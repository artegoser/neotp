import { hotp } from "./lib.js";
import { TotpOptions } from "./types.js";

/**
 * Generate a time based One Time Password
 */
export async function gen(
  key: string,
  { time = 30, _t = Date.now() }: TotpOptions = {}
) {
  // Determine the value of the counter, C
  // This is the number of time steps in seconds since T0
  let counter = Math.floor(_t / 1000 / time);

  return await hotp.gen(key, counter);
}

/**
 * Check a One Time Password based on a timer.
 */
export async function verify(
  token: string,
  key: string,
  { time = 30, _t = Date.now() }: TotpOptions = {}
) {
  return (await gen(key, { time, _t })) === token;
}
