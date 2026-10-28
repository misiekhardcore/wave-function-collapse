'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { tiles } from '@/lib';
import type { TileObject } from '@/types';

type CanvasGridProps = {
  grid: TileObject[];
  cols: number;
  tileSize: number;
};

type CanvasPalette = {
  surface: string;
  void: string;
  grid: string;
};

/**
 * Used when the CSS custom properties cannot be read, which is the case in
 * jsdom (and during the first paint of a server-rendered page).
 */
const FALLBACK_PALETTE: CanvasPalette = {
  surface: '#ffffff',
  void: '#eaeaea',
  grid: '#d4d4d4',
};

/** Beyond 2x the extra pixels cost far more than they add. */
const MAX_PIXEL_RATIO = 2;

function subscribeToColorScheme(onStoreChange: () => void) {
  if (typeof document === 'undefined') return () => {};

  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  return () => observer.disconnect();
}

function getColorSchemeSnapshot() {
  return typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
}

function getServerColorSchemeSnapshot() {
  return false;
}

/**
 * The palette is read from CSS custom properties rather than guessed in
 * JavaScript, so the drawing can never disagree with the scheme the page is
 * rendering in.
 */
function readPalette(): CanvasPalette {
  if (typeof document === 'undefined') return FALLBACK_PALETTE;

  const styles = getComputedStyle(document.documentElement);
  const read = (property: string, fallback: string) => {
    return styles.getPropertyValue(property).trim() || fallback;
  };

  return {
    surface: read('--canvas-surface', FALLBACK_PALETTE.surface),
    void: read('--canvas-void', FALLBACK_PALETTE.void),
    grid: read('--canvas-grid', FALLBACK_PALETTE.grid),
  };
}

export const CanvasGrid = forwardRef<HTMLCanvasElement, CanvasGridProps>(function CanvasGrid(
  { grid, cols, tileSize },
  forwardedRef
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDark = useSyncExternalStore(
    subscribeToColorScheme,
    getColorSchemeSnapshot,
    getServerColorSchemeSnapshot
  );
  const [loadedTiles, setLoadedTiles] = useState(0);
  const rows = grid.length / cols;

  const images = useMemo(() => {
    if (typeof window === 'undefined') return [];

    return tiles.map((tile) => {
      const image = new window.Image();
      image.src = `/tiles/${tile.id}.png`;
      return image;
    });
  }, []);

  // Tiles finish loading after the first paint, so each finished image bumps a
  // counter that re-runs the draw. The previous implementation returned from the
  // whole effect at the first unfinished image, leaving every later cell blank.
  useEffect(() => {
    const handleLoad = () => setLoadedTiles((count) => count + 1);

    images.forEach((image) => image.addEventListener('load', handleLoad));

    return () => images.forEach((image) => image.removeEventListener('load', handleLoad));
  }, [images]);

  const setCanvasRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;

      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const palette = readPalette();
    const pixelRatio = Math.min(
      typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
      MAX_PIXEL_RATIO
    );
    const width = cols * tileSize;
    const height = rows * tileSize;

    // Back the canvas with a device-pixel-sized buffer so tiles stay sharp on
    // HiDPI screens, while the element itself still scales to its container.
    // `toDataURL` reads this buffer, so downloads come out at full resolution.
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    context.fillStyle = palette.surface;
    context.fillRect(0, 0, width, height);

    for (let index = 0; index < grid.length; index++) {
      const tile = grid[index];
      const x = (index % cols) * tileSize;
      const y = Math.floor(index / cols) * tileSize;
      const image = tile.options.length === 1 ? images[tile.options[0]] : undefined;

      if (image?.complete && image.naturalWidth > 0) {
        context.drawImage(image, x, y, tileSize, tileSize);
        continue;
      }

      // Unresolved cells read as quiet voids rather than black holes.
      context.fillStyle = palette.void;
      context.fillRect(x, y, tileSize, tileSize);
      context.strokeStyle = palette.grid;
      context.lineWidth = 1;
      context.strokeRect(x + 0.5, y + 0.5, tileSize - 1, tileSize - 1);
    }
  }, [grid, cols, rows, images, tileSize, isDark, loadedTiles]);

  return (
    // The canvas is capped at its intrinsic size instead of stretched to the
    // panel: a narrow grid such as 12 x 70 would otherwise be blown up to
    // thousands of pixels tall. `max-w-full` keeps it inside the panel, and
    // `mx-auto` centres it when the pattern is narrower than the stage.
    <canvas
      ref={setCanvasRef}
      data-testid="canvas"
      width={cols * tileSize}
      height={rows * tileSize}
      style={{ width: cols * tileSize }}
      className="mx-auto block h-auto max-w-full"
    />
  );
});

CanvasGrid.displayName = 'CanvasGrid';
