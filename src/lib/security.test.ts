import { describe, expect, it } from "vitest";

import { hashSessionToken, safeNextPath } from "./security";

describe("safeNextPath", () => {
  it("keeps internal routes and rejects external redirects", () => {
    expect(safeNextPath("/write")).toBe("/write");
    expect(safeNextPath("/posts/1?mode=edit")).toBe("/posts/1?mode=edit");
    expect(safeNextPath("https://evil.example")).toBe("/");
    expect(safeNextPath("//evil.example")).toBe("/");
    expect(safeNextPath("login")).toBe("/");
  });
});

describe("hashSessionToken", () => {
  it("hashes tokens deterministically with the configured secret", () => {
    const first = hashSessionToken("session-token", "secret-key");
    const second = hashSessionToken("session-token", "secret-key");

    expect(first).toBe(second);
    expect(first).not.toBe("session-token");
  });
});
