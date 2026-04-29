# @philiprehberger/ts-match

[![CI](https://github.com/philiprehberger/ts-match/actions/workflows/ci.yml/badge.svg)](https://github.com/philiprehberger/ts-match/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@philiprehberger/ts-match.svg)](https://www.npmjs.com/package/@philiprehberger/ts-match)
[![Last updated](https://img.shields.io/github/last-commit/philiprehberger/ts-match)](https://github.com/philiprehberger/ts-match/commits/main)

Pattern matching for TypeScript -- switch on steroids

## Installation

```bash
npm install @philiprehberger/ts-match
```

## Usage

```ts
import { match, P } from "@philiprehberger/ts-match";

// Literal matching
const label = match(statusCode)
  .with(200, () => "OK")
  .with(404, () => "Not Found")
  .with(500, () => "Server Error")
  .otherwise(() => "Unknown");

// Type matchers
const type = match(value)
  .with(P.string, () => "string")
  .with(P.number, () => "number")
  .with(P.boolean, () => "boolean")
  .otherwise(() => "other");

// Object shape matching
const message = match(event)
  .with({ type: "login", user: P.select("name") }, (_v, sel) => `Welcome ${sel.name}`)
  .with({ type: "logout" }, () => "Goodbye")
  .exhaustive();

// Guard predicates
const size = match(count)
  .with(P.when((n) => n > 100), () => "large")
  .with(P.when((n) => n > 10), () => "medium")
  .otherwise(() => "small");

// Union matching
const color = match(input)
  .with(P.union("red", "green", "blue"), () => "primary")
  .otherwise(() => "other");

// Array matching
const result = match(data)
  .with(P.array(P.number), (nums) => nums.reduce((a, b) => a + b, 0))
  .otherwise(() => 0);

// Regex matching on strings
const kind = match(token)
  .with(P.regex(/^user-\d+$/), () => "user")
  .with(P.regex(/^admin-\d+$/), () => "admin")
  .otherwise(() => "other");

// Exhaustive matching (throws if no pattern matches)
const output = match(action)
  .with("start", () => startProcess())
  .with("stop", () => stopProcess())
  .exhaustive();
```

## API

| Export | Description |
| --- | --- |
| `match(value)` | Start a match expression, returns a chainable builder |
| `.with(pattern, handler)` | Add a match case; handler receives `(value, selections)` |
| `.otherwise(handler)` | Default case; always matches, returns handler result |
| `.exhaustive()` | Finalize; throws if no pattern matched |
| `.run()` | Alias for `.exhaustive()` |
| `P.string` | Matches any string |
| `P.number` | Matches any number |
| `P.boolean` | Matches any boolean |
| `P.nullish` | Matches `null` or `undefined` |
| `P.any` | Matches any value |
| `P.when(fn)` | Matches when `fn(value)` returns `true` |
| `P.union(...values)` | Matches if any value/pattern in the union matches |
| `P.instanceOf(Class)` | Matches instances of the given class |
| `P.select(name?)` | Captures the matched value into selections |
| `P.array(pattern)` | Matches arrays where every element matches the pattern |
| `P.regex(re)` | Matches strings against the given regular expression |

## Development

```bash
npm install
npm run build
npm test
```

## Support

If you find this project useful:

⭐ [Star the repo](https://github.com/philiprehberger/ts-match)

🐛 [Report issues](https://github.com/philiprehberger/ts-match/issues?q=is%3Aissue+is%3Aopen+label%3Abug)

💡 [Suggest features](https://github.com/philiprehberger/ts-match/issues?q=is%3Aissue+is%3Aopen+label%3Aenhancement)

❤️ [Sponsor development](https://github.com/sponsors/philiprehberger)

🌐 [All Open Source Projects](https://philiprehberger.com/open-source-packages)

💻 [GitHub Profile](https://github.com/philiprehberger)

🔗 [LinkedIn Profile](https://www.linkedin.com/in/philiprehberger)

## License

[MIT](LICENSE)
