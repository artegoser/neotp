"use strict";

let base32 = require("base32.js");

function bytes2str(bytes) {
  return String.fromCharCode.apply(String, bytes);
}

function str2bytes(str) {
  let bytes = [];
  for (let i = 0; i < str.length; i++) {
    bytes.push(str.charCodeAt(i));
  }
  return bytes;
}

exports.encode = function (str) {
  return base32.encode(str2bytes(str));
};
exports.decode = function (str) {
  let buf = base32.decode(str);
  return bytes2str(buf);
};
