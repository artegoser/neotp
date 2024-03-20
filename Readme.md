# New One Time Password library

## TODO

- [ ] Use native crypto module
- [ ] Rewrite to esm + typescript
- [ ] Add support for sha256, 512

## Installation

```bash
npm install neotp
```

## Usage

```javascript
let neotp = require("neotp");

//.... some initial login code, that receives the user details and TOTP / HOTP token

let key = "secret key for user... could be stored in DB";
let token = "user supplied one time use token";

// Check TOTP is correct (HOTP if hotp pass type)
let login = neotp.totp.verify(token, key);

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

## API

### hotp.verify(token, key, opt)

Check a counter based one time password for validity.

Returns null if token is not valid for given key and options.

Returns an object `{delta: #}` if the token is valid. `delta` is the count skew between client and server.

#### opt (hotp.verify)

**window**

> The allowable margin for the counter. The function will check `window` codes in the future against the provided token.
> i.e. if `window = 100` and `counter = 5` all tokens between 5 and 105 will be checked against the supplied token
> Default - 50

**counter**

> Counter value. This should be stored by the application on a per user basis. It is up to the application to track and increment this value as needed. It is also up to the application to increment this value if there is a skew between the client and server (`delta`)

### totp.verify(token, key, opt)

Check a time based one time password for validity

Returns null if token is not valid for given key and options.

Returns an object `{delta: #}` if the token is valid. `delta` is the count skew between client and server.

#### opt (totp.verify)

##### window (totp.verify)

> The allowable margin for the counter. The function will check `window` codes in the future against the provided token.
> i.e. if `window = 5` and `counter = 1000` all tokens between 995 and 1005 will be checked against the supplied token
> Default - 6

##### time (totp.verify)

> The time step of the counter. This must be the same for every request and is used to calculate C.
> Default - 30

### hotp.gen(key, opt)

Return a counter based one time password

#### opt (hotp.gen)

##### counter (hotp.gen)

> Counter value. This should be stored by the application, must be user specific, and be incremented for each request.

### totp.gen(key, opt)

Return a time based one time password

#### opt (totp.gen)

##### time (totp.gen)

> The time step of the counter. This must be the same for every request and is used to calculate C.
> Default - 30

## Credits

> This is a Renewed fork of [botp](https://github.com/d-band/botp) that is fork of [notp](https://github.com/guyht/notp) for support browser.
