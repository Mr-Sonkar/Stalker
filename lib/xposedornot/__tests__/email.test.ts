import { checkEmailBreaches, checkXposedOrNotAnalytics } from "../email";
import { XposedOrNot } from "xposedornot";

jest.mock("xposedornot");

describe("XposedOrNot Email & Analytics Check", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles valid email and returns sanitized results", async () => {
    const mockResult = {
      found: true,
      analytics: {
        ExposedBreaches: {
          breaches_details: [
            {
              breach: "Adobe",
              domain: "adobe.com",
              xposed_date: "2013",
              added: "2013-12-04T00:00:00Z",
              xposed_records: 152445165,
              verified: "Yes",
              xposed_data: "Email addresses;Passwords;Usernames",
            },
          ],
        },
        ExposedPastes: [
          {
            paste_id: "paste_xon_1",
            source: "Pastebin",
            title: "Leaked Creds",
            date: "2023-05-01",
            emails_count: 500,
          },
        ],
      },
    };

    (XposedOrNot as jest.Mock).mockImplementation(() => ({
      getBreachAnalytics: jest.fn().mockResolvedValue(mockResult),
    }));

    const results = await checkEmailBreaches("test@example.com");

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Adobe");
    expect(results[0].verified).toBe(true);
    expect(results[0].dataClasses).toContain("Passwords");
    expect(results[0].sources).toContain("XposedOrNot");

    const analytics = await checkXposedOrNotAnalytics("test@example.com");
    expect(analytics.breaches).toHaveLength(1);
    expect(analytics.pastes).toHaveLength(1);
    expect(analytics.pastes[0].source).toBe("Pastebin");
  });

  it("handles clean email (no breaches found)", async () => {
    (XposedOrNot as jest.Mock).mockImplementation(() => ({
      getBreachAnalytics: jest.fn().mockResolvedValue({ found: false }),
    }));

    const results = await checkEmailBreaches("clean@example.com");
    expect(results).toEqual([]);
  });

  it("handles 404 response gracefully", async () => {
    (XposedOrNot as jest.Mock).mockImplementation(() => ({
      getBreachAnalytics: jest.fn().mockRejectedValue({
        response: { status: 404 },
      }),
    }));

    const results = await checkEmailBreaches("secure@example.com");
    expect(results).toEqual([]);
  });
});

