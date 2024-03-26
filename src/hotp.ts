import { HotpVerifyOptions } from "./types.js";
import { hexToBytes, HmacSHA1, intToWords, WordArray } from "./utils.js";

/**
 * Generate a counter based One Time Password
 */
export function gen(key: string, counter: number) {
  // Create the byte array
  let b = intToWords(counter);
  // Update the HMAC with the byte array
  let digest = HmacSHA1(WordArray.create(b), key).toString();

  // Get byte array
  let h = hexToBytes(digest);

  // Truncate
  let offset = h[19] & 0xf;
  let v =
    ((h[offset] & 0x7f) << 24) |
    ((h[offset + 1] & 0xff) << 16) |
    ((h[offset + 2] & 0xff) << 8) |
    (h[offset + 3] & 0xff);

  let v_s = (v % 1000000) + "";

  return Array(7 - v_s.length).join("0") + v_s;
}
/**
 * Check a One Time Password based on a counter.
 */
export function verify(
  token: string,
  key: string,
  counter: number,
  { window = 50 }: HotpVerifyOptions = {}
) {
  // Now loop through from C to C + W to determine if there is
  // a correct code
  for (let i = counter - window; i <= counter + window; ++i) {
    if (gen(key, i) === token) {
      // We have found a matching code, trigger callback
      // and pass offset
      return {
        delta: i - counter,
      };
    }
  }

  // If we get to here then no codes have matched, return null
  return false;
}
