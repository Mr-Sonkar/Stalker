import { runProfileTextScan } from "../profile-text";

jest.mock("../profile-text/ocr", () => ({
  extractTextFromImage: jest.fn().mockResolvedValue("Hi! My email is test@example.com and phone is 800-555-0199."),
}));

describe("Profile Text Scan", () => {
  it("should extract PII from bio text", async () => {
    const findings = await runProfileTextScan("Reach me at contact@company.com or call +1 800 555 0199.");

    expect(findings).toBeDefined();
    expect(findings.length).toBeGreaterThan(0);
    
    const bioFinding = findings.find(f => f.source === "bio");
    expect(bioFinding).toBeDefined();
    expect(bioFinding?.piiType === "email" || findings.some(f => f.piiType === "email")).toBeTruthy();
    expect(bioFinding?.piiType === "phone" || findings.some(f => f.piiType === "phone")).toBeTruthy();
  });

  it("should handle empty inputs gracefully", async () => {
    const findings = await runProfileTextScan();
    expect(findings).toEqual([]);
  });

  it("should extract PII from screenshot", async () => {
    const mockFile = Buffer.from("test image content");
    const findings = await runProfileTextScan(undefined, mockFile);

    expect(findings).toBeDefined();
    expect(findings.length).toBeGreaterThan(0);

    const ssFinding = findings.find(f => f.source === "ocr");
    expect(ssFinding).toBeDefined();
    expect(ssFinding?.piiType === "email" || findings.some(f => f.piiType === "email")).toBeTruthy();
    expect(ssFinding?.piiType === "phone" || findings.some(f => f.piiType === "phone")).toBeTruthy();
  });
});
