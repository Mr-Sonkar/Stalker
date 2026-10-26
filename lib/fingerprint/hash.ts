export async function generateHash(data: any): Promise<string> {
  // Normalize the object to a stable JSON string
  const normalizedData = JSON.stringify(data, Object.keys(data).sort());
  
  // Use Web Crypto API for SHA-256
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(normalizedData);
  
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    // Fallback if crypto.subtle is not available (e.g. non-HTTPS, though Next.js handles this in dev)
    console.error("Crypto API not available, returning crude fallback");
    return "0000000000000000000000000000000000000000000000000000000000000000";
  }
}
