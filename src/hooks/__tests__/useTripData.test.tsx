import { jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { waitFor } from "@testing-library/react";
import { useTripData } from "../useTripData";

const mockQuotesResponse = {
  quotes: [
    {
      legs: [
        {
          trip_uid: "abc123",
          departure: { scheduled: new Date(Date.now() + 100000).toISOString() },
        },
      ],
    },
  ],
};

const mockTripResponse = {
  route: [
    {
      id: "stop1",
      location: { name: "First Stop", lat: 1, lon: 1 },
      arrival: { scheduled: "2025-06-20T12:00:00Z" },
    },
  ],
  vehicle: {
    id: "vehicle1",
    gps: {
      latitude: 1,
      longitude: 1,
      last_updated: "2025-06-20T12:00:00Z",
    },
  },
};

describe("useTripData", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("fetches trip and sets data correctly", async () => {
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

    const { result } = renderHook(() => useTripData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(false);
    expect(result.current.trip).toEqual(mockTripResponse);
    expect(result.current.gps).toEqual(mockTripResponse.vehicle.gps);
  });

  test("handles invalid quotes structure", async () => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ quotes: null }),
    } as Response);

    const { result } = renderHook(() => useTripData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.trip).toBe(null);
  });

  test("handles no future trips found", async () => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        quotes: [
          {
            legs: [
              {
                trip_uid: "abc123",
                departure: {
                  scheduled: new Date(Date.now() - 3600000).toISOString(),
                },
              },
            ],
          },
        ],
      }),
    } as Response);

    const { result } = renderHook(() => useTripData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.trip).toBe(null);
  });

  test("handles trip API fetch failure", async () => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotesResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
      } as Response);

    const { result } = renderHook(() => useTripData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.trip).toBe(null);
  });

  test("handles quotes fetch failure", async () => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const { result } = renderHook(() => useTripData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.trip).toBe(null);
  });

  test("handles quotes with no legs", async () => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        quotes: [{ legs: null }],
      }),
    } as Response);

    const { result } = renderHook(() => useTripData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(true);
    expect(result.current.trip).toBe(null);
  });

  test("returns null gps if vehicle has no gps", async () => {
    const responseWithoutGps = {
      ...mockTripResponse,
      vehicle: {
        id: "vehicle1",
        gps: undefined,
      },
    };

    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockQuotesResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutGps,
      } as Response);

    const { result } = renderHook(() => useTripData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.gps).toBe(null);
  });

  test("refetches trip data every 15 seconds", async () => {
    jest.useFakeTimers();

    global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

    (global.fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockQuotesResponse,
    } as Response);

    const { unmount } = renderHook(() => useTripData());

    // Fast-forward time to trigger interval
    jest.advanceTimersByTime(15000);

    expect(global.fetch).toHaveBeenCalledTimes(2); // initial + interval

    unmount();
    jest.useRealTimers();
  });
});
