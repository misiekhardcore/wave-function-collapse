import { act, renderHook } from '@testing-library/react';

import { usePatternGenerator } from './usePatternGenerator';

describe('usePatternGenerator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should report instant-generation progress without repainting the grid', () => {
    const { result } = renderHook(() => usePatternGenerator());

    act(() => result.current.setColumns(10));
    act(() => result.current.setRows(10));
    expect(result.current.totalTiles).toBe(100);

    act(() => result.current.generate());

    const seededGrid = result.current.grid;
    const seededTiles = result.current.collapsedTiles;
    expect(result.current.status).toBe('running');
    expect(seededTiles).toBeLessThan(result.current.totalTiles);

    // One tick of the clock runs exactly one slice of the solver, which is what
    // lets the progress readout paint between slices.
    act(() => jest.runOnlyPendingTimers());

    expect(result.current.status).toBe('running');
    expect(result.current.collapsedTiles).toBeGreaterThan(seededTiles);
    expect(result.current.collapsedTiles).toBeLessThan(result.current.totalTiles);

    // The readout moves, the canvas does not: an instant run must not repaint
    // the tiles it has already resolved.
    expect(result.current.grid).toBe(seededGrid);

    let slices = 1;
    while (result.current.status === 'running' && slices <= result.current.totalTiles) {
      act(() => jest.runOnlyPendingTimers());
      slices += 1;
    }

    expect(result.current.status).not.toBe('running');
    expect(slices).toBeGreaterThan(1);
    expect(Number.isFinite(result.current.endTime)).toBe(true);
  });

  it('should abandon the run in flight when restarted', () => {
    const { result } = renderHook(() => usePatternGenerator());

    act(() => result.current.setColumns(10));
    act(() => result.current.setRows(10));
    act(() => result.current.generate());
    act(() => jest.runOnlyPendingTimers());

    // A run now spans many tasks, so an abandoned one must not keep collapsing.
    expect(result.current.status).toBe('running');

    act(() => result.current.restart());
    const collapsedAfterRestart = result.current.collapsedTiles;
    act(() => jest.runOnlyPendingTimers());

    expect(result.current.status).toBe('idle');
    expect(result.current.collapsedTiles).toBe(collapsedAfterRestart);
  });
});
