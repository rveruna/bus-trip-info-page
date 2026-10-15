import { isStale, STALE_AFTER_MS } from '../gps';

const now = new Date('2026-10-15T10:00:00Z');
const gpsSeen = (msAgo: number, format = (d: Date) => d.toISOString()) => ({
  latitude: 56,
  longitude: -3,
  last_updated: format(new Date(+now - msAgo)),
});

describe('isStale', () => {
  it('trusts a position that was reported recently', () => {
    expect(isStale(gpsSeen(30_000), now)).toBe(false);
    expect(isStale(gpsSeen(STALE_AFTER_MS), now)).toBe(false);
  });

  it('does not trust one that is older than ten minutes', () => {
    expect(isStale(gpsSeen(STALE_AFTER_MS + 1000), now)).toBe(true);
    expect(isStale(gpsSeen(90 * 60_000), now)).toBe(true);
  });

  it('has no position to trust when the bus reports none', () => {
    expect(isStale(null, now)).toBe(true);
  });

  it('treats a time it cannot read as stale', () => {
    expect(isStale({ latitude: 1, longitude: 1, last_updated: 'yesterday-ish' }, now)).toBe(true);
  });

  it('reads the timestamps the API sends, with microseconds and a UTC offset', () => {
    const apiStyle = { latitude: 1, longitude: 1, last_updated: '2026-10-15T10:59:30.568000+01:00' };
    expect(isStale(apiStyle, now)).toBe(false);
  });
});
