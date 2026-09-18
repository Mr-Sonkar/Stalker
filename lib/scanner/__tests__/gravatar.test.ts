import { checkGravatarExposure } from '../gravatar';

describe('checkGravatarExposure', () => {
  it('should return an object with the correct structure', async () => {
    const result = await checkGravatarExposure('test@example.com');
    expect(result).toHaveProperty('platform');
    expect(result).toHaveProperty('category');
    expect(result).toHaveProperty('isExposed');
    expect(result).toHaveProperty('details');
    // avatarUrl and profileUrl are only present when exposed
    if (result.isExposed) {
      expect(result).toHaveProperty('avatarUrl');
      expect(result).toHaveProperty('profileUrl');
    }
  });

  it('should have category "avatar" for Gravatar', async () => {
    const result = await checkGravatarExposure('test@example.com');
    expect(result.category).toBe('avatar');
  });

  it('should set platform to "Gravatar / Automattic"', async () => {
    const result = await checkGravatarExposure('test@example.com');
    expect(result.platform).toBe('Gravatar / Automattic');
  });

  // Note: We cannot guarantee whether a specific email will have a Gravatar profile or not.
  // So we just check the structure and that the function doesn't throw.
  it('should not throw for any email input', async () => {
    await expect(checkGravatarExposure('test@example.com')).resolves.not.toThrow();
    await expect(checkGravatarExposure('invalid-email')).resolves.not.toThrow();
    await expect(checkGravatarExposure('')).resolves.not.toThrow();
  });
});