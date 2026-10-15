# 0002: The hard-coded route is a deliberate scope limit

Status: accepted

## Context

A bus page needs to know which trip to follow. A real page would take it from a link or a search.

## Decision

The route is fixed in `src/hooks/useTripData.ts` (origin 13, destination 42), and the page follows one of today's
trips on it. The README says so, so nobody mistakes the demo for a trip search.

## Consequences

- The scope stays on what the page shows: the map, the stop times, the delay and the next stop.
- On a day with no trips on that route the page shows its error state, which is an honest answer for a demo.
