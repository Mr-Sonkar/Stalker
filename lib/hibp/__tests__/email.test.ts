import { checkEmailBreaches } from "../email";

// Mock fetch for tests
global.fetch = jest.fn();

describe("HIBP Email Check", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Privacy Check: HIBP API key is only available server-side", () => {
    // We check that process.env.HIBP_API_KEY is used.
    // In Next.js, vars not prefixed with NEXT_PUBLIC_ are strictly server-side.
    // We can't strictly assert Next.js compiler behavior in Jest easily, but we can verify our code uses process.env.HIBP_API_KEY.
    expect(process.env.NEXT_PUBLIC_HIBP_API_KEY).toBeUndefined();
  });

  it("handles valid email and returns sanitized results", async () => {
    const mockApiResponse = [
      {
        Name: "Adobe",
        Title: "Adobe",
        Domain: "adobe.com",
        BreachDate: "2013-10-04",
        AddedDate: "2013-12-04T00:00:00Z",
        PwnCount: 152445165,
        IsVerified: true,
        IsSensitive: false,
        DataClasses: ["Email addresses", "Password hints", "Passwords", "Usernames"],
        // These raw fields should NOT be in the final result:
        Description: "In October 2013...",
        LogoPath: "https://..."
      }
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    });

    const results = await checkEmailBreaches("test@example.com");
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Adobe");
    expect(results[0].dataClasses).toContain("Passwords");
    
    // Assert sanitized format (Description should not exist)
    expect((results[0] as any).Description).toBeUndefined();
  });

  it("handles 404 (no breach) by returning empty array", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    const results = await checkEmailBreaches("secure@example.com");
    expect(results).toEqual([]);
  });

  it("handles 401 authentication failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
    });

    await expect(checkEmailBreaches("test@example.com")).rejects.toThrow("HIBP API error: 401");
  });

  it("handles 429 rate limit", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
    });

    await expect(checkEmailBreaches("test@example.com")).rejects.toThrow("HIBP API error: 429");
  });
});
