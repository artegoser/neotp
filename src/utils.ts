/**
 * convert an integer to a byte array
 */
function intToBytes(num: number) {
  var bytes = [];

  for (var i = 7; i >= 0; --i) {
    bytes[i] = num & 255;
    num = num >> 8;
  }

  return bytes;
}

export async function hmac(
  secret: string,
  counter: number,
  hash: "SHA-512" | "SHA-256" | "SHA-1" = "SHA-1"
) {
  const algorithm = { name: "HMAC", hash };

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    algorithm,
    false,
    ["sign", "verify"]
  );

  const signature = await crypto.subtle.sign(
    algorithm.name,
    key,
    new Uint8Array(intToBytes(counter))
  );

  return new Uint8Array(signature);
}
