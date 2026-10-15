# 0005: The phone view is a frame of the same page

Status: accepted

## Context

The page is designed for a phone, but most visitors to a portfolio open it on a laptop, where it stretches across
a wide window. A phone-shaped view shows it as designed. It should be a choice, not the default, so the full
page is still what a visitor sees first.

## Decision

A "View on a phone" button, shown only on wide screens, replaces the page with a bezel round an `<iframe>` of
the same page at 390 by 800 pixels (`?embed=1`, which hides the button inside the frame). The route chosen is
carried into the frame through the address.

The alternative was to give the page a phone-sized box with its own scrolling, or to scale the page down with
`transform`. A frame was chosen because it has a real phone-sized viewport:

- Layout, the map's dragging and the scrolling behave exactly as on a phone, with no second scroll area fighting
  the page's. This was checked in Chrome: dragging the map and using the mouse wheel over it do not move the
  outer page.
- Leaflet works out click and drag positions from the size of its container. A scaled box makes those wrong.

## Consequences

- Only one copy of the page runs at a time. Opening the phone view removes the full page, which stops its
  15-second refresh (see [0001](0001-poll-every-15-seconds.md)), so the page makes the same requests as before.
- Closing the phone view reloads the full page. A route changed inside the frame is not carried back out.
- The bezel is decoration: hidden from assistive technology and with no tab stops. The frame has a title.
- The button needs a viewport of 700 pixels or more, so it never appears on a phone.
