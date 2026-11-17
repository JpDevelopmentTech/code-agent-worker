import { describe, expect, it } from "vitest";
import { redactSecrets } from "./redact-secrets";

describe("redactSecrets", () => {
  it("should replace every occurrence of each secret when they appear in the text", () => {
    const text = "token=ghp_abcdefgh12345 y otra vez ghp_abcdefgh12345; worker=wrk_0123456789";

    expect(redactSecrets(text, ["ghp_abcdefgh12345", "wrk_0123456789"])).toBe(
      "token=[REDACTADO] y otra vez [REDACTADO]; worker=[REDACTADO]",
    );
  });

  it("should ignore empty or very short values when they are passed as secrets", () => {
    expect(redactSecrets("a b c", ["", "a"])).toBe("a b c");
  });

  it("should redact the longer secret first when one secret contains another", () => {
    expect(redactSecrets("x-ABCDEFGH12345678-x", ["ABCDEFGH", "ABCDEFGH12345678"])).toBe(
      "x-[REDACTADO]-x",
    );
  });

  it("should leave the text untouched when no secret appears", () => {
    expect(redactSecrets("todo limpio", ["ghp_abcdefgh12345"])).toBe("todo limpio");
  });
});
