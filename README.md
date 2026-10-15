# Bus Trip Info Page

[![CI](https://github.com/rveruna/bus-trip-info-page/actions/workflows/ci.yml/badge.svg)](https://github.com/rveruna/bus-trip-info-page/actions/workflows/ci.yml)
[![CodeQL](https://github.com/rveruna/bus-trip-info-page/actions/workflows/codeql.yml/badge.svg)](https://github.com/rveruna/bus-trip-info-page/actions/workflows/codeql.yml)

**[Live demo](https://rveruna.github.io/bus-trip-info-page/)**, showing the buses running on a route right now.

A mobile-friendly page for following bus journeys: a live map with every running bus on a route, every stop of the bus you pick with its scheduled and estimated arrival time, the next stop highlighted, and how late each bus is running. Built with React, TypeScript and Leaflet.

## What it does

- Every bus running on the route shown on a Leaflet map, each in its own colour, gliding along the route as new positions arrive
- Choose the route (from, to and a swap button); it is kept in the address, for example `?from=80&to=452` for Glasgow to Inverness
- Pick a bus from the map or the list to see its stops, with scheduled and estimated times, and the delay in minutes where it is running late
- A "View on a phone" button (wide screens only) shows the page in a phone-shaped frame, as a visitor on a phone would see it; see [the decision record](docs/decisions/0005-phone-view-is-a-frame-of-the-same-page.md)
- Stops the bus has passed are dimmed, and the next stop is highlighted
- Data refreshes every 15 seconds
- Loading, empty and error states; when no bus is running it shows the next departure

## Data

Trips come from [Ember's public API](https://api.ember.to). The page asks for the quotes between two places for today and tomorrow, keeps the trips that have left and not yet arrived, and loads each one for its stops and its bus's GPS position. The list of places comes from the same API. Dundee to Edinburgh is the default route. See [the decision record](docs/decisions/0004-follow-every-running-bus-on-a-chosen-route.md) for why it follows running buses and not the next departure.

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

95 tests in 16 suites cover the API client, the hooks, the page, the route picker, the bus list, the map marker animation, the phone view, the stop list and the utilities, with over 99% statement coverage. The bug that started this rewrite, following a bus that had not left yet, has a test that fails if it comes back. Four of them check accessibility: the main landmark, the status and alert announcements, the names of the bus markers, the stop markers staying out of the tab order and the labels of the route pickers. They use Jest and React Testing Library, with one fake of the three API endpoints (`src/test/mockApi.ts`).

## Limits and what I would improve

- A route is a pair of places, not a search: there is no date or time picker, and a bus that left yesterday and is still running overnight is not found, because the API refuses searches that start on a previous day.
- A bus counts as running by its scheduled times, so one running late past its scheduled arrival disappears early.
- Error handling is minimal: any failure shows "Something went wrong" with no retry.
- Accessibility is checked by tests and by Lighthouse in CI, but not with a real screen reader. The map itself is a third-party Leaflet component. The bus markers are named and can be reached with the keyboard, but the stop markers are left out of the tab order (a route has up to 31 of them, close together), and a map is a hard thing to use without sight, so the stop list is the main way to read the trip.
- The page's performance score (about 90) is limited by third-party map tiles, which dominate its largest paint. CI enforces accessibility, best practices and SEO but not performance; see [the decision record](docs/decisions/0003-do-not-enforce-performance-in-ci.md).
- The trip data is not cached between refreshes, so each refresh makes one quotes request plus one per bus (up to seven).
- The map is checked in a real browser by hand and in jsdom by tests, but there is no automated browser test of the buses moving.
