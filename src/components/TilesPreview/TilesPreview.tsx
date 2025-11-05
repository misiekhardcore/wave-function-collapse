'use client';

import Image from 'next/image';
import { useState } from 'react';

import { Tile } from '@/types';

export function TilesPreview({ tiles }: { tiles: Tile[] }) {
  const [selectedTile, setSelectedTile] = useState<number>(0);

  return (
    <div className="flex flex-col gap-2 items-center">
      <h3>Tiles</h3>
      <div className="flex gap-4">
        {tiles.map((tile) => (
          <Image
            key={tile.id}
            src={`/tiles/${tile.id}.png`}
            alt={`tile ${tile.id}`}
            height={40}
            width={40}
            onClick={() => setSelectedTile(tile.id)}
            data-selected={selectedTile === tile.id}
            className="border border-dashed border-red-500 cursor-pointer data-[selected=true]:border-solid data-[selected=true]:border-green-500"
          />
        ))}
      </div>
      <div className="flex flex-col gap-4 items-center">
        <Group title="Top neigbors" tiles={tiles[selectedTile].top.map((idx) => tiles[idx])} />
        <div className="grid gap-4 grid-cols-3 items-center content-center justify-items-center">
          <Group title="Left neighbors" tiles={tiles[selectedTile].left.map((idx) => tiles[idx])} />
          <Image
            src={`/tiles/${selectedTile}.png`}
            alt={`tile ${selectedTile}`}
            height={40}
            width={40}
            className="border border-solid border-green-500"
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
    <div className="flex flex-col items-center">
      <p>{title}</p>
      <div className="grid gap-2 grid-cols-3">
        {tiles.map((tile) => (
          <Image
            key={tile.id}
            src={`/tiles/${tile.id}.png`}
            alt={`tile ${tile.id}`}
            height={40}
            width={40}
            className="border border-dashed border-red-500"
          />
        ))}
      </div>
    </div>
  );
}
