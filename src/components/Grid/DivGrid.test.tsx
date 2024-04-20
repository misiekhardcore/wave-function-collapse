import { render, screen } from '@testing-library/react';

import { DivGrid } from './DivGrid';

describe('DivGrid', () => {
  it('should render the grid', () => {
    const grid = [
      { col: 0, row: 0, collapsed: false, options: [0, 1, 2, 3] },
      { col: 0, row: 1, collapsed: true, options: [1] },
      { col: 1, row: 0, collapsed: true, options: [2] },
      { col: 1, row: 1, collapsed: true, options: [2] },
    ];

    render(<DivGrid grid={grid} cols={2} tileSize={10} />);

    const divGrid = screen.getByTestId('div-grid');
    expect(divGrid).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });
});
