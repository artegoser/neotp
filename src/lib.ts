import CryptoJS from "crypto-js";
const WordArray = CryptoJS.lib.WordArray;
const HmacSHA1 = CryptoJS.HmacSHA1;

/**
 * convert an integer to a byte array
 * @param {Integer} num
 * @return {Array} bytes
 */
function intToWords(num: number) {
  let bytes = [];
  for (let i = 7; i >= 0; --i) {
    bytes[i] = num & 255;
    num = num >> 8;
  }
  let words: number[] = [];
  for (let i = 0; i < bytes.length; i++) {
    words[i >>> 2] |= bytes[i] << (24 - (i % 4) * 8);
  }
  return words;
}

/**
 * convert a hex value to a byte array
 * @param {String} hex string of hex to convert to a byte array
 * @return {Array} bytes
 */
function hexToBytes(hex: string) {
  let bytes = [];
  for (let c = 0, C = hex.length; c < C; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

let hotp = {
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
  gen(key: string, opt?: any) {
    key = key || "";
    opt = opt || {};
    let counter = opt.counter || 0;

    let p = 6;

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
  },
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
  verify(token: string, key: string, opt?: any) {
    opt = opt || {};
    let win = opt.window || 50;
    let counter = opt.counter || 0;

    // Now loop through from C to C + W to determine if there is
    // a correct code
    for (let i = counter - win; i <= counter + win; ++i) {
      opt.counter = i;
      if (this.gen(key, opt) === token) {
        // We have found a matching code, trigger callback
        // and pass offset
        return {
          delta: i - counter,
        };
      }
    }

    // If we get to here then no codes have matched, return null
    return null;
  },
};

let totp = {
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
  gen(key: string, opt?: any) {
    opt = opt || {};
    let time = opt.time || 30;
    let _t = Date.now();

    // Time has been overwritten.
    if (opt._t) {
      _t = opt._t;
    }

    // Determine the value of the counter, C
    // This is the number of time steps in seconds since T0
    opt.counter = Math.floor(_t / 1000 / time);

    return hotp.gen(key, opt);
  },

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
  verify(token: string, key: string, opt?: any) {
    opt = opt || {};
    let time = opt.time || 30;
    let _t = Date.now();

    // Time has been overwritten.
    if (opt._t) {
      _t = opt._t;
    }

    // Determine the value of the counter, C
    // This is the number of time steps in seconds since T0
    opt.counter = Math.floor(_t / 1000 / time);

    return hotp.verify(token, key, opt);
  },
};

export { hotp, totp };
