import { selectTrips, nextDeparture, MAX_BUSES } from '../selectTrips';
import { makeQuote } from '../../test/mockApi';

const now = new Date();

describe('selectTrips', () => {
  it('picks every trip that has left and not yet arrived, earliest first', () => {
    const refs = selectTrips(
      [makeQuote('later', -30), makeQuote('earlier', -90), makeQuote('future', 20)],
      now,
    );

    expect(refs.map((ref) => ref.uid)).toEqual(['earlier', 'later']);
    expect(refs.every((ref) => ref.inProgress)).toBe(true);
  });

  it('ignores a trip that has already arrived', () => {
    const refs = selectTrips([makeQuote('done', -300, 60), makeQuote('running', -10)], now);

    expect(refs.map((ref) => ref.uid)).toEqual(['running']);
  });

  it('falls back to the next departure when nothing is running', () => {
    const refs = selectTrips(
      [makeQuote('far', 300), makeQuote('soon', 20), makeQuote('done', -300, 60)],
      now,
    );

    expect(refs).toHaveLength(1);
    expect(refs[0]).toMatchObject({ uid: 'soon', inProgress: false });
  });

  it('returns nothing when there are no usable trips', () => {
    expect(selectTrips([], now)).toEqual([]);
    expect(selectTrips([makeQuote('done', -300, 60)], now)).toEqual([]);
  });

  it('skips quotes with missing or malformed data and repeated trips', () => {
    const quotes = [
      { legs: null },
      {},
      { legs: [{ trip_uid: 'no-times' }] },
      { legs: [{ trip_uid: 'bad', departure: { scheduled: 'nope' }, arrival: { scheduled: 'nope' } }] },
      makeQuote('ok', -10),
      makeQuote('ok', -10),
    ];

    expect(selectTrips(quotes, now).map((ref) => ref.uid)).toEqual(['ok']);
  });

  it('caps the number of buses', () => {
    const quotes = Array.from({ length: MAX_BUSES + 4 }, (_, i) => makeQuote(`trip-${i}`, -10 - i));

    expect(selectTrips(quotes, now)).toHaveLength(MAX_BUSES);
  });
});

describe('nextDeparture', () => {
  it('is the earliest trip that has not left yet', () => {
    const next = nextDeparture(
      [makeQuote('far', 300), makeQuote('soon', 20), makeQuote('running', -30)],
      now,
    );

    expect(next).toMatchObject({ uid: 'soon', inProgress: false });
  });

  it('is nothing when every trip has left', () => {
    expect(nextDeparture([makeQuote('running', -30)], now)).toBeUndefined();
    expect(nextDeparture([], now)).toBeUndefined();
  });
});
