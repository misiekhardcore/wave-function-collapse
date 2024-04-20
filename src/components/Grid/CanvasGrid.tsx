'use client';

import { useEffect, useMemo } from 'react';

import { tiles } from '@/lib';
import { TileObject } from '@/types';

type CanvasGridProps = {
  grid: TileObject[];
  cols: number;
  tileSize: number;
};

export function CanvasGrid({ grid, cols, tileSize }: CanvasGridProps) {
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
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    grid.forEach((tile, idx) => {
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
    });
  }, [grid, cols, images, tileSize]);

  return (
    <canvas
      data-testid="canvas"
      width={cols * tileSize}
      height={rows * tileSize}
      style={{ width: cols * tileSize, height: rows * tileSize }}
    />
  );
}
