import { encode } from "../src/base32.js";
import assert from "assert";

let key = "12345678901234567890";
let value = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("Base32", () => {
  it("Encode", () => {
    assert.equal(encode(key), value);
  });
});
