import { describe, it } from "node:test";
import assert from "node:assert";
import { match, P } from "../../dist/index.js";

describe("match", () => {
  describe("literal matching", () => {
    it("should match exact string values", () => {
      const result = match("hello")
        .with("hello", () => "matched")
        .with("world", () => "nope")
        .otherwise(() => "default");

      assert.strictEqual(result, "matched");
    });

    it("should match exact number values", () => {
      const result = match(42)
        .with(1, () => "one")
        .with(42, () => "forty-two")
        .otherwise(() => "default");

      assert.strictEqual(result, "forty-two");
    });

    it("should match null and undefined", () => {
      assert.strictEqual(
        match(null)
          .with(null, () => "null")
          .otherwise(() => "other"),
        "null",
      );

      assert.strictEqual(
        match(undefined)
          .with(undefined, () => "undefined")
          .otherwise(() => "other"),
        "undefined",
      );
    });

    it("should match boolean values", () => {
      const result = match(true)
        .with(true, () => "yes")
        .with(false, () => "no")
        .otherwise(() => "other");

      assert.strictEqual(result, "yes");
    });
  });

  describe("P.string", () => {
    it("should match any string", () => {
      const result = match("anything" as unknown)
        .with(P.string, () => "is string")
        .otherwise(() => "not string");

      assert.strictEqual(result, "is string");
    });

    it("should not match non-strings", () => {
      const result = match(123 as unknown)
        .with(P.string, () => "is string")
        .otherwise(() => "not string");

      assert.strictEqual(result, "not string");
    });
  });

  describe("P.number", () => {
    it("should match any number", () => {
      const result = match(3.14 as unknown)
        .with(P.number, () => "is number")
        .otherwise(() => "not number");

      assert.strictEqual(result, "is number");
    });

    it("should not match non-numbers", () => {
      const result = match("hi" as unknown)
        .with(P.number, () => "is number")
        .otherwise(() => "not number");

      assert.strictEqual(result, "not number");
    });
  });

  describe("P.boolean", () => {
    it("should match any boolean", () => {
      const result = match(false as unknown)
        .with(P.boolean, () => "is boolean")
        .otherwise(() => "not boolean");

      assert.strictEqual(result, "is boolean");
    });
  });

  describe("P.nullish", () => {
    it("should match null", () => {
      const result = match(null as unknown)
        .with(P.nullish, () => "nullish")
        .otherwise(() => "not nullish");

      assert.strictEqual(result, "nullish");
    });

    it("should match undefined", () => {
      const result = match(undefined as unknown)
        .with(P.nullish, () => "nullish")
        .otherwise(() => "not nullish");

      assert.strictEqual(result, "nullish");
    });

    it("should not match non-nullish values", () => {
      const result = match(0 as unknown)
        .with(P.nullish, () => "nullish")
        .otherwise(() => "not nullish");

      assert.strictEqual(result, "not nullish");
    });
  });

  describe("P.when", () => {
    it("should match when predicate returns true", () => {
      const result = match(10)
        .with(P.when((v) => (v as number) > 5), () => "big")
        .otherwise(() => "small");

      assert.strictEqual(result, "big");
    });

    it("should not match when predicate returns false", () => {
      const result = match(2)
        .with(P.when((v) => (v as number) > 5), () => "big")
        .otherwise(() => "small");

      assert.strictEqual(result, "small");
    });
  });

  describe("P.union", () => {
    it("should match any of the provided values", () => {
      const result = match("b")
        .with(P.union("a", "b", "c"), () => "matched")
        .otherwise(() => "no match");

      assert.strictEqual(result, "matched");
    });

    it("should not match values outside the union", () => {
      const result = match("z")
        .with(P.union("a", "b", "c"), () => "matched")
        .otherwise(() => "no match");

      assert.strictEqual(result, "no match");
    });

    it("should work with pattern matchers in the union", () => {
      const result = match(42 as unknown)
        .with(P.union(P.string, P.number), () => "string or number")
        .otherwise(() => "other");

      assert.strictEqual(result, "string or number");
    });
  });

  describe("P.instanceOf", () => {
    it("should match instances of a class", () => {
      class MyError extends Error {
        code = 404;
      }
      const err = new MyError("not found");

      const result = match(err as unknown)
        .with(P.instanceOf(MyError), () => "my error")
        .with(P.instanceOf(Error), () => "generic error")
        .otherwise(() => "unknown");

      assert.strictEqual(result, "my error");
    });

    it("should not match non-instances", () => {
      const result = match("not an error" as unknown)
        .with(P.instanceOf(Error), () => "error")
        .otherwise(() => "not error");

      assert.strictEqual(result, "not error");
    });
  });

  describe("P.select", () => {
    it("should capture the matched value", () => {
      const result = match({ name: "Alice", age: 30 })
        .with({ name: P.select("name") }, (_value, selections) => {
          return `Hello ${selections["name"] as string}`;
        })
        .otherwise(() => "no match");

      assert.strictEqual(result, "Hello Alice");
    });

    it("should capture with default key when no name given", () => {
      const result = match(42)
        .with(P.select(), (_value, selections) => {
          return selections["__select__"] as number;
        })
        .otherwise(() => 0);

      assert.strictEqual(result, 42);
    });
  });

  describe("P.array", () => {
    it("should match arrays where all elements match", () => {
      const result = match([1, 2, 3] as unknown)
        .with(P.array(P.number), () => "all numbers")
        .otherwise(() => "not all numbers");

      assert.strictEqual(result, "all numbers");
    });

    it("should not match if any element fails", () => {
      const result = match([1, "two", 3] as unknown)
        .with(P.array(P.number), () => "all numbers")
        .otherwise(() => "not all numbers");

      assert.strictEqual(result, "not all numbers");
    });

    it("should not match non-arrays", () => {
      const result = match("not array" as unknown)
        .with(P.array(P.string), () => "array")
        .otherwise(() => "not array");

      assert.strictEqual(result, "not array");
    });

    it("should match empty arrays", () => {
      const result = match([] as unknown)
        .with(P.array(P.number), () => "empty array matches")
        .otherwise(() => "no match");

      assert.strictEqual(result, "empty array matches");
    });
  });

  describe("object pattern matching", () => {
    it("should match object shapes", () => {
      const result = match({ type: "success", data: 42 })
        .with({ type: "success" }, () => "success")
        .with({ type: "error" }, () => "error")
        .otherwise(() => "unknown");

      assert.strictEqual(result, "success");
    });

    it("should match nested object shapes", () => {
      const value = { user: { name: "Alice", role: "admin" }, active: true };

      const result = match(value)
        .with({ user: { role: "admin" }, active: true }, () => "active admin")
        .with({ user: { role: "admin" } }, () => "admin")
        .otherwise(() => "other");

      assert.strictEqual(result, "active admin");
    });

    it("should combine object shapes with P matchers", () => {
      const result = match({ status: 200, body: "OK" } as Record<string, unknown>)
        .with({ status: P.number, body: P.string }, () => "valid response")
        .otherwise(() => "invalid");

      assert.strictEqual(result, "valid response");
    });
  });

  describe(".otherwise", () => {
    it("should return the default when no pattern matches", () => {
      const result = match("xyz")
        .with("abc", () => "abc")
        .otherwise(() => "default");

      assert.strictEqual(result, "default");
    });

    it("should receive the original value", () => {
      const result = match(99)
        .with(0, () => "zero")
        .otherwise((v) => `value is ${v}`);

      assert.strictEqual(result, "value is 99");
    });
  });

  describe(".exhaustive", () => {
    it("should return the matched result", () => {
      const result = match("a")
        .with("a", () => "matched a")
        .with("b", () => "matched b")
        .exhaustive();

      assert.strictEqual(result, "matched a");
    });

    it("should throw when no pattern matches", () => {
      assert.throws(
        () => {
          match("c")
            .with("a", () => "a")
            .with("b", () => "b")
            .exhaustive();
        },
        {
          message: /Pattern matching exhaustive error/,
        },
      );
    });
  });

  describe(".run", () => {
    it("should be an alias for exhaustive", () => {
      const result = match("hello")
        .with("hello", () => "world")
        .run();

      assert.strictEqual(result, "world");
    });

    it("should throw like exhaustive when no match", () => {
      assert.throws(
        () => {
          match(999)
            .with(0, () => "zero")
            .run();
        },
        {
          message: /Pattern matching exhaustive error/,
        },
      );
    });
  });

  describe("nested patterns", () => {
    it("should match deeply nested structures", () => {
      const data = {
        response: {
          status: "ok",
          payload: {
            items: [1, 2, 3],
          },
        },
      };

      const result = match(data)
        .with(
          { response: { status: "ok", payload: { items: P.array(P.number) } } },
          () => "valid data",
        )
        .otherwise(() => "invalid");

      assert.strictEqual(result, "valid data");
    });

    it("should match first matching pattern in order", () => {
      const result = match({ x: 1, y: 2 })
        .with({ x: 1 }, () => "first")
        .with({ x: 1, y: 2 }, () => "second")
        .otherwise(() => "default");

      assert.strictEqual(result, "first");
    });
  });

  describe("P.any", () => {
    it("should match any value", () => {
      const result = match({ key: "anything" })
        .with({ key: P.any }, () => "matched")
        .otherwise(() => "no match");

      assert.strictEqual(result, "matched");
    });
  });
});
