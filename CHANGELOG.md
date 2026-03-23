# Changelog

## 0.1.2

- Standardize README badges and CHANGELOG formatting

## 0.1.1

- Standardize package configuration

## 0.1.0

- `match(value)` entry point returning a chainable builder
- `.with(pattern, handler)` for registering match cases
- `.otherwise(handler)` for default/fallback cases
- `.exhaustive()` for runtime exhaustiveness checking
- `P.string`, `P.number`, `P.boolean` type matchers
- `P.nullish`, `P.any`, `P.when(predicate)`, `P.union()` matchers
- `P.instanceOf(Class)`, `P.select()`, `P.array(pattern)` matchers
- Object shape matching with nested pattern support
- Literal value matching
