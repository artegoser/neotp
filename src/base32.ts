import base32Encode from "base32-encode";

function str2bytes(str: string) {
  let bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }

  return new Uint8Array(bytes);
}

export function encode(str: string) {
  return base32Encode(str2bytes(str), "RFC4648");
}
