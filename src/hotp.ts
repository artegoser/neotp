import { HotpVerifyOptions } from "./types.js";
import { hexToBytes, HmacSHA1, intToWords, WordArray } from "./utils.js";

/**
 * Generate a counter based One Time Password
 *
 * @return {String} the one time password
 *
 * Arguments:
 *
 *  args
 *     key - Key for the one time password.  This should be unique and secret for
 *         every user as this is the seed that is used to calculate the HMAC
 *
 *     counter - Counter value.  This should be stored by the application, must
 *         be user specific, and be incremented for each request.
 *
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
 *
 * @return {Object} null if failure, { delta: # } on success
 * delta is the time step difference between the client and the server
 *
 * Arguments:
 *
 *  args
 *     key - Key for the one time password.  This should be unique and secret for
 *         every user as it is the seed used to calculate the HMAC
 *
 *     token - Passcode to validate.
 *
 *     window - The allowable margin for the counter.  The function will check
 *         'W' codes in the future against the provided passcode.  Note,
 *         it is the calling applications responsibility to keep track of
 *         'W' and increment it for each password check, and also to adjust
 *         it accordingly in the case where the client and server become
 *         out of sync (second argument returns non zero).
 *         E.g. if W = 100, and C = 5, this function will check the passcode
 *         against all One Time Passcodes between 5 and 105.
 *
 *         Default - 50
 *
 *     counter - Counter value.  This should be stored by the application, must
 *         be user specific, and be incremented for each request.
 *
 */
export function verify(
  token: string,
  key: string,
  { window = 50, counter = 0 }: HotpVerifyOptions = {}
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
