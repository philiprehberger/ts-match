import { MATCH_SYMBOL, type Matcher, type MatchResult } from "./types.js";

/** Check if a value is a Matcher (has the match symbol) */
export function isPattern(value: unknown): value is Matcher {
  return (
    value !== null &&
    typeof value === "object" &&
    MATCH_SYMBOL in value &&
    typeof (value as Matcher)[MATCH_SYMBOL] === "function"
  );
}

/** Attempt to match a value against a pattern, returning a MatchResult */
export function matchPattern(
  value: unknown,
  pattern: unknown,
): MatchResult {
  // Matcher objects (P.string, P.when, etc.)
  if (isPattern(pattern)) {
    return pattern[MATCH_SYMBOL](value);
  }

  // Exact equality for primitives and null/undefined
  if (
    pattern === null ||
    pattern === undefined ||
    typeof pattern === "string" ||
    typeof pattern === "number" ||
    typeof pattern === "boolean" ||
    typeof pattern === "bigint" ||
    typeof pattern === "symbol"
  ) {
    return { matched: value === pattern, selections: {} };
  }

  // Array patterns
  if (Array.isArray(pattern)) {
    if (!Array.isArray(value)) {
      return { matched: false, selections: {} };
    }
    if (pattern.length !== value.length) {
      return { matched: false, selections: {} };
    }
    const selections: Record<string, unknown> = {};
    for (let i = 0; i < pattern.length; i++) {
      const result = matchPattern(value[i], pattern[i]);
      if (!result.matched) {
        return { matched: false, selections: {} };
      }
      Object.assign(selections, result.selections);
    }
    return { matched: true, selections };
  }

  // Object patterns (match shape)
  if (typeof pattern === "object" && pattern !== null) {
    if (typeof value !== "object" || value === null) {
      return { matched: false, selections: {} };
    }
    const selections: Record<string, unknown> = {};
    for (const key of Object.keys(pattern)) {
      const patternVal = (pattern as Record<string, unknown>)[key];
      const valueVal = (value as Record<string, unknown>)[key];
      const result = matchPattern(valueVal, patternVal);
      if (!result.matched) {
        return { matched: false, selections: {} };
      }
      Object.assign(selections, result.selections);
    }
    return { matched: true, selections };
  }

  // Function patterns — treat as guard
  if (typeof pattern === "function") {
    return {
      matched: (pattern as (v: unknown) => boolean)(value),
      selections: {},
    };
  }

  return { matched: false, selections: {} };
}

function createTypeMatcher(typeName: string): Matcher {
  return {
    [MATCH_SYMBOL]: (value: unknown): MatchResult => ({
      matched: typeof value === typeName,
      selections: {},
    }),
  };
}

/** Pattern matching utilities */
export const P = {
  /** Matches any string */
  string: createTypeMatcher("string"),

  /** Matches any number */
  number: createTypeMatcher("number"),

  /** Matches any boolean */
  boolean: createTypeMatcher("boolean"),

  /** Matches null or undefined */
  nullish: {
    [MATCH_SYMBOL]: (value: unknown): MatchResult => ({
      matched: value === null || value === undefined,
      selections: {},
    }),
  } as Matcher,

  /** Matches any value */
  any: {
    [MATCH_SYMBOL]: (_value: unknown): MatchResult => ({
      matched: true,
      selections: {},
    }),
  } as Matcher,

  /** Matches when the predicate returns true */
  when(predicate: (value: unknown) => boolean): Matcher {
    return {
      [MATCH_SYMBOL]: (value: unknown): MatchResult => ({
        matched: predicate(value),
        selections: {},
      }),
    };
  },

  /** Matches any of the provided values */
  union(...values: unknown[]): Matcher {
    return {
      [MATCH_SYMBOL]: (value: unknown): MatchResult => ({
        matched: values.some((v) => {
          const result = matchPattern(value, v);
          return result.matched;
        }),
        selections: {},
      }),
    };
  },

  /** Matches instances of the given class */
  instanceOf<T>(ctor: new (...args: unknown[]) => T): Matcher {
    return {
      [MATCH_SYMBOL]: (value: unknown): MatchResult => ({
        matched: value instanceof ctor,
        selections: {},
      }),
    };
  },

  /** Captures the matched value as a selection */
  select(name?: string): Matcher {
    const key = name ?? "__select__";
    return {
      [MATCH_SYMBOL]: (value: unknown): MatchResult => ({
        matched: true,
        selections: { [key]: value },
      }),
    };
  },

  /** Matches arrays where every element matches the given pattern */
  array(pattern: unknown): Matcher {
    return {
      [MATCH_SYMBOL]: (value: unknown): MatchResult => {
        if (!Array.isArray(value)) {
          return { matched: false, selections: {} };
        }
        const allSelections: Record<string, unknown> = {};
        for (const item of value) {
          const result = matchPattern(item, pattern);
          if (!result.matched) {
            return { matched: false, selections: {} };
          }
          Object.assign(allSelections, result.selections);
        }
        return { matched: true, selections: allSelections };
      },
    };
  },
} as const;
