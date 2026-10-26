import { checkDataBreaches } from '../breaches';

describe('checkDataBreaches', () => {
  beforeEach(() => {
    // Reset environment variable before each test
    delete process.env.HIBP_API_KEY;
  });

  it('should return test breaches for test email', async () => {
    const result = await checkDataBreaches('test.breach@example.com');
    expect(Array.isArray(result)).toBe(true);
    // Test emails should trigger demo data
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return test breaches for admin email', async () => {
    const result = await checkDataBreaches('alex.pwned@admin.com');
    expect(Array.isArray(result)).toBe(true);
    // Should return 4 breaches for admin/pwned combo
    expect(result.length).toBe(4);
  });

  it('should return empty array for clean email', async () => {
    const result = await checkDataBreaches('clean.user@example.com');
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it('should handle missing HIBP API key gracefully', async () => {
    // Ensure no API key is set
    delete process.env.HIBP_API_KEY;
    const result = await checkDataBreaches('test@example.com');
    expect(Array.isArray(result)).toBe(true);
  });
});