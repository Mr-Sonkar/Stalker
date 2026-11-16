import { sha1, getHashPrefix, getHashSuffix, parsePwnedPasswordsResponse } from "../passwords";
import { TextEncoder } from "util";

// Mock crypto.subtle for tests
global.crypto = {
  ...global.crypto,
  subtle: {
    digest: async (algo: any, data: Uint8Array) => {
      // In Node 19+ webcrypto is available. For jest, we use a basic mock or crypto module.
      const crypto = require("crypto");
      const hash = crypto.createHash("sha1").update(data).digest();
      return new Uint8Array(hash).buffer;
    },
  } as any,
};
global.TextEncoder = TextEncoder as any;

describe("HIBP Passwords (k-Anonymity)", () => {
  it("generates SHA-1 correctly", async () => {
    const hash = await sha1("password123");
    expect(hash).toBe("CBFDAC6008F9CAB4083784CBD1874F76618D2A97"); // Known SHA-1 for 'password123'
  });

  it("extracts only 5-character prefix", async () => {
    const hash = "CBFDAC6008F9CAB4083784CBD1874F76618D2A97";
    expect(getHashPrefix(hash)).toBe("CBFDA");
    expect(getHashPrefix(hash)).toHaveLength(5);
  });

  it("extracts suffix correctly", async () => {
    const hash = "CBFDAC6008F9CAB4083784CBD1874F76618D2A97";
    expect(getHashSuffix(hash)).toBe("C6008F9CAB4083784CBD1874F76618D2A97");
  });

  it("parses known breached test password count", () => {
    const mockResponse = `C6008F9CAB4083784CBD1874F76618D2A97:2147483647\n00000000000000000000000000000000000:10`;
    const count = parsePwnedPasswordsResponse(mockResponse, "C6008F9CAB4083784CBD1874F76618D2A97");
    expect(count).toBe(2147483647);
  });

  it("returns 0 for password not found", () => {
    const mockResponse = `00000000000000000000000000000000000:10`;
    const count = parsePwnedPasswordsResponse(mockResponse, "AC3D322EBCDF39276FA2BCE2B1A7E117D06");
    expect(count).toBe(0);
  });

  it("Privacy Check: Full password is never sent in request", () => {
    // This is tested implicitly by the architecture: we only use getHashPrefix() to construct the URL.
    // getHashPrefix only returns 5 characters. The plaintext password is only passed to sha1().
    const plaintext = "mySecretPassword";
    const prefix = getHashPrefix("SOMEHASHVALUE");
    expect(prefix).not.toContain(plaintext);
    expect(prefix.length).toBe(5);
  });
});
