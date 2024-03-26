type hashes = "SHA-1" | "SHA-256" | "SHA-512";

export interface HotpGenOptions {
  _hash?: hashes;
}

export interface HotpVerifyOptions {
  window?: number;
  _hash?: hashes;
}

export interface TotpOptions {
  time?: number;
  _t?: number;
  _hash?: hashes;
}
