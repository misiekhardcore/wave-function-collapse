'use client';

import { useEffect, useState } from 'react';

import { CanvasGrid, DivGrid } from '@/components';
import { collapseGrid, generateInitialGrid } from '@/lib';

import styles from './page.module.scss';

const COLS = 30;
const MIN_COLS = 2;
const MAX_COLS = 50;
const ROWS = 30;
const MIN_ROWS = 2;
const MAX_ROWS = 40;
const INITIAL_TILES_COUNT = 10;
const TILE_SIZE = 20;

let interval: NodeJS.Timeout;
let timeout: NodeJS.Timeout;

const grids = {
  DivGrid,
  CanvasGrid,
};

export default function Home() {
  const [grid, setGrid] = useState(generateInitialGrid(INITIAL_TILES_COUNT, COLS, ROWS));
  const [cols, setCols] = useState(COLS);
  const [rows, setRows] = useState(ROWS);
  const [inProgress, setInProgress] = useState(false);
  const [startTime, setStartTime] = useState<number>();
  const [endTime, setEndTime] = useState<number>();
  const [outputGrid, setOutputGrid] = useState<keyof typeof grids>('CanvasGrid');

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
          const nextGrid = collapseGrid(grid, cols, rows);
          if (nextGrid.every((tile) => tile.collapsed)) {
            setInProgress(false);
            clearInterval(interval);
            console.log('done');
            setEndTime(Date.now());
          }
          return nextGrid.slice();
        } catch (error) {
          console.log('error', error);
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
          newGrid = collapseGrid(newGrid, cols, rows);
        }
        setInProgress(false);
        console.log('done');
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

  const OutputGrid = grids[outputGrid] || DivGrid;

  return (
    <main className={styles.main} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      <div className={styles.form}>
        <label htmlFor="cols">
          Number of columns
          <input
            type="number"
            max={MAX_COLS}
            min={MIN_COLS}
            id="cols"
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value) || 1)}
          />
        </label>
        <label htmlFor="rows">
          Number of rows
          <input
            type="number"
            id="rows"
            max={MAX_ROWS}
            min={MIN_ROWS}
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value) || 1)}
          />
        </label>
        <label htmlFor="output">
          Output
          <select
            value={outputGrid}
            id="output"
            onChange={(e) => setOutputGrid(e.target.value as keyof typeof grids)}
          >
            <option value="DivGrid">DivGrid</option>
            <option value="CanvasGrid">CanvasGrid</option>
          </select>
        </label>
        <button disabled={inProgress} onClick={handleGenerateOnFly}>
          generate on fly
        </button>
        <button disabled={inProgress} onClick={handleGenerateAndDisplay}>
          generate and display
        </button>
        <button onClick={handleRestart}>restart</button>
      </div>
      <p>Generated in: {getElapsedTime(startTime, endTime)}</p>
      {inProgress && <p className={styles.loading}>Work in progress...</p>}
      <OutputGrid grid={grid} cols={cols} tileSize={TILE_SIZE} />
    </main>
  );
}

function getElapsedTime(startTime: number | undefined, endTime: number | undefined): string {
  if (!startTime || !endTime) return '--';
  return ((endTime - startTime) / 1000).toFixed(2) + 's';
}
