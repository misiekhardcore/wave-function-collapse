import { z } from 'zod';

/**
 * One edge of a tile, read clockwise: `lw` runs from land to water.
 *
 * Two edges connect automatically when one is the reverse of the other, so a
 * set never lists the pairs that already follow from its sockets.
 */
const socketSchema = z
  .string()
  .min(1, 'A socket cannot be empty.')
  .regex(/^\S+$/, 'A socket cannot contain spaces.');

/** Clockwise rotation, in degrees. */
export const rotationSchema = z.union([
  z.literal(0),
  z.literal(90),
  z.literal(180),
  z.literal(270),
]);

export const tileDefinitionSchema = z
  .strictObject({
    image: z.string().min(1, 'A tile needs an image.'),
    sockets: z.tuple([socketSchema, socketSchema, socketSchema, socketSchema], {
      error: 'A tile needs four sockets: north, east, south and west.',
    }),
    /** Frequency of the tile; split evenly across its variants. */
    weight: z.number().positive('A tile weight has to be greater than zero.').default(1),
    /** Every angle the tile is instantiated at. */
    rotate: z.array(rotationSchema).min(1, 'A tile needs at least one rotation.').default([0]),
    /** Adds a mirrored variant at every rotation. */
    flip: z.boolean().default(false),
  })
  .strict();

/** `[socketA, socketB, weight]`: an extra pair, or a weight on an automatic one. */
export const connectionSchema = z.tuple([socketSchema, socketSchema, z.number().min(0)]);

export const tileSetDataSchema = z
  .strictObject({
    version: z.literal(1, { error: 'Unsupported tile set version.' }),
    id: z.string().min(1).optional(),
    name: z.string().min(1, 'A tile set needs a name.'),
    description: z.string().default(''),
    bias: z.enum(['constant', 'noise']).default('constant'),
    connections: z.array(connectionSchema).default([]),
    tiles: z.record(z.string().min(1), tileDefinitionSchema),
  })
  .superRefine((set, ctx) => {
    const names = Object.keys(set.tiles);

    if (names.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'A tile set needs at least one tile.',
        path: ['tiles'],
      });
    }

    const sockets = new Set(names.flatMap((name) => set.tiles[name].sockets));
    const written = new Map<string, [string, string]>();

    for (const [name, tile] of Object.entries(set.tiles)) {
      if (new Set(tile.rotate).size !== tile.rotate.length) {
        ctx.addIssue({
          code: 'custom',
          message: `Tile "${name}" lists the same rotation twice.`,
          path: ['tiles', name, 'rotate'],
        });
      }
    }

    for (const [index, [a, b, weight]] of set.connections.entries()) {
      const path = ['connections', index];

      for (const socket of [a, b]) {
        if (!sockets.has(socket)) {
          ctx.addIssue({
            code: 'custom',
            message: `Connection names socket "${socket}", which no tile has.`,
            path,
          });
        }
      }

      // A forbidden pair only means something where the sockets would otherwise
      // connect on their own, which is exactly the reverse pair.
      if (weight === 0 && reverseSocket(a) !== b) {
        ctx.addIssue({
          code: 'custom',
          message: `Connection "${a}" to "${b}" forbids a pair that could not happen anyway; it has to name a socket and its reverse.`,
          path,
        });
      }

      const key = [a, b].sort().join('\u0000');
      const previous = written.get(key);

      if (previous) {
        ctx.addIssue({
          code: 'custom',
          message: `Connection "${a}" to "${b}" is listed twice.`,
          path,
        });
      } else {
        written.set(key, [a, b]);
      }
    }
  });

/** The reverse of an edge, which is what it has to meet on the next tile. */
export function reverseSocket(socket: string): string {
  return [...socket].reverse().join('');
}

export type TileDefinition = z.output<typeof tileDefinitionSchema>;
export type TileSetData = z.output<typeof tileSetDataSchema>;

/** A definition is data, so a typo in it has to fail loudly and early. */
export function parseTileSetData(data: unknown): TileSetData {
  const result = tileSetDataSchema.safeParse(data);

  if (result.success) return result.data;

  const details = result.error.issues
    .map((issue) => `${issue.path.join('.') || 'set'}: ${issue.message}`)
    .join('\n');

  throw new Error(`Invalid tile set:\n${details}`);
}
