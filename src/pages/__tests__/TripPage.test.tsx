import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { TripPage } from '../TripPage';
import { makePlace, makeQuote, makeStop, makeTrip, mockApi } from '../../test/mockApi';

/** Chooses the option with this visible text, as a person would in the select. */
const selectOption = (select: HTMLElement, text: string) => {
  const option = Array.from((select as HTMLSelectElement).options).find((o) => o.text === text)!;
  fireEvent.change(select, { target: { value: option.value } });
};

const places = [makePlace(13, 'Dundee'), makePlace(42, 'Edinburgh'), makePlace(80, 'Glasgow')];

const tripOne = makeTrip(
  [makeStop(1, 'Perth Road', -20, { actual: new Date().toISOString() }), makeStop(2, 'Forth Bridge', 20)],
  {
    latitude: 56.1,
    longitude: -3.1,
    heading: 90,
  },
);
const tripTwo = makeTrip([makeStop(3, 'Falkirk', 15), makeStop(4, 'Stirling', 40)], {
  latitude: 56.0,
  longitude: -3.8,
});

const twoBuses = () =>
  mockApi({
    places,
    quotes: [makeQuote('one', -60), makeQuote('two', -30)],
    trips: { one: tripOne, two: tripTwo },
  });

describe('TripPage (integration)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('shows the buses running now and the stops of the first', async () => {
    twoBuses();
    render(<TripPage />);

    expect(screen.getByRole('status').textContent).toMatch(/loading trips/i);

    expect(await screen.findByText('Forth Bridge')).toBeTruthy();
    expect(screen.queryByText('Falkirk', { selector: 'div' })).toBeNull();
    expect(screen.getAllByRole('button', { name: /^Bus [12]/ })).toHaveLength(4); // two on the map, two in the list
  });

  test('puts every running bus on the map', async () => {
    twoBuses();
    render(<TripPage />);

    await screen.findByText('Forth Bridge');

    const map = screen.getByRole('region', { name: /live map/i });
    expect(within(map).getAllByRole('button', { name: /^Bus 1,/ })).toHaveLength(1);
    expect(within(map).getAllByRole('button', { name: /^Bus 2,/ })).toHaveLength(1);
  });

  test('shows another bus’s stops when it is chosen', async () => {
    twoBuses();
    render(<TripPage />);
    await screen.findByText('Forth Bridge');

    const list = screen.getByRole('list', { name: /buses on this route/i });
    fireEvent.click(within(list).getByRole('button', { name: /Bus 2/ }));

    expect(await screen.findByText('Falkirk', { selector: 'div' })).toBeTruthy();
    expect(screen.queryByText('Forth Bridge', { selector: 'div' })).toBeNull();
    expect(within(list).getByRole('button', { name: /Bus 2/ }).getAttribute('aria-pressed')).toBe('true');
  });

  test('follows a bus when its marker on the map is clicked', async () => {
    twoBuses();
    render(<TripPage />);
    await screen.findByText('Forth Bridge');

    const map = screen.getByRole('region', { name: /live map/i });
    fireEvent.click(within(map).getByRole('button', { name: /^Bus 2,/ }));

    expect(await screen.findByText('Falkirk', { selector: 'div' })).toBeTruthy();
  });

  test('shows no bus selector when only one bus is running', async () => {
    mockApi({ places, quotes: [makeQuote('one', -60)], trips: { one: tripOne } });
    render(<TripPage />);

    await screen.findByText('Forth Bridge');

    expect(screen.queryByRole('list', { name: /buses on this route/i })).toBeNull();
  });

  test('says so when the bus shown has not left yet', async () => {
    mockApi({ places, quotes: [makeQuote('soon', 30)], trips: { soon: tripOne } });
    render(<TripPage />);

    expect(await screen.findByText(/no bus is running right now/i)).toBeTruthy();
    expect(screen.getByText('Forth Bridge')).toBeTruthy();
  });

  test('names the route in the header, using the place names', async () => {
    twoBuses();
    render(<TripPage />);

    expect(await screen.findByText('Dundee → Edinburgh')).toBeTruthy();
  });

  describe('choosing a route', () => {
    test('opens the route in the address', async () => {
      window.history.replaceState(null, '', '/?from=80&to=13');
      const fetchMock = twoBuses();
      render(<TripPage />);

      expect(await screen.findByText('Glasgow → Dundee')).toBeTruthy();
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('origin=80&destination=13'));
    });

    test('loads the buses for a newly chosen destination and updates the address', async () => {
      const fetchMock = twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');

      selectOption(screen.getByLabelText('To'), 'Glasgow');

      await waitFor(() =>
        expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('origin=13&destination=80')),
      );
      expect(window.location.search).toBe('?from=13&to=80');
      expect(await screen.findByText('Dundee → Glasgow')).toBeTruthy();
    });

    test('swaps the ends of the route', async () => {
      twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');

      fireEvent.click(screen.getByRole('button', { name: /swap/i }));

      expect(await screen.findByText('Edinburgh → Dundee')).toBeTruthy();
      expect(window.location.search).toBe('?from=42&to=13');
    });

    test('swaps instead of allowing one place at both ends', async () => {
      twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');

      selectOption(screen.getByLabelText('From'), 'Edinburgh');

      expect(await screen.findByText('Edinburgh → Dundee')).toBeTruthy();
    });

    test('goes back to following the first bus after the route changes', async () => {
      twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');
      const list = screen.getByRole('list', { name: /buses on this route/i });
      fireEvent.click(within(list).getByRole('button', { name: /Bus 2/ }));
      await screen.findByText('Falkirk', { selector: 'div' });

      selectOption(screen.getByLabelText('To'), 'Glasgow');

      expect(await screen.findByText('Forth Bridge', { selector: 'div' })).toBeTruthy();
    });

    test('still shows the buses when the list of places cannot be loaded', async () => {
      const fetchMock = twoBuses();
      const original = fetchMock.getMockImplementation()!;
      fetchMock.mockImplementation((input) =>
        String(input).includes('/locations/') ? Promise.reject(new Error('offline')) : original(input),
      );
      render(<TripPage />);

      expect(await screen.findByText('Forth Bridge')).toBeTruthy();
      expect(screen.queryByRole('form', { name: /choose a route/i })).toBeNull();
    });
  });

  describe('phone view', () => {
    test('is offered on the full screen page', async () => {
      twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');

      expect(screen.getByRole('button', { name: 'View on a phone' })).toBeTruthy();
    });

    test('swaps the page for a framed copy of itself, and back', async () => {
      twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');

      fireEvent.click(screen.getByRole('button', { name: 'View on a phone' }));

      expect(screen.getByTitle(/shown at phone width/i)).toBeTruthy();
      // The full page has gone, which also stops its 15-second refresh, so the frame is the only live copy.
      expect(screen.queryByRole('region', { name: /live map/i })).toBeNull();

      fireEvent.click(screen.getByRole('button', { name: /back to full screen/i }));

      expect(await screen.findByRole('region', { name: /live map/i })).toBeTruthy();
      expect(screen.queryByTitle(/shown at phone width/i)).toBeNull();
    });

    test('opens on the route that was chosen', async () => {
      twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');
      selectOption(screen.getByLabelText('To'), 'Glasgow');
      await screen.findByText('Dundee → Glasgow');

      fireEvent.click(screen.getByRole('button', { name: 'View on a phone' }));

      expect(screen.getByTitle(/shown at phone width/i).getAttribute('src')).toMatch(
        /\?from=13&to=80&embed=1$/,
      );
    });

    test('is not offered inside the phone view, and the address keeps saying so', async () => {
      window.history.replaceState(null, '', '/?from=13&to=42&embed=1');
      twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');

      expect(screen.queryByRole('button', { name: 'View on a phone' })).toBeNull();

      selectOption(screen.getByLabelText('To'), 'Glasgow');
      await screen.findByText('Dundee → Glasgow');

      expect(window.location.search).toBe('?from=13&to=80&embed=1');
    });
  });

  describe('when there is nothing to show', () => {
    test('says so when no bus runs on the route', async () => {
      mockApi({ places, quotes: [] });
      render(<TripPage />);

      expect(await screen.findByText(/no buses run on this route/i)).toBeTruthy();
    });

    test('renders an error message if the trips cannot be fetched', async () => {
      mockApi({ places, failQuotes: true });
      render(<TripPage />);

      expect((await screen.findByRole('alert')).textContent).toMatch(/something went wrong/i);
    });

    test('keeps the route picker so another route can be tried', async () => {
      mockApi({ places, failQuotes: true });
      render(<TripPage />);
      await screen.findByRole('alert');

      expect(screen.getByLabelText('From')).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    test('has one main landmark while loading, once loaded and on failure', async () => {
      twoBuses();
      const { unmount } = render(<TripPage />);
      expect(screen.getAllByRole('main')).toHaveLength(1);
      await screen.findByText('Forth Bridge');
      expect(screen.getAllByRole('main')).toHaveLength(1);
      unmount();

      mockApi({ places, failQuotes: true });
      render(<TripPage />);
      await screen.findByRole('alert');
      expect(screen.getAllByRole('main')).toHaveLength(1);
    });

    test('announces a failure as an alert inside the main landmark', async () => {
      mockApi({ failQuotes: true });
      render(<TripPage />);

      const alert = await screen.findByRole('alert');

      expect(screen.getByRole('main').contains(alert)).toBe(true);
    });

    test('gives the buses on the map accessible names', async () => {
      twoBuses();
      render(<TripPage />);

      await screen.findByText('Forth Bridge');

      const map = screen.getByRole('region', { name: /live map/i });
      expect(within(map).getByRole('button', { name: /^Bus 1, \d\d:\d\d departure$/ })).toBeTruthy();
      expect(within(map).getByRole('button', { name: /^Bus 2, \d\d:\d\d departure$/ })).toBeTruthy();
    });

    test('keeps the stop markers out of the tab order, so the stop list is the keyboard route', async () => {
      twoBuses();
      render(<TripPage />);

      await screen.findByText('Forth Bridge');

      const map = screen.getByRole('region', { name: /live map/i });
      const stopMarker = map.querySelector('.stop-dot-icon[title="Forth Bridge"]');
      expect(stopMarker).not.toBeNull();
      expect(stopMarker?.getAttribute('tabindex')).toBeNull();
      expect(within(map).queryByRole('button', { name: 'Forth Bridge' })).toBeNull();
    });

    test('labels the route pickers and the swap button', async () => {
      twoBuses();
      render(<TripPage />);
      await screen.findByText('Forth Bridge');

      expect(screen.getByLabelText('From')).toBeTruthy();
      expect(screen.getByLabelText('To')).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Swap from and to' })).toBeTruthy();
    });
  });
});
