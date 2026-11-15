'use client';

import {
  Field,
  FieldDescription,
  FieldLabel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@konopskidev/ui';

import { Panel } from '@/components/Panel';
import { tileSets } from '@/lib';
import type { TileSetId } from '@/types';

type TileSetPickerProps = {
  value: TileSetId;
  onChange: (id: TileSetId) => void;
};

/** Switches the rules every tile follows; the grid is regenerated for the new set. */
export function TileSetPicker({ value, onChange }: TileSetPickerProps) {
  const selected = tileSets.find((set) => set.id === value) ?? tileSets[0];

  return (
    <Panel title="Tile set" description="Choose the rules the pattern is built from.">
      <Field>
        <FieldLabel htmlFor="tile-set">Preset</FieldLabel>
        <Select value={value} onValueChange={(next) => onChange(next as TileSetId)}>
          <SelectTrigger id="tile-set" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tileSets.map((set) => (
              <SelectItem key={set.id} value={set.id}>
                {set.name} · {set.tiles.length} tiles
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldDescription>{selected.description}</FieldDescription>
      </Field>
    </Panel>
  );
}
