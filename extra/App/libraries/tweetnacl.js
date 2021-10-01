/*

Encryption using the library by dchest available at https://cdnjs.cloudflare.com/ajax/libs/tweetnacl/1.0.1/nacl.min.js

*/

!(function (r) {
  "use strict";
  function n(r, n) {
    return (r << n) | (r >>> (32 - n));
  }
  function e(r, n) {
    var e = 255 & r[n + 3];
    return (
      (e = (e << 8) | (255 & r[n + 2])),
      ((e = (e << 8) | (255 & r[n + 1])) << 8) | (255 & r[n + 0])
    );
  }
  function t(r, n) {
    var e = (r[n] << 24) | (r[n + 1] << 16) | (r[n + 2] << 8) | r[n + 3],
      t = (r[n + 4] << 24) | (r[n + 5] << 16) | (r[n + 6] << 8) | r[n + 7];
    return new sr(e, t);
  }
  function o(r, n, e) {
    var t;
    for (t = 0; t < 4; t++) (r[n + t] = 255 & e), (e >>>= 8);
  }
  function i(r, n, e) {
    (r[n] = (e.hi >> 24) & 255),
      (r[n + 1] = (e.hi >> 16) & 255),
      (r[n + 2] = (e.hi >> 8) & 255),
      (r[n + 3] = 255 & e.hi),
      (r[n + 4] = (e.lo >> 24) & 255),
      (r[n + 5] = (e.lo >> 16) & 255),
      (r[n + 6] = (e.lo >> 8) & 255),
      (r[n + 7] = 255 & e.lo);
  }
  function f(r, n, e, t, o) {
    var i,
      f = 0;
    for (i = 0; i < o; i++) f |= r[n + i] ^ e[t + i];
    return (1 & ((f - 1) >>> 8)) - 1;
  }
  function a(r, n, e, t) {
    return f(r, n, e, t, 16);
  }
  function u(r, n, e, t) {
    return f(r, n, e, t, 32);
  }
  function c(r, t, i, f, a) {
    var u,
      c,
      w,
      y = new Uint32Array(16),
      l = new Uint32Array(16),
      s = new Uint32Array(16),
      h = new Uint32Array(4);
    for (u = 0; u < 4; u++)
      (l[5 * u] = e(f, 4 * u)),
        (l[1 + u] = e(i, 4 * u)),
        (l[6 + u] = e(t, 4 * u)),
        (l[11 + u] = e(i, 16 + 4 * u));
    for (u = 0; u < 16; u++) s[u] = l[u];
    for (u = 0; u < 20; u++) {
      for (c = 0; c < 4; c++) {
        for (w = 0; w < 4; w++) h[w] = l[(5 * c + 4 * w) % 16];
        for (
          h[1] ^= n((h[0] + h[3]) | 0, 7),
            h[2] ^= n((h[1] + h[0]) | 0, 9),
            h[3] ^= n((h[2] + h[1]) | 0, 13),
            h[0] ^= n((h[3] + h[2]) | 0, 18),
            w = 0;
          w < 4;
          w++
        )
          y[4 * c + ((c + w) % 4)] = h[w];
      }
      for (w = 0; w < 16; w++) l[w] = y[w];
    }
    if (a) {
      for (u = 0; u < 16; u++) l[u] = (l[u] + s[u]) | 0;
      for (u = 0; u < 4; u++)
        (l[5 * u] = (l[5 * u] - e(f, 4 * u)) | 0),
          (l[6 + u] = (l[6 + u] - e(t, 4 * u)) | 0);
      for (u = 0; u < 4; u++) o(r, 4 * u, l[5 * u]), o(r, 16 + 4 * u, l[6 + u]);
    } else for (u = 0; u < 16; u++) o(r, 4 * u, (l[u] + s[u]) | 0);
  }
  function w(r, n, e, t) {
    return c(r, n, e, t, !1), 0;
  }
  function y(r, n, e, t) {
    return c(r, n, e, t, !0), 0;
  }
  function l(r, n, e, t, o, i, f) {
    var a,
      u,
      c = new Uint8Array(16),
      y = new Uint8Array(64);
    if (!o) return 0;
    for (u = 0; u < 16; u++) c[u] = 0;
    for (u = 0; u < 8; u++) c[u] = i[u];
    for (; o >= 64; ) {
      for (w(y, c, f, Br), u = 0; u < 64; u++)
        r[n + u] = (e ? e[t + u] : 0) ^ y[u];
      for (a = 1, u = 8; u < 16; u++)
        (a = (a + (255 & c[u])) | 0), (c[u] = 255 & a), (a >>>= 8);
      (o -= 64), (n += 64), e && (t += 64);
    }
    if (o > 0)
      for (w(y, c, f, Br), u = 0; u < o; u++)
        r[n + u] = (e ? e[t + u] : 0) ^ y[u];
    return 0;
  }
  function s(r, n, e, t, o) {
    return l(r, n, null, 0, e, t, o);
  }
  function h(r, n, e, t, o) {
    var i = new Uint8Array(32);
    return y(i, t, o, Br), s(r, n, e, t.subarray(16), i);
  }
  function v(r, n, e, t, o, i, f) {
    var a = new Uint8Array(32);
    return y(a, i, f, Br), l(r, n, e, t, o, i.subarray(16), a);
  }
  function g(r, n) {
    var e,
      t = 0;
    for (e = 0; e < 17; e++)
      (t = (t + ((r[e] + n[e]) | 0)) | 0), (r[e] = 255 & t), (t >>>= 8);
  }
  function b(r, n, e, t, o, i) {
    var f,
      a,
      u,
      c,
      w = new Uint32Array(17),
      y = new Uint32Array(17),
      l = new Uint32Array(17),
      s = new Uint32Array(17),
      h = new Uint32Array(17);
    for (u = 0; u < 17; u++) y[u] = l[u] = 0;
    for (u = 0; u < 16; u++) y[u] = i[u];
    for (
      y[3] &= 15,
        y[4] &= 252,
        y[7] &= 15,
        y[8] &= 252,
        y[11] &= 15,
        y[12] &= 252,
        y[15] &= 15;
      o > 0;

    ) {
      for (u = 0; u < 17; u++) s[u] = 0;
      for (u = 0; u < 16 && u < o; ++u) s[u] = e[t + u];
      for (s[u] = 1, t += u, o -= u, g(l, s), a = 0; a < 17; a++)
        for (w[a] = 0, u = 0; u < 17; u++)
          w[a] =
            0 | (w[a] + l[u] * (u <= a ? y[a - u] : (320 * y[a + 17 - u]) | 0));
      for (a = 0; a < 17; a++) l[a] = w[a];
      for (c = 0, u = 0; u < 16; u++)
        (c = (c + l[u]) | 0), (l[u] = 255 & c), (c >>>= 8);
      for (
        c = (c + l[16]) | 0, l[16] = 3 & c, c = (5 * (c >>> 2)) | 0, u = 0;
        u < 16;
        u++
      )
        (c = (c + l[u]) | 0), (l[u] = 255 & c), (c >>>= 8);
      (c = (c + l[16]) | 0), (l[16] = c);
    }
    for (u = 0; u < 17; u++) h[u] = l[u];
    for (g(l, Sr), f = 0 | -(l[16] >>> 7), u = 0; u < 17; u++)
      l[u] ^= f & (h[u] ^ l[u]);
    for (u = 0; u < 16; u++) s[u] = i[u + 16];
    for (s[16] = 0, g(l, s), u = 0; u < 16; u++) r[n + u] = l[u];
    return 0;
  }
  function p(r, n, e, t, o, i) {
    var f = new Uint8Array(16);
    return b(f, 0, e, t, o, i), a(r, n, f, 0);
  }
  function _(r, n, e, t, o) {
    var i;
    if (e < 32) return -1;
    for (v(r, 0, n, 0, e, t, o), b(r, 16, r, 32, e - 32, r), i = 0; i < 16; i++)
      r[i] = 0;
    return 0;
  }
  function A(r, n, e, t, o) {
    var i,
      f = new Uint8Array(32);
    if (e < 32) return -1;
    if ((h(f, 0, 32, t, o), 0 !== p(n, 16, n, 32, e - 32, f))) return -1;
    for (v(r, 0, n, 0, e, t, o), i = 0; i < 32; i++) r[i] = 0;
    return 0;
  }
  function U(r, n) {
    var e;
    for (e = 0; e < 16; e++) r[e] = 0 | n[e];
  }
  function E(r) {
    var n, e;
    for (e = 0; e < 16; e++)
      (r[e] += 65536),
        (n = Math.floor(r[e] / 65536)),
        (r[(e + 1) * (e < 15 ? 1 : 0)] +=
          n - 1 + 37 * (n - 1) * (15 === e ? 1 : 0)),
        (r[e] -= 65536 * n);
  }
  function x(r, n, e) {
    for (var t, o = ~(e - 1), i = 0; i < 16; i++)
      (t = o & (r[i] ^ n[i])), (r[i] ^= t), (n[i] ^= t);
  }
  function d(r, n) {
    var e,
      t,
      o,
      i = hr(),
      f = hr();
    for (e = 0; e < 16; e++) f[e] = n[e];
    for (E(f), E(f), E(f), t = 0; t < 2; t++) {
      for (i[0] = f[0] - 65517, e = 1; e < 15; e++)
        (i[e] = f[e] - 65535 - ((i[e - 1] >> 16) & 1)), (i[e - 1] &= 65535);
      (i[15] = f[15] - 32767 - ((i[14] >> 16) & 1)),
        (o = (i[15] >> 16) & 1),
        (i[14] &= 65535),
        x(f, i, 1 - o);
    }
    for (e = 0; e < 16; e++)
      (r[2 * e] = 255 & f[e]), (r[2 * e + 1] = f[e] >> 8);
  }
  function m(r, n) {
    var e = new Uint8Array(32),
      t = new Uint8Array(32);
    return d(e, r), d(t, n), u(e, 0, t, 0);
  }
  function B(r) {
    var n = new Uint8Array(32);
    return d(n, r), 1 & n[0];
  }
  function S(r, n) {
    var e;
    for (e = 0; e < 16; e++) r[e] = n[2 * e] + (n[2 * e + 1] << 8);
    r[15] &= 32767;
  }
  function K(r, n, e) {
    var t;
    for (t = 0; t < 16; t++) r[t] = (n[t] + e[t]) | 0;
  }
  function Y(r, n, e) {
    var t;
    for (t = 0; t < 16; t++) r[t] = (n[t] - e[t]) | 0;
  }
  function T(r, n, e) {
    var t,
      o,
      i = new Float64Array(31);
    for (t = 0; t < 31; t++) i[t] = 0;
    for (t = 0; t < 16; t++) for (o = 0; o < 16; o++) i[t + o] += n[t] * e[o];
    for (t = 0; t < 15; t++) i[t] += 38 * i[t + 16];
    for (t = 0; t < 16; t++) r[t] = i[t];
    E(r), E(r);
  }
  function L(r, n) {
    T(r, n, n);
  }
  function k(r, n) {
    var e,
      t = hr();
    for (e = 0; e < 16; e++) t[e] = n[e];
    for (e = 253; e >= 0; e--) L(t, t), 2 !== e && 4 !== e && T(t, t, n);
    for (e = 0; e < 16; e++) r[e] = t[e];
  }
  function z(r, n) {
    var e,
      t = hr();
    for (e = 0; e < 16; e++) t[e] = n[e];
    for (e = 250; e >= 0; e--) L(t, t), 1 !== e && T(t, t, n);
    for (e = 0; e < 16; e++) r[e] = t[e];
  }
  function R(r, n, e) {
    var t,
      o,
      i = new Uint8Array(32),
      f = new Float64Array(80),
      a = hr(),
      u = hr(),
      c = hr(),
      w = hr(),
      y = hr(),
      l = hr();
    for (o = 0; o < 31; o++) i[o] = n[o];
    for (i[31] = (127 & n[31]) | 64, i[0] &= 248, S(f, e), o = 0; o < 16; o++)
      (u[o] = f[o]), (w[o] = a[o] = c[o] = 0);
    for (a[0] = w[0] = 1, o = 254; o >= 0; --o)
      (t = (i[o >>> 3] >>> (7 & o)) & 1),
        x(a, u, t),
        x(c, w, t),
        K(y, a, c),
        Y(a, a, c),
        K(c, u, w),
        Y(u, u, w),
        L(w, y),
        L(l, a),
        T(a, c, a),
        T(c, u, y),
        K(y, a, c),
        Y(a, a, c),
        L(u, a),
        Y(c, w, l),
        T(a, c, Ar),
        K(a, a, w),
        T(c, c, a),
        T(a, w, l),
        T(w, u, f),
        L(u, y),
        x(a, u, t),
        x(c, w, t);
    for (o = 0; o < 16; o++)
      (f[o + 16] = a[o]),
        (f[o + 32] = c[o]),
        (f[o + 48] = u[o]),
        (f[o + 64] = w[o]);
    var s = f.subarray(32),
      h = f.subarray(16);
    return k(s, s), T(h, h, s), d(r, h), 0;
  }
  function P(r, n) {
    return R(r, n, br);
  }
  function N(r, n) {
    return vr(n, 32), P(r, n);
  }
  function O(r, n, e) {
    var t = new Uint8Array(32);
    return R(t, e, n), y(r, gr, t, Br);
  }
  function C(r, n, e, t, o, i) {
    var f = new Uint8Array(32);
    return O(f, o, i), Kr(r, n, e, t, f);
  }
  function F(r, n, e, t, o, i) {
    var f = new Uint8Array(32);
    return O(f, o, i), Yr(r, n, e, t, f);
  }
  function M() {
    var r,
      n,
      e,
      t = 0,
      o = 0,
      i = 0,
      f = 0;
    for (e = 0; e < arguments.length; e++)
      (r = arguments[e].lo),
        (n = arguments[e].hi),
        (t += 65535 & r),
        (o += r >>> 16),
        (i += 65535 & n),
        (f += n >>> 16);
    return (
      (o += t >>> 16),
      (i += o >>> 16),
      (f += i >>> 16),
      new sr((65535 & i) | (f << 16), (65535 & t) | (o << 16))
    );
  }
  function G(r, n) {
    return new sr(r.hi >>> n, (r.lo >>> n) | (r.hi << (32 - n)));
  }
  function Z() {
    var r,
      n = 0,
      e = 0;
    for (r = 0; r < arguments.length; r++)
      (n ^= arguments[r].lo), (e ^= arguments[r].hi);
    return new sr(e, n);
  }
  function q(r, n) {
    var e,
      t,
      o = 32 - n;
    return (
      n < 32
        ? ((e = (r.hi >>> n) | (r.lo << o)), (t = (r.lo >>> n) | (r.hi << o)))
        : n < 64 &&
          ((e = (r.lo >>> n) | (r.hi << o)), (t = (r.hi >>> n) | (r.lo << o))),
      new sr(e, t)
    );
  }
  function I(r, n, e) {
    var t = (r.hi & n.hi) ^ (~r.hi & e.hi),
      o = (r.lo & n.lo) ^ (~r.lo & e.lo);
    return new sr(t, o);
  }
  function V(r, n, e) {
    var t = (r.hi & n.hi) ^ (r.hi & e.hi) ^ (n.hi & e.hi),
      o = (r.lo & n.lo) ^ (r.lo & e.lo) ^ (n.lo & e.lo);
    return new sr(t, o);
  }
  function X(r) {
    return Z(q(r, 28), q(r, 34), q(r, 39));
  }
  function D(r) {
    return Z(q(r, 14), q(r, 18), q(r, 41));
  }
  function j(r) {
    return Z(q(r, 1), q(r, 8), G(r, 7));
  }
  function H(r) {
    return Z(q(r, 19), q(r, 61), G(r, 6));
  }
  function J(r, n, e) {
    var o,
      f,
      a,
      u = [],
      c = [],
      w = [],
      y = [];
    for (f = 0; f < 8; f++) u[f] = w[f] = t(r, 8 * f);
    for (var l = 0; e >= 128; ) {
      for (f = 0; f < 16; f++) y[f] = t(n, 8 * f + l);
      for (f = 0; f < 80; f++) {
        for (a = 0; a < 8; a++) c[a] = w[a];
        for (
          o = M(w[7], D(w[4]), I(w[4], w[5], w[6]), Tr[f], y[f % 16]),
            c[7] = M(o, X(w[0]), V(w[0], w[1], w[2])),
            c[3] = M(c[3], o),
            a = 0;
          a < 8;
          a++
        )
          w[(a + 1) % 8] = c[a];
        if (f % 16 == 15)
          for (a = 0; a < 16; a++)
            y[a] = M(
              y[a],
              y[(a + 9) % 16],
              j(y[(a + 1) % 16]),
              H(y[(a + 14) % 16])
            );
      }
      for (f = 0; f < 8; f++) (w[f] = M(w[f], u[f])), (u[f] = w[f]);
      (l += 128), (e -= 128);
    }
    for (f = 0; f < 8; f++) i(r, 8 * f, u[f]);
    return e;
  }
  function Q(r, n, e) {
    var t,
      o = new Uint8Array(64),
      f = new Uint8Array(256),
      a = e;
    for (t = 0; t < 64; t++) o[t] = Lr[t];
    for (J(o, n, e), e %= 128, t = 0; t < 256; t++) f[t] = 0;
    for (t = 0; t < e; t++) f[t] = n[a - e + t];
    for (
      f[e] = 128,
        e = 256 - 128 * (e < 112 ? 1 : 0),
        f[e - 9] = 0,
        i(f, e - 8, new sr((a / 536870912) | 0, a << 3)),
        J(o, f, e),
        t = 0;
      t < 64;
      t++
    )
      r[t] = o[t];
    return 0;
  }
  function W(r, n) {
    var e = hr(),
      t = hr(),
      o = hr(),
      i = hr(),
      f = hr(),
      a = hr(),
      u = hr(),
      c = hr(),
      w = hr();
    Y(e, r[1], r[0]),
      Y(w, n[1], n[0]),
      T(e, e, w),
      K(t, r[0], r[1]),
      K(w, n[0], n[1]),
      T(t, t, w),
      T(o, r[3], n[3]),
      T(o, o, Er),
      T(i, r[2], n[2]),
      K(i, i, i),
      Y(f, t, e),
      Y(a, i, o),
      K(u, i, o),
      K(c, t, e),
      T(r[0], f, a),
      T(r[1], c, u),
      T(r[2], u, a),
      T(r[3], f, c);
  }
  function $(r, n, e) {
    var t;
    for (t = 0; t < 4; t++) x(r[t], n[t], e);
  }
  function rr(r, n) {
    var e = hr(),
      t = hr(),
      o = hr();
    k(o, n[2]), T(e, n[0], o), T(t, n[1], o), d(r, t), (r[31] ^= B(e) << 7);
  }
  function nr(r, n, e) {
    var t, o;
    for (
      U(r[0], pr), U(r[1], _r), U(r[2], _r), U(r[3], pr), o = 255;
      o >= 0;
      --o
    )
      (t = (e[(o / 8) | 0] >> (7 & o)) & 1),
        $(r, n, t),
        W(n, r),
        W(r, r),
        $(r, n, t);
  }
  function er(r, n) {
    var e = [hr(), hr(), hr(), hr()];
    U(e[0], xr), U(e[1], dr), U(e[2], _r), T(e[3], xr, dr), nr(r, e, n);
  }
  function tr(r, n, e) {
    var t,
      o = new Uint8Array(64),
      i = [hr(), hr(), hr(), hr()];
    for (
      e || vr(n, 32),
        Q(o, n, 32),
        o[0] &= 248,
        o[31] &= 127,
        o[31] |= 64,
        er(i, o),
        rr(r, i),
        t = 0;
      t < 32;
      t++
    )
      n[t + 32] = r[t];
    return 0;
  }
  function or(r, n) {
    var e, t, o, i;
    for (t = 63; t >= 32; --t) {
      for (e = 0, o = t - 32, i = t - 12; o < i; ++o)
        (n[o] += e - 16 * n[t] * kr[o - (t - 32)]),
          (e = (n[o] + 128) >> 8),
          (n[o] -= 256 * e);
      (n[o] += e), (n[t] = 0);
    }
    for (e = 0, o = 0; o < 32; o++)
      (n[o] += e - (n[31] >> 4) * kr[o]), (e = n[o] >> 8), (n[o] &= 255);
    for (o = 0; o < 32; o++) n[o] -= e * kr[o];
    for (t = 0; t < 32; t++) (n[t + 1] += n[t] >> 8), (r[t] = 255 & n[t]);
  }
  function ir(r) {
    var n,
      e = new Float64Array(64);
    for (n = 0; n < 64; n++) e[n] = r[n];
    for (n = 0; n < 64; n++) r[n] = 0;
    or(r, e);
  }
  function fr(r, n, e, t) {
    var o,
      i,
      f = new Uint8Array(64),
      a = new Uint8Array(64),
      u = new Uint8Array(64),
      c = new Float64Array(64),
      w = [hr(), hr(), hr(), hr()];
    Q(f, t, 32), (f[0] &= 248), (f[31] &= 127), (f[31] |= 64);
    var y = e + 64;
    for (o = 0; o < e; o++) r[64 + o] = n[o];
    for (o = 0; o < 32; o++) r[32 + o] = f[32 + o];
    for (
      Q(u, r.subarray(32), e + 32), ir(u), er(w, u), rr(r, w), o = 32;
      o < 64;
      o++
    )
      r[o] = t[o];
    for (Q(a, r, e + 64), ir(a), o = 0; o < 64; o++) c[o] = 0;
    for (o = 0; o < 32; o++) c[o] = u[o];
    for (o = 0; o < 32; o++) for (i = 0; i < 32; i++) c[o + i] += a[o] * f[i];
    return or(r.subarray(32), c), y;
  }
  function ar(r, n) {
    var e = hr(),
      t = hr(),
      o = hr(),
      i = hr(),
      f = hr(),
      a = hr(),
      u = hr();
    return (
      U(r[2], _r),
      S(r[1], n),
      L(o, r[1]),
      T(i, o, Ur),
      Y(o, o, r[2]),
      K(i, r[2], i),
      L(f, i),
      L(a, f),
      T(u, a, f),
      T(e, u, o),
      T(e, e, i),
      z(e, e),
      T(e, e, o),
      T(e, e, i),
      T(e, e, i),
      T(r[0], e, i),
      L(t, r[0]),
      T(t, t, i),
      m(t, o) && T(r[0], r[0], mr),
      L(t, r[0]),
      T(t, t, i),
      m(t, o)
        ? -1
        : (B(r[0]) === n[31] >> 7 && Y(r[0], pr, r[0]), T(r[3], r[0], r[1]), 0)
    );
  }
  function ur(r, n, e, t) {
    var o,
      i = new Uint8Array(32),
      f = new Uint8Array(64),
      a = [hr(), hr(), hr(), hr()],
      c = [hr(), hr(), hr(), hr()];
    if ((-1, e < 64)) return -1;
    if (ar(c, t)) return -1;
    for (o = 0; o < e; o++) r[o] = n[o];
    for (o = 0; o < 32; o++) r[o + 32] = t[o];
    if (
      (Q(f, r, e),
      ir(f),
      nr(a, c, f),
      er(c, n.subarray(32)),
      W(a, c),
      rr(i, a),
      (e -= 64),
      u(n, 0, i, 0))
    ) {
      for (o = 0; o < e; o++) r[o] = 0;
      return -1;
    }
    for (o = 0; o < e; o++) r[o] = n[o + 64];
    return e;
  }
  function cr(r, n) {
    if (r.length !== zr) throw new Error("bad key size");
    if (n.length !== Rr) throw new Error("bad nonce size");
  }
  function wr(r, n) {
    if (r.length !== Pr) throw new Error("bad public key size");
    if (n.length !== Nr) throw new Error("bad secret key size");
  }
  function yr() {
    for (var r = 0; r < arguments.length; r++)
      if (!(arguments[r] instanceof Uint8Array))
        throw new TypeError("unexpected type, use Uint8Array");
  }
  function lr(r) {
    for (var n = 0; n < r.length; n++) r[n] = 0;
  }
  var sr = function (r, n) {
      (this.hi = 0 | r), (this.lo = 0 | n);
    },
    hr = function (r) {
      var n,
        e = new Float64Array(16);
      if (r) for (n = 0; n < r.length; n++) e[n] = r[n];
      return e;
    },
    vr = function () {
      throw new Error("no PRNG");
    },
    gr = new Uint8Array(16),
    br = new Uint8Array(32);
  br[0] = 9;
  var pr = hr(),
    _r = hr([1]),
    Ar = hr([56129, 1]),
    Ur = hr([
      30883, 4953, 19914, 30187, 55467, 16705, 2637, 112, 59544, 30585, 16505,
      36039, 65139, 11119, 27886, 20995,
    ]),
    Er = hr([
      61785, 9906, 39828, 60374, 45398, 33411, 5274, 224, 53552, 61171, 33010,
      6542, 64743, 22239, 55772, 9222,
    ]),
    xr = hr([
      54554, 36645, 11616, 51542, 42930, 38181, 51040, 26924, 56412, 64982,
      57905, 49316, 21502, 52590, 14035, 8553,
    ]),
    dr = hr([
      26200, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214, 26214,
      26214, 26214, 26214, 26214, 26214, 26214,
    ]),
    mr = hr([
      41136, 18958, 6951, 50414, 58488, 44335, 6150, 12099, 55207, 15867, 153,
      11085, 57099, 20417, 9344, 11139,
    ]),
    Br = new Uint8Array([
      101, 120, 112, 97, 110, 100, 32, 51, 50, 45, 98, 121, 116, 101, 32, 107,
    ]),
    Sr = new Uint32Array([5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 252]),
    Kr = _,
    Yr = A,
    Tr = [
      new sr(1116352408, 3609767458),
      new sr(1899447441, 602891725),
      new sr(3049323471, 3964484399),
      new sr(3921009573, 2173295548),
      new sr(961987163, 4081628472),
      new sr(1508970993, 3053834265),
      new sr(2453635748, 2937671579),
      new sr(2870763221, 3664609560),
      new sr(3624381080, 2734883394),
      new sr(310598401, 1164996542),
      new sr(607225278, 1323610764),
      new sr(1426881987, 3590304994),
      new sr(1925078388, 4068182383),
      new sr(2162078206, 991336113),
      new sr(2614888103, 633803317),
      new sr(3248222580, 3479774868),
      new sr(3835390401, 2666613458),
      new sr(4022224774, 944711139),
      new sr(264347078, 2341262773),
      new sr(604807628, 2007800933),
      new sr(770255983, 1495990901),
      new sr(1249150122, 1856431235),
      new sr(1555081692, 3175218132),
      new sr(1996064986, 2198950837),
      new sr(2554220882, 3999719339),
      new sr(2821834349, 766784016),
      new sr(2952996808, 2566594879),
      new sr(3210313671, 3203337956),
      new sr(3336571891, 1034457026),
      new sr(3584528711, 2466948901),
      new sr(113926993, 3758326383),
      new sr(338241895, 168717936),
      new sr(666307205, 1188179964),
      new sr(773529912, 1546045734),
      new sr(1294757372, 1522805485),
      new sr(1396182291, 2643833823),
      new sr(1695183700, 2343527390),
      new sr(1986661051, 1014477480),
      new sr(2177026350, 1206759142),
      new sr(2456956037, 344077627),
      new sr(2730485921, 1290863460),
      new sr(2820302411, 3158454273),
      new sr(3259730800, 3505952657),
      new sr(3345764771, 106217008),
      new sr(3516065817, 3606008344),
      new sr(3600352804, 1432725776),
      new sr(4094571909, 1467031594),
      new sr(275423344, 851169720),
      new sr(430227734, 3100823752),
      new sr(506948616, 1363258195),
      new sr(659060556, 3750685593),
      new sr(883997877, 3785050280),
      new sr(958139571, 3318307427),
      new sr(1322822218, 3812723403),
      new sr(1537002063, 2003034995),
      new sr(1747873779, 3602036899),
      new sr(1955562222, 1575990012),
      new sr(2024104815, 1125592928),
      new sr(2227730452, 2716904306),
      new sr(2361852424, 442776044),
      new sr(2428436474, 593698344),
      new sr(2756734187, 3733110249),
      new sr(3204031479, 2999351573),
      new sr(3329325298, 3815920427),
      new sr(3391569614, 3928383900),
      new sr(3515267271, 566280711),
      new sr(3940187606, 3454069534),
      new sr(4118630271, 4000239992),
      new sr(116418474, 1914138554),
      new sr(174292421, 2731055270),
      new sr(289380356, 3203993006),
      new sr(460393269, 320620315),
      new sr(685471733, 587496836),
      new sr(852142971, 1086792851),
      new sr(1017036298, 365543100),
      new sr(1126000580, 2618297676),
      new sr(1288033470, 3409855158),
      new sr(1501505948, 4234509866),
      new sr(1607167915, 987167468),
      new sr(1816402316, 1246189591),
    ],
    Lr = new Uint8Array([
      106, 9, 230, 103, 243, 188, 201, 8, 187, 103, 174, 133, 132, 202, 167, 59,
      60, 110, 243, 114, 254, 148, 248, 43, 165, 79, 245, 58, 95, 29, 54, 241,
      81, 14, 82, 127, 173, 230, 130, 209, 155, 5, 104, 140, 43, 62, 108, 31,
      31, 131, 217, 171, 251, 65, 189, 107, 91, 224, 205, 25, 19, 126, 33, 121,
    ]),
    kr = new Float64Array([
      237, 211, 245, 92, 26, 99, 18, 88, 214, 156, 247, 162, 222, 249, 222, 20,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 16,
    ]),
    zr = 32,
    Rr = 24,
    Pr = 32,
    Nr = 32,
    Or = Rr;
  (r.lowlevel = {
    crypto_core_hsalsa20: y,
    crypto_stream_xor: v,
    crypto_stream: h,
    crypto_stream_salsa20_xor: l,
    crypto_stream_salsa20: s,
    crypto_onetimeauth: b,
    crypto_onetimeauth_verify: p,
    crypto_verify_16: a,
    crypto_verify_32: u,
    crypto_secretbox: _,
    crypto_secretbox_open: A,
    crypto_scalarmult: R,
    crypto_scalarmult_base: P,
    crypto_box_beforenm: O,
    crypto_box_afternm: Kr,
    crypto_box: C,
    crypto_box_open: F,
    crypto_box_keypair: N,
    crypto_hash: Q,
    crypto_sign: fr,
    crypto_sign_keypair: tr,
    crypto_sign_open: ur,
    crypto_secretbox_KEYBYTES: zr,
    crypto_secretbox_NONCEBYTES: Rr,
    crypto_secretbox_ZEROBYTES: 32,
    crypto_secretbox_BOXZEROBYTES: 16,
    crypto_scalarmult_BYTES: 32,
    crypto_scalarmult_SCALARBYTES: 32,
    crypto_box_PUBLICKEYBYTES: Pr,
    crypto_box_SECRETKEYBYTES: Nr,
    crypto_box_BEFORENMBYTES: 32,
    crypto_box_NONCEBYTES: Or,
    crypto_box_ZEROBYTES: 32,
    crypto_box_BOXZEROBYTES: 16,
    crypto_sign_BYTES: 64,
    crypto_sign_PUBLICKEYBYTES: 32,
    crypto_sign_SECRETKEYBYTES: 64,
    crypto_sign_SEEDBYTES: 32,
    crypto_hash_BYTES: 64,
  }),
    (r.randomBytes = function (r) {
      var n = new Uint8Array(r);
      return vr(n, r), n;
    }),
    (r.secretbox = function (r, n, e) {
      yr(r, n, e), cr(e, n);
      for (
        var t = new Uint8Array(32 + r.length),
          o = new Uint8Array(t.length),
          i = 0;
        i < r.length;
        i++
      )
        t[i + 32] = r[i];
      return _(o, t, t.length, n, e), o.subarray(16);
    }),
    (r.secretbox.open = function (r, n, e) {
      yr(r, n, e), cr(e, n);
      for (
        var t = new Uint8Array(16 + r.length),
          o = new Uint8Array(t.length),
          i = 0;
        i < r.length;
        i++
      )
        t[i + 16] = r[i];
      return t.length < 32
        ? null
        : 0 !== A(o, t, t.length, n, e)
        ? null
        : o.subarray(32);
    }),
    (r.secretbox.keyLength = zr),
    (r.secretbox.nonceLength = Rr),
    (r.secretbox.overheadLength = 16),
    (r.scalarMult = function (r, n) {
      if ((yr(r, n), 32 !== r.length)) throw new Error("bad n size");
      if (32 !== n.length) throw new Error("bad p size");
      var e = new Uint8Array(32);
      return R(e, r, n), e;
    }),
    (r.scalarMult.base = function (r) {
      if ((yr(r), 32 !== r.length)) throw new Error("bad n size");
      var n = new Uint8Array(32);
      return P(n, r), n;
    }),
    (r.scalarMult.scalarLength = 32),
    (r.scalarMult.groupElementLength = 32),
    (r.box = function (n, e, t, o) {
      var i = r.box.before(t, o);
      return r.secretbox(n, e, i);
    }),
    (r.box.before = function (r, n) {
      yr(r, n), wr(r, n);
      var e = new Uint8Array(32);
      return O(e, r, n), e;
    }),
    (r.box.after = r.secretbox),
    (r.box.open = function (n, e, t, o) {
      var i = r.box.before(t, o);
      return r.secretbox.open(n, e, i);
    }),
    (r.box.open.after = r.secretbox.open),
    (r.box.keyPair = function () {
      var r = new Uint8Array(Pr),
        n = new Uint8Array(Nr);
      return N(r, n), { publicKey: r, secretKey: n };
    }),
    (r.box.keyPair.fromSecretKey = function (r) {
      if ((yr(r), r.length !== Nr)) throw new Error("bad secret key size");
      var n = new Uint8Array(Pr);
      return P(n, r), { publicKey: n, secretKey: new Uint8Array(r) };
    }),
    (r.box.publicKeyLength = Pr),
    (r.box.secretKeyLength = Nr),
    (r.box.sharedKeyLength = 32),
    (r.box.nonceLength = Or),
    (r.box.overheadLength = r.secretbox.overheadLength),
    (r.sign = function (r, n) {
      if ((yr(r, n), 64 !== n.length)) throw new Error("bad secret key size");
      var e = new Uint8Array(64 + r.length);
      return fr(e, r, r.length, n), e;
    }),
    (r.sign.open = function (r, n) {
      if ((yr(r, n), 32 !== n.length)) throw new Error("bad public key size");
      var e = new Uint8Array(r.length),
        t = ur(e, r, r.length, n);
      if (t < 0) return null;
      for (var o = new Uint8Array(t), i = 0; i < o.length; i++) o[i] = e[i];
      return o;
    }),
    (r.sign.detached = function (n, e) {
      for (
        var t = r.sign(n, e), o = new Uint8Array(64), i = 0;
        i < o.length;
        i++
      )
        o[i] = t[i];
      return o;
    }),
    (r.sign.detached.verify = function (r, n, e) {
      if ((yr(r, n, e), 64 !== n.length)) throw new Error("bad signature size");
      if (32 !== e.length) throw new Error("bad public key size");
      var t,
        o = new Uint8Array(64 + r.length),
        i = new Uint8Array(64 + r.length);
      for (t = 0; t < 64; t++) o[t] = n[t];
      for (t = 0; t < r.length; t++) o[t + 64] = r[t];
      return ur(i, o, o.length, e) >= 0;
    }),
    (r.sign.keyPair = function () {
      var r = new Uint8Array(32),
        n = new Uint8Array(64);
      return tr(r, n), { publicKey: r, secretKey: n };
    }),
    (r.sign.keyPair.fromSecretKey = function (r) {
      if ((yr(r), 64 !== r.length)) throw new Error("bad secret key size");
      for (var n = new Uint8Array(32), e = 0; e < n.length; e++)
        n[e] = r[32 + e];
      return { publicKey: n, secretKey: new Uint8Array(r) };
    }),
    (r.sign.keyPair.fromSeed = function (r) {
      if ((yr(r), 32 !== r.length)) throw new Error("bad seed size");
      for (
        var n = new Uint8Array(32), e = new Uint8Array(64), t = 0;
        t < 32;
        t++
      )
        e[t] = r[t];
      return tr(n, e, !0), { publicKey: n, secretKey: e };
    }),
    (r.sign.publicKeyLength = 32),
    (r.sign.secretKeyLength = 64),
    (r.sign.seedLength = 32),
    (r.sign.signatureLength = 64),
    (r.hash = function (r) {
      yr(r);
      var n = new Uint8Array(64);
      return Q(n, r, r.length), n;
    }),
    (r.hash.hashLength = 64),
    (r.verify = function (r, n) {
      return (
        yr(r, n),
        0 !== r.length &&
          0 !== n.length &&
          r.length === n.length &&
          0 === f(r, 0, n, 0, r.length)
      );
    }),
    (r.setPRNG = function (r) {
      vr = r;
    }),
    (function () {
      var n = "undefined" != typeof self ? self.crypto || self.msCrypto : null;
      if (n && n.getRandomValues) {
        r.setPRNG(function (r, e) {
          var t,
            o = new Uint8Array(e);
          for (t = 0; t < e; t += 65536)
            n.getRandomValues(o.subarray(t, t + Math.min(e - t, 65536)));
          for (t = 0; t < e; t++) r[t] = o[t];
          lr(o);
        });
      } else
        "undefined" != typeof require &&
          (n = require("crypto")) &&
          n.randomBytes &&
          r.setPRNG(function (r, e) {
            var t,
              o = n.randomBytes(e);
            for (t = 0; t < e; t++) r[t] = o[t];
            lr(o);
          });
    })();
})(
  "undefined" != typeof module && module.exports
    ? module.exports
    : (self.nacl = self.nacl || {})
);
