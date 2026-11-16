import type { Tile } from '@/types';

/**
 * Bumped whenever the checked-in tile art changes.
 *
 * Tile URLs are otherwise stable across builds, so a browser, the Next image
 * optimiser or any CDN in front of the app would keep serving the previous PNG
 * — which mixes old and new tile art in one pattern. Bumping this version gives
 * the new art new URLs.
 */
export const TILE_ART_VERSION = 8;

/**
 * The PNG a tile is drawn with.
 *
 * The path is read from the set's `image`, which points into `public` with or
 * without a leading slash. One image serves every variant of a tile: the
 * rotation and mirroring are applied when it is drawn.
 */
export function getTileArtSrc(tile: Tile): string {
  const path = tile.image.startsWith('/') ? tile.image : `/${tile.image}`;

  return `${path}${path.includes('?') ? '&' : '?'}v=${TILE_ART_VERSION}`;
}
