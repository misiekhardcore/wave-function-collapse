import type { TileObject, Tile } from '../types';

/**
 * Generates a timestamped filename for the download
 */
export function generateDownloadFilename(): string {
  return `wave-function-collapse-${Date.now()}.png`;
}

/**
 * Downloads an image from a canvas element
 * @param canvas - The canvas element to download
 * @param filename - The name of the file to download (default: 'pattern.png')
 */
export function downloadCanvasAsImage(
  canvas: HTMLCanvasElement | null,
  filename = 'pattern.png'
): void {
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  try {
    // Convert canvas to data URL
    const dataURL = canvas.toDataURL('image/png');

    // Create a temporary anchor element
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataURL;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading image:', error);
  }
}

/**
 * Creates a canvas from the current grid and downloads it as an image
 * @param grid - The grid data
 * @param cols - Number of columns
 * @param tileSize - Size of each tile
 * @param tiles - The tile definitions
 * @param filename - The name of the file to download (default: 'pattern.png')
 */
export function downloadGridAsImage(
  grid: TileObject[],
  cols: number,
  tileSize: number,
  tiles: Tile[],
  filename = 'pattern.png'
): void {
  const rows = grid.length / cols;
  const canvas = document.createElement('canvas');
  canvas.width = cols * tileSize;
  canvas.height = rows * tileSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }

  // Get unique tile IDs that are actually used in the grid
  const usedTileIds = new Set(grid.filter((cell) => cell.collapsed).map((cell) => cell.options[0]));

  // Create a promise array only for the tiles that are used
  const usedTiles = tiles.filter((tile) => usedTileIds.has(tile.id));
  const imagePromises = usedTiles.map((tile) => {
    return new Promise<{ id: number; img: HTMLImageElement }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ id: tile.id, img });
      img.onerror = reject;
      img.src = `/tiles/${tile.id}.png`;
    });
  });

  // Wait for all images to load, then draw and download
  Promise.all(imagePromises)
    .then((loadedImages) => {
      // Create a map for quick lookup
      const imageMap = new Map(loadedImages.map((item) => [item.id, item.img]));

      for (let idx = 0; idx < grid.length; idx++) {
        const tile = grid[idx];
        const x = (idx % cols) * tileSize;
        const y = Math.floor(idx / cols) * tileSize;

        if (tile.options.length !== 1) {
          ctx.fillStyle = 'black';
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = 'blue';
          ctx.strokeRect(x, y, tileSize, tileSize);
        } else {
          const img = imageMap.get(tile.options[0]);
          if (img) {
            ctx.drawImage(img, x, y, tileSize, tileSize);
          }
        }
      }

      downloadCanvasAsImage(canvas, filename);
    })
    .catch((error) => {
      console.error('Error loading tile images:', error);
    });
}
