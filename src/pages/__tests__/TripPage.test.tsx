import { render, screen, waitFor } from '@testing-library/react';
import { TripPage } from '../TripPage';

const mockQuotesResponse = {
  quotes: [
    {
      legs: [
        {
          trip_uid: 'abc123',
          departure: { scheduled: new Date(Date.now() + 100000).toISOString() },
        },
      ],
    },
  ],
};

const mockTripResponse = {
  route: [
    {
      id: 'stop1',
      location: { name: 'First Stop', lat: 1, lon: 1 },
      arrival: { scheduled: '2025-06-20T12:00:00Z' },
    },
  ],
  vehicle: {
    id: 'vehicle1',
    gps: {
      latitude: 1,
      longitude: 1,
      last_updated: '2025-06-20T12:00:00Z',
    },
  },
};

describe('TripPage (integration)', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('renders trip page with live data', async () => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotesResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockTripResponse,
      } as Response);

    render(<TripPage />);

    expect(screen.getByText(/loading trip/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText(/first stop/i)).toBeTruthy();
    });

    // Optionally verify elements like:
    expect(screen.getByText(/first stop/i)).toBeTruthy();
  });

  test('renders error message if trip fetch fails', async () => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotesResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
      } as Response);

    render(<TripPage />);

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeTruthy();
    });
  });

  describe('accessibility', () => {
    const stubFetch = (tripResponse: unknown, tripOk = true) => {
      global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;
      (global.fetch as jest.MockedFunction<typeof fetch>)
        .mockResolvedValueOnce({ ok: true, json: async () => mockQuotesResponse } as Response)
        .mockResolvedValueOnce({ ok: tripOk, json: async () => tripResponse } as Response);
    };

    test('has a main landmark and announces loading as a status', async () => {
      stubFetch(mockTripResponse);
      render(<TripPage />);

      expect(screen.getByRole('main')).toBeTruthy();
      expect(screen.getByRole('status').textContent).toMatch(/loading trip/i);

      await waitFor(() => expect(screen.getByText(/first stop/i)).toBeTruthy());
    });

    test('keeps the main landmark once the trip has loaded', async () => {
      stubFetch(mockTripResponse);
      render(<TripPage />);

      await waitFor(() => expect(screen.getByText(/first stop/i)).toBeTruthy());

      expect(screen.getByRole('main')).toBeTruthy();
    });

    test('announces a failure as an alert inside the main landmark', async () => {
      stubFetch({}, false);
      render(<TripPage />);

      const alert = await screen.findByRole('alert');

      expect(alert.textContent).toMatch(/something went wrong/i);
      expect(screen.getByRole('main').contains(alert)).toBe(true);
    });

    test('gives the map markers accessible names', async () => {
      stubFetch(mockTripResponse);
      render(<TripPage />);

      await waitFor(() =>
        expect(screen.getAllByRole('button', { name: 'First Stop' }).length).toBeGreaterThan(0),
      );

      expect(screen.getAllByRole('button', { name: 'Bus position' }).length).toBeGreaterThan(0);
    });
  });
});
