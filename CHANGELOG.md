# Changelog

All notable changes to this project will be documented in this file.

## [0.1.0] - 2026-03-20

### Added

- `match(value)` entry point returning a chainable builder
- `.with(pattern, handler)` for registering match cases
- `.otherwise(handler)` for default/fallback cases
- `.exhaustive()` for runtime exhaustiveness checking (throws on no match)
- `.run()` alias for `.exhaustive()`
- `P.string`, `P.number`, `P.boolean` type matchers
- `P.nullish` matcher for null/undefined
- `P.any` wildcard matcher
- `P.when(predicate)` guard matcher
- `P.union(...values)` for matching any of several values/patterns
- `P.instanceOf(Class)` for instanceof checks
- `P.select()` / `P.select(name)` for capturing matched values
- `P.array(pattern)` for matching arrays where every element matches
- Object shape matching with nested pattern support
- Literal value matching (strings, numbers, booleans, null, undefined)
