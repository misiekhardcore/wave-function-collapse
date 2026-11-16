import { getBiasFactor } from './bias';

describe('getBiasFactor', () => {
  it('should leave the weights alone when the bias is constant', () => {
    for (let index = 0; index < 20; index++) {
      expect(getBiasFactor('constant', index)).toBe(1);
    }
  });

  it('should vary the factor from cell to cell with noise', () => {
    const factors = Array.from({ length: 40 }, (_, index) => getBiasFactor('noise', index));

    expect(new Set(factors).size).toBeGreaterThan(20);
  });

  it('should keep every noise factor within half to one and a half', () => {
    for (let index = 0; index < 200; index++) {
      const factor = getBiasFactor('noise', index);

      expect(factor).toBeGreaterThanOrEqual(0.5);
      expect(factor).toBeLessThan(1.5);
    }
  });

  it('should give a cell the same factor every time', () => {
    expect(getBiasFactor('noise', 17)).toBe(getBiasFactor('noise', 17));
  });
});
