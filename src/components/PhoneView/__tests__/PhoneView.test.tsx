import { fireEvent, render, screen } from '@testing-library/react';
import { PhoneView } from '../PhoneView';

describe('PhoneView', () => {
  it('shows this page in a titled frame, marked as embedded and on the chosen route', () => {
    render(<PhoneView route={{ origin: 80, destination: 452 }} onClose={() => {}} />);

    const frame = screen.getByTitle(/shown at phone width/i);
    expect(frame.tagName).toBe('IFRAME');
    expect(frame.getAttribute('src')).toBe(`${window.location.pathname}?from=80&to=452&embed=1`);
  });

  it('goes back to full screen', () => {
    const onClose = jest.fn();
    render(<PhoneView route={{ origin: 13, destination: 42 }} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: /back to full screen/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('is one main landmark with a heading, and the bezel is hidden from assistive technology', () => {
    const { container } = render(<PhoneView route={{ origin: 13, destination: 42 }} onClose={() => {}} />);

    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('heading', { name: /on a phone/i })).toBeTruthy();
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });
});
