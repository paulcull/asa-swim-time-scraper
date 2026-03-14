# Project Review

## What the repository is trying to achieve

This package exposes a single library function, `getTimes(asaNumber)`, that fetches an athlete's personal-best page from `https://www.swimmingresults.org/individualbest/personal_best.php`, parses the long-course and short-course result tables, and returns a normalized JSON array.

Each result entry contains:

- the source course (`LC` or `SC`)
- the stroke/event name
- the date obtained
- the original timing and an alternate-course converted timing
- meet metadata such as FINA points, venue, license, and level
- a collection timestamp

## How the legacy implementation worked

- `src/index.js` validated the ASA number loosely and built the URL.
- `src/scraper.js` downloaded HTML with `request`, parsed tables with `cheerio` plus `cheerio-tableparser`, used `moment` for date/time shaping, and delegated pool conversion to `asa-swim-time-converter`.
- Grunt handled linting, docs, bundling to `dist/`, and coverage.

## Key problems found during review

- Security: the scraper disabled TLS verification globally via `process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'`.
- Runtime risk: `request` is deprecated and unmaintained.
- Operability: tests depended on the live website, so they were non-deterministic and could fail for reasons unrelated to code changes.
- Maintainability: the repo carried old generated assets (`coverage/`, `dist/`, generated docs) and a large Grunt toolchain for a small library.
- Error handling: promise rejection and input validation were inconsistent, and the public API returned string errors instead of typed `Error` objects.
