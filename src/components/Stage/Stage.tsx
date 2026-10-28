'use client';

import { CheckIcon, CircleIcon, LoaderCircleIcon, TriangleAlertIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Panel } from '@/components/Panel';
import { Badge } from '@/components/ui/badge';
import type { GenerationStatus } from '@/hooks';

type StageProps = {
  status: GenerationStatus;
  elapsedTime: string;
  collapsedTiles: number;
  totalTiles: number;
  children: ReactNode;
};

const STATUS_APPEARANCE = {
  idle: { label: 'Idle', variant: 'outline', Icon: CircleIcon },
  running: { label: 'Solving', variant: 'secondary', Icon: LoaderCircleIcon },
  complete: { label: 'Complete', variant: 'default', Icon: CheckIcon },
  stuck: { label: 'Stuck', variant: 'destructive', Icon: TriangleAlertIcon },
} as const;

export function Stage({ status, elapsedTime, collapsedTiles, totalTiles, children }: StageProps) {
  const { label, variant, Icon } = STATUS_APPEARANCE[status];
  const isRunning = status === 'running';
  const progress = totalTiles === 0 ? 0 : (collapsedTiles / totalTiles) * 100;
  const roundedProgress = Math.round(progress);

  return (
    <Panel
      title="Pattern"
      description="Every unresolved cell is a wave of possibilities; a collapse fixes one tile."
      action={
        <Badge variant={variant}>
          <Icon className={isRunning ? 'animate-spin' : undefined} />
          {label}
        </Badge>
      }
    >
      <div className="relative overflow-hidden rounded-lg ring-1 ring-border">
        {children}
        {isRunning ? (
          <div
            aria-hidden
            className="pointer-events-none absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur-sm"
          >
            <LoaderCircleIcon className="size-3.5 animate-spin text-primary" />
            {roundedProgress}%
          </div>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
        <div
          role="progressbar"
          aria-label="Collapsed tiles"
          aria-valuemin={0}
          aria-valuemax={totalTiles}
          aria-valuenow={collapsedTiles}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {collapsedTiles}/{totalTiles}
        </span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{elapsedTime}</span>
      </div>

      <p aria-live="polite" className="sr-only">
        {label}
      </p>
    </Panel>
  );
}
