# ASA Swim Time Scraper

Node library for fetching an athlete's personal-best history from `swimmingresults.org` and returning normalized JSON.

## Current status

The repo has been modernized around current Node runtimes:

- deprecated HTTP/runtime dependencies removed
- insecure TLS override removed
- deterministic fixture-based tests added
- native Node test and coverage workflow in place

See [docs/PROJECT_REVIEW.md](./docs/PROJECT_REVIEW.md) for the repository review and [docs/MODERNIZATION_PLAN.md](./docs/MODERNIZATION_PLAN.md) for the upgrade plan that was executed.

## Install

```bash
npm install asa-swim-time-scraper
```

## Usage

```js
const { getTimes } = require('asa-swim-time-scraper');

getTimes('1168208')
  .then((times) => {
    console.log(times);
  })
  .catch((error) => {
    console.error(error.message);
  });
```

## API

### `getTimes(asaNumber, options?)`

Fetches and parses long-course and short-course personal bests for a numeric ASA swimmer ID.

Options:

- `year`: override the target year used in the request URL
- `timeoutMs`: request timeout in milliseconds
- `fetchImpl`: custom fetch implementation for testing
- `now`: override the collection timestamp for testing

Returns a promise resolving to an array of swim records.

## Development

```bash
npm test
npm run test:coverage
```

## Notes

- This project is not affiliated with Swim England / ASA.
- The upstream website structure may change; tests in this repo validate parser behavior against fixtures, not the live site markup.
