import { apiFetch, ApiError, setStoredToken } from "../lib/api";

// Mock the redirect helper so jsdom's window.location restrictions don't
// interfere with the stale-token interceptor tests.
jest.mock("../lib/sessionRedirect", () => ({
  redirectToSessionExpiredLogin: jest.fn(),
}));
import { redirectToSessionExpiredLogin } from "../lib/sessionRedirect";
const mockRedirect = redirectToSessionExpiredLogin as jest.MockedFunction<typeof redirectToSessionExpiredLogin>;

// Unit tests for apiFetch error handling and stale-token interceptor.
// fetch is mocked so no real network calls happen.

const TOKEN_KEY = "mc_token";

describe("apiFetch \u2014 basic error handling", () => {
  beforeEach(() => {
    // @ts-expect-error
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_BASE = "http://example.com";
    localStorage.clear();
    mockRedirect.mockClear();
  });

  it("throws ApiError on 500", async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "SERVER_ERROR", message: "Oops" }),
    });

    await expect(apiFetch("x")).rejects.toBeInstanceOf(ApiError);
    await expect(apiFetch("x")).rejects.toMatchObject({ status: 500 });
  });

  it("returns parsed json on 2xx", async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => "application/json" },
      json: async () => ({ ok: true }),
    });

    const out = await apiFetch<{ ok: boolean }>("x");
    expect(out.ok).toBe(true);
  });
});

describe("apiFetch \u2014 stale-token interceptor (401 handling)", () => {
  beforeEach(() => {
    // @ts-expect-error
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_BASE = "http://example.com";
    localStorage.clear();
    mockRedirect.mockClear();
  });

  it("on 401 from authenticated call: clears mc_token", async () => {
    setStoredToken("old-token-value");
    expect(localStorage.getItem(TOKEN_KEY)).toBe("old-token-value");

    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "INVALID_TOKEN" }),
    });

    await expect(apiFetch("/api/auth/me")).rejects.toBeInstanceOf(ApiError);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it("on 401 from authenticated call: calls redirectToSessionExpiredLogin", async () => {
    setStoredToken("old-token-value");

    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "INVALID_TOKEN" }),
    });

    await expect(apiFetch("/api/auth/me")).rejects.toBeInstanceOf(ApiError);
    expect(mockRedirect).toHaveBeenCalledTimes(1);
  });

  it("on 401 from authenticated call: throws SESSION_EXPIRED", async () => {
    setStoredToken("old-token-value");

    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "INVALID_TOKEN" }),
    });

    await expect(apiFetch("/api/auth/me")).rejects.toMatchObject({
      status: 401,
      message: "SESSION_EXPIRED",
    });
  });

  it("on 401 from noAuth call: does NOT clear token and does NOT redirect", async () => {
    setStoredToken("keep-this-token");

    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "INVALID_CREDENTIALS" }),
    });

    await expect(
      apiFetch("/api/auth/login", { method: "POST", body: {}, noAuth: true })
    ).rejects.toBeInstanceOf(ApiError);

    expect(localStorage.getItem(TOKEN_KEY)).toBe("keep-this-token");
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("on 403 FORBIDDEN: does NOT clear token and does NOT redirect", async () => {
    setStoredToken("valid-token");

    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: false,
      status: 403,
      headers: { get: () => "application/json" },
      json: async () => ({ error: "FORBIDDEN" }),
    });

    await expect(apiFetch("/api/courses")).rejects.toBeInstanceOf(ApiError);
    expect(localStorage.getItem(TOKEN_KEY)).toBe("valid-token");
    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
