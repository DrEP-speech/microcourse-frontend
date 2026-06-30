import { apiFetch, ApiError } from "../lib/api";

// Unit tests for apiFetch error normalisation.
// fetch is mocked so no real network calls happen.
// ApiError shape: { status: number, message: string, details: any }
describe("apiFetch", () => {
  beforeEach(() => {
    // @ts-expect-error
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_BASE = "http://example.com";
  });

  it("throws ApiError on non-2xx", async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => "application/json" },
      json: async () => ({ code: "UNAUTHORIZED", message: "Nope" }),
    });

    await expect(apiFetch("x")).rejects.toBeInstanceOf(ApiError);
    // ApiError picks up message from response body; no .code on the error itself
    await expect(apiFetch("x")).rejects.toMatchObject({ status: 401, message: "Nope" });
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
