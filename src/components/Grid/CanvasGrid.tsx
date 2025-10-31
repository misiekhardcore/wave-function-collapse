'use client';

import { forwardRef, useEffect, useMemo } from 'react';

import { tiles } from '@/lib';
import { TileObject } from '@/types';

type CanvasGridProps = {
  grid: TileObject[];
  cols: number;
  tileSize: number;
};

export const CanvasGrid = forwardRef<HTMLCanvasElement, CanvasGridProps>(function CanvasGrid(
  { grid, cols, tileSize },
  ref
) {
  const rows = grid.length / cols;
  const images = useMemo(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return [];
    return tiles.map((tile) => {
      const img = new Image();
      img.src = `/tiles/${tile.id}.png`;
      return img;
    });
  }, []);

  useEffect(() => {
    const canvas = typeof ref !== 'function' && ref?.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    for (let idx = 0; idx < grid.length; idx++) {
      const tile = grid[idx];
      const x = (idx % cols) * tileSize;
      const y = Math.floor(idx / cols) * tileSize;
      if (tile.options.length !== 1) {
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, tileSize, tileSize);
        ctx.strokeStyle = 'blue';
        ctx.strokeRect(x, y, tileSize, tileSize);
      } else {
        const img = images[tile.options[0]];

        if (!img) return;
        if (!img.complete)
          return img.addEventListener('load', () => ctx.drawImage(img, x, y, tileSize, tileSize));
        else ctx.drawImage(img, x, y, tileSize, tileSize);
      }
    }
  }, [grid, cols, images, tileSize, ref]);

  return (
    <canvas
      ref={ref}
      data-testid="canvas"
      width={cols * tileSize}
      height={rows * tileSize}
      style={{ width: cols * tileSize, height: rows * tileSize }}
    />
  );
});

CanvasGrid.displayName = 'CanvasGrid';
