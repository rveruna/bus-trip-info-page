# Bus Trip Info Page

A mobile-friendly page for following a bus journey: a live map with the bus's position, every stop with its scheduled and estimated arrival time, the next stop highlighted, and how late the bus is running. Built with React, TypeScript and Leaflet.

## What it does

- Map of the bus's current position, drawn with Leaflet
- List of all stops with scheduled and estimated times, and the delay in minutes where the bus is running late
- The next stop is highlighted from the estimated times
- Data refreshes every 15 seconds
- Loading and error states

## Data

The trip comes from [Ember's public API](https://api.ember.to). The route is fixed in `src/hooks/useTripData.ts` (origin 13, destination 42), and the page picks one of today's trips. It is a demo with a hard-coded route, not a trip search.

## Run it

```bash
yarn install --frozen-lockfile   # the repo has a yarn.lock
yarn dev                         # http://localhost:5173
yarn build
yarn test
yarn lint
```

`npm install` also works but ignores `yarn.lock`, so it can pick newer package versions than the ones this was built with.

## Tests

22 tests in 7 suites cover the hook, the page, the header, the stop list and the utilities, with 100% statement and about 93% branch coverage. They use Jest and React Testing Library.

## Limits and what I would improve

- The route is hard-coded, and the page does not let you choose a trip.
- Error handling is minimal: any failure shows "Something went wrong" with no retry.
- No explicit accessibility work yet: no ARIA labels or text alternatives beyond what Leaflet provides by default.
- The trip data is not cached between refreshes, so each refresh repeats the requests.
