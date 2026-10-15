import { fireEvent, render, screen } from '@testing-library/react';
import { TripSelector } from '../TripSelector';
import { makeStop } from '../../../test/mockApi';
import type { LiveTrip } from '@/types/trip';

const at = (offset: number) => new Date(Date.now() + offset * 60000).toISOString();

const trip = (uid: string, over: Partial<LiveTrip> = {}): LiveTrip => ({
  uid,
  departure: at(-60),
  arrival: at(60),
  inProgress: true,
  gps: null,
  route: [makeStop(1, 'A', 20, { estimated: at(26) })],
  ...over,
});

describe('TripSelector', () => {
  it('lists every bus with how late it is running', () => {
    render(
      <TripSelector
        trips={[trip('a'), trip('b', { route: [makeStop(1, 'A', 20)] })]}
        selectedUid="a"
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText('Bus 1').closest('button')?.textContent).toMatch(/6 min late/);
    expect(screen.getByText('Bus 2').closest('button')?.textContent).toMatch(/on time/);
  });

  it('marks the followed bus as pressed', () => {
    render(<TripSelector trips={[trip('a'), trip('b')]} selectedUid="b" onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: /Bus 2/ }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: /Bus 1/ }).getAttribute('aria-pressed')).toBe('false');
  });

  it('says when a bus has not left yet', () => {
    render(<TripSelector trips={[trip('a', { inProgress: false })]} selectedUid="a" onSelect={() => {}} />);

    expect(screen.getByRole('button').textContent).toMatch(/not yet running/);
  });

  it('reports which bus was chosen', async () => {
    const onSelect = jest.fn();
    render(<TripSelector trips={[trip('a'), trip('b')]} selectedUid="a" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: /Bus 2/ }));

    expect(onSelect).toHaveBeenCalledWith('b');
  });
});
