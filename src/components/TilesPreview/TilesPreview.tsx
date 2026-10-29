'use client';

import { Separator, ToggleGroup, ToggleGroupItem } from '@konopskidev/ui';
import Image from 'next/image';
import { useState } from 'react';

import { Panel } from '@/components/Panel';
import type { Tile } from '@/types';

export function TilesPreview({ tiles }: { tiles: Tile[] }) {
  const [selectedTile, setSelectedTile] = useState(0);
  const selected = tiles[selectedTile] ?? tiles[0];

  return (
    <Panel
      title="Tiles"
      description="Pick a tile to see which tiles can sit on each side of it."
      contentClassName="gap-5"
    >
      <ToggleGroup
        type="single"
        aria-label="Tile types"
        variant="outline"
        size="sm"
        spacing={2}
        className="flex-wrap"
        value={String(selectedTile)}
        onValueChange={(value) => value && setSelectedTile(Number(value))}
      >
        {tiles.map((tile) => (
          <ToggleGroupItem
            key={tile.id}
            value={String(tile.id)}
            aria-label={`Tile ${tile.id}`}
            className="h-auto p-1 data-[state=on]:border-primary data-[state=on]:bg-primary/10"
          >
            <Image
              src={`/tiles/${tile.id}.png`}
              alt=""
              width={28}
              height={28}
              className="block [image-rendering:pixelated]"
            />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Separator />

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center justify-items-center gap-x-2 gap-y-4">
        <span aria-hidden />
        <NeighborGroup title="Above" tiles={collectTiles(selected.top, tiles)} />
        <span aria-hidden />

        <NeighborGroup title="Left" tiles={collectTiles(selected.left, tiles)} />
        <div className="flex flex-col items-center gap-1.5">
          <Image
            src={`/tiles/${selected.id}.png`}
            alt={`Tile ${selected.id}`}
            width={48}
            height={48}
            className="block rounded-sm ring-2 ring-primary ring-offset-2 ring-offset-card [image-rendering:pixelated]"
          />
          <span className="text-xs font-medium">Tile {selected.id}</span>
        </div>
        <NeighborGroup title="Right" tiles={collectTiles(selected.right, tiles)} />

        <span aria-hidden />
        <NeighborGroup title="Below" tiles={collectTiles(selected.bottom, tiles)} />
        <span aria-hidden />
      </div>
    </Panel>
  );
}

function collectTiles(ids: number[], tiles: Tile[]): Tile[] {
  return ids.map((id) => tiles[id]).filter(Boolean);
}

function NeighborGroup({ title, tiles }: { title: string; tiles: Tile[] }) {
  return (
    <div className="flex w-full max-w-32 flex-col items-center gap-1.5">
      <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </span>
      <div className="flex flex-wrap justify-center gap-1">
        {tiles.map((tile) => (
          <Image
            key={tile.id}
            src={`/tiles/${tile.id}.png`}
            alt={`Tile ${tile.id}`}
            width={22}
            height={22}
            className="block rounded-[3px] ring-1 ring-border [image-rendering:pixelated]"
          />
        ))}
      </div>
    </div>
  );
}
