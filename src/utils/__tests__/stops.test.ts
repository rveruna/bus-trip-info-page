import { describeDelay, findNextStopIndex, getDelayMinutes, hasFinished, journeyStops } from '../stops';
import { makeStop } from '../../test/mockApi';

const now = new Date();
const at = (offset: number) => new Date(Date.now() + offset * 60000).toISOString();

describe('findNextStopIndex', () => {
  it('finds the first stop that is still ahead', () => {
    const route = [makeStop(1, 'A', -20), makeStop(2, 'B', 10), makeStop(3, 'C', 30)];
    expect(findNextStopIndex(route, now)).toBe(1);
  });

  it('uses the estimate over the schedule', () => {
    const route = [makeStop(1, 'A', -5, { estimated: at(5) }), makeStop(2, 'B', 30)];
    expect(findNextStopIndex(route, now)).toBe(0);
  });

  it('skips stops the bus has already reached, even if their estimate is still ahead', () => {
    const route = [makeStop(1, 'A', 1, { actual: at(-1), estimated: at(2) }), makeStop(2, 'B', 30)];
    expect(findNextStopIndex(route, now)).toBe(1);
  });

  it('skips skipped stops, and returns -1 when the trip is over', () => {
    const route = [{ ...makeStop(1, 'A', 10), skipped: true }, makeStop(2, 'B', -10)];
    expect(findNextStopIndex(route, now)).toBe(-1);
  });
});

describe('getDelayMinutes and describeDelay', () => {
  it('measures lateness at the next stop', () => {
    const route = [makeStop(1, 'A', -10), makeStop(2, 'B', 20, { estimated: at(26) })];
    expect(getDelayMinutes(route, now)).toBe(6);
    expect(describeDelay(6)).toBe('6 min late');
  });

  it('reports early running and on-time running', () => {
    expect(getDelayMinutes([makeStop(1, 'A', 20, { estimated: at(17) })], now)).toBe(-3);
    expect(describeDelay(-3)).toBe('3 min early');
    expect(getDelayMinutes([makeStop(1, 'A', 20)], now)).toBe(0);
    expect(describeDelay(0)).toBe('on time');
  });

  it('is null when the trip has no stop left', () => {
    expect(getDelayMinutes([makeStop(1, 'A', -20)], now)).toBeNull();
    expect(describeDelay(null)).toBe('finished');
  });
});

describe('hasFinished', () => {
  it('is true once the bus has reached every stop', () => {
    const route = [makeStop(1, 'A', -20, { actual: at(-20) }), makeStop(2, 'B', -5, { actual: at(-5) })];
    expect(hasFinished(route, now)).toBe(true);
  });

  it('is false while a stop is still ahead', () => {
    expect(hasFinished([makeStop(1, 'A', -20, { actual: at(-20) }), makeStop(2, 'B', 10)], now)).toBe(false);
  });

  it('is false for a trip with no stops, so it is not hidden by mistake', () => {
    expect(hasFinished([], now)).toBe(false);
  });
});

describe('journeyStops', () => {
  const route = [
    makeStop(1, 'Aberdeen', -90),
    makeStop(2, 'Dundee', -10),
    makeStop(3, 'Perth', 20),
    makeStop(4, 'Edinburgh', 80),
    makeStop(5, 'Glasgow', 140),
  ];
  const names = (stops: typeof route) => stops.map((stop) => stop.location.name);

  it('keeps only the stops from where the journey gets on to where it gets off', () => {
    expect(names(journeyStops(route, 2, 4))).toEqual(['Dundee', 'Perth', 'Edinburgh']);
  });

  it('keeps the whole route when the journey covers it', () => {
    expect(journeyStops(route, 1, 5)).toEqual(route);
  });

  it('keeps the whole route when a stop is not on it, or the stops are the wrong way round', () => {
    expect(journeyStops(route, 99, 4)).toEqual(route);
    expect(journeyStops(route, 2, undefined)).toEqual(route);
    expect(journeyStops(route, 4, 2)).toEqual(route);
  });
});
