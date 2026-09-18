import { analyzeEmailDomain } from '../email-check';

describe('analyzeEmailDomain', () => {
  it('should correctly identify disposable email domain', async () => {
    const result = await analyzeEmailDomain('test@mailinator.com');
    expect(result.isDisposable).toBe(true);
    expect(result.providerType).toBe('disposable');
  });

  it('should correctly identify public provider domain', async () => {
    const result = await analyzeEmailDomain('test@gmail.com');
    expect(result.providerType).toBe('public_free');
    expect(result.hasMxRecords).toBe(true); // Should be true for valid domains
  });

  it('should correctly identify domain not in disposable or public lists', async () => {
    const result = await analyzeEmailDomain('test@example.com');
    // example.com is not in DISPOSABLE_PROVIDERS nor POPULAR_PUBLIC_PROVIDERS
    // So it should be "corporate" (as per the else block in the function)
    expect(result.providerType).toBe('corporate');
  });

  it('should handle invalid email format', async () => {
    const result = await analyzeEmailDomain('invalid-email');
    expect(result.domain).toBe('');
    expect(result.isDisposable).toBe(false);
    expect(result.hasMxRecords).toBe(false);
    expect(result.providerType).toBe('custom');
  });

  it('should handle email with multiple @ symbols', async () => {
    const result = await analyzeEmailDomain('test@domain@extra.com');
    expect(result.domain).toBe('');
    expect(result.isDisposable).toBe(false);
    expect(result.hasMxRecords).toBe(false);
    expect(result.providerType).toBe('custom');
  });
});