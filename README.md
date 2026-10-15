# Bus Trip Info Page

[![CI](https://github.com/rveruna/bus-trip-info-page/actions/workflows/ci.yml/badge.svg)](https://github.com/rveruna/bus-trip-info-page/actions/workflows/ci.yml)
[![CodeQL](https://github.com/rveruna/bus-trip-info-page/actions/workflows/codeql.yml/badge.svg)](https://github.com/rveruna/bus-trip-info-page/actions/workflows/codeql.yml)

**[Live demo](https://rveruna.github.io/bus-trip-info-page/)**, showing a real bus on today's trip.

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
yarn format        # Prettier
node perf/lighthouse.mjs   # Lighthouse in real Chrome
```

`npm install` also works but ignores `yarn.lock`, so it can pick newer package versions than the ones this was built with.

## Practices

- **CI on every push to master:** an audit of production dependencies (high severity and above), lint, a Prettier check, the build, the tests with coverage, and Lighthouse (accessibility, best practices and SEO at least 90).
- **Before every commit:** a Husky hook formats and lints the staged files.
- **Kept current and watched:** Dependabot groups weekly updates, and CodeQL scans every push.
- **Decisions are written down:** [docs/decisions](docs/decisions) records the choices that were not obvious.
- **Deployed from CI:** pushes to master publish the demo to GitHub Pages.

## What checking it found

Lighthouse scored the page 95 for accessibility and 83 for SEO. The map's bus and stop markers were focusable buttons with no accessible name, the page had no `main` landmark, and it still had the default title, no description and no valid `robots.txt`. All fixed: accessibility and SEO are now 100, and the fixes have tests that fail if they are undone.

## Tests

26 tests in 7 suites cover the hook, the page, the header, the stop list and the utilities, with 100% statement coverage. Four of them check accessibility: the main landmark, the status and alert announcements, and the names of the map markers. They use Jest and React Testing Library.

## Limits and what I would improve

- The route is hard-coded, and the page does not let you choose a trip.
- Error handling is minimal: any failure shows "Something went wrong" with no retry.
- Accessibility is checked by tests and by Lighthouse in CI, but not with a real screen reader. The map itself is a third-party Leaflet component; its markers are named, but a map is a hard thing to use without sight, so the stop list is the main way to read the trip.
- The page's performance score (about 90) is limited by third-party map tiles, which dominate its largest paint. CI enforces accessibility, best practices and SEO but not performance; see [the decision record](docs/decisions/0003-do-not-enforce-performance-in-ci.md).
- The trip data is not cached between refreshes, so each refresh repeats the requests.
