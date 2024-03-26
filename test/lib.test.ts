import neotp from "../src/lib.js";
import assert from "assert";
import { HotpVerifyOptions } from "../src/types.js";

/*
 * Test HOTtoken.  Uses test values from rfc6238
 *                   Truncated
 *  Count    Hexadecimal    Decimal        HOTP
 *  0        4c93cf18       1284755224     755224
 *  1        41397eea       1094287082     287082
 *  2         82fef30        137359152     359152
 *  3        66ef7655       1726969429     969429
 *  4        61c5938a       1640338314     338314
 *  5        33c083d4        868254676     254676
 *  6        7256c032       1918287922     287922
 *  7         4e5b397         82162583     162583
 *  8        2823443f        673399871     399871
 *  9        2679dc69        645520489     520489
 *
 *
 * see https://datatracker.ietf.org/doc/html/rfc4226#appendix-D
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
      it(`Vector at ${i}`, async () => {
        let res = await neotp.hotp.verify(HOTP[i], key, i, opt);

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

    it("Should fail for window < 8", async () => {
      assert.ok(
        !(await neotp.hotp.verify(token, key, 0, { window: 7 })),
        "Should not pass for value of window < 8"
      );
    });

    it("Should pass for window >= 9", async () => {
      assert.ok(
        await neotp.hotp.verify(token, key, 0, { window: 9 }),
        "Should pass for value of window >= 9"
      );
    });

    it("Should pass for negative counter values", async () => {
      token = "755224";

      assert.ok(
        await neotp.hotp.verify(token, key, -7, { window: 8 }),
        "Should pass for negative counter values"
      );
    });
  });

  describe("Gen", () => {
    let key = "12345678901234567890";

    for (let i = 0; i < HOTP.length; i++) {
      it(`Vector at ${i}`, async () => {
        assert.equal(
          await neotp.hotp.gen(key, i),
          HOTP[i],
          "HOTP value should be correct"
        );
      });
    }
  });
});

/*
 * Test TOTtoken using test vectors from rfc6238.
 *
 * +-------------+--------------+------------------+----------+--------+
 * |  Time (sec) |   UTC Time   | Value of T (hex) |   TOTP   |  Mode  |
 * +-------------+--------------+------------------+----------+--------+
 * |      59     |  1970-01-01  | 0000000000000001 | 94287082 |  SHA1  |
 * |             |   00:00:59   |                  |          |        |
 * |      59     |  1970-01-01  | 0000000000000001 | 46119246 | SHA256 |
 * |             |   00:00:59   |                  |          |        |
 * |      59     |  1970-01-01  | 0000000000000001 | 90693936 | SHA512 |
 * |             |   00:00:59   |                  |          |        |
 * |  1111111109 |  2005-03-18  | 00000000023523EC | 07081804 |  SHA1  |
 * |             |   01:58:29   |                  |          |        |
 * |  1111111109 |  2005-03-18  | 00000000023523EC | 68084774 | SHA256 |
 * |             |   01:58:29   |                  |          |        |
 * |  1111111109 |  2005-03-18  | 00000000023523EC | 25091201 | SHA512 |
 * |             |   01:58:29   |                  |          |        |
 * |  1111111111 |  2005-03-18  | 00000000023523ED | 14050471 |  SHA1  |
 * |             |   01:58:31   |                  |          |        |
 * |  1111111111 |  2005-03-18  | 00000000023523ED | 67062674 | SHA256 |
 * |             |   01:58:31   |                  |          |        |
 * |  1111111111 |  2005-03-18  | 00000000023523ED | 99943326 | SHA512 |
 * |             |   01:58:31   |                  |          |        |
 * |  1234567890 |  2009-02-13  | 000000000273EF07 | 89005924 |  SHA1  |
 * |             |   23:31:30   |                  |          |        |
 * |  1234567890 |  2009-02-13  | 000000000273EF07 | 91819424 | SHA256 |
 * |             |   23:31:30   |                  |          |        |
 * |  1234567890 |  2009-02-13  | 000000000273EF07 | 93441116 | SHA512 |
 * |             |   23:31:30   |                  |          |        |
 * |  2000000000 |  2033-05-18  | 0000000003F940AA | 69279037 |  SHA1  |
 * |             |   03:33:20   |                  |          |        |
 * |  2000000000 |  2033-05-18  | 0000000003F940AA | 90698825 | SHA256 |
 * |             |   03:33:20   |                  |          |        |
 * |  2000000000 |  2033-05-18  | 0000000003F940AA | 38618901 | SHA512 |
 * |             |   03:33:20   |                  |          |        |
 * | 20000000000 |  2603-10-11  | 0000000027BC86AA | 65353130 |  SHA1  |
 * |             |   11:33:20   |                  |          |        |
 * | 20000000000 |  2603-10-11  | 0000000027BC86AA | 77737706 | SHA256 |
 * |             |   11:33:20   |                  |          |        |
 * | 20000000000 |  2603-10-11  | 0000000027BC86AA | 47863826 | SHA512 |
 * |             |   11:33:20   |                  |          |        |
 * +-------------+--------------+------------------+----------+--------+
 *
 * see https://datatracker.ietf.org/doc/html/rfc6238#appendix-B
 */
describe("TOTP", () => {
  let time = [59, 1111111109, 1111111111, 1234567890, 2000000000, 20000000000];
  let results = {
    sha1: ["287082", "081804", "050471", "005924", "279037", "353130"],
    sha256: ["119246", "084774", "062674", "819424", "698825", "737706"],
    sha512: ["693936", "091201", "943326", "441116", "618901", "863826"],
  };
  let key = "12345678901234567890";

  describe("Verify", () => {
    for (let i = 0; i < time.length; i++) {
      it(`Vector at ${time[i]}s (sha1)`, async () => {
        let token = results.sha1[i];
        let res = await neotp.totp.verify(token, key, {
          _t: time[i] * 1000,
          _hash: "SHA-1",
        });
        assert.ok(res, "Should pass");
      });

      // it(`Vector at ${time[i]}s (sha256)`, async () => {
      //   let token = results.sha256[i];
      //   let res = await neotp.totp.verify(token, key, {
      //     _t: time[i] * 1000,
      //     _hash: "SHA-256",
      //   });
      //   assert.ok(res, "Should pass");
      // });

      // it(`Vector at ${time[i]}s (sha512)`, async () => {
      //   let token = results.sha512[i];
      //   let res = await neotp.totp.verify(token, key, {
      //     _t: time[i] * 1000,
      //     _hash: "SHA-512",
      //   });
      //   assert.ok(res, "Should pass");
      // });
    }
  });

  describe("Gen", () => {
    for (let i = 0; i < time.length; i++) {
      it(`Vector at ${time[i]}s (sha1)`, async () => {
        let res = await neotp.totp.gen(key, {
          _t: time[i] * 1000,
          _hash: "SHA-1",
        });
        assert.equal(res, results.sha1[i], "Should be correct");
      });

      // it(`Vector at ${time[i]}s (sha256)`, async () => {
      //   let res = await neotp.totp.gen(key, {
      //     _t: time[i] * 1000,
      //     _hash: "SHA-256",
      //   });
      //   assert.equal(res, results.sha256[i], "Should be correct");
      // });

      // it(`Vector at ${time[i]}s (sha512)`, async () => {
      //   let res = await neotp.totp.gen(key, {
      //     _t: time[i] * 1000,
      //     _hash: "SHA-512",
      //   });
      //   assert.equal(res, results.sha512[i], "Should be correct");
      // });
    }
  });
});
