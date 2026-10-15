# 0006: Hide finished buses and positions that have stopped updating

Status: accepted. Refines [0004](0004-follow-every-running-bus-on-a-chosen-route.md).

## Context

0004 counts a bus as running between its scheduled departure and arrival. On the live page this showed a bus
whose trip data had arrivals recorded at every stop, so it had finished, but whose GPS had stopped at 09:23. At
10:50 it was still first in the list, on the map at its frozen position, and the header said "Last updated: 09:23".

## Decision

- A trip whose bus has reached every stop is not shown as running, even inside its scheduled times. If that
  leaves no bus, the page falls back to the next departure, as it does when nothing is running.
- A position more than 10 minutes old (or missing, or unreadable) is not drawn on the map. The bus stays in the
  list as "no position since 09:23", so its stops can still be read, but it is not the bus followed by default.

## Consequences

- Every dot on the map is a position from the last 10 minutes.
- Ten minutes is a judgement: long enough for a bus in a mobile dead spot, short enough that a parked bus drops
  off. It is one constant (`STALE_AFTER_MS` in `src/utils/gps.ts`).
- A bus running late past its scheduled arrival still drops off early, as before.
