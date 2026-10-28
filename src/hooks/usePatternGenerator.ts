'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  collapseGrid,
  downloadCanvasAsImage,
  generateDownloadFilename,
  generateInitialGrid,
} from '@/lib';
import type { TileObject } from '@/types';

export const SEED_TILES_COUNT = 10;
export const TILE_SIZE = 10;
export const MIN_COLUMNS = 2;
export const MAX_COLUMNS = 100;
export const MIN_ROWS = 2;
export const MAX_ROWS = 70;

const DEFAULT_COLUMNS = 100;
const DEFAULT_ROWS = 70;

/** Pause between animation frames, slow enough to follow the solve by eye. */
const ANIMATION_STEP_MS = 50;

/**
 * Budget for a full step-by-step solve. A large grid needs thousands of
 * collapses, so each frame resolves several tiles: without this, the default
 * 100 x 70 grid would take almost six minutes to finish.
 */
const ANIMATION_DURATION_MS = 20_000;

export type GenerationStatus = 'idle' | 'running' | 'complete' | 'stuck';

export type PatternGenerator = {
  grid: TileObject[];
  columns: number;
  rows: number;
  status: GenerationStatus;
  isRunning: boolean;
  isComplete: boolean;
  collapsedTiles: number;
  totalTiles: number;
  startTime?: number;
  endTime?: number;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  setColumns: (value: number) => void;
  setRows: (value: number) => void;
  animate: () => void;
  generate: () => void;
  restart: () => void;
  download: () => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function createGrid(columns: number, rows: number): TileObject[] {
  return generateInitialGrid(SEED_TILES_COUNT, columns, rows);
}

/**
 * Owns the pattern grid and the two ways of solving it.
 *
 * Every run is identified by a monotonic id: timers created by an earlier run
 * compare their id before touching state, so restarting or resizing mid-run
 * abandons the old run instead of racing the new one. Grid updates always go
 * through `gridRef`/`commitGrid` because the animation timer needs the latest
 * grid synchronously, and because solving must never happen inside a state
 * updater (React may invoke those twice).
 */
export function usePatternGenerator(): PatternGenerator {
  const [grid, setGrid] = useState<TileObject[]>(() => createGrid(DEFAULT_COLUMNS, DEFAULT_ROWS));
  const [columns, setColumnsState] = useState(DEFAULT_COLUMNS);
  const [rows, setRowsState] = useState(DEFAULT_ROWS);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gridRef = useRef(grid);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);

  const stopTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // The solver mutates tiles in place, so every commit stores a snapshot: a
  // repeated array reference would make React bail out of the re-render and the
  // canvas would never repaint during the animation.
  const commitGrid = useCallback((nextGrid: TileObject[]) => {
    const snapshot = nextGrid.slice();
    gridRef.current = snapshot;
    setGrid(snapshot);
  }, []);

  /** Abandons the run in flight and returns the page to its idle state. */
  const reset = useCallback(() => {
    runIdRef.current += 1;
    stopTimers();
    setStatus('idle');
    setStartTime(undefined);
    setEndTime(undefined);
  }, [stopTimers]);

  useEffect(() => {
    return () => {
      runIdRef.current += 1;
      stopTimers();
    };
  }, [stopTimers]);

  const applySize = useCallback(
    (nextColumns: number, nextRows: number) => {
      reset();
      setColumnsState(nextColumns);
      setRowsState(nextRows);
      commitGrid(createGrid(nextColumns, nextRows));
    },
    [commitGrid, reset]
  );

  const setColumns = useCallback(
    (value: number) => applySize(clamp(value, MIN_COLUMNS, MAX_COLUMNS), rows),
    [applySize, rows]
  );

  const setRows = useCallback(
    (value: number) => applySize(columns, clamp(value, MIN_ROWS, MAX_ROWS)),
    [applySize, columns]
  );

  const finish = useCallback(
    (runId: number, nextStatus: GenerationStatus) => {
      if (runIdRef.current !== runId) return;

      stopTimers();
      setEndTime(Date.now());
      setStatus(nextStatus);
    },
    [stopTimers]
  );

  const restart = useCallback(() => {
    reset();
    commitGrid(createGrid(columns, rows));
  }, [columns, rows, commitGrid, reset]);

  const animate = useCallback(() => {
    reset();
    const runId = runIdRef.current;
    const initialGrid = createGrid(columns, rows);
    const frames = ANIMATION_DURATION_MS / ANIMATION_STEP_MS;
    const collapsesPerFrame = Math.max(1, Math.ceil(initialGrid.length / frames));

    setStartTime(Date.now());
    setStatus('running');
    commitGrid(initialGrid);

    intervalRef.current = setInterval(() => {
      if (runIdRef.current !== runId) return;

      try {
        let nextGrid = gridRef.current;
        for (let step = 0; step < collapsesPerFrame; step++) {
          nextGrid = collapseGrid(nextGrid, columns);
        }

        const isComplete = nextGrid.every((tile) => tile.collapsed);
        commitGrid(nextGrid);
        if (isComplete) finish(runId, 'complete');
      } catch {
        finish(runId, 'stuck');
      }
    }, ANIMATION_STEP_MS);
  }, [columns, rows, commitGrid, finish, reset]);

  const generate = useCallback(() => {
    reset();
    const runId = runIdRef.current;
    const initialGrid = createGrid(columns, rows);

    setStartTime(Date.now());
    setStatus('running');
    commitGrid(initialGrid);

    // Yield once so "solving" is painted before the synchronous loop takes over.
    timeoutRef.current = setTimeout(() => {
      if (runIdRef.current !== runId) return;

      // Solve a private copy so the array React is rendering is never mutated
      // underneath it while the loop runs.
      let nextGrid = gridRef.current.slice();
      try {
        // collapseGrid resolves one cell per call, so the grid can never need
        // more steps than it has cells.
        for (let step = 0; step < initialGrid.length; step++) {
          if (nextGrid.every((tile) => tile.collapsed)) break;
          nextGrid = collapseGrid(nextGrid, columns);
        }

        const isComplete = nextGrid.every((tile) => tile.collapsed);
        commitGrid(nextGrid);
        finish(runId, isComplete ? 'complete' : 'stuck');
      } catch {
        commitGrid(nextGrid);
        finish(runId, 'stuck');
      }
    }, 0);
  }, [columns, rows, commitGrid, finish, reset]);

  const download = useCallback(() => {
    downloadCanvasAsImage(canvasRef.current, generateDownloadFilename());
  }, []);

  const { collapsedTiles, totalTiles } = useMemo(() => {
    return {
      collapsedTiles: grid.reduce((count, tile) => count + (tile.collapsed ? 1 : 0), 0),
      totalTiles: grid.length,
    };
  }, [grid]);

  return {
    grid,
    columns,
    rows,
    status,
    isRunning: status === 'running',
    isComplete: totalTiles > 0 && collapsedTiles === totalTiles,
    collapsedTiles,
    totalTiles,
    startTime,
    endTime,
    canvasRef,
    setColumns,
    setRows,
    animate,
    generate,
    restart,
    download,
  };
}
