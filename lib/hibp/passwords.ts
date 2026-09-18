export async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export function getHashPrefix(hash: string): string {
  return hash.slice(0, 5);
}

export function getHashSuffix(hash: string): string {
  return hash.slice(5);
}

export function parsePwnedPasswordsResponse(responseText: string, targetSuffix: string): number {
  const lines = responseText.split("\n");
  for (const line of lines) {
    const [suffix, count] = line.trim().split(":");
    if (suffix === targetSuffix) {
      return parseInt(count, 10);
    }
  }
  return 0;
}
