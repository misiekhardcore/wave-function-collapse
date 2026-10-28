/**
 * Formats the time between two timestamps as seconds with two decimals.
 *
 * Returns `'--'` until a run has both started and finished, so the UI can render
 * the same helper for every state of the generator.
 */
export function getElapsedTime(startTime?: number, endTime?: number): string {
  if (!startTime || !endTime) return '--';

  return `${((endTime - startTime) / 1000).toFixed(2)}s`;
}
