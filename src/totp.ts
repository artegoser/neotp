import { hotp } from "./lib.js";
import { TotpOptions } from "./types.js";

/**
 * Generate a time based One Time Password
 *
 * @return {String} the one time password
 *
 * Arguments:
 *
 *  args
 *     key - Key for the one time password.  This should be unique and secret for
 *         every user as it is the seed used to calculate the HMAC
 *
 *     time - The time step of the counter.  This must be the same for
 *         every request and is used to calculat C.
 *
 *         Default - 30
 *
 */
export function gen(
  key: string,
  { time = 30, _t = Date.now() }: TotpOptions = {}
) {
  // Determine the value of the counter, C
  // This is the number of time steps in seconds since T0
  let counter = Math.floor(_t / 1000 / time);

  return hotp.gen(key, counter);
}

/**
 * Check a One Time Password based on a timer.
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
 *         'W' codes either side of the provided counter.  Note,
 *         it is the calling applications responsibility to keep track of
 *         'W' and increment it for each password check, and also to adjust
 *         it accordingly in the case where the client and server become
 *         out of sync (second argument returns non zero).
 *         E.g. if W = 5, and C = 1000, this function will check the passcode
 *         against all One Time Passcodes between 995 and 1005.
 *
 *         Default - 6
 *
 *     time - The time step of the counter.  This must be the same for
 *         every request and is used to calculate C.
 *
 *         Default - 30
 *
 */
export function verify(
  token: string,
  key: string,
  { time = 30, _t = Date.now() }: TotpOptions = {}
) {
  return gen(key, { time, _t }) === token;
}
