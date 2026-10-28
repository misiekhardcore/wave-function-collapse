'use client';

import { CanvasGrid, PatternControls, Stage, TilesPreview } from '@/components';
import { TILE_SIZE, usePatternGenerator } from '@/hooks';
import { getElapsedTime, tiles } from '@/lib';

export default function Home() {
  const {
    grid,
    columns,
    rows,
    status,
    isRunning,
    isComplete,
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
  } = usePatternGenerator();

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      <div className="flex flex-col gap-4">
        <PatternControls
          columns={columns}
          rows={rows}
          isRunning={isRunning}
          isComplete={isComplete}
          onColumnsChange={setColumns}
          onRowsChange={setRows}
          onGenerate={generate}
          onAnimate={animate}
          onRestart={restart}
          onDownload={download}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <Stage
          status={status}
          elapsedTime={getElapsedTime(startTime, endTime)}
          collapsedTiles={collapsedTiles}
          totalTiles={totalTiles}
        >
          <CanvasGrid ref={canvasRef} grid={grid} cols={columns} tileSize={TILE_SIZE} />
        </Stage>
        <TilesPreview tiles={tiles} />
      </div>
    </main>
  );
}
