import { createCanvas } from 'canvas';
import type { CanvasRenderingContext2D as CanvasContext } from 'canvas';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { SIDES, tileSets } from '../src/lib/tileSets';
import type { Tile, TileEdge, TileEdges, TileSetId } from '../src/types';

/**
 * Rasterises the tile art for every set to `public/tiles/<set>/<id>.png`.
 *
 * The wire set keeps its original hand-made art, so it is skipped here. The
 * other sets are drawn from their edge labels: the same data the solver uses,
 * so art and rules can never drift apart.
 *
 * Run with `pnpm tiles`.
 */

/** Matches the size of the original wire art; the canvas scales it down. */
const SIZE = 40;
const SURFACE = '#ffffff';

const MAZE_WALL = '#1a1a1a';

const PCB = {
  board: '#1f7f42',
  boardShadow: '#135c2e',
  trace: '#45e08d',
  pad: '#d7e0e4',
  chip: '#2b3136',
  die: '#3a4249',
  pin: '#6f7a86',
};

/** Clearance between a chip body and the board band its pins sit in, in pixels. */
const PCB_CHIP_MARGIN = 14;

const PCB_SIDE_POINTS: Record<(typeof SIDES)[number], [number, number]> = {
  top: [SIZE / 2, 0],
  right: [SIZE, SIZE / 2],
  bottom: [SIZE / 2, SIZE],
  left: [0, SIZE / 2],
};

const QUILT_COLORS: Record<string, string> = {
  'color-a': '#4f7cac',
  'color-b': '#c0704a',
  'color-c': '#7aa874',
};

const TERRAINS: TileEdge[] = ['land', 'beach', 'water'];

const TERRAIN_COLORS: Record<string, string> = {
  land: '#78a86b',
  beach: '#e6d3a3',
  water: '#5a8fc4',
};

type Painter = (context: CanvasContext, tile: Tile) => void;

type Side = keyof TileEdges;

type PcbPoint = [number, number];

/** Every trace is a dark halo under a bright line, so it reads on the board. */
function paintPcbTrace(context: CanvasContext, lines: PcbPoint[][]) {
  context.lineCap = 'round';
  context.lineJoin = 'round';

  const passes: [number, string][] = [
    [6.5, PCB.boardShadow],
    [4.5, PCB.trace],
  ];

  for (const [width, color] of passes) {
    context.lineWidth = width;
    context.strokeStyle = color;

    for (const points of lines) {
      context.beginPath();
      points.forEach(([x, y], index) => {
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
    }
  }
}

function paintPcbPad(context: CanvasContext, [x, y]: PcbPoint, radius: number) {
  context.fillStyle = PCB.pad;
  context.beginPath();
  context.arc(x, y, radius, 0, Math.PI * 2);
  context.fill();
}

/** A straight run with one 45° sidestep, the way a real trace changes lane. */
function pcbJogPoints(vertical: boolean): PcbPoint[] {
  const mid = SIZE / 2;
  const lane = 7;

  if (vertical) {
    return [
      [mid, 0],
      [mid, 8],
      [mid - lane, 15],
      [mid - lane, 25],
      [mid, 32],
      [mid, SIZE],
    ];
  }

  return [
    [0, mid],
    [8, mid],
    [15, mid - lane],
    [25, mid - lane],
    [32, mid],
    [SIZE, mid],
  ];
}

/**
 * Green copper on soldermask. Elbows bend through a via or run straight on the
 * 45°, straights hold their line or jog, tees meet at a via, and test points end
 * in a silver terminal pad. Silver appears nowhere else.
 */
function paintPcb(context: CanvasContext, tile: Tile) {
  context.fillStyle = PCB.board;
  context.fillRect(0, 0, SIZE, SIZE);

  if (tile.art === 'chip' || tile.art === 'chip-body') {
    paintChipPart(context, tile);
    return;
  }

  const connected = SIDES.filter((side) => tile.edges[side] === 'green');
  const middle: PcbPoint = [SIZE / 2, SIZE / 2];
  const lines: PcbPoint[][] = [];

  if (tile.art === 'diagonal' && connected.length === 2) {
    lines.push([PCB_SIDE_POINTS[connected[0]], PCB_SIDE_POINTS[connected[1]]]);
  } else if (tile.art === 'jog') {
    lines.push(pcbJogPoints(connected.includes('top')));
  } else {
    for (const side of connected) lines.push([PCB_SIDE_POINTS[side], middle]);
  }

  paintPcbTrace(context, lines);

  if (tile.art === 'terminal') {
    paintPcbPad(context, middle, 6);
    return;
  }

  // Only where three traces meet is a via worth drawing; a bend simply rounds.
  if (tile.art === undefined && connected.length >= 3) paintPcbPad(context, middle, 4.5);
}

type ChipCorners = { tl: boolean; tr: boolean; br: boolean; bl: boolean };

function chipBodyPath(
  context: CanvasContext,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  corners: ChipCorners
) {
  const radius = 4;

  context.beginPath();
  context.moveTo(x0 + (corners.tl ? radius : 0), y0);
  context.lineTo(x1 - (corners.tr ? radius : 0), y0);
  if (corners.tr) context.quadraticCurveTo(x1, y0, x1, y0 + radius);
  context.lineTo(x1, y1 - (corners.br ? radius : 0));
  if (corners.br) context.quadraticCurveTo(x1, y1, x1 - radius, y1);
  context.lineTo(x0 + (corners.bl ? radius : 0), y1);
  if (corners.bl) context.quadraticCurveTo(x0, y1, x0, y1 - radius);
  context.lineTo(x0, y0 + (corners.tl ? radius : 0));
  if (corners.tl) context.quadraticCurveTo(x0, y0, x0 + radius, y0);
  context.closePath();
}

/** Pin legs in the clearance band, all at the same pitch so they line up. */
const PCB_PIN_WIDTH = 6;
const PCB_PIN_LENGTH = 11;
const PCB_PIN_PITCH = 10;

/**
 * Draws the legs that stick out of one board-facing side of the body. The run
 * stops short of a corner that also faces the board, where the perpendicular
 * row would otherwise collide with it.
 */
function paintChipPins(
  context: CanvasContext,
  side: Side,
  board: Record<Side, boolean>,
  x0: number,
  y0: number
) {
  // Keep the corner clear of a side that also faces the board, where the
  // perpendicular row would otherwise collide with this one.
  const inset = PCB_CHIP_MARGIN - 2;
  const half = PCB_PIN_WIDTH / 2;
  const horizontal = side === 'top' || side === 'bottom';
  const startBoard = horizontal ? board.left : board.top;
  const endBoard = horizontal ? board.right : board.bottom;

  context.fillStyle = PCB.pin;

  for (let center = PCB_PIN_PITCH / 2; center < SIZE; center += PCB_PIN_PITCH) {
    if ((startBoard && center < inset) || (endBoard && center > SIZE - inset)) continue;

    if (side === 'top')
      context.fillRect(center - half, y0 - PCB_PIN_LENGTH, PCB_PIN_WIDTH, PCB_PIN_LENGTH);
    if (side === 'bottom') context.fillRect(center - half, y0, PCB_PIN_WIDTH, PCB_PIN_LENGTH);
    if (side === 'left')
      context.fillRect(x0 - PCB_PIN_LENGTH, center - half, PCB_PIN_LENGTH, PCB_PIN_WIDTH);
    if (side === 'right') context.fillRect(x0, center - half, PCB_PIN_LENGTH, PCB_PIN_WIDTH);
  }
}

/**
 * One part of a chip package. Board sides get a clearance band for the pins, so
 * the parts assemble into a single rounded dark block whatever the footprint.
 */
function paintChipPart(context: CanvasContext, tile: Tile) {
  const margin = PCB_CHIP_MARGIN;
  const board = {
    top: tile.edges.top === 'open',
    right: tile.edges.right === 'open',
    bottom: tile.edges.bottom === 'open',
    left: tile.edges.left === 'open',
  };

  const x0 = board.left ? margin : 0;
  const y0 = board.top ? margin : 0;
  const x1 = board.right ? SIZE - margin : SIZE;
  const y1 = board.bottom ? SIZE - margin : SIZE;

  if (board.top) paintChipPins(context, 'top', board, x0, y0);
  if (board.right) paintChipPins(context, 'right', board, x1, y0);
  if (board.bottom) paintChipPins(context, 'bottom', board, x0, y1);
  if (board.left) paintChipPins(context, 'left', board, x0, y0);

  context.fillStyle = PCB.chip;
  chipBodyPath(context, x0, y0, x1, y1, {
    tl: board.top && board.left,
    tr: board.top && board.right,
    br: board.bottom && board.right,
    bl: board.bottom && board.left,
  });
  context.fill();

  // Only the centre part carries the die; the edges of the package are pins.
  if (tile.art !== 'chip-body') return;

  context.fillStyle = PCB.die;
  context.fillRect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16);
}

/** Walls are thick bands hugging every closed side, so they join up next door. */
function paintWalls(context: CanvasContext, tile: Tile) {
  const band = SIZE / 4;

  context.fillStyle = MAZE_WALL;
  if (tile.edges.top === 'wall') context.fillRect(0, 0, SIZE, band);
  if (tile.edges.right === 'wall') context.fillRect(SIZE - band, 0, band, SIZE);
  if (tile.edges.bottom === 'wall') context.fillRect(0, SIZE - band, SIZE, band);
  if (tile.edges.left === 'wall') context.fillRect(0, 0, band, SIZE);
}

/** Four triangles from the centre, each in the colour of the side it meets. */
function paintQuilt(context: CanvasContext, tile: Tile) {
  const mid = SIZE / 2;
  const corners: Record<(typeof SIDES)[number], [number, number][]> = {
    top: [
      [0, 0],
      [SIZE, 0],
    ],
    right: [
      [SIZE, 0],
      [SIZE, SIZE],
    ],
    bottom: [
      [SIZE, SIZE],
      [0, SIZE],
    ],
    left: [
      [0, SIZE],
      [0, 0],
    ],
  };

  for (const side of SIDES) {
    const color = QUILT_COLORS[tile.edges[side]];
    const [from, to] = corners[side];

    context.fillStyle = color;
    context.beginPath();
    context.moveTo(mid, mid);
    context.lineTo(from[0], from[1]);
    context.lineTo(to[0], to[1]);
    context.closePath();
    context.fill();
  }
}

/**
 * The interior takes the average terrain of the four sides, and every side
 * keeps a band of its own terrain so neighbouring tiles line up.
 */
function paintTerrain(context: CanvasContext, tile: Tile) {
  const average =
    SIDES.reduce((total, side) => total + TERRAINS.indexOf(tile.edges[side]), 0) / SIDES.length;
  const base = TERRAINS[Math.round(average)];
  const band = SIZE * 0.3;

  context.fillStyle = TERRAIN_COLORS[base];
  context.fillRect(0, 0, SIZE, SIZE);

  for (const side of SIDES) {
    context.fillStyle = TERRAIN_COLORS[tile.edges[side]];

    if (side === 'top') context.fillRect(0, 0, SIZE, band);
    if (side === 'right') context.fillRect(SIZE - band, 0, band, SIZE);
    if (side === 'bottom') context.fillRect(0, SIZE - band, SIZE, band);
    if (side === 'left') context.fillRect(0, 0, band, SIZE);
  }
}

const PAINTERS: Partial<Record<TileSetId, Painter>> = {
  pcb: paintPcb,
  maze: paintWalls,
  quilt: paintQuilt,
  terrain: paintTerrain,
};

async function main() {
  const outputRoot = join(process.cwd(), 'public', 'tiles');

  for (const set of tileSets) {
    const painter = PAINTERS[set.id];
    if (!painter) continue;

    const directory = join(outputRoot, set.id);
    await mkdir(directory, { recursive: true });

    for (const tile of set.tiles) {
      const canvas = createCanvas(SIZE, SIZE);
      const context = canvas.getContext('2d');

      context.fillStyle = SURFACE;
      context.fillRect(0, 0, SIZE, SIZE);
      painter(context, tile);

      await writeFile(join(directory, `${tile.id}.png`), canvas.toBuffer('image/png'));
    }

    console.log(`${set.name}: wrote ${set.tiles.length} tiles to ${directory}`);
  }
}

void main();
