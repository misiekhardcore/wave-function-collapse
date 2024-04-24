'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Tile } from '@/types';

import styles from './TilesPreview.module.scss';

export function TilesPreview({ tiles }: { tiles: Tile[] }) {
  const [selectedTile, setSelectedTile] = useState<number>(0);

  return (
    <div className={styles.TilesPreview}>
      <h3>Tiles</h3>
      <div className={styles.available}>
        {tiles.map((tile) => (
          <Image
            key={tile.id}
            src={`/tiles/${tile.id}.png`}
            alt={`tile ${tile.id}`}
            height={40}
            width={40}
            onClick={() => setSelectedTile(tile.id)}
            data-selected={selectedTile === tile.id}
          />
        ))}
      </div>
      <div className={styles.selectedTile}>
        <Group title="Top neigbors" tiles={tiles[selectedTile].top.map((idx) => tiles[idx])} />
        <div className={styles.midLine}>
          <Group title="Left neighbors" tiles={tiles[selectedTile].left.map((idx) => tiles[idx])} />
          <Image
            src={`/tiles/${selectedTile}.png`}
            alt={`tile ${selectedTile}`}
            height={40}
            width={40}
          />
          <Group
            title="Right neighbors"
            tiles={tiles[selectedTile].right.map((idx) => tiles[idx])}
          />
        </div>
        <Group
          title="Bottom neighbors"
          tiles={tiles[selectedTile].bottom.map((idx) => tiles[idx])}
        />
      </div>
    </div>
  );
}

function Group({ tiles, title }: { tiles: Tile[]; title: string }) {
  return (
    <div className={styles.group}>
      <p>{title}</p>
      <div className={styles.grid}>
        {tiles.map((tile) => (
          <Image
            key={tile.id}
            src={`/tiles/${tile.id}.png`}
            alt={`tile ${tile.id}`}
            height={40}
            width={40}
          />
        ))}
      </div>
    </div>
  );
}
