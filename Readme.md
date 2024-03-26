# New One Time Password library

## TODO

- [ ] Use native crypto module
- [x] Rewrite to esm + typescript
- [ ] Add support for sha256, 512

## Installation

```bash
npm install neotp
```

## Usage

```typescript
import { totp } from "neotp";

let key = "secret key for user... could be stored in DB";

// Generate TOTP
let token = totp.gen(key);

// Check TOTP is correct
let login = totp.verify(token, key);

// invalid token if login is null
if (!login) {
  return console.log("Token invalid");
}

// valid token
console.log("Token valid, sync value is %s", login.delta);
```

### Google Authenticator

[Google authenticator](https://github.com/google/google-authenticator/) requires that keys be base32 encoded before being used. This includes manual entry into the app as well as preparing a QR code URI.

```javascript
let base32 = require("neotp/base32");

let key = "secret key for the user";

// encoded will be the secret key, base32 encoded
let encoded = base32.encode(key);

// Google authenticator doesn't like equal signs
let encodedForGoogle = encoded.toString().replace(/=/g, "");

// to create a URI for a qr code (change totp to hotp if using hotp)
let uri = "otpauth://totp/somelabel?secret=" + encodedForGoogle;
```

Note: If your label has spaces or other invalid uri characters you will need to encode it accordingly using `encodeURIComponent` More details about the uri key format can be found on the [google auth wiki](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)

## Credits

> This is a Renewed fork of [botp](https://github.com/d-band/botp) that is fork of [notp](https://github.com/guyht/notp) for support browser.
