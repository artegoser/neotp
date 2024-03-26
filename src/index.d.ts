declare module "base32.js" {
  function decode(str: string): Buffer;
  function encode(str: string): string;
}
