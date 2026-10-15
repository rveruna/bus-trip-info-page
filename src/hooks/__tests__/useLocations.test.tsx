import { renderHook, waitFor } from '@testing-library/react';
import { useLocations } from '../useLocations';
import { makePlace, mockApi } from '../../test/mockApi';

describe('useLocations', () => {
  afterEach(() => jest.restoreAllMocks());

  test('returns only the places that still have buses', async () => {
    mockApi({ places: [makePlace(1, 'Dundee'), makePlace(2, 'Closed stop', false)] });

    const { result } = renderHook(() => useLocations());

    await waitFor(() => expect(result.current).toHaveLength(1));
    expect(result.current[0].name).toBe('Dundee');
  });

  test('returns nothing when the request fails, rather than breaking the page', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;

    const { result } = renderHook(() => useLocations());

    await waitFor(() => expect(console.error).toHaveBeenCalled());
    expect(result.current).toEqual([]);
  });
});
