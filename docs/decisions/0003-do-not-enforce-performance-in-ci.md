# 0003: Do not enforce a performance score in CI

Status: accepted

## Context

Lighthouse scores this page 86 to 90 for performance, and the cause is the largest contentful paint, about 4 s on
a simulated phone. The largest element is a map tile served by OpenStreetMap. The same audits point at that
third party's cache headers and image sizes, which this project cannot change.

## Decision

CI fails when accessibility, best practices or SEO drops below 90, because those are in this project's control.
The performance score is reported but not enforced, so a change outside the project cannot break the build.

## Consequences

- Accessibility and SEO are protected: both went from below 100 to 100 in this work.
- A real performance regression would not be caught automatically. A bundle size budget (the JavaScript is small)
  would be the next guard to add.
