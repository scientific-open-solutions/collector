/*

This code is taken from: https://cdn.jsdelivr.net/npm/tweetnacl-util@0.15.0/nacl-util.min.js

*/

!(function (e, n) {
  "use strict";
  "undefined" != typeof module && module.exports
    ? (module.exports = n())
    : e.nacl
    ? (e.nacl.util = n())
    : ((e.nacl = {}), (e.nacl.util = n()));
})(this, function () {
  "use strict";
  function e(e) {
    if (
      !/^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/.test(
        e
      )
    )
      throw new TypeError("invalid encoding");
  }
  var n = {};
  return (
    (n.decodeUTF8 = function (e) {
      if ("string" != typeof e) throw new TypeError("expected string");
      var n,
        r = unescape(encodeURIComponent(e)),
        t = new Uint8Array(r.length);
      for (n = 0; n < r.length; n++) t[n] = r.charCodeAt(n);
      return t;
    }),
    (n.encodeUTF8 = function (e) {
      var n,
        r = [];
      for (n = 0; n < e.length; n++) r.push(String.fromCharCode(e[n]));
      return decodeURIComponent(escape(r.join("")));
    }),
    "undefined" == typeof atob
      ? "undefined" != typeof Buffer.from
        ? ((n.encodeBase64 = function (e) {
            return Buffer.from(e).toString("base64");
          }),
          (n.decodeBase64 = function (n) {
            return (
              e(n),
              new Uint8Array(
                Array.prototype.slice.call(Buffer.from(n, "base64"), 0)
              )
            );
          }))
        : ((n.encodeBase64 = function (e) {
            return new Buffer(e).toString("base64");
          }),
          (n.decodeBase64 = function (n) {
            return (
              e(n),
              new Uint8Array(
                Array.prototype.slice.call(new Buffer(n, "base64"), 0)
              )
            );
          }))
      : ((n.encodeBase64 = function (e) {
          var n,
            r = [],
            t = e.length;
          for (n = 0; n < t; n++) r.push(String.fromCharCode(e[n]));
          return btoa(r.join(""));
        }),
        (n.decodeBase64 = function (n) {
          e(n);
          var r,
            t = atob(n),
            o = new Uint8Array(t.length);
          for (r = 0; r < t.length; r++) o[r] = t.charCodeAt(r);
          return o;
        })),
    n
  );
});
