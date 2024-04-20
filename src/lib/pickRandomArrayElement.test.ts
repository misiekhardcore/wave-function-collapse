import { pickRandomArrayElement } from './pickRandomArrayElement';

describe('pickRandomArrayIndex', () => {
  it('should return a random index', () => {
    const array = [0, 1, 2, 3, 4, 5];
    const result = pickRandomArrayElement(array);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(array.length);
  });

  it('should return undefined for an empty array', () => {
    const array: number[] = [];
    const result = pickRandomArrayElement(array);
    expect(result).not.toBeDefined();
  });
});
