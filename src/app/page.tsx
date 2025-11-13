'use client';

import { useEffect, useRef, useState } from 'react';

import { CanvasGrid, TilesPreview } from '@/components';
import {
  collapseGrid,
  generateInitialGrid,
  tiles,
  downloadCanvasAsImage,
  generateDownloadFilename,
} from '@/lib';

const COLS = 100;
const MIN_COLS = 2;
const MAX_COLS = 100;
const ROWS = 70;
const MIN_ROWS = 2;
const MAX_ROWS = 70;
const INITIAL_TILES_COUNT = 10;
const TILE_SIZE = 10;

export default function Home() {
  const [grid, setGrid] = useState(generateInitialGrid(INITIAL_TILES_COUNT, COLS, ROWS));
  const [cols, setCols] = useState(COLS);
  const [rows, setRows] = useState(ROWS);
  const [inProgress, setInProgress] = useState(false);
  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(undefined);
  const intervalRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(intervalRef.current);
    };
  }, []);

  function handleGenerateOnFly() {
    handleRestart();
    setStartTime(() => Date.now());

    if (inProgress) return;

    setInProgress(true);
    intervalRef.current = setInterval(() => {
      setGrid((grid) => {
        try {
          const nextGrid = collapseGrid(grid, cols);
          if (nextGrid.every((tile) => tile.collapsed)) {
            setInProgress(false);
            clearInterval(intervalRef.current);
            setEndTime(Date.now());
          }
          return nextGrid.slice();
        } catch (_error) {
          setGrid(grid);
          setInProgress(false);
          clearInterval(intervalRef.current);
          return grid;
        }
      });
    });
  }

  function handleGenerateAndDisplay() {
    handleRestart();
    setStartTime(() => Date.now());

    if (inProgress) return;

    setInProgress(true);
    timeoutRef.current = setTimeout(() => {
      setGrid((grid) => {
        let newGrid = grid;
        while (!newGrid.every((tile) => tile.collapsed)) {
          newGrid = collapseGrid(newGrid, cols);
        }
        setInProgress(false);
        setEndTime(Date.now());
        clearTimeout(timeoutRef.current);

        return newGrid.slice();
      });
    });
  }

  function handleReset() {
    setStartTime(undefined);
    setEndTime(undefined);
    setInProgress(false);
    clearTimeout(timeoutRef.current);
    clearInterval(intervalRef.current);
  }

  function handleRestart() {
    handleReset();
    setGrid(generateInitialGrid(INITIAL_TILES_COUNT, cols, rows));
  }

  function handleDownload() {
    const filename = generateDownloadFilename();
    downloadCanvasAsImage(canvasRef.current, filename);
  }

  function handleColsChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleReset();
    let newCols = parseInt(e.target.value) || 1;
    if (newCols < MIN_COLS) newCols = MIN_COLS;
    if (newCols > MAX_COLS) newCols = MAX_COLS;
    setCols(newCols);
    setGrid(generateInitialGrid(INITIAL_TILES_COUNT, newCols, rows));
  }

  function handleRowsChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleReset();
    let newRows = parseInt(e.target.value) || 1;
    if (newRows < MIN_ROWS) newRows = MIN_ROWS;
    if (newRows > MAX_ROWS) newRows = MAX_ROWS;
    setRows(newRows);
    setGrid(generateInitialGrid(INITIAL_TILES_COUNT, cols, newRows));
  }

  const isPatternComplete = grid.every((tile) => tile.collapsed);

  return (
    <main className="p-4 items-center flex flex-col gap-4 max-w-[1200px] w-full mx-auto">
      <div className="items-end flex gap-4 flex-wrap">
        <label htmlFor="cols" className="min-w-fit">
          Number of columns
          <input
            type="number"
            max={MAX_COLS}
            min={MIN_COLS}
            id="cols"
            value={cols}
            onChange={handleColsChange}
            className="w-full"
          />
        </label>
        <label htmlFor="rows" className="min-w-fit">
          Number of rows
          <input
            type="number"
            id="rows"
            max={MAX_ROWS}
            min={MIN_ROWS}
            value={rows}
            onChange={handleRowsChange}
            className="w-full"
          />
        </label>
        <button disabled={inProgress} onClick={handleGenerateOnFly} className="min-w-fit">
          generate on fly
        </button>
        <button disabled={inProgress} onClick={handleGenerateAndDisplay} className="min-w-fit">
          generate and display
        </button>
        <button onClick={handleRestart} className="min-w-fit">
          restart
        </button>
        <button
          disabled={!isPatternComplete || inProgress}
          onClick={handleDownload}
          className="min-w-fit"
        >
          download pattern
        </button>
      </div>
      <p>Generated in: {getElapsedTime(startTime, endTime)}</p>
      {inProgress && (
        <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background/50 p-8">
          Work in progress...
        </p>
      )}
      <CanvasGrid grid={grid} cols={cols} tileSize={TILE_SIZE} ref={canvasRef} />
      <TilesPreview tiles={tiles} />
    </main>
  );
}

function getElapsedTime(startTime: number | undefined, endTime: number | undefined): string {
  if (!startTime || !endTime) return '--';
  return ((endTime - startTime) / 1000).toFixed(2) + 's';
}
