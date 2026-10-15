# 0001: Refresh by polling every 15 seconds

Status: accepted

## Context

The page shows a bus's live position and estimated arrival times. The public API offers plain requests and no
push channel (no WebSocket or server-sent events).

## Decision

Request the trip again every 15 seconds with `setInterval`, and stop when the page is left.

## Consequences

- Simple, and works with any server.
- The data can be up to 15 seconds old, and each refresh repeats the quote and trip requests. A real product
  would cache the trip id and refresh only the vehicle position, or use a push channel if one existed.
