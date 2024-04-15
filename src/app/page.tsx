'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { collapseGrid, generateInitialGrid } from './lib';

import styles from './page.module.scss';

const COLS = 55;
const ROWS = 40;
const INITIAL_TILES_COUNT = 15;
const TILE_SIZE = 20;

let interval: NodeJS.Timeout;
let timeout: NodeJS.Timeout;

export default function Home() {
  const [grid, setGrid] = useState(generateInitialGrid(INITIAL_TILES_COUNT, COLS, ROWS));
  const [cols, setCols] = useState(COLS);
  const [rows, setRows] = useState(ROWS);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    setGrid(generateInitialGrid(INITIAL_TILES_COUNT, cols, rows));
    clearInterval(interval);
  }, [rows, cols]);

  useEffect(() => {
    return () => clearInterval(interval);
  }, [rows, cols]);

  function handleGenerateOnFly() {
    handleRestart();

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

    if (inProgress) return;

    setInProgress(true);
    let newGrid = grid;
    timeout = setTimeout(() => {
      while (!newGrid.every((tile) => tile.collapsed)) {
        newGrid = collapseGrid(newGrid, cols, rows);
      }
      setGrid(newGrid);
      setInProgress(false);
      console.log('done');
      clearTimeout(timeout);
    });
  }

  function handleRestart() {
    clearTimeout(timeout);
    clearInterval(interval);
    setInProgress(false);
    setGrid(generateInitialGrid(INITIAL_TILES_COUNT, cols, rows));
  }

  return (
    <main className={styles.main} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      <div className={styles.form}>
        <label htmlFor="cols">
          Number of columns
          <input
            type="number"
            id="cols"
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value))}
          />
        </label>
        <label htmlFor="rows">
          Number of rows
          <input
            type="number"
            id="rows"
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value))}
          />
        </label>
        <button disabled={inProgress} onClick={handleGenerateOnFly}>
          generate on fly
        </button>
        <button disabled={inProgress} onClick={handleGenerateAndDisplay}>
          generate and display
        </button>
        <button onClick={handleRestart}>restart</button>
      </div>
      {inProgress && <p className={styles.loading}>Work in progress...</p>}
      <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {grid.map((tile, idx) => {
          if (tile.options.length !== 1)
            return (
              <div
                className={styles.empty}
                key={idx}
                style={{ width: TILE_SIZE, height: TILE_SIZE }}
              />
            );
          return (
            <Image
              src={`/tiles/${tile.options[0]}.png`}
              alt={`tile ${tile.options[0]}`}
              key={tile.options[0] + '-' + idx}
              width={TILE_SIZE}
              height={TILE_SIZE}
            />
          );
        })}
      </div>
    </main>
  );
}
