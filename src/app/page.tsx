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
const MAX_COLS = 50;
const ROWS = 70;
const MIN_ROWS = 2;
const MAX_ROWS = 40;
const INITIAL_TILES_COUNT = 10;
const TILE_SIZE = 10;

let interval: NodeJS.Timeout;
let timeout: NodeJS.Timeout;

export default function Home() {
  const [grid, setGrid] = useState(generateInitialGrid(INITIAL_TILES_COUNT, COLS, ROWS));
  const [cols, setCols] = useState(COLS);
  const [rows, setRows] = useState(ROWS);
  const [inProgress, setInProgress] = useState(false);
  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setGrid(generateInitialGrid(INITIAL_TILES_COUNT, cols, rows));
    clearInterval(interval);
  }, [rows, cols]);

  useEffect(() => {
    return () => clearInterval(interval);
  }, [rows, cols]);

  function handleGenerateOnFly() {
    handleRestart();
    setStartTime(Date.now());

    if (inProgress) return;

    setInProgress(true);
    interval = setInterval(() => {
      setGrid((grid) => {
        try {
          const nextGrid = collapseGrid(grid, cols);
          if (nextGrid.every((tile) => tile.collapsed)) {
            setInProgress(false);
            clearInterval(interval);
            setEndTime(Date.now());
          }
          return nextGrid.slice();
        } catch (_error) {
          setGrid(grid);
          setInProgress(false);
          clearInterval(interval);
          return grid;
        }
      });
    });
  }

  function handleGenerateAndDisplay() {
    handleRestart();
    setStartTime(Date.now());

    if (inProgress) return;

    setInProgress(true);
    timeout = setTimeout(() => {
      setGrid((grid) => {
        let newGrid = grid;
        while (!newGrid.every((tile) => tile.collapsed)) {
          newGrid = collapseGrid(newGrid, cols);
        }
        setInProgress(false);
        setEndTime(Date.now());
        clearTimeout(timeout);

        return newGrid.slice();
      });
    });
  }

  function handleRestart() {
    setStartTime(undefined);
    setEndTime(undefined);
    setInProgress(false);
    setGrid(generateInitialGrid(INITIAL_TILES_COUNT, cols, rows));
    clearTimeout(timeout);
    clearInterval(interval);
  }

  function handleDownload() {
    const filename = generateDownloadFilename();
    downloadCanvasAsImage(canvasRef.current, filename);
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
            onChange={(e) => setCols(parseInt(e.target.value) || 1)}
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
            onChange={(e) => setRows(parseInt(e.target.value) || 1)}
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
