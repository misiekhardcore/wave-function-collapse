import { getCommonOptions } from './getCommonOptions';

describe('getCommonOptions', () => {
  it('should return the common options between two sets of options', () => {
    let options1 = [1, 2, 3];
    let options2 = [2, 3, 4];
    expect(getCommonOptions(options1, options2)).toEqual([2, 3]);

    options1 = [1, 2, 3];
    options2 = [4, 5, 6];
    expect(getCommonOptions(options1, options2)).toEqual([]);
  });

  it('should return the common options between four sets of options', () => {
    const options1 = [1, 2, 4];
    const options2 = [2, 3, 4];
    const options3 = [3, 4, 5];
    const options4 = [4, 5, 6];
    expect(getCommonOptions(options1, options2, options3, options4)).toEqual([4]);
  });

  it('should return an empty array if no common options are found', () => {
    const options1 = [1, 2, 3];
    const options2 = [4, 5, 6];
    const options3 = [7, 8, 9];
    const options4 = [10, 11, 12];
    expect(getCommonOptions(options1, options2, options3, options4)).toEqual([]);
  });
});
