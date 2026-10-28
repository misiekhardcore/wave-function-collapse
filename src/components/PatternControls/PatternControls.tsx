'use client';

import { DownloadIcon, PlayIcon, RotateCcwIcon, ZapIcon } from 'lucide-react';
import { useState } from 'react';

import { Panel } from '@/components/Panel';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { MAX_COLUMNS, MAX_ROWS, MIN_COLUMNS, MIN_ROWS } from '@/hooks';

type PatternControlsProps = {
  columns: number;
  rows: number;
  isRunning: boolean;
  isComplete: boolean;
  onColumnsChange: (value: number) => void;
  onRowsChange: (value: number) => void;
  onGenerate: () => void;
  onAnimate: () => void;
  onRestart: () => void;
  onDownload: () => void;
};

export function PatternControls({
  columns,
  rows,
  isRunning,
  isComplete,
  onColumnsChange,
  onRowsChange,
  onGenerate,
  onAnimate,
  onRestart,
  onDownload,
}: PatternControlsProps) {
  return (
    <>
      <Panel title="Grid size" description="How many tiles to solve across and down.">
        <SizeField
          id="columns"
          label="Columns"
          hint={`${MIN_COLUMNS}–${MAX_COLUMNS}`}
          value={columns}
          min={MIN_COLUMNS}
          max={MAX_COLUMNS}
          onChange={onColumnsChange}
        />
        <SizeField
          id="rows"
          label="Rows"
          hint={`${MIN_ROWS}–${MAX_ROWS}`}
          value={rows}
          min={MIN_ROWS}
          max={MAX_ROWS}
          onChange={onRowsChange}
        />
      </Panel>
      <Panel title="Generate" description="Pick a speed, then export the finished pattern.">
        <Button onClick={onGenerate} disabled={isRunning} className="w-full">
          <ZapIcon />
          Generate pattern
        </Button>
        <Button variant="outline" onClick={onAnimate} disabled={isRunning} className="w-full">
          <PlayIcon />
          Watch it solve
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={onRestart}>
            <RotateCcwIcon />
            Restart
          </Button>
          <Button variant="outline" onClick={onDownload} disabled={!isComplete || isRunning}>
            <DownloadIcon />
            PNG
          </Button>
        </div>
      </Panel>
    </>
  );
}

type SizeFieldProps = {
  id: string;
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

/**
 * Number input plus slider for one grid dimension.
 *
 * The input keeps a local draft so partial values can be typed (clearing "100"
 * to type "50" must not snap to the minimum on the first keystroke); the draft
 * is clamped and committed on blur or Enter. The slider is uncontrolled with a
 * key tied to the committed value, so dragging previews smoothly while the grid
 * is only regenerated once the pointer is released.
 */
function SizeField({ id, label, hint, value, min, max, onChange }: SizeFieldProps) {
  const [draft, setDraft] = useState<string | null>(null);

  function commit(nextValue: string) {
    const parsed = Number.parseInt(nextValue, 10);
    setDraft(null);

    if (!Number.isFinite(parsed)) return;

    onChange(Math.min(max, Math.max(min, parsed)));
  }

  return (
    <Field>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={draft ?? value}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commit(event.currentTarget.value);
            }

            if (event.key === 'Escape') setDraft(null);
          }}
          className="h-8 w-16 text-right tabular-nums"
        />
      </div>
      <Slider
        key={value}
        defaultValue={[value]}
        min={min}
        max={max}
        step={1}
        aria-label={label}
        onValueCommit={([nextValue]) => onChange(nextValue)}
      />
      <FieldDescription>{hint}</FieldDescription>
    </Field>
  );
}
