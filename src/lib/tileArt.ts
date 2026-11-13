import type { TileSetId } from '@/types';

/**
 * Bumped whenever `pnpm tiles` changes the rasterised art.
 *
 * Tile URLs are otherwise stable across builds, so a browser, the Next image
 * optimiser or any CDN in front of the app would keep serving the previous PNG
 * — which mixes old and new tile art in one pattern. Bumping this version gives
 * the new art new URLs.
 */
export const TILE_ART_VERSION = 2;

export function getTileArtSrc(tileSetId: TileSetId, tileId: number): string {
  return `/tiles/${tileSetId}/${tileId}.png?v=${TILE_ART_VERSION}`;
}
