import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  authIsConfigured,
  createSessionToken,
  credentialsMatch,
  verifySessionToken,
} from "./auth";

describe("static authentication", () => {
  beforeEach(() => {
    process.env.MOBILITY_AUTH_USERNAME = "demo";
    process.env.MOBILITY_AUTH_PASSWORD = "a-long-demo-password";
    process.env.MOBILITY_AUTH_SECRET = "0123456789abcdef0123456789abcdef";
  });

  afterEach(() => {
    delete process.env.MOBILITY_AUTH_USERNAME;
    delete process.env.MOBILITY_AUTH_PASSWORD;
    delete process.env.MOBILITY_AUTH_SECRET;
  });

  it("accepts only the configured credentials", () => {
    expect(authIsConfigured()).toBe(true);
    expect(credentialsMatch("demo", "a-long-demo-password")).toBe(true);
    expect(credentialsMatch("demo", "wrong")).toBe(false);
  });

  it("creates a signed session that survives verification", async () => {
    const token = await createSessionToken("demo");
    expect((await verifySessionToken(token))?.sub).toBe("demo");
  });

  it("rejects tampered and expired sessions", async () => {
    const token = await createSessionToken("demo");
    expect(await verifySessionToken(`${token}x`)).toBeNull();
    expect(
      await verifySessionToken(await createSessionToken("demo", -1)),
    ).toBeNull();
  });
});
