/** Symbol used to identify pattern matchers */
export const MATCH_SYMBOL = Symbol.for("match");

/** Interface for custom pattern matchers */
export interface Matcher {
  [MATCH_SYMBOL]: (value: unknown) => MatchResult;
}

/** Result of a pattern match attempt */
export interface MatchResult {
  matched: boolean;
  selections: Record<string, unknown>;
}

/** A pattern can be a literal value, object shape, or a Matcher */
export type Pattern = unknown;

/** A case registered via .with() */
export interface MatchCase<R> {
  pattern: Pattern;
  handler: (value: unknown, selections: Record<string, unknown>) => R;
}

/** Builder interface for constructing match expressions */
export interface MatchExpression<T, R> {
  with<V extends R>(pattern: Pattern, handler: (value: T, selections: Record<string, unknown>) => V): MatchExpression<T, R | V>;
  otherwise<V>(handler: (value: T) => V): R | V;
  exhaustive(): R;
  run(): R;
}
