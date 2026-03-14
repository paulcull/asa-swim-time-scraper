# Modernization and Security Plan

## Objectives

1. Preserve the public purpose of the package: fetch and normalize ASA personal-best data.
2. Remove insecure and deprecated runtime behavior.
3. Replace brittle legacy tooling with a smaller, current Node-based workflow.
4. Make validation deterministic with fixture-driven tests and explicit coverage thresholds.

## Plan

1. Replace the HTTP stack:
   - remove `request`
   - use `fetch` with timeout support
   - restrict scraping to the expected HTTPS host

2. Tighten public API validation and errors:
   - require numeric ASA numbers
   - return `Error` instances with stable messages
   - centralize URL construction

3. Simplify parsing:
   - remove `cheerio-tableparser` and `moment`
   - parse table rows directly with `cheerio`
   - implement focused date/time parsing helpers

4. Modernize tooling:
   - remove Grunt-based scripts
   - use Node's native test runner and built-in coverage
   - keep the package as a simple CommonJS library targeting modern Node

5. Validate:
   - add fixtures that model the source tables
   - cover success, invalid input, invalid host, and HTTP failure paths
   - enforce coverage thresholds in the test command
