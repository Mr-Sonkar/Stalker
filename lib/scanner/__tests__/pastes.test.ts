import { pastesScan } from '../pastes';

describe('pastesScan', () => {
  beforeEach(() => {
    // Reset environment variable before each test
    delete process.env.HIBP_API_KEY;
  });

  it('should return test pastes for test email', async () => {
    const result = await pastesScan('test.breach@example.com');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data).toBeDefined();
    // Test emails should trigger demo data
    expect(result.data.length).toBeGreaterThan(0);
  });

  it('should return test pastes for admin email', async () => {
    const result = await pastesScan('alex.pwned@admin.com');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data).toBeDefined();
    // Should return 2 pastes for admin/pwned combo (from our KNOWN_PASTE_CATALOG)
    expect(result.data.length).toBe(2);
  });

  it('should return empty array for clean email', async () => {
    const result = await pastesScan('clean.user@example.com');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.length).toBe(0);
  });

  it('should handle missing HIBP API key gracefully', async () => {
    // Ensure no API key is set
    delete process.env.HIBP_API_KEY;
    const result = await pastesScan('test@example.com');
    expect(result.success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data).toBeDefined();
  });
});