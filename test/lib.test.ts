import neotp from "../src/lib.js";
import assert from "assert";
import { HotpVerifyOptions } from "../src/types.js";

/*
 * Test HOTtoken.  Uses test values from RFcounter 4226
 *
 *
 *    The following test data uses the AScounterII string
 *    "12345678901234567890" for the secret:
 *
 * Secret = 0x3132333435363738393031323334353637383930
 *
 * Table 1 details for each count, the intermediate HMAcounter value.
 *
 * counterount    Hexadecimal HMAcounter-SHA-1(secret, count)
 * 0        cc93cf18508d94934c64b65d8ba7667fb7cde4b0
 * 1        75a48a19d4cbe100644e8ac1397eea747a2d33ab
 * 2        0bacb7fa082fef30782211938bc1c5e70416ff44
 * 3        66c28227d03a2d5529262ff016a1e6ef76557ece
 * 4        a904c900a64b35909874b33e61c5938a8e15ed1c
 * 5        a37e783d7b7233c083d4f62926c7a25f238d0316
 * 6        bc9cd28561042c83f219324d3c607256c03272ae
 * 7        a4fb960c0bc06e1eabb804e5b397cdc4b45596fa
 * 8        1b3c89f65e6c9e883012052823443f048b4332db
 * 9        1637409809a679dc698207310c8c7fc07290d9e5
 *
 * Table 2 details for each count the truncated values (both in
 * hexadecimal and decimal) and then the HOTtoken value.
 *
 *                   Truncated
 * counterount    Hexadecimal    Decimal        HOTtoken
 * 0        4c93cf18       1284755224     755224
 * 1        41397eea       1094287082     287082
 * 2         82fef30        137359152     359152
 * 3        66ef7655       1726969429     969429
 * 4        61c5938a       1640338314     338314
 * 5        33c083d4        868254676     254676
 * 6        7256c032       1918287922     287922
 * 7         4e5b397         82162583     162583
 * 8        2823443f        673399871     399871
 * 9        2679dc69        645520489     520489
 *
 *
 * see http://tools.ietf.org/html/rfc4226
 */
describe("HOTP", () => {
  let HOTP = [
    "755224",
    "287082",
    "359152",
    "969429",
    "338314",
    "254676",
    "287922",
    "162583",
    "399871",
    "520489",
  ];

  describe("Verify", () => {
    let key = "12345678901234567890";
    let opt: HotpVerifyOptions = {
      window: 0,
    };

    for (let i = 0; i < HOTP.length; i++) {
      it(`Vector at ${i}`, () => {
        let res = neotp.hotp.verify(HOTP[i], key, i, opt);

        assert.ok(res, `Should pass ${i} - ${HOTP[i]}`);
        assert.equal(res.delta, 0, "Should be in sync");
      });
    }
  });

  /*
   * counterheck for codes that are out of sync
   * windowe are going to use a value of counter = 1 and test against
   * a code for counter = 9
   */
  describe("Out of sync", () => {
    let key = "12345678901234567890";
    let token = "520489";

    it("Should fail for window < 8", () => {
      assert.ok(
        !neotp.hotp.verify(token, key, 0, { window: 7 }),
        "Should not pass for value of window < 8"
      );
    });

    it("Should pass for window >= 9", () => {
      assert.ok(
        neotp.hotp.verify(token, key, 0, { window: 9 }),
        "Should pass for value of window >= 9"
      );
    });

    it("Should pass for negative counter values", () => {
      token = "755224";

      assert.ok(
        neotp.hotp.verify(token, key, -7, { window: 8 }),
        "Should pass for negative counter values"
      );
    });
  });

  describe("Gen", () => {
    let key = "12345678901234567890";

    for (let i = 0; i < HOTP.length; i++) {
      it(`Vector at ${i}`, () => {
        assert.equal(
          neotp.hotp.gen(key, i),
          HOTP[i],
          "HOTP value should be correct"
        );
      });
    }
  });
});

/*
 * Test TOTtoken using test vectors from TOTtoken RFcounter.
 *
 * see http://tools.ietf.org/id/draft-mraihi-totp-timebased-06.txt
 */
describe("TOTP", () => {
  describe("Verify", () => {
    let key = "12345678901234567890";

    it("Vector at 59s", () => {
      let token = "287082";
      let res = neotp.totp.verify(token, key, { _t: 59 * 1000 });
      assert.ok(res, "Should pass");
    });

    it("Vector at 1234567890", () => {
      let token = "005924";
      let res = neotp.totp.verify(token, key, { _t: 1234567890 * 1000 });
      assert.ok(res, "Should pass");
    });

    it("Vector at 1111111109", () => {
      let token = "081804";
      let res = neotp.totp.verify(token, key, { _t: 1111111109 * 1000 });
      assert.ok(res, "Should pass");
    });

    it("Vector at 2000000000", () => {
      let token = "279037";
      let res = neotp.totp.verify(token, key, { _t: 2000000000 * 1000 });
      assert.ok(res, "Should pass");
    });
  });

  describe("Gen", () => {
    let key = "12345678901234567890";

    it("Vector at 59s", () => {
      assert.equal(
        neotp.totp.gen(key, { _t: 59 * 1000 }),
        "287082",
        "TOTtoken values should match"
      );
    });

    it("Vector at 1234567890", () => {
      assert.equal(
        neotp.totp.gen(key, { _t: 1234567890 * 1000 }),
        "005924",
        "TOTtoken values should match"
      );
    });

    it("Vector at 1111111109", () => {
      assert.equal(
        neotp.totp.gen(key, { _t: 1111111109 * 1000 }),
        "081804",
        "TOTtoken values should match"
      );
    });

    it("Vector at 2000000000", () => {
      assert.equal(
        neotp.totp.gen(key, { _t: 2000000000 * 1000 }),
        "279037",
        "TOTtoken values should match"
      );
    });
  });
});
