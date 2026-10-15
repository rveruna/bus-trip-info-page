# 0004: Follow every running bus on a route the user chooses

Status: accepted. Supersedes [0002](0002-hard-coded-route-is-a-scope-limit.md).

## Context

The page took the first trip on a fixed route whose departure was still in the future. That bus had not left,
so its GPS position was at a depot or on the way to the first stop, not on the route: on the day this was
checked it was 5 km from its first stop. The marker sat away from the line and never passed the stops, and
after the last departure of the day there was no trip to pick, so the page showed only an error. The demo
never showed what it claimed to show.

The same quotes response also lists the trips that are running, and their GPS positions lie on the route.

## Decision

- Show every trip whose scheduled departure has passed and whose scheduled arrival has not, up to six, each
  with its own colour on the map. Pick the one whose stops are listed from the map or from a list of buses.
- When no bus is running, fall back to the next departure and say so, rather than showing an error.
- Let the user choose the origin and destination from the API's list of places, and keep the choice in the
  address (`?from=13&to=42`) so a link opens the same journey. Dundee to Edinburgh stays the default.
- Move each bus to its new position over three seconds instead of jumping (skipped when the user prefers
  reduced motion).

## Consequences

- The marker is on the route and passes the stops, which is what the page is for.
- One refresh now makes one quotes request plus one request per bus (up to seven), every 15 seconds. This
  makes the cost noted in [0001](0001-poll-every-15-seconds.md) larger. Caching the trip ids would cut it to
  one request per bus.
- The API refuses searches that start on a previous day, so a bus that left yesterday and is still running
  overnight is not found.
- A bus counts as running by its scheduled times. One that is running late past its scheduled arrival drops
  off the page early.
