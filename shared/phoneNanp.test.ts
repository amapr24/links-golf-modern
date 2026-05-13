import { describe, expect, it } from "vitest";
import { formatNanpPhoneForStorage } from "./phoneNanp";

describe("formatNanpPhoneForStorage", () => {
  it("formats 10 digits", () => {
    expect(formatNanpPhoneForStorage("7875550100")).toBe("+1 787-555-0100");
  });

  it("formats 11 digits with country 1", () => {
    expect(formatNanpPhoneForStorage("17875550100")).toBe("+1 787-555-0100");
  });

  it("strips punctuation", () => {
    expect(formatNanpPhoneForStorage("+1 (787) 555-0100")).toBe("+1 787-555-0100");
  });

  it("returns null for too short", () => {
    expect(formatNanpPhoneForStorage("5550100")).toBeNull();
  });
});
