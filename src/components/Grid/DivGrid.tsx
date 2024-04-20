import Image from 'next/image';
import { cloneElement, useMemo } from 'react';

import { TileObject } from '@/types';
import { tiles } from '@/lib';

import styles from './DivGrid.module.scss';

type DivGridProps = {
  grid: TileObject[];
  cols: number;
  tileSize: number;
};

export function DivGrid({ grid, cols, tileSize }: DivGridProps) {
  const images = useMemo(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return [];
    return tiles.map((tile) => {
      const img = (
        <Image
          src={`/tiles/${tile.id}.png`}
          alt={`tile ${tile.id}`}
          width={tileSize}
          height={tileSize}
        />
      );
      return img;
    });
  }, [tileSize]);

  return (
    <div
      className={styles.DivGrid}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      data-testid="div-grid"
    >
      {grid.map((tile, idx) => {
        if (tile.options.length !== 1)
          return (
            <div className={styles.empty} key={idx} style={{ width: tileSize, height: tileSize }} />
          );
        return cloneElement(images[tile.options[0]], { key: idx });
      })}
    </div>
  );
}
