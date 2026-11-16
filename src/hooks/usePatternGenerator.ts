'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  collapseGrid,
  DEFAULT_TILE_SET_ID,
  downloadCanvasAsImage,
  generateDownloadFilename,
  generateInitialGrid,
  getTileSet,
} from '@/lib';
import type { TileObject, TileSet, TileSetId } from '@/types';

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

/**
 * Progress updates an instant run reports before it finishes, however cheap the
 * solve is. Solving in one task used to freeze the page until the pattern was
 * done, so the readout jumped from 0% to 100%; a run now solves in slices.
 */
const GENERATE_PROGRESS_UPDATES = 30;

/** Longest a slice of an instant run may hold the main thread before yielding. */
const GENERATE_SLICE_MS = 100;

/** A small grid solves in one or two slices, so it stays effectively instant. */
const GENERATE_MIN_STEPS_PER_SLICE = 50;

export type GenerationStatus = 'idle' | 'running' | 'complete' | 'stuck';

export type PatternGenerator = {
  grid: TileObject[];
  columns: number;
  rows: number;
  tileSet: TileSet;
  setTileSet: (id: TileSetId) => void;
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

function createGrid(tileSet: TileSet, columns: number, rows: number): TileObject[] {
  return generateInitialGrid(SEED_TILES_COUNT, columns, rows, tileSet.tiles, tileSet.bias);
}

function countCollapsed(grid: TileObject[]): number {
  return grid.reduce((count, tile) => count + (tile.collapsed ? 1 : 0), 0);
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
  const [tileSetId, setTileSetId] = useState<TileSetId>(DEFAULT_TILE_SET_ID);
  const tileSet = getTileSet(tileSetId);
  const [grid, setGrid] = useState<TileObject[]>(() =>
    createGrid(getTileSet(DEFAULT_TILE_SET_ID), DEFAULT_COLUMNS, DEFAULT_ROWS)
  );
  const [columns, setColumnsState] = useState(DEFAULT_COLUMNS);
  const [rows, setRowsState] = useState(DEFAULT_ROWS);
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();
  // Tiles an instant run has resolved while its grid is still private: the
  // readout climbs, the canvas keeps painting the seeded grid, and only the
  // finished pattern is committed.
  const [pendingCollapsedTiles, setPendingCollapsedTiles] = useState<number | null>(null);

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
    setPendingCollapsedTiles(null);
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
      commitGrid(createGrid(tileSet, nextColumns, nextRows));
    },
    [commitGrid, reset, tileSet]
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
      setPendingCollapsedTiles(null);
    },
    [stopTimers]
  );

  const setTileSet = useCallback(
    (id: TileSetId) => {
      reset();
      setTileSetId(id);
      commitGrid(createGrid(getTileSet(id), columns, rows));
    },
    [columns, rows, commitGrid, reset]
  );

  const restart = useCallback(() => {
    reset();
    commitGrid(createGrid(tileSet, columns, rows));
  }, [columns, rows, commitGrid, reset, tileSet]);

  const animate = useCallback(() => {
    reset();
    const runId = runIdRef.current;
    const initialGrid = createGrid(tileSet, columns, rows);
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
          nextGrid = collapseGrid(nextGrid, columns, tileSet.tiles, tileSet.bias);
        }

        const isComplete = nextGrid.every((tile) => tile.collapsed);
        commitGrid(nextGrid);
        if (isComplete) finish(runId, 'complete');
      } catch {
        finish(runId, 'stuck');
      }
    }, ANIMATION_STEP_MS);
  }, [columns, rows, commitGrid, finish, reset, tileSet]);

  const generate = useCallback(() => {
    reset();
    const runId = runIdRef.current;
    const initialGrid = createGrid(tileSet, columns, rows);

    setStartTime(Date.now());
    setStatus('running');
    setPendingCollapsedTiles(countCollapsed(initialGrid));
    commitGrid(initialGrid);

    // The solver works on a private copy that survives the slices below, so the
    // grid React is rendering is never mutated while it solves.
    let workGrid = gridRef.current;
    let remainingSteps = initialGrid.length;
    // collapseGrid resolves one cell per call, so the grid can never need more
    // steps than it has cells.
    const stepsPerSlice = Math.max(
      GENERATE_MIN_STEPS_PER_SLICE,
      Math.ceil(initialGrid.length / GENERATE_PROGRESS_UPDATES)
    );

    /**
     * Solves one batch, reports the progress, then yields. The intermediate
     * grids stay private: an instant run lights up the readout instead of
     * redrawing the canvas with every half-solved pattern.
     */
    const solveSlice = () => {
      if (runIdRef.current !== runId) return;

      const sliceStart = Date.now();
      let steps = 0;

      try {
        while (steps < stepsPerSlice && remainingSteps > 0) {
          // Counting per step would be a full pass over the grid every time;
          // the short-circuiting check is enough to stop at a solved grid.
          if (!workGrid.some((tile) => !tile.collapsed)) break;

          workGrid = collapseGrid(workGrid, columns, tileSet.tiles, tileSet.bias);
          steps += 1;
          remainingSteps -= 1;

          if (Date.now() - sliceStart >= GENERATE_SLICE_MS) break;
        }
      } catch {
        commitGrid(workGrid);
        finish(runId, 'stuck');
        return;
      }

      const collapsed = countCollapsed(workGrid);
      const isComplete = collapsed === workGrid.length;

      if (isComplete || remainingSteps === 0) {
        commitGrid(workGrid);
        finish(runId, isComplete ? 'complete' : 'stuck');
        return;
      }

      setPendingCollapsedTiles(collapsed);
      timeoutRef.current = setTimeout(solveSlice, 0);
    };

    // Yield once so "solving" is painted before the solver takes over.
    timeoutRef.current = setTimeout(solveSlice, 0);
  }, [columns, rows, commitGrid, finish, reset, tileSet]);

  const download = useCallback(() => {
    downloadCanvasAsImage(canvasRef.current, generateDownloadFilename());
  }, []);

  const { collapsedTiles, totalTiles } = useMemo(() => {
    return {
      collapsedTiles: countCollapsed(grid),
      totalTiles: grid.length,
    };
  }, [grid]);

  return {
    grid,
    columns,
    rows,
    tileSet,
    setTileSet,
    status,
    isRunning: status === 'running',
    isComplete: totalTiles > 0 && collapsedTiles === totalTiles,
    collapsedTiles: pendingCollapsedTiles ?? collapsedTiles,
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
