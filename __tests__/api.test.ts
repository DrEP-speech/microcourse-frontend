import { apiRequest, ApiError } from "../lib/api";

// NOTE: This is a unit test for error normalization.
// We mock fetch so no real network calls happen.
describe("apiRequest", () => {
  beforeEach(() => {
    // @ts-expect-error
    global.fetch = jest.fn();
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://example.com";
  });

  it("throws ApiError on non-2xx", async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => JSON.stringify({ code: "UNAUTHORIZED", message: "Nope" }),
    });

    await expect(apiRequest("x")).rejects.toBeInstanceOf(ApiError);
    await expect(apiRequest("x")).rejects.toMatchObject({ status: 401, code: "UNAUTHORIZED" });
  });

  it("returns parsed json on 2xx", async () => {
    // @ts-expect-error
    global.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ok: true }),
    });

    const out = await apiRequest<{ ok: boolean }>("x");
    expect(out.ok).toBe(true);
  });
});
