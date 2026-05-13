import { describe, expect, it } from "vitest";
import {
  formatUsPhoneForStorage,
  normalizeUsLocalPhoneDigits,
} from "./phoneNanp";

describe("normalizeUsLocalPhoneDigits", () => {
  it("keeps up to 10 digits", () => {
    expect(normalizeUsLocalPhoneDigits("7875550100")).toBe("7875550100");
  });

  it("strips leading 1 for pasted NANP", () => {
    expect(normalizeUsLocalPhoneDigits("17875550100")).toBe("7875550100");
  });

  it("truncates to 10 after stripping 1", () => {
    expect(normalizeUsLocalPhoneDigits("1787555010012")).toBe("7875550100");
  });

  it("strips non-digits", () => {
    expect(normalizeUsLocalPhoneDigits("(787) 555-0100")).toBe("7875550100");
  });
});

describe("formatUsPhoneForStorage", () => {
  it("formats 10 digits with implied +1", () => {
    expect(formatUsPhoneForStorage("7875550100")).toBe("+1 787-555-0100");
  });

  it("accepts pasted +1 number", () => {
    expect(formatUsPhoneForStorage("+1 (787) 555-0100")).toBe("+1 787-555-0100");
  });

  it("returns null if not 10 national digits", () => {
    expect(formatUsPhoneForStorage("5550100")).toBeNull();
  });
});
