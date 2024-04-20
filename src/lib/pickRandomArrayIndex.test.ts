import { pickRandomArrayIndex } from './pickRandomArrayIndex';

describe('pickRandomArrayIndex', () => {
  it('should return a random index', () => {
    const array = [0, 1, 2, 3, 4, 5];
    const result = pickRandomArrayIndex(array);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(array.length);
  });

  it('should return 0 for an empty array', () => {
    const array: number[] = [];
    const result = pickRandomArrayIndex(array);
    expect(result).toBe(0);
  });
});
