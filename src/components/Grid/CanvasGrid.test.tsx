import { render, waitFor } from '@testing-library/react';
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

import { CanvasGrid } from './CanvasGrid';

describe('CanvasGrid', () => {
  it('should render the grid', async () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [0] },
      { col: 1, row: 0, collapsed: true, options: [1] },
      { col: 1, row: 1, collapsed: true, options: [5] },
    ];

    const { getByTestId } = render(<CanvasGrid grid={grid} cols={2} tileSize={20} />);
    const canvas = await waitFor(() => {
      return getByTestId('canvas') as HTMLCanvasElement;
    });
    expect(canvas).toBeInTheDocument();

    const img = canvas.toDataURL();
    const data = img.replace(/^data:image\/\w+;base64,/, '');
    const buf = Buffer.from(data, 'base64');
    // may need to do fuzzy image comparison because, at least for me, on
    // travis-ci it was sometimes 2 pixel diff or more for font related stuff
    expect(buf).toMatchImageSnapshot({
      failureThreshold: 0.5,
      failureThresholdType: 'percent',
    });
  });
});
