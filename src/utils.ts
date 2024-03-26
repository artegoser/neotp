/**
 * convert an integer to a byte array
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
 */
function hexToBytes(hex: string) {
  let bytes = [];
  for (let c = 0, C = hex.length; c < C; c += 2) {
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

import CryptoJS from "crypto-js";
import HmacSHA1 from "crypto-js/hmac-sha1.js";
const WordArray = CryptoJS.lib.WordArray;

export { intToWords, hexToBytes, HmacSHA1, WordArray };
