let base32 = require("../base32");
let assert = require("assert");

let key = "12345678901234567890";
let value = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";

describe("Base32", () => {
  it("Encode", () => {
    assert.equal(base32.encode(key), value);
  });

  it("Decode", () => {
    assert.equal(base32.decode(value), key);
  });
});
