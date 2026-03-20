import type { MatchCase, MatchExpression } from "./types.js";
import { matchPattern } from "./patterns.js";

class MatchBuilder<T, R = never> implements MatchExpression<T, R> {
  private readonly value: T;
  private readonly cases: MatchCase<unknown>[] = [];

  constructor(value: T) {
    this.value = value;
  }

  with<V>(
    pattern: unknown,
    handler: (value: T, selections: Record<string, unknown>) => V,
  ): MatchExpression<T, R | V> {
    this.cases.push({
      pattern,
      handler: handler as (
        value: unknown,
        selections: Record<string, unknown>,
      ) => unknown,
    });
    return this as unknown as MatchExpression<T, R | V>;
  }

  otherwise<V>(handler: (value: T) => V): R | V {
    for (const c of this.cases) {
      const result = matchPattern(this.value, c.pattern);
      if (result.matched) {
        return c.handler(this.value, result.selections) as R;
      }
    }
    return handler(this.value);
  }

  exhaustive(): R {
    for (const c of this.cases) {
      const result = matchPattern(this.value, c.pattern);
      if (result.matched) {
        return c.handler(this.value, result.selections) as R;
      }
    }
    throw new Error(
      `Pattern matching exhaustive error: no pattern matched value ${JSON.stringify(this.value)}`,
    );
  }

  run(): R {
    return this.exhaustive();
  }
}

/**
 * Start a pattern match expression.
 *
 * @example
 * ```ts
 * const result = match(value)
 *   .with("hello", () => "greeting")
 *   .with(P.number, () => "a number")
 *   .otherwise(() => "something else");
 * ```
 */
export function match<T>(value: T): MatchExpression<T, never> {
  return new MatchBuilder<T>(value);
}
