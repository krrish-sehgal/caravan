// ../../node_modules/esbuild-plugin-polyfill-node/polyfills/buffer.js
import { Buffer } from "buffer";

// src/addresses.ts
import {
  validate as bitcoinAddressValidation,
  Network as ValidationNetwork
} from "bitcoin-address-validation";

// src/networks.ts
import { networks } from "bitcoinjs-lib-v5";
var Network = /* @__PURE__ */ ((Network2) => {
  Network2["MAINNET"] = "mainnet";
  Network2["TESTNET"] = "testnet";
  Network2["REGTEST"] = "regtest";
  Network2["SIGNET"] = "signet";
  return Network2;
})(Network || {});
function networkData(network) {
  switch (network) {
    case "mainnet" /* MAINNET */:
      return networks.bitcoin;
    case "testnet" /* TESTNET */:
      return networks.testnet;
    case "regtest" /* REGTEST */:
      return networks.regtest;
    case "signet" /* SIGNET */:
      throw new Error("Signet is not supported yet");
    default:
      return networks.testnet;
  }
}
function networkLabel(network) {
  switch (network) {
    case "mainnet" /* MAINNET */:
      return "Mainnet";
    case "testnet" /* TESTNET */:
      return "Testnet";
    default:
      return "Testnet";
  }
}
function getNetworkFromPrefix(prefix) {
  switch (prefix.toLowerCase()) {
    case "xpub":
    case "ypub":
    case "zpub":
      return "mainnet" /* MAINNET */;
    case "tpub":
    case "upub":
    case "vpub":
      return "testnet" /* TESTNET */;
    default:
      throw new Error(`Unrecognized extended public key prefix ${prefix}`);
  }
}

// src/addresses.ts
var MAINNET_ADDRESS_MAGIC_BYTE_PATTERN = "^(bc1|[13])";
var TESTNET_ADDRESS_MAGIC_BYTE_PATTERN = "^(tb1|bcrt1|[mn2])";
var REGTEST_ADDRESS_MAGIC_BYTE_PATTERN = "^(bcrt1|[mn2])";
var ADDRESS_BODY_PATTERN = "[A-HJ-NP-Za-km-z1-9]+$";
var BECH32_ADDRESS_MAGIC_BYTE_REGEX = /^(tb|bc)/;
var BECH32_ADDRESS_BODY_PATTERN = "[ac-hj-np-z02-9]+$";
function validateAddress(address, network) {
  if (!address || address.trim() === "") {
    return "Address cannot be blank.";
  }
  const magic_byte_regex = network === "testnet" /* TESTNET */ ? TESTNET_ADDRESS_MAGIC_BYTE_PATTERN : network === "regtest" /* REGTEST */ ? REGTEST_ADDRESS_MAGIC_BYTE_PATTERN : MAINNET_ADDRESS_MAGIC_BYTE_PATTERN;
  const isBech32 = address.match(BECH32_ADDRESS_MAGIC_BYTE_REGEX);
  const address_body_regex = isBech32 ? BECH32_ADDRESS_BODY_PATTERN : ADDRESS_BODY_PATTERN;
  const address_regex = magic_byte_regex + address_body_regex;
  if (!address.match(address_regex)) {
    if (network == "regtest" /* REGTEST */) {
      return "Address must start with one of 'bcrt1', 'm', 'n', or '2' followed by letters or digits.";
    } else if (network === "testnet" /* TESTNET */) {
      return "Address must start with one of 'tb1', 'm', 'n', or '2' followed by letters or digits.";
    } else {
      return "Address must start with either of 'bc1', '1' or '3' followed by letters or digits.";
    }
  }
  let valid = bitcoinAddressValidation(
    address,
    network
  );
  if (!valid && network === "regtest" /* REGTEST */) {
    valid = bitcoinAddressValidation(address, ValidationNetwork.testnet);
  }
  return valid ? "" : "Address is invalid.";
}
function getAddressType(address, network) {
  if (validateAddress(address, network) !== "") {
    return "UNKNOWN";
  }
  const bech32Regex = /^(bc1|tb1|bcrt1)/;
  const p2pkhRegex = /^(1|m|n)/;
  const p2shRegex = /^(3|2)/;
  if (address.match(bech32Regex)) {
    if (address.startsWith("bc1p") || address.startsWith("tb1p") || address.startsWith("bcrt1p")) {
      return "P2TR";
    }
    return "P2WSH";
  } else if (address.match(p2pkhRegex)) {
    return "P2PKH";
  } else if (address.match(p2shRegex)) {
    return "P2SH";
  }
  return "UNKNOWN";
}

// src/block_explorer.ts
var BASE_URL_MAINNET = "https://mempool.space";
var BASE_URL_TESTNET = "https://mempool.space/testnet";
function blockExplorerBaseURL(network) {
  return network === "testnet" /* TESTNET */ ? BASE_URL_TESTNET : BASE_URL_MAINNET;
}
function blockExplorerURL(path, network) {
  return `${blockExplorerBaseURL(network)}${path}`;
}
function blockExplorerAPIURL(path, network) {
  return `${blockExplorerBaseURL(network)}/api${path}`;
}
function blockExplorerTransactionURL(txid, network) {
  return blockExplorerURL(`/tx/${txid}`, network);
}
function blockExplorerAddressURL(address, network) {
  return blockExplorerURL(`/address/${address}`, network);
}

// src/braid.ts
import { Struct as Struct2 } from "bufio";

// ../../node_modules/@jspm/core/nodelibs/browser/chunk-5decc758.js
var e;
var t;
var n;
var r = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : global;
var o = e = {};
function i() {
  throw new Error("setTimeout has not been defined");
}
function u() {
  throw new Error("clearTimeout has not been defined");
}
function c(e4) {
  if (t === setTimeout)
    return setTimeout(e4, 0);
  if ((t === i || !t) && setTimeout)
    return t = setTimeout, setTimeout(e4, 0);
  try {
    return t(e4, 0);
  } catch (n3) {
    try {
      return t.call(null, e4, 0);
    } catch (n4) {
      return t.call(this || r, e4, 0);
    }
  }
}
!function() {
  try {
    t = "function" == typeof setTimeout ? setTimeout : i;
  } catch (e4) {
    t = i;
  }
  try {
    n = "function" == typeof clearTimeout ? clearTimeout : u;
  } catch (e4) {
    n = u;
  }
}();
var l;
var s = [];
var f = false;
var a = -1;
function h() {
  f && l && (f = false, l.length ? s = l.concat(s) : a = -1, s.length && d());
}
function d() {
  if (!f) {
    var e4 = c(h);
    f = true;
    for (var t4 = s.length; t4; ) {
      for (l = s, s = []; ++a < t4; )
        l && l[a].run();
      a = -1, t4 = s.length;
    }
    l = null, f = false, function(e5) {
      if (n === clearTimeout)
        return clearTimeout(e5);
      if ((n === u || !n) && clearTimeout)
        return n = clearTimeout, clearTimeout(e5);
      try {
        n(e5);
      } catch (t5) {
        try {
          return n.call(null, e5);
        } catch (t6) {
          return n.call(this || r, e5);
        }
      }
    }(e4);
  }
}
function m(e4, t4) {
  (this || r).fun = e4, (this || r).array = t4;
}
function p() {
}
o.nextTick = function(e4) {
  var t4 = new Array(arguments.length - 1);
  if (arguments.length > 1)
    for (var n3 = 1; n3 < arguments.length; n3++)
      t4[n3 - 1] = arguments[n3];
  s.push(new m(e4, t4)), 1 !== s.length || f || c(d);
}, m.prototype.run = function() {
  (this || r).fun.apply(null, (this || r).array);
}, o.title = "browser", o.browser = true, o.env = {}, o.argv = [], o.version = "", o.versions = {}, o.on = p, o.addListener = p, o.once = p, o.off = p, o.removeListener = p, o.removeAllListeners = p, o.emit = p, o.prependListener = p, o.prependOnceListener = p, o.listeners = function(e4) {
  return [];
}, o.binding = function(e4) {
  throw new Error("process.binding is not supported");
}, o.cwd = function() {
  return "/";
}, o.chdir = function(e4) {
  throw new Error("process.chdir is not supported");
}, o.umask = function() {
  return 0;
};
var T = e;
T.addListener;
T.argv;
T.binding;
T.browser;
T.chdir;
T.cwd;
T.emit;
T.env;
T.listeners;
T.nextTick;
T.off;
T.on;
T.once;
T.prependListener;
T.prependOnceListener;
T.removeAllListeners;
T.removeListener;
T.title;
T.umask;
T.version;
T.versions;

// ../../node_modules/@jspm/core/nodelibs/browser/chunk-b4205b57.js
var t2 = "function" == typeof Symbol && "symbol" == typeof Symbol.toStringTag;
var e2 = Object.prototype.toString;
var o2 = function(o3) {
  return !(t2 && o3 && "object" == typeof o3 && Symbol.toStringTag in o3) && "[object Arguments]" === e2.call(o3);
};
var n2 = function(t4) {
  return !!o2(t4) || null !== t4 && "object" == typeof t4 && "number" == typeof t4.length && t4.length >= 0 && "[object Array]" !== e2.call(t4) && "[object Function]" === e2.call(t4.callee);
};
var r2 = function() {
  return o2(arguments);
}();
o2.isLegacyArguments = n2;
var l2 = r2 ? o2 : n2;
var t$1 = Object.prototype.toString;
var o$1 = Function.prototype.toString;
var n$1 = /^\s*(?:function)?\*/;
var e$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.toStringTag;
var r$1 = Object.getPrototypeOf;
var c2 = function() {
  if (!e$1)
    return false;
  try {
    return Function("return function*() {}")();
  } catch (t4) {
  }
}();
var u2 = c2 ? r$1(c2) : {};
var i2 = function(c3) {
  return "function" == typeof c3 && (!!n$1.test(o$1.call(c3)) || (e$1 ? r$1(c3) === u2 : "[object GeneratorFunction]" === t$1.call(c3)));
};
var t$2 = "function" == typeof Object.create ? function(t4, e4) {
  e4 && (t4.super_ = e4, t4.prototype = Object.create(e4.prototype, { constructor: { value: t4, enumerable: false, writable: true, configurable: true } }));
} : function(t4, e4) {
  if (e4) {
    t4.super_ = e4;
    var o3 = function() {
    };
    o3.prototype = e4.prototype, t4.prototype = new o3(), t4.prototype.constructor = t4;
  }
};
var i$1 = function(e4) {
  return e4 && "object" == typeof e4 && "function" == typeof e4.copy && "function" == typeof e4.fill && "function" == typeof e4.readUInt8;
};
var o$2 = {};
var u$1 = i$1;
var f2 = l2;
var a2 = i2;
function c$1(e4) {
  return e4.call.bind(e4);
}
var s2 = "undefined" != typeof BigInt;
var p2 = "undefined" != typeof Symbol;
var y = p2 && void 0 !== Symbol.toStringTag;
var l$1 = "undefined" != typeof Uint8Array;
var d2 = "undefined" != typeof ArrayBuffer;
if (l$1 && y)
  var g = Object.getPrototypeOf(Uint8Array.prototype), b = c$1(Object.getOwnPropertyDescriptor(g, Symbol.toStringTag).get);
var m2 = c$1(Object.prototype.toString);
var h2 = c$1(Number.prototype.valueOf);
var j = c$1(String.prototype.valueOf);
var A = c$1(Boolean.prototype.valueOf);
if (s2)
  var w = c$1(BigInt.prototype.valueOf);
if (p2)
  var v = c$1(Symbol.prototype.valueOf);
function O(e4, t4) {
  if ("object" != typeof e4)
    return false;
  try {
    return t4(e4), true;
  } catch (e5) {
    return false;
  }
}
function S(e4) {
  return l$1 && y ? void 0 !== b(e4) : B(e4) || k(e4) || E(e4) || D(e4) || U(e4) || P(e4) || x(e4) || I(e4) || M(e4) || z(e4) || F(e4);
}
function B(e4) {
  return l$1 && y ? "Uint8Array" === b(e4) : "[object Uint8Array]" === m2(e4) || u$1(e4) && void 0 !== e4.buffer;
}
function k(e4) {
  return l$1 && y ? "Uint8ClampedArray" === b(e4) : "[object Uint8ClampedArray]" === m2(e4);
}
function E(e4) {
  return l$1 && y ? "Uint16Array" === b(e4) : "[object Uint16Array]" === m2(e4);
}
function D(e4) {
  return l$1 && y ? "Uint32Array" === b(e4) : "[object Uint32Array]" === m2(e4);
}
function U(e4) {
  return l$1 && y ? "Int8Array" === b(e4) : "[object Int8Array]" === m2(e4);
}
function P(e4) {
  return l$1 && y ? "Int16Array" === b(e4) : "[object Int16Array]" === m2(e4);
}
function x(e4) {
  return l$1 && y ? "Int32Array" === b(e4) : "[object Int32Array]" === m2(e4);
}
function I(e4) {
  return l$1 && y ? "Float32Array" === b(e4) : "[object Float32Array]" === m2(e4);
}
function M(e4) {
  return l$1 && y ? "Float64Array" === b(e4) : "[object Float64Array]" === m2(e4);
}
function z(e4) {
  return l$1 && y ? "BigInt64Array" === b(e4) : "[object BigInt64Array]" === m2(e4);
}
function F(e4) {
  return l$1 && y ? "BigUint64Array" === b(e4) : "[object BigUint64Array]" === m2(e4);
}
function T2(e4) {
  return "[object Map]" === m2(e4);
}
function N(e4) {
  return "[object Set]" === m2(e4);
}
function W(e4) {
  return "[object WeakMap]" === m2(e4);
}
function $(e4) {
  return "[object WeakSet]" === m2(e4);
}
function C(e4) {
  return "[object ArrayBuffer]" === m2(e4);
}
function V(e4) {
  return "undefined" != typeof ArrayBuffer && (C.working ? C(e4) : e4 instanceof ArrayBuffer);
}
function G(e4) {
  return "[object DataView]" === m2(e4);
}
function R(e4) {
  return "undefined" != typeof DataView && (G.working ? G(e4) : e4 instanceof DataView);
}
function J(e4) {
  return "[object SharedArrayBuffer]" === m2(e4);
}
function _(e4) {
  return "undefined" != typeof SharedArrayBuffer && (J.working ? J(e4) : e4 instanceof SharedArrayBuffer);
}
function H(e4) {
  return O(e4, h2);
}
function Z(e4) {
  return O(e4, j);
}
function q(e4) {
  return O(e4, A);
}
function K(e4) {
  return s2 && O(e4, w);
}
function L(e4) {
  return p2 && O(e4, v);
}
o$2.isArgumentsObject = f2, o$2.isGeneratorFunction = a2, o$2.isPromise = function(e4) {
  return "undefined" != typeof Promise && e4 instanceof Promise || null !== e4 && "object" == typeof e4 && "function" == typeof e4.then && "function" == typeof e4.catch;
}, o$2.isArrayBufferView = function(e4) {
  return d2 && ArrayBuffer.isView ? ArrayBuffer.isView(e4) : S(e4) || R(e4);
}, o$2.isTypedArray = S, o$2.isUint8Array = B, o$2.isUint8ClampedArray = k, o$2.isUint16Array = E, o$2.isUint32Array = D, o$2.isInt8Array = U, o$2.isInt16Array = P, o$2.isInt32Array = x, o$2.isFloat32Array = I, o$2.isFloat64Array = M, o$2.isBigInt64Array = z, o$2.isBigUint64Array = F, T2.working = "undefined" != typeof Map && T2(/* @__PURE__ */ new Map()), o$2.isMap = function(e4) {
  return "undefined" != typeof Map && (T2.working ? T2(e4) : e4 instanceof Map);
}, N.working = "undefined" != typeof Set && N(/* @__PURE__ */ new Set()), o$2.isSet = function(e4) {
  return "undefined" != typeof Set && (N.working ? N(e4) : e4 instanceof Set);
}, W.working = "undefined" != typeof WeakMap && W(/* @__PURE__ */ new WeakMap()), o$2.isWeakMap = function(e4) {
  return "undefined" != typeof WeakMap && (W.working ? W(e4) : e4 instanceof WeakMap);
}, $.working = "undefined" != typeof WeakSet && $(/* @__PURE__ */ new WeakSet()), o$2.isWeakSet = function(e4) {
  return $(e4);
}, C.working = "undefined" != typeof ArrayBuffer && C(new ArrayBuffer()), o$2.isArrayBuffer = V, G.working = "undefined" != typeof ArrayBuffer && "undefined" != typeof DataView && G(new DataView(new ArrayBuffer(1), 0, 1)), o$2.isDataView = R, J.working = "undefined" != typeof SharedArrayBuffer && J(new SharedArrayBuffer()), o$2.isSharedArrayBuffer = _, o$2.isAsyncFunction = function(e4) {
  return "[object AsyncFunction]" === m2(e4);
}, o$2.isMapIterator = function(e4) {
  return "[object Map Iterator]" === m2(e4);
}, o$2.isSetIterator = function(e4) {
  return "[object Set Iterator]" === m2(e4);
}, o$2.isGeneratorObject = function(e4) {
  return "[object Generator]" === m2(e4);
}, o$2.isWebAssemblyCompiledModule = function(e4) {
  return "[object WebAssembly.Module]" === m2(e4);
}, o$2.isNumberObject = H, o$2.isStringObject = Z, o$2.isBooleanObject = q, o$2.isBigIntObject = K, o$2.isSymbolObject = L, o$2.isBoxedPrimitive = function(e4) {
  return H(e4) || Z(e4) || q(e4) || K(e4) || L(e4);
}, o$2.isAnyArrayBuffer = function(e4) {
  return l$1 && (V(e4) || _(e4));
}, ["isProxy", "isExternal", "isModuleNamespaceObject"].forEach(function(e4) {
  Object.defineProperty(o$2, e4, { enumerable: false, value: function() {
    throw new Error(e4 + " is not supported in userland");
  } });
});
var Q = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : global;
var X = {};
var Y = T;
var ee = Object.getOwnPropertyDescriptors || function(e4) {
  for (var t4 = Object.keys(e4), r4 = {}, n3 = 0; n3 < t4.length; n3++)
    r4[t4[n3]] = Object.getOwnPropertyDescriptor(e4, t4[n3]);
  return r4;
};
var te = /%[sdj%]/g;
X.format = function(e4) {
  if (!ge(e4)) {
    for (var t4 = [], r4 = 0; r4 < arguments.length; r4++)
      t4.push(oe(arguments[r4]));
    return t4.join(" ");
  }
  r4 = 1;
  for (var n3 = arguments, i3 = n3.length, o3 = String(e4).replace(te, function(e5) {
    if ("%%" === e5)
      return "%";
    if (r4 >= i3)
      return e5;
    switch (e5) {
      case "%s":
        return String(n3[r4++]);
      case "%d":
        return Number(n3[r4++]);
      case "%j":
        try {
          return JSON.stringify(n3[r4++]);
        } catch (e6) {
          return "[Circular]";
        }
      default:
        return e5;
    }
  }), u3 = n3[r4]; r4 < i3; u3 = n3[++r4])
    le(u3) || !he(u3) ? o3 += " " + u3 : o3 += " " + oe(u3);
  return o3;
}, X.deprecate = function(e4, t4) {
  if (void 0 !== Y && true === Y.noDeprecation)
    return e4;
  if (void 0 === Y)
    return function() {
      return X.deprecate(e4, t4).apply(this || Q, arguments);
    };
  var r4 = false;
  return function() {
    if (!r4) {
      if (Y.throwDeprecation)
        throw new Error(t4);
      Y.traceDeprecation ? console.trace(t4) : console.error(t4), r4 = true;
    }
    return e4.apply(this || Q, arguments);
  };
};
var re = {};
var ne = /^$/;
if (Y.env.NODE_DEBUG) {
  ie = Y.env.NODE_DEBUG;
  ie = ie.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*").replace(/,/g, "$|^").toUpperCase(), ne = new RegExp("^" + ie + "$", "i");
}
var ie;
function oe(e4, t4) {
  var r4 = { seen: [], stylize: fe };
  return arguments.length >= 3 && (r4.depth = arguments[2]), arguments.length >= 4 && (r4.colors = arguments[3]), ye(t4) ? r4.showHidden = t4 : t4 && X._extend(r4, t4), be(r4.showHidden) && (r4.showHidden = false), be(r4.depth) && (r4.depth = 2), be(r4.colors) && (r4.colors = false), be(r4.customInspect) && (r4.customInspect = true), r4.colors && (r4.stylize = ue), ae(r4, e4, r4.depth);
}
function ue(e4, t4) {
  var r4 = oe.styles[t4];
  return r4 ? "\x1B[" + oe.colors[r4][0] + "m" + e4 + "\x1B[" + oe.colors[r4][1] + "m" : e4;
}
function fe(e4, t4) {
  return e4;
}
function ae(e4, t4, r4) {
  if (e4.customInspect && t4 && we(t4.inspect) && t4.inspect !== X.inspect && (!t4.constructor || t4.constructor.prototype !== t4)) {
    var n3 = t4.inspect(r4, e4);
    return ge(n3) || (n3 = ae(e4, n3, r4)), n3;
  }
  var i3 = function(e5, t5) {
    if (be(t5))
      return e5.stylize("undefined", "undefined");
    if (ge(t5)) {
      var r5 = "'" + JSON.stringify(t5).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, '"') + "'";
      return e5.stylize(r5, "string");
    }
    if (de(t5))
      return e5.stylize("" + t5, "number");
    if (ye(t5))
      return e5.stylize("" + t5, "boolean");
    if (le(t5))
      return e5.stylize("null", "null");
  }(e4, t4);
  if (i3)
    return i3;
  var o3 = Object.keys(t4), u3 = function(e5) {
    var t5 = {};
    return e5.forEach(function(e6, r5) {
      t5[e6] = true;
    }), t5;
  }(o3);
  if (e4.showHidden && (o3 = Object.getOwnPropertyNames(t4)), Ae(t4) && (o3.indexOf("message") >= 0 || o3.indexOf("description") >= 0))
    return ce(t4);
  if (0 === o3.length) {
    if (we(t4)) {
      var f3 = t4.name ? ": " + t4.name : "";
      return e4.stylize("[Function" + f3 + "]", "special");
    }
    if (me(t4))
      return e4.stylize(RegExp.prototype.toString.call(t4), "regexp");
    if (je(t4))
      return e4.stylize(Date.prototype.toString.call(t4), "date");
    if (Ae(t4))
      return ce(t4);
  }
  var a3, c3 = "", s3 = false, p3 = ["{", "}"];
  (pe(t4) && (s3 = true, p3 = ["[", "]"]), we(t4)) && (c3 = " [Function" + (t4.name ? ": " + t4.name : "") + "]");
  return me(t4) && (c3 = " " + RegExp.prototype.toString.call(t4)), je(t4) && (c3 = " " + Date.prototype.toUTCString.call(t4)), Ae(t4) && (c3 = " " + ce(t4)), 0 !== o3.length || s3 && 0 != t4.length ? r4 < 0 ? me(t4) ? e4.stylize(RegExp.prototype.toString.call(t4), "regexp") : e4.stylize("[Object]", "special") : (e4.seen.push(t4), a3 = s3 ? function(e5, t5, r5, n4, i4) {
    for (var o4 = [], u4 = 0, f4 = t5.length; u4 < f4; ++u4)
      ke(t5, String(u4)) ? o4.push(se(e5, t5, r5, n4, String(u4), true)) : o4.push("");
    return i4.forEach(function(i5) {
      i5.match(/^\d+$/) || o4.push(se(e5, t5, r5, n4, i5, true));
    }), o4;
  }(e4, t4, r4, u3, o3) : o3.map(function(n4) {
    return se(e4, t4, r4, u3, n4, s3);
  }), e4.seen.pop(), function(e5, t5, r5) {
    var n4 = 0;
    if (e5.reduce(function(e6, t6) {
      return n4++, t6.indexOf("\n") >= 0 && n4++, e6 + t6.replace(/\u001b\[\d\d?m/g, "").length + 1;
    }, 0) > 60)
      return r5[0] + ("" === t5 ? "" : t5 + "\n ") + " " + e5.join(",\n  ") + " " + r5[1];
    return r5[0] + t5 + " " + e5.join(", ") + " " + r5[1];
  }(a3, c3, p3)) : p3[0] + c3 + p3[1];
}
function ce(e4) {
  return "[" + Error.prototype.toString.call(e4) + "]";
}
function se(e4, t4, r4, n3, i3, o3) {
  var u3, f3, a3;
  if ((a3 = Object.getOwnPropertyDescriptor(t4, i3) || { value: t4[i3] }).get ? f3 = a3.set ? e4.stylize("[Getter/Setter]", "special") : e4.stylize("[Getter]", "special") : a3.set && (f3 = e4.stylize("[Setter]", "special")), ke(n3, i3) || (u3 = "[" + i3 + "]"), f3 || (e4.seen.indexOf(a3.value) < 0 ? (f3 = le(r4) ? ae(e4, a3.value, null) : ae(e4, a3.value, r4 - 1)).indexOf("\n") > -1 && (f3 = o3 ? f3.split("\n").map(function(e5) {
    return "  " + e5;
  }).join("\n").substr(2) : "\n" + f3.split("\n").map(function(e5) {
    return "   " + e5;
  }).join("\n")) : f3 = e4.stylize("[Circular]", "special")), be(u3)) {
    if (o3 && i3.match(/^\d+$/))
      return f3;
    (u3 = JSON.stringify("" + i3)).match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (u3 = u3.substr(1, u3.length - 2), u3 = e4.stylize(u3, "name")) : (u3 = u3.replace(/'/g, "\\'").replace(/\\"/g, '"').replace(/(^"|"$)/g, "'"), u3 = e4.stylize(u3, "string"));
  }
  return u3 + ": " + f3;
}
function pe(e4) {
  return Array.isArray(e4);
}
function ye(e4) {
  return "boolean" == typeof e4;
}
function le(e4) {
  return null === e4;
}
function de(e4) {
  return "number" == typeof e4;
}
function ge(e4) {
  return "string" == typeof e4;
}
function be(e4) {
  return void 0 === e4;
}
function me(e4) {
  return he(e4) && "[object RegExp]" === ve(e4);
}
function he(e4) {
  return "object" == typeof e4 && null !== e4;
}
function je(e4) {
  return he(e4) && "[object Date]" === ve(e4);
}
function Ae(e4) {
  return he(e4) && ("[object Error]" === ve(e4) || e4 instanceof Error);
}
function we(e4) {
  return "function" == typeof e4;
}
function ve(e4) {
  return Object.prototype.toString.call(e4);
}
function Oe(e4) {
  return e4 < 10 ? "0" + e4.toString(10) : e4.toString(10);
}
X.debuglog = function(e4) {
  if (e4 = e4.toUpperCase(), !re[e4])
    if (ne.test(e4)) {
      var t4 = Y.pid;
      re[e4] = function() {
        var r4 = X.format.apply(X, arguments);
        console.error("%s %d: %s", e4, t4, r4);
      };
    } else
      re[e4] = function() {
      };
  return re[e4];
}, X.inspect = oe, oe.colors = { bold: [1, 22], italic: [3, 23], underline: [4, 24], inverse: [7, 27], white: [37, 39], grey: [90, 39], black: [30, 39], blue: [34, 39], cyan: [36, 39], green: [32, 39], magenta: [35, 39], red: [31, 39], yellow: [33, 39] }, oe.styles = { special: "cyan", number: "yellow", boolean: "yellow", undefined: "grey", null: "bold", string: "green", date: "magenta", regexp: "red" }, X.types = o$2, X.isArray = pe, X.isBoolean = ye, X.isNull = le, X.isNullOrUndefined = function(e4) {
  return null == e4;
}, X.isNumber = de, X.isString = ge, X.isSymbol = function(e4) {
  return "symbol" == typeof e4;
}, X.isUndefined = be, X.isRegExp = me, X.types.isRegExp = me, X.isObject = he, X.isDate = je, X.types.isDate = je, X.isError = Ae, X.types.isNativeError = Ae, X.isFunction = we, X.isPrimitive = function(e4) {
  return null === e4 || "boolean" == typeof e4 || "number" == typeof e4 || "string" == typeof e4 || "symbol" == typeof e4 || void 0 === e4;
}, X.isBuffer = i$1;
var Se = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function Be() {
  var e4 = /* @__PURE__ */ new Date(), t4 = [Oe(e4.getHours()), Oe(e4.getMinutes()), Oe(e4.getSeconds())].join(":");
  return [e4.getDate(), Se[e4.getMonth()], t4].join(" ");
}
function ke(e4, t4) {
  return Object.prototype.hasOwnProperty.call(e4, t4);
}
X.log = function() {
  console.log("%s - %s", Be(), X.format.apply(X, arguments));
}, X.inherits = t$2, X._extend = function(e4, t4) {
  if (!t4 || !he(t4))
    return e4;
  for (var r4 = Object.keys(t4), n3 = r4.length; n3--; )
    e4[r4[n3]] = t4[r4[n3]];
  return e4;
};
var Ee = "undefined" != typeof Symbol ? Symbol("util.promisify.custom") : void 0;
function De(e4, t4) {
  if (!e4) {
    var r4 = new Error("Promise was rejected with a falsy value");
    r4.reason = e4, e4 = r4;
  }
  return t4(e4);
}
X.promisify = function(e4) {
  if ("function" != typeof e4)
    throw new TypeError('The "original" argument must be of type Function');
  if (Ee && e4[Ee]) {
    var t4;
    if ("function" != typeof (t4 = e4[Ee]))
      throw new TypeError('The "util.promisify.custom" argument must be of type Function');
    return Object.defineProperty(t4, Ee, { value: t4, enumerable: false, writable: false, configurable: true }), t4;
  }
  function t4() {
    for (var t5, r4, n3 = new Promise(function(e5, n4) {
      t5 = e5, r4 = n4;
    }), i3 = [], o3 = 0; o3 < arguments.length; o3++)
      i3.push(arguments[o3]);
    i3.push(function(e5, n4) {
      e5 ? r4(e5) : t5(n4);
    });
    try {
      e4.apply(this || Q, i3);
    } catch (e5) {
      r4(e5);
    }
    return n3;
  }
  return Object.setPrototypeOf(t4, Object.getPrototypeOf(e4)), Ee && Object.defineProperty(t4, Ee, { value: t4, enumerable: false, writable: false, configurable: true }), Object.defineProperties(t4, ee(e4));
}, X.promisify.custom = Ee, X.callbackify = function(e4) {
  if ("function" != typeof e4)
    throw new TypeError('The "original" argument must be of type Function');
  function t4() {
    for (var t5 = [], r4 = 0; r4 < arguments.length; r4++)
      t5.push(arguments[r4]);
    var n3 = t5.pop();
    if ("function" != typeof n3)
      throw new TypeError("The last argument must be of type Function");
    var i3 = this || Q, o3 = function() {
      return n3.apply(i3, arguments);
    };
    e4.apply(this || Q, t5).then(function(e5) {
      Y.nextTick(o3.bind(null, null, e5));
    }, function(e5) {
      Y.nextTick(De.bind(null, e5, o3));
    });
  }
  return Object.setPrototypeOf(t4, Object.getPrototypeOf(e4)), Object.defineProperties(t4, ee(e4)), t4;
};

// ../../node_modules/@jspm/core/nodelibs/browser/assert.js
function e3(e4, r4) {
  if (null == e4)
    throw new TypeError("Cannot convert first argument to object");
  for (var t4 = Object(e4), n3 = 1; n3 < arguments.length; n3++) {
    var o3 = arguments[n3];
    if (null != o3)
      for (var a3 = Object.keys(Object(o3)), l3 = 0, i3 = a3.length; l3 < i3; l3++) {
        var c3 = a3[l3], b3 = Object.getOwnPropertyDescriptor(o3, c3);
        void 0 !== b3 && b3.enumerable && (t4[c3] = o3[c3]);
      }
  }
  return t4;
}
var r3 = { assign: e3, polyfill: function() {
  Object.assign || Object.defineProperty(Object, "assign", { enumerable: false, configurable: true, writable: true, value: e3 });
} };
var t3;
var e$12 = Object.prototype.toString;
var r$12 = function(t4) {
  var r4 = e$12.call(t4), n3 = "[object Arguments]" === r4;
  return n3 || (n3 = "[object Array]" !== r4 && null !== t4 && "object" == typeof t4 && "number" == typeof t4.length && t4.length >= 0 && "[object Function]" === e$12.call(t4.callee)), n3;
};
if (!Object.keys) {
  n3 = Object.prototype.hasOwnProperty, o3 = Object.prototype.toString, c3 = r$12, l3 = Object.prototype.propertyIsEnumerable, i3 = !l3.call({ toString: null }, "toString"), a3 = l3.call(function() {
  }, "prototype"), u3 = ["toString", "toLocaleString", "valueOf", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "constructor"], f3 = function(t4) {
    var e4 = t4.constructor;
    return e4 && e4.prototype === t4;
  }, p3 = { $applicationCache: true, $console: true, $external: true, $frame: true, $frameElement: true, $frames: true, $innerHeight: true, $innerWidth: true, $onmozfullscreenchange: true, $onmozfullscreenerror: true, $outerHeight: true, $outerWidth: true, $pageXOffset: true, $pageYOffset: true, $parent: true, $scrollLeft: true, $scrollTop: true, $scrollX: true, $scrollY: true, $self: true, $webkitIndexedDB: true, $webkitStorageInfo: true, $window: true }, s3 = function() {
    if ("undefined" == typeof window)
      return false;
    for (var t4 in window)
      try {
        if (!p3["$" + t4] && n3.call(window, t4) && null !== window[t4] && "object" == typeof window[t4])
          try {
            f3(window[t4]);
          } catch (t5) {
            return true;
          }
      } catch (t5) {
        return true;
      }
    return false;
  }();
  t3 = function(t4) {
    var e4 = null !== t4 && "object" == typeof t4, r4 = "[object Function]" === o3.call(t4), l4 = c3(t4), p4 = e4 && "[object String]" === o3.call(t4), y3 = [];
    if (!e4 && !r4 && !l4)
      throw new TypeError("Object.keys called on a non-object");
    var b3 = a3 && r4;
    if (p4 && t4.length > 0 && !n3.call(t4, 0))
      for (var g3 = 0; g3 < t4.length; ++g3)
        y3.push(String(g3));
    if (l4 && t4.length > 0)
      for (var h4 = 0; h4 < t4.length; ++h4)
        y3.push(String(h4));
    else
      for (var $3 in t4)
        b3 && "prototype" === $3 || !n3.call(t4, $3) || y3.push(String($3));
    if (i3)
      for (var j3 = function(t5) {
        if ("undefined" == typeof window || !s3)
          return f3(t5);
        try {
          return f3(t5);
        } catch (t6) {
          return false;
        }
      }(t4), w3 = 0; w3 < u3.length; ++w3)
        j3 && "constructor" === u3[w3] || !n3.call(t4, u3[w3]) || y3.push(u3[w3]);
    return y3;
  };
}
var n3;
var o3;
var c3;
var l3;
var i3;
var a3;
var u3;
var f3;
var p3;
var s3;
var y2 = t3;
var b2 = Array.prototype.slice;
var g2 = r$12;
var h3 = Object.keys;
var $2 = h3 ? function(t4) {
  return h3(t4);
} : y2;
var j2 = Object.keys;
$2.shim = function() {
  Object.keys ? function() {
    var t4 = Object.keys(arguments);
    return t4 && t4.length === arguments.length;
  }(1, 2) || (Object.keys = function(t4) {
    return g2(t4) ? j2(b2.call(t4)) : j2(t4);
  }) : Object.keys = $2;
  return Object.keys || $2;
};
var w2 = $2;
var r$2 = w2;
var e$2 = "function" == typeof Symbol && "symbol" == typeof Symbol("foo");
var o$12 = Object.prototype.toString;
var n$12 = Array.prototype.concat;
var a$1 = Object.defineProperty;
var c$12 = a$1 && function() {
  var t4 = {};
  try {
    for (var r4 in a$1(t4, "x", { enumerable: false, value: t4 }), t4)
      return false;
    return t4.x === t4;
  } catch (t5) {
    return false;
  }
}();
var l$12 = function(t4, r4, e4, n3) {
  var l3;
  (!(r4 in t4) || "function" == typeof (l3 = n3) && "[object Function]" === o$12.call(l3) && n3()) && (c$12 ? a$1(t4, r4, { configurable: true, enumerable: false, value: e4, writable: true }) : t4[r4] = e4);
};
var u$12 = function(t4, o3) {
  var a3 = arguments.length > 2 ? arguments[2] : {}, c3 = r$2(o3);
  e$2 && (c3 = n$12.call(c3, Object.getOwnPropertySymbols(o3)));
  for (var u3 = 0; u3 < c3.length; u3 += 1)
    l$12(t4, c3[u3], o3[c3[u3]], a3[c3[u3]]);
};
u$12.supportsDescriptors = !!c$12;
var f$1 = u$12;
var t$12 = function() {
  if ("function" != typeof Symbol || "function" != typeof Object.getOwnPropertySymbols)
    return false;
  if ("symbol" == typeof Symbol.iterator)
    return true;
  var t4 = {}, e4 = Symbol("test"), r4 = Object(e4);
  if ("string" == typeof e4)
    return false;
  if ("[object Symbol]" !== Object.prototype.toString.call(e4))
    return false;
  if ("[object Symbol]" !== Object.prototype.toString.call(r4))
    return false;
  for (e4 in t4[e4] = 42, t4)
    return false;
  if ("function" == typeof Object.keys && 0 !== Object.keys(t4).length)
    return false;
  if ("function" == typeof Object.getOwnPropertyNames && 0 !== Object.getOwnPropertyNames(t4).length)
    return false;
  var o3 = Object.getOwnPropertySymbols(t4);
  if (1 !== o3.length || o3[0] !== e4)
    return false;
  if (!Object.prototype.propertyIsEnumerable.call(t4, e4))
    return false;
  if ("function" == typeof Object.getOwnPropertyDescriptor) {
    var n3 = Object.getOwnPropertyDescriptor(t4, e4);
    if (42 !== n3.value || true !== n3.enumerable)
      return false;
  }
  return true;
};
var f$2 = ("undefined" != typeof globalThis ? globalThis : "undefined" != typeof self ? self : global).Symbol;
var e$3 = t$12;
var l$2 = function() {
  return "function" == typeof f$2 && ("function" == typeof Symbol && ("symbol" == typeof f$2("foo") && ("symbol" == typeof Symbol("bar") && e$3())));
};
var t$22 = "Function.prototype.bind called on incompatible ";
var n$2 = Array.prototype.slice;
var o$22 = Object.prototype.toString;
var r$3 = function(r4) {
  var e4 = this;
  if ("function" != typeof e4 || "[object Function]" !== o$22.call(e4))
    throw new TypeError(t$22 + e4);
  for (var p3, i3 = n$2.call(arguments, 1), c3 = function() {
    if (this instanceof p3) {
      var t4 = e4.apply(this, i3.concat(n$2.call(arguments)));
      return Object(t4) === t4 ? t4 : this;
    }
    return e4.apply(r4, i3.concat(n$2.call(arguments)));
  }, a3 = Math.max(0, e4.length - i3.length), l3 = [], u3 = 0; u3 < a3; u3++)
    l3.push("$" + u3);
  if (p3 = Function("binder", "return function (" + l3.join(",") + "){ return binder.apply(this,arguments); }")(c3), e4.prototype) {
    var y3 = function() {
    };
    y3.prototype = e4.prototype, p3.prototype = new y3(), y3.prototype = null;
  }
  return p3;
};
var e$4 = Function.prototype.bind || r$3;
var o$3 = TypeError;
var t$3 = Object.getOwnPropertyDescriptor;
if (t$3)
  try {
    t$3({}, "");
  } catch (r4) {
    t$3 = null;
  }
var n$3 = function() {
  throw new o$3();
};
var y$1 = t$3 ? function() {
  try {
    return arguments.callee, n$3;
  } catch (r4) {
    try {
      return t$3(arguments, "callee").get;
    } catch (r5) {
      return n$3;
    }
  }
}() : n$3;
var a$2 = l$2();
var i$12 = Object.getPrototypeOf || function(r4) {
  return r4.__proto__;
};
var d3 = "undefined" == typeof Uint8Array ? void 0 : i$12(Uint8Array);
var f$3 = { "%Array%": Array, "%ArrayBuffer%": "undefined" == typeof ArrayBuffer ? void 0 : ArrayBuffer, "%ArrayBufferPrototype%": "undefined" == typeof ArrayBuffer ? void 0 : ArrayBuffer.prototype, "%ArrayIteratorPrototype%": a$2 ? i$12([][Symbol.iterator]()) : void 0, "%ArrayPrototype%": Array.prototype, "%ArrayProto_entries%": Array.prototype.entries, "%ArrayProto_forEach%": Array.prototype.forEach, "%ArrayProto_keys%": Array.prototype.keys, "%ArrayProto_values%": Array.prototype.values, "%AsyncFromSyncIteratorPrototype%": void 0, "%AsyncFunction%": void 0, "%AsyncFunctionPrototype%": void 0, "%AsyncGenerator%": void 0, "%AsyncGeneratorFunction%": void 0, "%AsyncGeneratorPrototype%": void 0, "%AsyncIteratorPrototype%": void 0, "%Atomics%": "undefined" == typeof Atomics ? void 0 : Atomics, "%Boolean%": Boolean, "%BooleanPrototype%": Boolean.prototype, "%DataView%": "undefined" == typeof DataView ? void 0 : DataView, "%DataViewPrototype%": "undefined" == typeof DataView ? void 0 : DataView.prototype, "%Date%": Date, "%DatePrototype%": Date.prototype, "%decodeURI%": decodeURI, "%decodeURIComponent%": decodeURIComponent, "%encodeURI%": encodeURI, "%encodeURIComponent%": encodeURIComponent, "%Error%": Error, "%ErrorPrototype%": Error.prototype, "%eval%": eval, "%EvalError%": EvalError, "%EvalErrorPrototype%": EvalError.prototype, "%Float32Array%": "undefined" == typeof Float32Array ? void 0 : Float32Array, "%Float32ArrayPrototype%": "undefined" == typeof Float32Array ? void 0 : Float32Array.prototype, "%Float64Array%": "undefined" == typeof Float64Array ? void 0 : Float64Array, "%Float64ArrayPrototype%": "undefined" == typeof Float64Array ? void 0 : Float64Array.prototype, "%Function%": Function, "%FunctionPrototype%": Function.prototype, "%Generator%": void 0, "%GeneratorFunction%": void 0, "%GeneratorPrototype%": void 0, "%Int8Array%": "undefined" == typeof Int8Array ? void 0 : Int8Array, "%Int8ArrayPrototype%": "undefined" == typeof Int8Array ? void 0 : Int8Array.prototype, "%Int16Array%": "undefined" == typeof Int16Array ? void 0 : Int16Array, "%Int16ArrayPrototype%": "undefined" == typeof Int16Array ? void 0 : Int8Array.prototype, "%Int32Array%": "undefined" == typeof Int32Array ? void 0 : Int32Array, "%Int32ArrayPrototype%": "undefined" == typeof Int32Array ? void 0 : Int32Array.prototype, "%isFinite%": isFinite, "%isNaN%": isNaN, "%IteratorPrototype%": a$2 ? i$12(i$12([][Symbol.iterator]())) : void 0, "%JSON%": "object" == typeof JSON ? JSON : void 0, "%JSONParse%": "object" == typeof JSON ? JSON.parse : void 0, "%Map%": "undefined" == typeof Map ? void 0 : Map, "%MapIteratorPrototype%": "undefined" != typeof Map && a$2 ? i$12((/* @__PURE__ */ new Map())[Symbol.iterator]()) : void 0, "%MapPrototype%": "undefined" == typeof Map ? void 0 : Map.prototype, "%Math%": Math, "%Number%": Number, "%NumberPrototype%": Number.prototype, "%Object%": Object, "%ObjectPrototype%": Object.prototype, "%ObjProto_toString%": Object.prototype.toString, "%ObjProto_valueOf%": Object.prototype.valueOf, "%parseFloat%": parseFloat, "%parseInt%": parseInt, "%Promise%": "undefined" == typeof Promise ? void 0 : Promise, "%PromisePrototype%": "undefined" == typeof Promise ? void 0 : Promise.prototype, "%PromiseProto_then%": "undefined" == typeof Promise ? void 0 : Promise.prototype.then, "%Promise_all%": "undefined" == typeof Promise ? void 0 : Promise.all, "%Promise_reject%": "undefined" == typeof Promise ? void 0 : Promise.reject, "%Promise_resolve%": "undefined" == typeof Promise ? void 0 : Promise.resolve, "%Proxy%": "undefined" == typeof Proxy ? void 0 : Proxy, "%RangeError%": RangeError, "%RangeErrorPrototype%": RangeError.prototype, "%ReferenceError%": ReferenceError, "%ReferenceErrorPrototype%": ReferenceError.prototype, "%Reflect%": "undefined" == typeof Reflect ? void 0 : Reflect, "%RegExp%": RegExp, "%RegExpPrototype%": RegExp.prototype, "%Set%": "undefined" == typeof Set ? void 0 : Set, "%SetIteratorPrototype%": "undefined" != typeof Set && a$2 ? i$12((/* @__PURE__ */ new Set())[Symbol.iterator]()) : void 0, "%SetPrototype%": "undefined" == typeof Set ? void 0 : Set.prototype, "%SharedArrayBuffer%": "undefined" == typeof SharedArrayBuffer ? void 0 : SharedArrayBuffer, "%SharedArrayBufferPrototype%": "undefined" == typeof SharedArrayBuffer ? void 0 : SharedArrayBuffer.prototype, "%String%": String, "%StringIteratorPrototype%": a$2 ? i$12(""[Symbol.iterator]()) : void 0, "%StringPrototype%": String.prototype, "%Symbol%": a$2 ? Symbol : void 0, "%SymbolPrototype%": a$2 ? Symbol.prototype : void 0, "%SyntaxError%": SyntaxError, "%SyntaxErrorPrototype%": SyntaxError.prototype, "%ThrowTypeError%": y$1, "%TypedArray%": d3, "%TypedArrayPrototype%": d3 ? d3.prototype : void 0, "%TypeError%": o$3, "%TypeErrorPrototype%": o$3.prototype, "%Uint8Array%": "undefined" == typeof Uint8Array ? void 0 : Uint8Array, "%Uint8ArrayPrototype%": "undefined" == typeof Uint8Array ? void 0 : Uint8Array.prototype, "%Uint8ClampedArray%": "undefined" == typeof Uint8ClampedArray ? void 0 : Uint8ClampedArray, "%Uint8ClampedArrayPrototype%": "undefined" == typeof Uint8ClampedArray ? void 0 : Uint8ClampedArray.prototype, "%Uint16Array%": "undefined" == typeof Uint16Array ? void 0 : Uint16Array, "%Uint16ArrayPrototype%": "undefined" == typeof Uint16Array ? void 0 : Uint16Array.prototype, "%Uint32Array%": "undefined" == typeof Uint32Array ? void 0 : Uint32Array, "%Uint32ArrayPrototype%": "undefined" == typeof Uint32Array ? void 0 : Uint32Array.prototype, "%URIError%": URIError, "%URIErrorPrototype%": URIError.prototype, "%WeakMap%": "undefined" == typeof WeakMap ? void 0 : WeakMap, "%WeakMapPrototype%": "undefined" == typeof WeakMap ? void 0 : WeakMap.prototype, "%WeakSet%": "undefined" == typeof WeakSet ? void 0 : WeakSet, "%WeakSetPrototype%": "undefined" == typeof WeakSet ? void 0 : WeakSet.prototype };
var u$2 = e$4.call(Function.call, String.prototype.replace);
var A2 = /[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;
var l$3 = /\\(\\)?/g;
var v2 = function(r4) {
  var e4 = [];
  return u$2(r4, A2, function(r5, o3, t4, n3) {
    e4[e4.length] = t4 ? u$2(n3, l$3, "$1") : o3 || r5;
  }), e4;
};
var P2 = function(r4, e4) {
  if (!(r4 in f$3))
    throw new SyntaxError("intrinsic " + r4 + " does not exist!");
  if (void 0 === f$3[r4] && !e4)
    throw new o$3("intrinsic " + r4 + " exists, but is not available. Please file an issue!");
  return f$3[r4];
};
var c$2 = function(r4, e4) {
  if ("string" != typeof r4 || 0 === r4.length)
    throw new TypeError("intrinsic name must be a non-empty string");
  if (arguments.length > 1 && "boolean" != typeof e4)
    throw new TypeError('"allowMissing" argument must be a boolean');
  for (var n3 = v2(r4), y3 = P2("%" + (n3.length > 0 ? n3[0] : "") + "%", e4), a3 = 1; a3 < n3.length; a3 += 1)
    if (null != y3)
      if (t$3 && a3 + 1 >= n3.length) {
        var i3 = t$3(y3, n3[a3]);
        if (!e4 && !(n3[a3] in y3))
          throw new o$3("base intrinsic for " + r4 + " exists, but the property is not available.");
        y3 = i3 ? i3.get || i3.value : y3[n3[a3]];
      } else
        y3 = y3[n3[a3]];
  return y3;
};
var t$4;
var p$1 = e$4;
var o$4 = c$2("%Function%");
var i$2 = o$4.apply;
var a$3 = o$4.call;
(t$4 = function() {
  return p$1.apply(a$3, arguments);
}).apply = function() {
  return p$1.apply(i$2, arguments);
};
var l$4 = t$4;
var r$4;
var n$4;
var i$3 = function(t4) {
  return t4 != t4;
};
var o$5 = (r$4 = function(t4, e4) {
  return 0 === t4 && 0 === e4 ? 1 / t4 == 1 / e4 : t4 === e4 || !(!i$3(t4) || !i$3(e4));
}, r$4);
var c$3 = (n$4 = function() {
  return "function" == typeof Object.is ? Object.is : o$5;
}, n$4);
var f$4 = f$1;
var u$3 = f$1;
var s$1 = r$4;
var a$4 = n$4;
var l$5 = function() {
  var t4 = c$3();
  return f$4(Object, { is: t4 }, { is: function() {
    return Object.is !== t4;
  } }), t4;
};
var p$2 = l$4(a$4(), Object);
u$3(p$2, { getPolyfill: a$4, implementation: s$1, shim: l$5 });
var m3 = p$2;
N2 = function(r4) {
  return r4 != r4;
};
var N2;
var e$5;
var i$4 = N2;
var n$5 = (e$5 = function() {
  return Number.isNaN && Number.isNaN(NaN) && !Number.isNaN("a") ? Number.isNaN : i$4;
}, f$1);
var t$5 = e$5;
var u$4 = f$1;
var a$5 = N2;
var m$1 = e$5;
var o$6 = function() {
  var r4 = t$5();
  return n$5(Number, { isNaN: r4 }, { isNaN: function() {
    return Number.isNaN !== r4;
  } }), r4;
};
var s$2 = m$1();
u$4(s$2, { getPolyfill: m$1, implementation: a$5, shim: o$6 });
var f$5 = s$2;
var c$4 = {};
var a$6 = false;
function i$5() {
  if (a$6)
    return c$4;
  function e4(t4) {
    return (e4 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t5) {
      return typeof t5;
    } : function(t5) {
      return t5 && "function" == typeof Symbol && t5.constructor === Symbol && t5 !== Symbol.prototype ? "symbol" : typeof t5;
    })(t4);
  }
  function n3(t4, n4) {
    return !n4 || "object" !== e4(n4) && "function" != typeof n4 ? function(t5) {
      if (void 0 === t5)
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      return t5;
    }(t4) : n4;
  }
  function r4(t4) {
    return (r4 = Object.setPrototypeOf ? Object.getPrototypeOf : function(t5) {
      return t5.__proto__ || Object.getPrototypeOf(t5);
    })(t4);
  }
  function o3(t4, e5) {
    return (o3 = Object.setPrototypeOf || function(t5, e6) {
      return t5.__proto__ = e6, t5;
    })(t4, e5);
  }
  a$6 = true;
  var i3, u3, l3 = {};
  function f3(t4, e5, c3) {
    c3 || (c3 = Error);
    var a3 = function(c4) {
      function a4(o4, c5, i4) {
        var u4;
        return !function(t5, e6) {
          if (!(t5 instanceof e6))
            throw new TypeError("Cannot call a class as a function");
        }(this, a4), (u4 = n3(this, r4(a4).call(this, function(t5, n4, r5) {
          return "string" == typeof e5 ? e5 : e5(t5, n4, r5);
        }(o4, c5, i4)))).code = t4, u4;
      }
      return !function(t5, e6) {
        if ("function" != typeof e6 && null !== e6)
          throw new TypeError("Super expression must either be null or a function");
        t5.prototype = Object.create(e6 && e6.prototype, { constructor: { value: t5, writable: true, configurable: true } }), e6 && o3(t5, e6);
      }(a4, c4), a4;
    }(c3);
    l3[t4] = a3;
  }
  function s3(t4, e5) {
    if (Array.isArray(t4)) {
      var n4 = t4.length;
      return t4 = t4.map(function(t5) {
        return String(t5);
      }), n4 > 2 ? "one of ".concat(e5, " ").concat(t4.slice(0, n4 - 1).join(", "), ", or ") + t4[n4 - 1] : 2 === n4 ? "one of ".concat(e5, " ").concat(t4[0], " or ").concat(t4[1]) : "of ".concat(e5, " ").concat(t4[0]);
    }
    return "of ".concat(e5, " ").concat(String(t4));
  }
  return f3("ERR_AMBIGUOUS_ARGUMENT", 'The "%s" argument is ambiguous. %s', TypeError), f3("ERR_INVALID_ARG_TYPE", function(t4, n4, r5) {
    var o4, c3, u4;
    if (void 0 === i3 && (i3 = tt()), i3("string" == typeof t4, "'name' must be a string"), "string" == typeof n4 && (c3 = "not ", n4.substr(0, c3.length) === c3) ? (o4 = "must not be", n4 = n4.replace(/^not /, "")) : o4 = "must be", function(t5, e5, n5) {
      return (void 0 === n5 || n5 > t5.length) && (n5 = t5.length), t5.substring(n5 - e5.length, n5) === e5;
    }(t4, " argument"))
      u4 = "The ".concat(t4, " ").concat(o4, " ").concat(s3(n4, "type"));
    else {
      var l4 = function(t5, e5, n5) {
        return "number" != typeof n5 && (n5 = 0), !(n5 + e5.length > t5.length) && -1 !== t5.indexOf(e5, n5);
      }(t4, ".") ? "property" : "argument";
      u4 = 'The "'.concat(t4, '" ').concat(l4, " ").concat(o4, " ").concat(s3(n4, "type"));
    }
    return u4 += ". Received type ".concat(e4(r5));
  }, TypeError), f3("ERR_INVALID_ARG_VALUE", function(e5, n4) {
    var r5 = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : "is invalid";
    void 0 === u3 && (u3 = X);
    var o4 = u3.inspect(n4);
    return o4.length > 128 && (o4 = "".concat(o4.slice(0, 128), "...")), "The argument '".concat(e5, "' ").concat(r5, ". Received ").concat(o4);
  }, TypeError), f3("ERR_INVALID_RETURN_VALUE", function(t4, n4, r5) {
    var o4;
    return o4 = r5 && r5.constructor && r5.constructor.name ? "instance of ".concat(r5.constructor.name) : "type ".concat(e4(r5)), "Expected ".concat(t4, ' to be returned from the "').concat(n4, '"') + " function but got ".concat(o4, ".");
  }, TypeError), f3("ERR_MISSING_ARGS", function() {
    for (var t4 = arguments.length, e5 = new Array(t4), n4 = 0; n4 < t4; n4++)
      e5[n4] = arguments[n4];
    void 0 === i3 && (i3 = tt()), i3(e5.length > 0, "At least one arg needs to be specified");
    var r5 = "The ", o4 = e5.length;
    switch (e5 = e5.map(function(t5) {
      return '"'.concat(t5, '"');
    }), o4) {
      case 1:
        r5 += "".concat(e5[0], " argument");
        break;
      case 2:
        r5 += "".concat(e5[0], " and ").concat(e5[1], " arguments");
        break;
      default:
        r5 += e5.slice(0, o4 - 1).join(", "), r5 += ", and ".concat(e5[o4 - 1], " arguments");
    }
    return "".concat(r5, " must be specified");
  }, TypeError), c$4.codes = l3, c$4;
}
var u$5 = {};
var l$6 = false;
function f$6() {
  if (l$6)
    return u$5;
  l$6 = true;
  var n3 = T;
  function r4(t4, e4, n4) {
    return e4 in t4 ? Object.defineProperty(t4, e4, { value: n4, enumerable: true, configurable: true, writable: true }) : t4[e4] = n4, t4;
  }
  function o3(t4, e4) {
    for (var n4 = 0; n4 < e4.length; n4++) {
      var r5 = e4[n4];
      r5.enumerable = r5.enumerable || false, r5.configurable = true, "value" in r5 && (r5.writable = true), Object.defineProperty(t4, r5.key, r5);
    }
  }
  function c3(t4, e4) {
    return !e4 || "object" !== y3(e4) && "function" != typeof e4 ? a3(t4) : e4;
  }
  function a3(t4) {
    if (void 0 === t4)
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    return t4;
  }
  function f3(t4) {
    var e4 = "function" == typeof Map ? /* @__PURE__ */ new Map() : void 0;
    return (f3 = function(t5) {
      if (null === t5 || (n4 = t5, -1 === Function.toString.call(n4).indexOf("[native code]")))
        return t5;
      var n4;
      if ("function" != typeof t5)
        throw new TypeError("Super expression must either be null or a function");
      if (void 0 !== e4) {
        if (e4.has(t5))
          return e4.get(t5);
        e4.set(t5, r5);
      }
      function r5() {
        return p3(t5, arguments, h4(this).constructor);
      }
      return r5.prototype = Object.create(t5.prototype, { constructor: { value: r5, enumerable: false, writable: true, configurable: true } }), g3(r5, t5);
    })(t4);
  }
  function s3() {
    if ("undefined" == typeof Reflect || !Reflect.construct)
      return false;
    if (Reflect.construct.sham)
      return false;
    if ("function" == typeof Proxy)
      return true;
    try {
      return Date.prototype.toString.call(Reflect.construct(Date, [], function() {
      })), true;
    } catch (t4) {
      return false;
    }
  }
  function p3(t4, e4, n4) {
    return (p3 = s3() ? Reflect.construct : function(t5, e5, n5) {
      var r5 = [null];
      r5.push.apply(r5, e5);
      var o4 = new (Function.bind.apply(t5, r5))();
      return n5 && g3(o4, n5.prototype), o4;
    }).apply(null, arguments);
  }
  function g3(t4, e4) {
    return (g3 = Object.setPrototypeOf || function(t5, e5) {
      return t5.__proto__ = e5, t5;
    })(t4, e4);
  }
  function h4(t4) {
    return (h4 = Object.setPrototypeOf ? Object.getPrototypeOf : function(t5) {
      return t5.__proto__ || Object.getPrototypeOf(t5);
    })(t4);
  }
  function y3(t4) {
    return (y3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t5) {
      return typeof t5;
    } : function(t5) {
      return t5 && "function" == typeof Symbol && t5.constructor === Symbol && t5 !== Symbol.prototype ? "symbol" : typeof t5;
    })(t4);
  }
  var b3 = X.inspect, v3 = i$5().codes.ERR_INVALID_ARG_TYPE;
  function d4(t4, e4, n4) {
    return (void 0 === n4 || n4 > t4.length) && (n4 = t4.length), t4.substring(n4 - e4.length, n4) === e4;
  }
  var m4 = "", E3 = "", w3 = "", S3 = "", j3 = { deepStrictEqual: "Expected values to be strictly deep-equal:", strictEqual: "Expected values to be strictly equal:", strictEqualObject: 'Expected "actual" to be reference-equal to "expected":', deepEqual: "Expected values to be loosely deep-equal:", equal: "Expected values to be loosely equal:", notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:', notStrictEqual: 'Expected "actual" to be strictly unequal to:', notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":', notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:', notEqual: 'Expected "actual" to be loosely unequal to:', notIdentical: "Values identical but not reference-equal:" };
  function O3(t4) {
    var e4 = Object.keys(t4), n4 = Object.create(Object.getPrototypeOf(t4));
    return e4.forEach(function(e5) {
      n4[e5] = t4[e5];
    }), Object.defineProperty(n4, "message", { value: t4.message }), n4;
  }
  function x3(t4) {
    return b3(t4, { compact: false, customInspect: false, depth: 1e3, maxArrayLength: 1 / 0, showHidden: false, breakLength: 1 / 0, showProxy: false, sorted: true, getters: true });
  }
  function q3(t4, e4, r5) {
    var o4 = "", c4 = "", a4 = 0, i3 = "", u3 = false, l3 = x3(t4), f4 = l3.split("\n"), s4 = x3(e4).split("\n"), p4 = 0, g4 = "";
    if ("strictEqual" === r5 && "object" === y3(t4) && "object" === y3(e4) && null !== t4 && null !== e4 && (r5 = "strictEqualObject"), 1 === f4.length && 1 === s4.length && f4[0] !== s4[0]) {
      var h5 = f4[0].length + s4[0].length;
      if (h5 <= 10) {
        if (!("object" === y3(t4) && null !== t4 || "object" === y3(e4) && null !== e4 || 0 === t4 && 0 === e4))
          return "".concat(j3[r5], "\n\n") + "".concat(f4[0], " !== ").concat(s4[0], "\n");
      } else if ("strictEqualObject" !== r5) {
        if (h5 < (n3.stderr && n3.stderr.isTTY ? n3.stderr.columns : 80)) {
          for (; f4[0][p4] === s4[0][p4]; )
            p4++;
          p4 > 2 && (g4 = "\n  ".concat(function(t5, e5) {
            if (e5 = Math.floor(e5), 0 == t5.length || 0 == e5)
              return "";
            var n4 = t5.length * e5;
            for (e5 = Math.floor(Math.log(e5) / Math.log(2)); e5; )
              t5 += t5, e5--;
            return t5 += t5.substring(0, n4 - t5.length);
          }(" ", p4), "^"), p4 = 0);
        }
      }
    }
    for (var b4 = f4[f4.length - 1], v4 = s4[s4.length - 1]; b4 === v4 && (p4++ < 2 ? i3 = "\n  ".concat(b4).concat(i3) : o4 = b4, f4.pop(), s4.pop(), 0 !== f4.length && 0 !== s4.length); )
      b4 = f4[f4.length - 1], v4 = s4[s4.length - 1];
    var O4 = Math.max(f4.length, s4.length);
    if (0 === O4) {
      var q4 = l3.split("\n");
      if (q4.length > 30)
        for (q4[26] = "".concat(m4, "...").concat(S3); q4.length > 27; )
          q4.pop();
      return "".concat(j3.notIdentical, "\n\n").concat(q4.join("\n"), "\n");
    }
    p4 > 3 && (i3 = "\n".concat(m4, "...").concat(S3).concat(i3), u3 = true), "" !== o4 && (i3 = "\n  ".concat(o4).concat(i3), o4 = "");
    var R4 = 0, A3 = j3[r5] + "\n".concat(E3, "+ actual").concat(S3, " ").concat(w3, "- expected").concat(S3), k3 = " ".concat(m4, "...").concat(S3, " Lines skipped");
    for (p4 = 0; p4 < O4; p4++) {
      var _3 = p4 - a4;
      if (f4.length < p4 + 1)
        _3 > 1 && p4 > 2 && (_3 > 4 ? (c4 += "\n".concat(m4, "...").concat(S3), u3 = true) : _3 > 3 && (c4 += "\n  ".concat(s4[p4 - 2]), R4++), c4 += "\n  ".concat(s4[p4 - 1]), R4++), a4 = p4, o4 += "\n".concat(w3, "-").concat(S3, " ").concat(s4[p4]), R4++;
      else if (s4.length < p4 + 1)
        _3 > 1 && p4 > 2 && (_3 > 4 ? (c4 += "\n".concat(m4, "...").concat(S3), u3 = true) : _3 > 3 && (c4 += "\n  ".concat(f4[p4 - 2]), R4++), c4 += "\n  ".concat(f4[p4 - 1]), R4++), a4 = p4, c4 += "\n".concat(E3, "+").concat(S3, " ").concat(f4[p4]), R4++;
      else {
        var T4 = s4[p4], P3 = f4[p4], I3 = P3 !== T4 && (!d4(P3, ",") || P3.slice(0, -1) !== T4);
        I3 && d4(T4, ",") && T4.slice(0, -1) === P3 && (I3 = false, P3 += ","), I3 ? (_3 > 1 && p4 > 2 && (_3 > 4 ? (c4 += "\n".concat(m4, "...").concat(S3), u3 = true) : _3 > 3 && (c4 += "\n  ".concat(f4[p4 - 2]), R4++), c4 += "\n  ".concat(f4[p4 - 1]), R4++), a4 = p4, c4 += "\n".concat(E3, "+").concat(S3, " ").concat(P3), o4 += "\n".concat(w3, "-").concat(S3, " ").concat(T4), R4 += 2) : (c4 += o4, o4 = "", 1 !== _3 && 0 !== p4 || (c4 += "\n  ".concat(P3), R4++));
      }
      if (R4 > 20 && p4 < O4 - 2)
        return "".concat(A3).concat(k3, "\n").concat(c4, "\n").concat(m4, "...").concat(S3).concat(o4, "\n") + "".concat(m4, "...").concat(S3);
    }
    return "".concat(A3).concat(u3 ? k3 : "", "\n").concat(c4).concat(o4).concat(i3).concat(g4);
  }
  var R3 = function(t4) {
    function e4(t5) {
      var r5;
      if (!function(t6, e5) {
        if (!(t6 instanceof e5))
          throw new TypeError("Cannot call a class as a function");
      }(this, e4), "object" !== y3(t5) || null === t5)
        throw new v3("options", "Object", t5);
      var o4 = t5.message, i4 = t5.operator, u4 = t5.stackStartFn, l3 = t5.actual, f4 = t5.expected, s4 = Error.stackTraceLimit;
      if (Error.stackTraceLimit = 0, null != o4)
        r5 = c3(this, h4(e4).call(this, String(o4)));
      else if (n3.stderr && n3.stderr.isTTY && (n3.stderr && n3.stderr.getColorDepth && 1 !== n3.stderr.getColorDepth() ? (m4 = "\x1B[34m", E3 = "\x1B[32m", S3 = "\x1B[39m", w3 = "\x1B[31m") : (m4 = "", E3 = "", S3 = "", w3 = "")), "object" === y3(l3) && null !== l3 && "object" === y3(f4) && null !== f4 && "stack" in l3 && l3 instanceof Error && "stack" in f4 && f4 instanceof Error && (l3 = O3(l3), f4 = O3(f4)), "deepStrictEqual" === i4 || "strictEqual" === i4)
        r5 = c3(this, h4(e4).call(this, q3(l3, f4, i4)));
      else if ("notDeepStrictEqual" === i4 || "notStrictEqual" === i4) {
        var p4 = j3[i4], g4 = x3(l3).split("\n");
        if ("notStrictEqual" === i4 && "object" === y3(l3) && null !== l3 && (p4 = j3.notStrictEqualObject), g4.length > 30)
          for (g4[26] = "".concat(m4, "...").concat(S3); g4.length > 27; )
            g4.pop();
        r5 = 1 === g4.length ? c3(this, h4(e4).call(this, "".concat(p4, " ").concat(g4[0]))) : c3(this, h4(e4).call(this, "".concat(p4, "\n\n").concat(g4.join("\n"), "\n")));
      } else {
        var b4 = x3(l3), d5 = "", R4 = j3[i4];
        "notDeepEqual" === i4 || "notEqual" === i4 ? (b4 = "".concat(j3[i4], "\n\n").concat(b4)).length > 1024 && (b4 = "".concat(b4.slice(0, 1021), "...")) : (d5 = "".concat(x3(f4)), b4.length > 512 && (b4 = "".concat(b4.slice(0, 509), "...")), d5.length > 512 && (d5 = "".concat(d5.slice(0, 509), "...")), "deepEqual" === i4 || "equal" === i4 ? b4 = "".concat(R4, "\n\n").concat(b4, "\n\nshould equal\n\n") : d5 = " ".concat(i4, " ").concat(d5)), r5 = c3(this, h4(e4).call(this, "".concat(b4).concat(d5)));
      }
      return Error.stackTraceLimit = s4, r5.generatedMessage = !o4, Object.defineProperty(a3(r5), "name", { value: "AssertionError [ERR_ASSERTION]", enumerable: false, writable: true, configurable: true }), r5.code = "ERR_ASSERTION", r5.actual = l3, r5.expected = f4, r5.operator = i4, Error.captureStackTrace && Error.captureStackTrace(a3(r5), u4), r5.stack, r5.name = "AssertionError", c3(r5);
    }
    var i3, u3;
    return !function(t5, e5) {
      if ("function" != typeof e5 && null !== e5)
        throw new TypeError("Super expression must either be null or a function");
      t5.prototype = Object.create(e5 && e5.prototype, { constructor: { value: t5, writable: true, configurable: true } }), e5 && g3(t5, e5);
    }(e4, t4), i3 = e4, (u3 = [{ key: "toString", value: function() {
      return "".concat(this.name, " [").concat(this.code, "]: ").concat(this.message);
    } }, { key: b3.custom, value: function(t5, e5) {
      return b3(this, function(t6) {
        for (var e6 = 1; e6 < arguments.length; e6++) {
          var n4 = null != arguments[e6] ? arguments[e6] : {}, o4 = Object.keys(n4);
          "function" == typeof Object.getOwnPropertySymbols && (o4 = o4.concat(Object.getOwnPropertySymbols(n4).filter(function(t7) {
            return Object.getOwnPropertyDescriptor(n4, t7).enumerable;
          }))), o4.forEach(function(e7) {
            r4(t6, e7, n4[e7]);
          });
        }
        return t6;
      }({}, e5, { customInspect: false, depth: 0 }));
    } }]) && o3(i3.prototype, u3), e4;
  }(f3(Error));
  return u$5 = R3;
}
function s$3(t4, e4) {
  return function(t5) {
    if (Array.isArray(t5))
      return t5;
  }(t4) || function(t5, e5) {
    var n3 = [], r4 = true, o3 = false, c3 = void 0;
    try {
      for (var a3, i3 = t5[Symbol.iterator](); !(r4 = (a3 = i3.next()).done) && (n3.push(a3.value), !e5 || n3.length !== e5); r4 = true)
        ;
    } catch (t6) {
      o3 = true, c3 = t6;
    } finally {
      try {
        r4 || null == i3.return || i3.return();
      } finally {
        if (o3)
          throw c3;
      }
    }
    return n3;
  }(t4, e4) || function() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }();
}
function p$3(t4) {
  return (p$3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t5) {
    return typeof t5;
  } : function(t5) {
    return t5 && "function" == typeof Symbol && t5.constructor === Symbol && t5 !== Symbol.prototype ? "symbol" : typeof t5;
  })(t4);
}
var g$1 = void 0 !== /a/g.flags;
var h$1 = function(t4) {
  var e4 = [];
  return t4.forEach(function(t5) {
    return e4.push(t5);
  }), e4;
};
var y$2 = function(t4) {
  var e4 = [];
  return t4.forEach(function(t5, n3) {
    return e4.push([n3, t5]);
  }), e4;
};
var b$1 = Object.is ? Object.is : m3;
var v$1 = Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols : function() {
  return [];
};
var d$1 = Number.isNaN ? Number.isNaN : f$5;
function m$2(t4) {
  return t4.call.bind(t4);
}
var E2 = m$2(Object.prototype.hasOwnProperty);
var w$1 = m$2(Object.prototype.propertyIsEnumerable);
var S2 = m$2(Object.prototype.toString);
var j$1 = X.types;
var O2 = j$1.isAnyArrayBuffer;
var x2 = j$1.isArrayBufferView;
var q2 = j$1.isDate;
var R2 = j$1.isMap;
var A$1 = j$1.isRegExp;
var k2 = j$1.isSet;
var _2 = j$1.isNativeError;
var T3 = j$1.isBoxedPrimitive;
var P$1 = j$1.isNumberObject;
var I2 = j$1.isStringObject;
var D2 = j$1.isBooleanObject;
var F2 = j$1.isBigIntObject;
var N$1 = j$1.isSymbolObject;
var L2 = j$1.isFloat32Array;
var M2 = j$1.isFloat64Array;
function U2(t4) {
  if (0 === t4.length || t4.length > 10)
    return true;
  for (var e4 = 0; e4 < t4.length; e4++) {
    var n3 = t4.charCodeAt(e4);
    if (n3 < 48 || n3 > 57)
      return true;
  }
  return 10 === t4.length && t4 >= Math.pow(2, 32);
}
function G2(t4) {
  return Object.keys(t4).filter(U2).concat(v$1(t4).filter(Object.prototype.propertyIsEnumerable.bind(t4)));
}
function V2(t4, e4) {
  if (t4 === e4)
    return 0;
  for (var n3 = t4.length, r4 = e4.length, o3 = 0, c3 = Math.min(n3, r4); o3 < c3; ++o3)
    if (t4[o3] !== e4[o3]) {
      n3 = t4[o3], r4 = e4[o3];
      break;
    }
  return n3 < r4 ? -1 : r4 < n3 ? 1 : 0;
}
function B2(t4, e4, n3, r4) {
  if (t4 === e4)
    return 0 !== t4 || (!n3 || b$1(t4, e4));
  if (n3) {
    if ("object" !== p$3(t4))
      return "number" == typeof t4 && d$1(t4) && d$1(e4);
    if ("object" !== p$3(e4) || null === t4 || null === e4)
      return false;
    if (Object.getPrototypeOf(t4) !== Object.getPrototypeOf(e4))
      return false;
  } else {
    if (null === t4 || "object" !== p$3(t4))
      return (null === e4 || "object" !== p$3(e4)) && t4 == e4;
    if (null === e4 || "object" !== p$3(e4))
      return false;
  }
  var o3, c3, a3, i3, u3 = S2(t4);
  if (u3 !== S2(e4))
    return false;
  if (Array.isArray(t4)) {
    if (t4.length !== e4.length)
      return false;
    var l3 = G2(t4), f3 = G2(e4);
    return l3.length === f3.length && C2(t4, e4, n3, r4, 1, l3);
  }
  if ("[object Object]" === u3 && (!R2(t4) && R2(e4) || !k2(t4) && k2(e4)))
    return false;
  if (q2(t4)) {
    if (!q2(e4) || Date.prototype.getTime.call(t4) !== Date.prototype.getTime.call(e4))
      return false;
  } else if (A$1(t4)) {
    if (!A$1(e4) || (a3 = t4, i3 = e4, !(g$1 ? a3.source === i3.source && a3.flags === i3.flags : RegExp.prototype.toString.call(a3) === RegExp.prototype.toString.call(i3))))
      return false;
  } else if (_2(t4) || t4 instanceof Error) {
    if (t4.message !== e4.message || t4.name !== e4.name)
      return false;
  } else {
    if (x2(t4)) {
      if (n3 || !L2(t4) && !M2(t4)) {
        if (!function(t5, e5) {
          return t5.byteLength === e5.byteLength && 0 === V2(new Uint8Array(t5.buffer, t5.byteOffset, t5.byteLength), new Uint8Array(e5.buffer, e5.byteOffset, e5.byteLength));
        }(t4, e4))
          return false;
      } else if (!function(t5, e5) {
        if (t5.byteLength !== e5.byteLength)
          return false;
        for (var n4 = 0; n4 < t5.byteLength; n4++)
          if (t5[n4] !== e5[n4])
            return false;
        return true;
      }(t4, e4))
        return false;
      var s3 = G2(t4), h4 = G2(e4);
      return s3.length === h4.length && C2(t4, e4, n3, r4, 0, s3);
    }
    if (k2(t4))
      return !(!k2(e4) || t4.size !== e4.size) && C2(t4, e4, n3, r4, 2);
    if (R2(t4))
      return !(!R2(e4) || t4.size !== e4.size) && C2(t4, e4, n3, r4, 3);
    if (O2(t4)) {
      if (c3 = e4, (o3 = t4).byteLength !== c3.byteLength || 0 !== V2(new Uint8Array(o3), new Uint8Array(c3)))
        return false;
    } else if (T3(t4) && !function(t5, e5) {
      return P$1(t5) ? P$1(e5) && b$1(Number.prototype.valueOf.call(t5), Number.prototype.valueOf.call(e5)) : I2(t5) ? I2(e5) && String.prototype.valueOf.call(t5) === String.prototype.valueOf.call(e5) : D2(t5) ? D2(e5) && Boolean.prototype.valueOf.call(t5) === Boolean.prototype.valueOf.call(e5) : F2(t5) ? F2(e5) && BigInt.prototype.valueOf.call(t5) === BigInt.prototype.valueOf.call(e5) : N$1(e5) && Symbol.prototype.valueOf.call(t5) === Symbol.prototype.valueOf.call(e5);
    }(t4, e4))
      return false;
  }
  return C2(t4, e4, n3, r4, 0);
}
function z2(t4, e4) {
  return e4.filter(function(e5) {
    return w$1(t4, e5);
  });
}
function C2(t4, e4, n3, r4, o3, c3) {
  if (5 === arguments.length) {
    c3 = Object.keys(t4);
    var a3 = Object.keys(e4);
    if (c3.length !== a3.length)
      return false;
  }
  for (var i3 = 0; i3 < c3.length; i3++)
    if (!E2(e4, c3[i3]))
      return false;
  if (n3 && 5 === arguments.length) {
    var u3 = v$1(t4);
    if (0 !== u3.length) {
      var l3 = 0;
      for (i3 = 0; i3 < u3.length; i3++) {
        var f3 = u3[i3];
        if (w$1(t4, f3)) {
          if (!w$1(e4, f3))
            return false;
          c3.push(f3), l3++;
        } else if (w$1(e4, f3))
          return false;
      }
      var s3 = v$1(e4);
      if (u3.length !== s3.length && z2(e4, s3).length !== l3)
        return false;
    } else {
      var p3 = v$1(e4);
      if (0 !== p3.length && 0 !== z2(e4, p3).length)
        return false;
    }
  }
  if (0 === c3.length && (0 === o3 || 1 === o3 && 0 === t4.length || 0 === t4.size))
    return true;
  if (void 0 === r4)
    r4 = { val1: /* @__PURE__ */ new Map(), val2: /* @__PURE__ */ new Map(), position: 0 };
  else {
    var g3 = r4.val1.get(t4);
    if (void 0 !== g3) {
      var h4 = r4.val2.get(e4);
      if (void 0 !== h4)
        return g3 === h4;
    }
    r4.position++;
  }
  r4.val1.set(t4, r4.position), r4.val2.set(e4, r4.position);
  var y3 = Q2(t4, e4, n3, c3, r4, o3);
  return r4.val1.delete(t4), r4.val2.delete(e4), y3;
}
function Y2(t4, e4, n3, r4) {
  for (var o3 = h$1(t4), c3 = 0; c3 < o3.length; c3++) {
    var a3 = o3[c3];
    if (B2(e4, a3, n3, r4))
      return t4.delete(a3), true;
  }
  return false;
}
function W2(t4) {
  switch (p$3(t4)) {
    case "undefined":
      return null;
    case "object":
      return;
    case "symbol":
      return false;
    case "string":
      t4 = +t4;
    case "number":
      if (d$1(t4))
        return false;
  }
  return true;
}
function H2(t4, e4, n3) {
  var r4 = W2(n3);
  return null != r4 ? r4 : e4.has(r4) && !t4.has(r4);
}
function J2(t4, e4, n3, r4, o3) {
  var c3 = W2(n3);
  if (null != c3)
    return c3;
  var a3 = e4.get(c3);
  return !(void 0 === a3 && !e4.has(c3) || !B2(r4, a3, false, o3)) && (!t4.has(c3) && B2(r4, a3, false, o3));
}
function K2(t4, e4, n3, r4, o3, c3) {
  for (var a3 = h$1(t4), i3 = 0; i3 < a3.length; i3++) {
    var u3 = a3[i3];
    if (B2(n3, u3, o3, c3) && B2(r4, e4.get(u3), o3, c3))
      return t4.delete(u3), true;
  }
  return false;
}
function Q2(t4, e4, n3, r4, o3, c3) {
  var a3 = 0;
  if (2 === c3) {
    if (!function(t5, e5, n4, r5) {
      for (var o4 = null, c4 = h$1(t5), a4 = 0; a4 < c4.length; a4++) {
        var i4 = c4[a4];
        if ("object" === p$3(i4) && null !== i4)
          null === o4 && (o4 = /* @__PURE__ */ new Set()), o4.add(i4);
        else if (!e5.has(i4)) {
          if (n4)
            return false;
          if (!H2(t5, e5, i4))
            return false;
          null === o4 && (o4 = /* @__PURE__ */ new Set()), o4.add(i4);
        }
      }
      if (null !== o4) {
        for (var u4 = h$1(e5), l4 = 0; l4 < u4.length; l4++) {
          var f3 = u4[l4];
          if ("object" === p$3(f3) && null !== f3) {
            if (!Y2(o4, f3, n4, r5))
              return false;
          } else if (!n4 && !t5.has(f3) && !Y2(o4, f3, n4, r5))
            return false;
        }
        return 0 === o4.size;
      }
      return true;
    }(t4, e4, n3, o3))
      return false;
  } else if (3 === c3) {
    if (!function(t5, e5, n4, r5) {
      for (var o4 = null, c4 = y$2(t5), a4 = 0; a4 < c4.length; a4++) {
        var i4 = s$3(c4[a4], 2), u4 = i4[0], l4 = i4[1];
        if ("object" === p$3(u4) && null !== u4)
          null === o4 && (o4 = /* @__PURE__ */ new Set()), o4.add(u4);
        else {
          var f3 = e5.get(u4);
          if (void 0 === f3 && !e5.has(u4) || !B2(l4, f3, n4, r5)) {
            if (n4)
              return false;
            if (!J2(t5, e5, u4, l4, r5))
              return false;
            null === o4 && (o4 = /* @__PURE__ */ new Set()), o4.add(u4);
          }
        }
      }
      if (null !== o4) {
        for (var g3 = y$2(e5), h4 = 0; h4 < g3.length; h4++) {
          var b3 = s$3(g3[h4], 2), v3 = (u4 = b3[0], b3[1]);
          if ("object" === p$3(u4) && null !== u4) {
            if (!K2(o4, t5, u4, v3, n4, r5))
              return false;
          } else if (!(n4 || t5.has(u4) && B2(t5.get(u4), v3, false, r5) || K2(o4, t5, u4, v3, false, r5)))
            return false;
        }
        return 0 === o4.size;
      }
      return true;
    }(t4, e4, n3, o3))
      return false;
  } else if (1 === c3)
    for (; a3 < t4.length; a3++) {
      if (!E2(t4, a3)) {
        if (E2(e4, a3))
          return false;
        for (var i3 = Object.keys(t4); a3 < i3.length; a3++) {
          var u3 = i3[a3];
          if (!E2(e4, u3) || !B2(t4[u3], e4[u3], n3, o3))
            return false;
        }
        return i3.length === Object.keys(e4).length;
      }
      if (!E2(e4, a3) || !B2(t4[a3], e4[a3], n3, o3))
        return false;
    }
  for (a3 = 0; a3 < r4.length; a3++) {
    var l3 = r4[a3];
    if (!B2(t4[l3], e4[l3], n3, o3))
      return false;
  }
  return true;
}
var X2 = { isDeepEqual: function(t4, e4) {
  return B2(t4, e4, false);
}, isDeepStrictEqual: function(t4, e4) {
  return B2(t4, e4, true);
} };
var Z2 = {};
var $$1 = false;
function tt() {
  if ($$1)
    return Z2;
  $$1 = true;
  var o3 = T;
  function c3(t4) {
    return (c3 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(t5) {
      return typeof t5;
    } : function(t5) {
      return t5 && "function" == typeof Symbol && t5.constructor === Symbol && t5 !== Symbol.prototype ? "symbol" : typeof t5;
    })(t4);
  }
  var a3, u3, l3 = i$5().codes, s3 = l3.ERR_AMBIGUOUS_ARGUMENT, p3 = l3.ERR_INVALID_ARG_TYPE, g3 = l3.ERR_INVALID_ARG_VALUE, h4 = l3.ERR_INVALID_RETURN_VALUE, y3 = l3.ERR_MISSING_ARGS, b3 = f$6(), v3 = X.inspect, d4 = X.types, m$12 = d4.isPromise, E3 = d4.isRegExp, w3 = Object.assign ? Object.assign : r3.assign, S3 = Object.is ? Object.is : m3;
  function j3() {
    a3 = X2.isDeepEqual, u3 = X2.isDeepStrictEqual;
  }
  var O3 = false, x3 = Z2 = k3, q3 = {};
  function R3(t4) {
    if (t4.message instanceof Error)
      throw t4.message;
    throw new b3(t4);
  }
  function A3(t4, e4, n3, r4) {
    if (!n3) {
      var o4 = false;
      if (0 === e4)
        o4 = true, r4 = "No value argument passed to `assert.ok()`";
      else if (r4 instanceof Error)
        throw r4;
      var c4 = new b3({ actual: n3, expected: true, message: r4, operator: "==", stackStartFn: t4 });
      throw c4.generatedMessage = o4, c4;
    }
  }
  function k3() {
    for (var t4 = arguments.length, e4 = new Array(t4), n3 = 0; n3 < t4; n3++)
      e4[n3] = arguments[n3];
    A3.apply(void 0, [k3, e4.length].concat(e4));
  }
  x3.fail = function t4(e4, n3, r4, c4, a4) {
    var i3, u4 = arguments.length;
    if (0 === u4)
      i3 = "Failed";
    else if (1 === u4)
      r4 = e4, e4 = void 0;
    else {
      if (false === O3) {
        O3 = true;
        var l4 = o3.emitWarning ? o3.emitWarning : console.warn.bind(console);
        l4("assert.fail() with more than one argument is deprecated. Please use assert.strictEqual() instead or only pass a message.", "DeprecationWarning", "DEP0094");
      }
      2 === u4 && (c4 = "!=");
    }
    if (r4 instanceof Error)
      throw r4;
    var f3 = { actual: e4, expected: n3, operator: void 0 === c4 ? "fail" : c4, stackStartFn: a4 || t4 };
    void 0 !== r4 && (f3.message = r4);
    var s4 = new b3(f3);
    throw i3 && (s4.message = i3, s4.generatedMessage = true), s4;
  }, x3.AssertionError = b3, x3.ok = k3, x3.equal = function t4(e4, n3, r4) {
    if (arguments.length < 2)
      throw new y3("actual", "expected");
    e4 != n3 && R3({ actual: e4, expected: n3, message: r4, operator: "==", stackStartFn: t4 });
  }, x3.notEqual = function t4(e4, n3, r4) {
    if (arguments.length < 2)
      throw new y3("actual", "expected");
    e4 == n3 && R3({ actual: e4, expected: n3, message: r4, operator: "!=", stackStartFn: t4 });
  }, x3.deepEqual = function t4(e4, n3, r4) {
    if (arguments.length < 2)
      throw new y3("actual", "expected");
    void 0 === a3 && j3(), a3(e4, n3) || R3({ actual: e4, expected: n3, message: r4, operator: "deepEqual", stackStartFn: t4 });
  }, x3.notDeepEqual = function t4(e4, n3, r4) {
    if (arguments.length < 2)
      throw new y3("actual", "expected");
    void 0 === a3 && j3(), a3(e4, n3) && R3({ actual: e4, expected: n3, message: r4, operator: "notDeepEqual", stackStartFn: t4 });
  }, x3.deepStrictEqual = function t4(e4, n3, r4) {
    if (arguments.length < 2)
      throw new y3("actual", "expected");
    void 0 === a3 && j3(), u3(e4, n3) || R3({ actual: e4, expected: n3, message: r4, operator: "deepStrictEqual", stackStartFn: t4 });
  }, x3.notDeepStrictEqual = function t4(e4, n3, r4) {
    if (arguments.length < 2)
      throw new y3("actual", "expected");
    void 0 === a3 && j3();
    u3(e4, n3) && R3({ actual: e4, expected: n3, message: r4, operator: "notDeepStrictEqual", stackStartFn: t4 });
  }, x3.strictEqual = function t4(e4, n3, r4) {
    if (arguments.length < 2)
      throw new y3("actual", "expected");
    S3(e4, n3) || R3({ actual: e4, expected: n3, message: r4, operator: "strictEqual", stackStartFn: t4 });
  }, x3.notStrictEqual = function t4(e4, n3, r4) {
    if (arguments.length < 2)
      throw new y3("actual", "expected");
    S3(e4, n3) && R3({ actual: e4, expected: n3, message: r4, operator: "notStrictEqual", stackStartFn: t4 });
  };
  var _3 = function t4(e4, n3, r4) {
    var o4 = this;
    !function(t5, e5) {
      if (!(t5 instanceof e5))
        throw new TypeError("Cannot call a class as a function");
    }(this, t4), n3.forEach(function(t5) {
      t5 in e4 && (void 0 !== r4 && "string" == typeof r4[t5] && E3(e4[t5]) && e4[t5].test(r4[t5]) ? o4[t5] = r4[t5] : o4[t5] = e4[t5]);
    });
  };
  function T4(t4, e4, n3, r4, o4, c4) {
    if (!(n3 in t4) || !u3(t4[n3], e4[n3])) {
      if (!r4) {
        var a4 = new _3(t4, o4), i3 = new _3(e4, o4, t4), l4 = new b3({ actual: a4, expected: i3, operator: "deepStrictEqual", stackStartFn: c4 });
        throw l4.actual = t4, l4.expected = e4, l4.operator = c4.name, l4;
      }
      R3({ actual: t4, expected: e4, message: r4, operator: c4.name, stackStartFn: c4 });
    }
  }
  function P3(t4, e4, n3, r4) {
    if ("function" != typeof e4) {
      if (E3(e4))
        return e4.test(t4);
      if (2 === arguments.length)
        throw new p3("expected", ["Function", "RegExp"], e4);
      if ("object" !== c3(t4) || null === t4) {
        var o4 = new b3({ actual: t4, expected: e4, message: n3, operator: "deepStrictEqual", stackStartFn: r4 });
        throw o4.operator = r4.name, o4;
      }
      var i3 = Object.keys(e4);
      if (e4 instanceof Error)
        i3.push("name", "message");
      else if (0 === i3.length)
        throw new g3("error", e4, "may not be an empty object");
      return void 0 === a3 && j3(), i3.forEach(function(o5) {
        "string" == typeof t4[o5] && E3(e4[o5]) && e4[o5].test(t4[o5]) || T4(t4, e4, o5, n3, i3, r4);
      }), true;
    }
    return void 0 !== e4.prototype && t4 instanceof e4 || !Error.isPrototypeOf(e4) && true === e4.call({}, t4);
  }
  function I3(t4) {
    if ("function" != typeof t4)
      throw new p3("fn", "Function", t4);
    try {
      t4();
    } catch (t5) {
      return t5;
    }
    return q3;
  }
  function D3(t4) {
    return m$12(t4) || null !== t4 && "object" === c3(t4) && "function" == typeof t4.then && "function" == typeof t4.catch;
  }
  function F3(t4) {
    return Promise.resolve().then(function() {
      var e4;
      if ("function" == typeof t4) {
        if (!D3(e4 = t4()))
          throw new h4("instance of Promise", "promiseFn", e4);
      } else {
        if (!D3(t4))
          throw new p3("promiseFn", ["Function", "Promise"], t4);
        e4 = t4;
      }
      return Promise.resolve().then(function() {
        return e4;
      }).then(function() {
        return q3;
      }).catch(function(t5) {
        return t5;
      });
    });
  }
  function N3(t4, e4, n3, r4) {
    if ("string" == typeof n3) {
      if (4 === arguments.length)
        throw new p3("error", ["Object", "Error", "Function", "RegExp"], n3);
      if ("object" === c3(e4) && null !== e4) {
        if (e4.message === n3)
          throw new s3("error/message", 'The error message "'.concat(e4.message, '" is identical to the message.'));
      } else if (e4 === n3)
        throw new s3("error/message", 'The error "'.concat(e4, '" is identical to the message.'));
      r4 = n3, n3 = void 0;
    } else if (null != n3 && "object" !== c3(n3) && "function" != typeof n3)
      throw new p3("error", ["Object", "Error", "Function", "RegExp"], n3);
    if (e4 === q3) {
      var o4 = "";
      n3 && n3.name && (o4 += " (".concat(n3.name, ")")), o4 += r4 ? ": ".concat(r4) : ".";
      var a4 = "rejects" === t4.name ? "rejection" : "exception";
      R3({ actual: void 0, expected: n3, operator: t4.name, message: "Missing expected ".concat(a4).concat(o4), stackStartFn: t4 });
    }
    if (n3 && !P3(e4, n3, r4, t4))
      throw e4;
  }
  function L3(t4, e4, n3, r4) {
    if (e4 !== q3) {
      if ("string" == typeof n3 && (r4 = n3, n3 = void 0), !n3 || P3(e4, n3)) {
        var o4 = r4 ? ": ".concat(r4) : ".", c4 = "doesNotReject" === t4.name ? "rejection" : "exception";
        R3({ actual: e4, expected: n3, operator: t4.name, message: "Got unwanted ".concat(c4).concat(o4, "\n") + 'Actual message: "'.concat(e4 && e4.message, '"'), stackStartFn: t4 });
      }
      throw e4;
    }
  }
  function M3() {
    for (var t4 = arguments.length, e4 = new Array(t4), n3 = 0; n3 < t4; n3++)
      e4[n3] = arguments[n3];
    A3.apply(void 0, [M3, e4.length].concat(e4));
  }
  return x3.throws = function t4(e4) {
    for (var n3 = arguments.length, r4 = new Array(n3 > 1 ? n3 - 1 : 0), o4 = 1; o4 < n3; o4++)
      r4[o4 - 1] = arguments[o4];
    N3.apply(void 0, [t4, I3(e4)].concat(r4));
  }, x3.rejects = function t4(e4) {
    for (var n3 = arguments.length, r4 = new Array(n3 > 1 ? n3 - 1 : 0), o4 = 1; o4 < n3; o4++)
      r4[o4 - 1] = arguments[o4];
    return F3(e4).then(function(e5) {
      return N3.apply(void 0, [t4, e5].concat(r4));
    });
  }, x3.doesNotThrow = function t4(e4) {
    for (var n3 = arguments.length, r4 = new Array(n3 > 1 ? n3 - 1 : 0), o4 = 1; o4 < n3; o4++)
      r4[o4 - 1] = arguments[o4];
    L3.apply(void 0, [t4, I3(e4)].concat(r4));
  }, x3.doesNotReject = function t4(e4) {
    for (var n3 = arguments.length, r4 = new Array(n3 > 1 ? n3 - 1 : 0), o4 = 1; o4 < n3; o4++)
      r4[o4 - 1] = arguments[o4];
    return F3(e4).then(function(e5) {
      return L3.apply(void 0, [t4, e5].concat(r4));
    });
  }, x3.ifError = function t4(e4) {
    if (null != e4) {
      var n3 = "ifError got unwanted exception: ";
      "object" === c3(e4) && "string" == typeof e4.message ? 0 === e4.message.length && e4.constructor ? n3 += e4.constructor.name : n3 += e4.message : n3 += v3(e4);
      var r4 = new b3({ actual: e4, expected: null, operator: "ifError", message: n3, stackStartFn: t4 }), o4 = e4.stack;
      if ("string" == typeof o4) {
        var a4 = o4.split("\n");
        a4.shift();
        for (var i3 = r4.stack.split("\n"), u4 = 0; u4 < a4.length; u4++) {
          var l4 = i3.indexOf(a4[u4]);
          if (-1 !== l4) {
            i3 = i3.slice(0, l4);
            break;
          }
        }
        r4.stack = "".concat(i3.join("\n"), "\n").concat(a4.join("\n"));
      }
      throw r4;
    }
  }, x3.strict = w3(M3, x3, { equal: x3.strictEqual, deepEqual: x3.deepStrictEqual, notEqual: x3.notStrictEqual, notDeepEqual: x3.notDeepStrictEqual }), x3.strict.strict = x3.strict, Z2;
}
var et = tt();
et.AssertionError;
et.deepEqual;
et.deepStrictEqual;
et.doesNotReject;
et.doesNotThrow;
et.equal;
et.fail;
et.ifError;
et.notDeepEqual;
et.notDeepStrictEqual;
et.notEqual;
et.notStrictEqual;
et.ok;
et.rejects;
et.strict;
et.strictEqual;
et.throws;
et.AssertionError;
et.deepEqual;
et.deepStrictEqual;
et.doesNotReject;
et.doesNotThrow;
et.equal;
et.fail;
et.ifError;
et.notDeepEqual;
et.notDeepStrictEqual;
et.notEqual;
et.notStrictEqual;
et.ok;
et.rejects;
et.strict;
et.strictEqual;
et.throws;
var AssertionError = et.AssertionError;
var deepEqual = et.deepEqual;
var deepStrictEqual = et.deepStrictEqual;
var doesNotReject = et.doesNotReject;
var doesNotThrow = et.doesNotThrow;
var equal = et.equal;
var fail = et.fail;
var ifError = et.ifError;
var notDeepEqual = et.notDeepEqual;
var notDeepStrictEqual = et.notDeepStrictEqual;
var notEqual = et.notEqual;
var notStrictEqual = et.notStrictEqual;
var ok = et.ok;
var rejects = et.rejects;
var strict = et.strict;
var strictEqual = et.strictEqual;
var throws = et.throws;

// src/p2sh.ts
var P2SH = "P2SH";
function estimateMultisigP2SHTransactionVSize(config) {
  const baseSize = 41 * config.numInputs + 34 * config.numOutputs + 30;
  const signatureLength = 72 + 1;
  const scriptOverhead = 4;
  const keylength = 33 + 1;
  const sigSize = signatureLength * config.m * config.numInputs + keylength * config.n * config.numInputs + scriptOverhead * config.numInputs;
  const vsize = baseSize + sigSize;
  return vsize;
}

// src/p2sh_p2wsh.ts
var P2SH_P2WSH = "P2SH-P2WSH";
function estimateMultisigP2SH_P2WSHTransactionVSize(config) {
  const baseSize = 76 * config.numInputs + 34 * config.numOutputs + 30;
  const signatureLength = 72;
  const overhead = 6;
  const keylength = 33;
  const witnessSize = signatureLength * config.m * config.numInputs + keylength * config.n * config.numInputs + overhead * config.numInputs;
  const vsize = Math.ceil(0.75 * baseSize + 0.25 * (baseSize + witnessSize));
  return vsize;
}

// src/p2wsh.ts
import { encoding } from "bufio";
var P2WSH = "P2WSH";
function txinSize() {
  const PREVHASH_BYTES = 32;
  const PREV_INDEX_BYTES = 4;
  const SCRIPT_LENGTH_BYTES = 1;
  const SEQUENCE_BYTES = 4;
  return PREVHASH_BYTES + PREV_INDEX_BYTES + SEQUENCE_BYTES + SCRIPT_LENGTH_BYTES;
}
function txoutSize(scriptPubkeySize = 34) {
  const VAL_BYTES = 8;
  const scriptLengthBytes = encoding.sizeVarint(scriptPubkeySize);
  return VAL_BYTES + scriptLengthBytes + scriptPubkeySize;
}
function getRedeemScriptSize(n3) {
  const OP_M_BYTES = 1;
  const OP_N_BYTES = 1;
  const opDataBytes = n3;
  const pubkeyBytes = 33 * n3;
  const OP_CHECKMULTISIG_BYTES = 1;
  return OP_M_BYTES + opDataBytes + pubkeyBytes + OP_N_BYTES + OP_CHECKMULTISIG_BYTES;
}
function getWitnessSize(m4, n3) {
  const OP_NULL_BYTES = 1;
  const opDataBytes = m4;
  const signaturesSize = 73 * m4;
  const REDEEM_SCRIPT_LENGTH = 1;
  const redeemScriptSize = getRedeemScriptSize(n3);
  const WITNESS_ITEMS_COUNT = encoding.sizeVarint(1 + m4 + 1);
  return WITNESS_ITEMS_COUNT + OP_NULL_BYTES + opDataBytes + signaturesSize + REDEEM_SCRIPT_LENGTH + redeemScriptSize;
}
function calculateBase(inputsCount, outputsCount) {
  let total = 0;
  total += 4;
  total += 4;
  total += encoding.sizeVarint(inputsCount);
  total += inputsCount * txinSize();
  total += encoding.sizeVarint(outputsCount);
  total += outputsCount * txoutSize();
  return total;
}
function calculateTotalWitnessSize({ numInputs, m: m4, n: n3 }) {
  let total = 0;
  total += 1;
  total += 1;
  total += encoding.sizeVarint(numInputs);
  total += numInputs * getWitnessSize(m4, n3);
  return total;
}
function calculateVSize(baseSize, witnessSize) {
  const WITNESS_SCALE_FACTOR = 4;
  const totalSize = baseSize + witnessSize;
  const txWeight = baseSize * 3 + totalSize;
  return Math.ceil(txWeight / WITNESS_SCALE_FACTOR);
}
function estimateMultisigP2WSHTransactionVSize(config) {
  const baseSize = calculateBase(config.numInputs, config.numOutputs);
  const witnessSize = calculateTotalWitnessSize(config);
  return calculateVSize(baseSize, witnessSize);
}

// src/paths.ts
var HARDENING_OFFSET = Math.pow(2, 31);
var BIP32_PATH_REGEX = /^(m\/)?(\d+'?\/)*\d+'?$/;
var BIP32_HARDENED_PATH_REGEX = /^(m\/)?(\d+'\/)*\d+'$/;
var BIP32_UNHARDENED_PATH_REGEX = /^(m\/)?(\d+\/)*\d+$/;
var BIP32_INDEX_REGEX = /^\d+'?$/;
var MAX_BIP32_HARDENED_NODE_INDEX = Math.pow(2, 31) - 1;
var MAX_BIP32_NODE_INDEX = Math.pow(2, 32) - 1;
function hardenedBIP32Index(index) {
  return parseInt(index, 10) + HARDENING_OFFSET;
}
function bip32PathToSequence(pathString) {
  const pathSegments = pathString.split("/").splice(1);
  return pathSegments.map((pathSegment) => {
    if (pathSegment.substr(-1) === "'") {
      return parseInt(pathSegment.slice(0, -1), 10) + HARDENING_OFFSET;
    } else {
      return parseInt(pathSegment, 10);
    }
  });
}
function bip32SequenceToPath(sequence) {
  return "m/" + sequence.map((index) => {
    if (index >= HARDENING_OFFSET) {
      return `${index - HARDENING_OFFSET}'`;
    } else {
      return index.toString();
    }
  }).join("/");
}
function validateBIP32Path(pathString, options) {
  if (pathString === null || pathString === void 0 || pathString === "") {
    return "BIP32 path cannot be blank.";
  }
  if (!pathString.match(BIP32_PATH_REGEX)) {
    return "BIP32 path is invalid.";
  }
  if (options && options.mode === "hardened") {
    if (!pathString.match(BIP32_HARDENED_PATH_REGEX)) {
      return "BIP32 path must be fully-hardened.";
    }
  }
  if (options && options.mode === "unhardened") {
    if (!pathString.match(BIP32_UNHARDENED_PATH_REGEX)) {
      return "BIP32 path cannot include hardened segments.";
    }
  }
  const segmentStrings = pathString.toLowerCase().split("/");
  return validateBIP32PathSegments(segmentStrings.slice(1));
}
function validateBIP32PathSegments(segmentStrings) {
  for (let i3 = 0; i3 < segmentStrings.length; i3++) {
    const indexString = segmentStrings[i3];
    const error = validateBIP32Index(indexString);
    if (error !== "") {
      return error;
    }
  }
  return "";
}
function validateBIP32Index(indexString, options) {
  if (indexString === null || indexString === void 0 || indexString === "") {
    return "BIP32 index cannot be blank.";
  }
  if (!indexString.match(BIP32_INDEX_REGEX)) {
    return "BIP32 index is invalid.";
  }
  let numberString, hardened;
  if (indexString.substr(indexString.length - 1) === "'") {
    numberString = indexString.substr(0, indexString.length - 1);
    hardened = true;
  } else {
    numberString = indexString;
    hardened = false;
  }
  const numberError = "Invalid BIP32 index.";
  const number = parseInt(numberString, 10);
  if (Number.isNaN(number) || number.toString().length !== numberString.length) {
    return numberError;
  }
  if (number > (hardened ? MAX_BIP32_HARDENED_NODE_INDEX : MAX_BIP32_NODE_INDEX)) {
    return "BIP32 index is too high.";
  }
  if (options && options.mode === "hardened") {
    if (!hardened && number <= MAX_BIP32_HARDENED_NODE_INDEX) {
      return "BIP32 index must be hardened.";
    }
  }
  if (options && options.mode === "unhardened") {
    if (hardened || number > MAX_BIP32_HARDENED_NODE_INDEX) {
      return "BIP32 index cannot be hardened.";
    }
  }
  return "";
}
function multisigBIP32Root(addressType, network) {
  const coinPath = network === "mainnet" /* MAINNET */ ? "0'" : "1'";
  switch (addressType) {
    case P2SH:
      return `m/45'/${coinPath}/0'`;
    case P2SH_P2WSH:
      return `m/48'/${coinPath}/0'/1'`;
    case P2WSH:
      return `m/48'/${coinPath}/0'/2'`;
    default:
      return null;
  }
}
function multisigBIP32Path(addressType, network, relativePath = "0") {
  const root = multisigBIP32Root(addressType, network);
  if (root) {
    return root + `/${relativePath}`;
  }
  return null;
}
function getParentBIP32Path(bip32Path) {
  const validated = validateBIP32Path(bip32Path);
  if (validated.length)
    return validated;
  return bip32Path.split("/").slice(0, -1).join("/");
}
function getRelativeBIP32Path(parentBIP32Path, childBIP32Path) {
  if (parentBIP32Path === childBIP32Path)
    return "";
  const validatedParent = validateBIP32Path(parentBIP32Path);
  if (validatedParent.length)
    return validatedParent;
  const validatedChild = validateBIP32Path(childBIP32Path);
  if (validatedChild.length)
    return validatedChild;
  if (!childBIP32Path.startsWith(parentBIP32Path))
    return `The provided bip32Path does not start with the chroot.`;
  return childBIP32Path.slice(parentBIP32Path.length + 1);
}

// src/utils.ts
import BigNumber from "bignumber.js";
import { crypto } from "bitcoinjs-lib-v5";
BigNumber.config({ EXPONENTIAL_AT: 16 });
var VALID_BASE64_REGEX = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/;
var VALID_HEX_REGEX = /^[0-9A-Fa-f]*$/;
function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ("0" + (byte & 255).toString(16)).slice(-2);
  }).join("");
}
function validBase64(inputString) {
  return VALID_BASE64_REGEX.test(inputString);
}
function validateHex(inputString) {
  if (inputString.length % 2 !== 0) {
    return "Invalid hex: odd-length string.";
  }
  if (!VALID_HEX_REGEX.test(inputString)) {
    return "Invalid hex: only characters a-f, A-F and 0-9 allowed.";
  }
  return "";
}
function satoshisToBitcoins(satoshis) {
  const originalValue = new BigNumber(satoshis);
  const roundedValue = originalValue.integerValue(BigNumber.ROUND_DOWN);
  return roundedValue.shiftedBy(-8).toString();
}
function bitcoinsToSatoshis(btc) {
  return new BigNumber(btc).shiftedBy(8).integerValue(BigNumber.ROUND_DOWN).toString();
}
var ZERO = new BigNumber(0);
function hash160(buf) {
  return crypto.ripemd160(crypto.sha256(buf));
}

// src/multisig.ts
import { payments } from "bitcoinjs-lib-v5";
var MULTISIG_ADDRESS_TYPES = {
  P2SH,
  P2SH_P2WSH,
  P2WSH
};
function generateMultisigFromPublicKeys(network, addressType, requiredSigners, ...publicKeys) {
  const multisig = payments.p2ms({
    m: requiredSigners,
    pubkeys: publicKeys.map((hex) => Buffer.from(hex, "hex")),
    network: networkData(network)
  });
  return generateMultisigFromRaw(addressType, multisig);
}
function generateMultisigFromHex(network, addressType, multisigScriptHex) {
  const multisig = payments.p2ms({
    output: Buffer.from(multisigScriptHex, "hex"),
    network: networkData(network)
  });
  return generateMultisigFromRaw(addressType, multisig);
}
function generateMultisigFromRaw(addressType, multisig) {
  switch (addressType) {
    case P2SH:
      return payments.p2sh({ redeem: multisig });
    case P2SH_P2WSH:
      return payments.p2sh({
        redeem: payments.p2wsh({ redeem: multisig })
      });
    case P2WSH:
      return payments.p2wsh({ redeem: multisig });
    default:
      return null;
  }
}
function multisigAddressType(multisig) {
  if (multisig.redeem.redeem) {
    return P2SH_P2WSH;
  } else {
    if (multisig.address.match(/^(tb|bc)/)) {
      return P2WSH;
    } else {
      return P2SH;
    }
  }
}
function multisigRequiredSigners(multisig) {
  return multisigAddressType(multisig) === P2SH_P2WSH ? multisig.redeem.redeem.m : multisig.redeem.m;
}
function multisigTotalSigners(multisig) {
  return multisigAddressType(multisig) === P2SH_P2WSH ? multisig.redeem.redeem.n : multisig.redeem.n;
}
function multisigScript(multisig) {
  switch (multisigAddressType(multisig)) {
    case P2SH:
      return multisigRedeemScript(multisig);
    case P2SH_P2WSH:
      return multisigWitnessScript(multisig);
    case P2WSH:
      return multisigWitnessScript(multisig);
    default:
      return null;
  }
}
function multisigRedeemScript(multisig) {
  switch (multisigAddressType(multisig)) {
    case P2SH:
      return multisig.redeem;
    case P2SH_P2WSH:
      return multisig.redeem;
    case P2WSH:
      return null;
    default:
      return null;
  }
}
function multisigWitnessScript(multisig) {
  switch (multisigAddressType(multisig)) {
    case P2SH:
      return null;
    case P2SH_P2WSH:
      return multisig.redeem.redeem;
    case P2WSH:
      return multisig.redeem;
    default:
      return null;
  }
}
function multisigPublicKeys(multisig) {
  return (multisigAddressType(multisig) === P2SH ? multisigRedeemScript(multisig) : multisigWitnessScript(multisig)).pubkeys.map(toHexString);
}
function multisigAddress(multisig) {
  return multisig.address;
}
function multisigBraidDetails(multisig) {
  return multisig.braidDetails ? multisig.braidDetails : null;
}

// src/keys.ts
import { ECPair } from "bitcoinjs-lib-v5";
import * as bip32 from "bip32";
import bs58check from "bs58check";
import { Struct } from "bufio";
var EXTENDED_PUBLIC_KEY_VERSIONS = {
  xpub: "0488b21e",
  ypub: "049d7cb2",
  zpub: "04b24746",
  Ypub: "0295b43f",
  Zpub: "02aa7ed3",
  tpub: "043587cf",
  upub: "044a5262",
  vpub: "045f1cf6",
  Upub: "024289ef",
  Vpub: "02575483"
};
function validatePrefix(prefix) {
  if (!EXTENDED_PUBLIC_KEY_VERSIONS[prefix]) {
    throw new Error(`Invalid prefix "${prefix}" for extended public key.`);
  }
  return null;
}
function validateRootFingerprint(rootFingerprint) {
  et(
    typeof rootFingerprint === "string",
    "Root fingerprint must be a string."
  );
  et(rootFingerprint.length === 8, `Expected hex value of length 8`);
  const rootXfpError = validateHex(rootFingerprint);
  et(!rootXfpError.length, `Root fingerprint must be valid hex`);
}
var ExtendedPublicKey = class _ExtendedPublicKey extends Struct {
  path;
  sequence;
  index;
  depth;
  chaincode;
  pubkey;
  parentFingerprint;
  network;
  version;
  rootFingerprint;
  base58String;
  constructor(options) {
    super();
    if (!options || !Object.keys(options).length) {
      return this;
    }
    if (options.path) {
      const pathError = validateBIP32Path(options.path);
      et(!pathError.length, pathError);
      this.path = options.path;
      this.sequence = bip32PathToSequence(this.path);
      this.index = this.sequence[this.sequence.length - 1];
      this.depth = this.path.split("/").length - 1;
    } else {
      et(
        options.depth !== void 0 && options.index !== void 0 && options.depth >= 0 && options.index >= 0,
        "Either an absolute bip32 path or index and depth are required to create ExtendedPublicKey"
      );
      this.depth = options.depth;
      this.index = options.index;
    }
    et(options.pubkey, "pubkey required to create ExtendedPublicKey");
    const pubKeyError = validatePublicKey(options.pubkey);
    et(!pubKeyError.length, pubKeyError);
    this.pubkey = isKeyCompressed(options.pubkey) ? options.pubkey : compressPublicKey(options.pubkey);
    et(
      options.chaincode && options.chaincode.length === 64,
      "xpub derivation requires 32-byte chaincode"
    );
    const chaincodeError = validateHex(options.chaincode);
    et(!chaincodeError.length, chaincodeError);
    this.chaincode = options.chaincode;
    et(typeof options.parentFingerprint === "number");
    this.parentFingerprint = options.parentFingerprint;
    if (options.network) {
      et(
        ["mainnet" /* MAINNET */, "testnet" /* TESTNET */].includes(options.network),
        `Expected network to be one of ${"mainnet" /* MAINNET */} or ${"testnet" /* TESTNET */}.`
      );
      this.network = options.network;
    } else {
      this.network = "mainnet" /* MAINNET */;
    }
    this.version = this.network === "mainnet" /* MAINNET */ ? EXTENDED_PUBLIC_KEY_VERSIONS.xpub : EXTENDED_PUBLIC_KEY_VERSIONS.tpub;
    if (options.rootFingerprint) {
      validateRootFingerprint(options.rootFingerprint);
      this.rootFingerprint = options.rootFingerprint;
    }
    this.base58String = this.toBase58();
  }
  /**
   * A Buffer Writer used to encode an xpub. This is called
   * by the `encode` and `toBase58` methods
   * @param {BufferWriter} bw bufio.BufferWriter
   * @returns {void} doesn't have a return, only updates given buffer writer
   */
  write(bw) {
    bw.writeString(this.version, "hex");
    bw.writeU8(this.depth);
    bw.writeU32BE(this.parentFingerprint);
    bw.writeU32BE(this.index);
    bw.writeString(this.chaincode, "hex");
    bw.writeString(this.pubkey, "hex");
  }
  /**
   * Given a network string, will update the network and matching
   * version magic bytes used for generating xpub
   * @param {string} network - one of "mainnet" or "testnet"
   * @returns {void}
   */
  setNetwork(network) {
    et(
      ["mainnet" /* MAINNET */, "testnet" /* TESTNET */, "regtest" /* REGTEST */].includes(network),
      `Expected network to be one of ${"mainnet" /* MAINNET */}, ${"testnet" /* TESTNET */}, or ${"regtest" /* REGTEST */}.`
    );
    this.network = network;
    this.version = this.network === "mainnet" /* MAINNET */ ? EXTENDED_PUBLIC_KEY_VERSIONS.xpub : EXTENDED_PUBLIC_KEY_VERSIONS.tpub;
  }
  /**
   * @param {string} bip32Path set this xpub's path
   * @returns {void}
   */
  setBip32Path(bip32Path) {
    const pathError = validateBIP32Path(bip32Path);
    et(!pathError.length, pathError);
    this.path = bip32Path;
  }
  /**
   * @param {string} rootFingerprint fingerprint of pubkey at m/
   * @returns {void}
   */
  setRootFingerprint(rootFingerprint) {
    validateRootFingerprint(rootFingerprint);
    this.rootFingerprint = rootFingerprint;
  }
  encode(extra) {
    return super.encode(extra);
  }
  /**
   * Return the base58 encoded xpub, adding the
   * @returns {string} base58check encoded xpub, prefixed by network
   */
  toBase58() {
    return bs58check.encode(this.encode());
  }
  /**
   * Return a new Extended Public Key class given
   * an xpub string
   * @param {string} data base58 check encoded xpub
   * @returns {ExtendedPublicKey} new ExtendedPublicKey instance
   */
  static fromBase58(data) {
    return _ExtendedPublicKey.decode(bs58check.decode(data));
  }
  /**
   * Sometimes we hop back and forth between a "Rich ExtendedPublicKey"
   * (a Struct with a couple extra parameters set) and the minimal
   * Struct - let's keep the actual string of the Struct around
   * for easy usage in other functions
   * @returns {void}
   */
  addBase58String() {
    this.base58String = this.toBase58();
  }
  /**
   * Used by the decoder to convert a raw xpub Buffer into
   * an ExtendedPublicKey class
   * @param {BufferReader} br - A bufio.BufferReader
   * @returns {ExtendedPublicKey} new instance of Extended Public Key
   */
  read(br) {
    this.version = br.readString(4, "hex");
    this.depth = br.readU8();
    this.parentFingerprint = br.readU32BE();
    this.index = br.readU32BE();
    this.chaincode = br.readString(32, "hex");
    this.pubkey = br.readString(33, "hex");
    this.base58String = this.toBase58();
    return this;
  }
  static decode(data, extra) {
    return super.decode(data, extra);
  }
};
function convertExtendedPublicKey(extendedPublicKey, targetPrefix) {
  try {
    const sourcePrefix = extendedPublicKey.slice(0, 4);
    validatePrefix(targetPrefix);
    validatePrefix(sourcePrefix);
    const decodedExtendedPublicKey = bs58check.decode(extendedPublicKey.trim());
    const extendedPublicKeyNoPrefix = decodedExtendedPublicKey.slice(4);
    const extendedPublicKeyNewPrefix = Buffer.concat([
      Buffer.from(EXTENDED_PUBLIC_KEY_VERSIONS[targetPrefix], "hex"),
      extendedPublicKeyNoPrefix
    ]);
    return bs58check.encode(extendedPublicKeyNewPrefix);
  } catch (err) {
    const e4 = err;
    throw new Error("Unable to convert extended public key: " + e4.message);
  }
}
function validateExtendedPublicKeyForNetwork(extendedPublicKey, network) {
  let requiredPrefix = "'xpub'";
  const requiresTpub = network === "testnet" /* TESTNET */ || network === "regtest" /* REGTEST */;
  if (requiresTpub) {
    requiredPrefix += " or 'tpub'";
  }
  const prefix = extendedPublicKey.slice(0, 4);
  if (network === "mainnet" /* MAINNET */ && prefix !== "xpub" || requiresTpub && prefix !== "tpub") {
    return `Extended public key must begin with ${requiredPrefix}.`;
  }
  return "";
}
function validateExtendedPublicKey(xpubString, network) {
  if (xpubString === null || xpubString === void 0 || xpubString === "") {
    return "Extended public key cannot be blank.";
  }
  if (xpubString.length < 4) {
    return `Invalid extended public key. Value ${xpubString} is too short`;
  }
  const prefixError = validateExtendedPublicKeyForNetwork(xpubString, network);
  if (prefixError)
    return prefixError;
  if (xpubString.length < 111) {
    return "Extended public key is too short.";
  }
  try {
    ExtendedPublicKey.fromBase58(xpubString);
  } catch (e4) {
    return "Invalid extended public key.";
  }
  return "";
}
function validatePublicKey(pubkeyHex, addressType) {
  if (pubkeyHex === null || pubkeyHex === void 0 || pubkeyHex === "") {
    return "Public key cannot be blank.";
  }
  const error = validateHex(pubkeyHex);
  if (error !== "") {
    return error;
  }
  try {
    ECPair.fromPublicKey(Buffer.from(pubkeyHex, "hex"));
  } catch (e4) {
    return "Invalid public key.";
  }
  if (!isKeyCompressed(pubkeyHex) && addressType && [P2SH_P2WSH, P2WSH].includes(addressType)) {
    return `${addressType} does not support uncompressed public keys.`;
  }
  return "";
}
function compressPublicKey(publicKey) {
  const pubkeyBuffer = Buffer.from(publicKey, "hex");
  const prefix = (pubkeyBuffer[64] & 1) !== 0 ? 3 : 2;
  const prefixBuffer = Buffer.alloc(1);
  prefixBuffer[0] = prefix;
  return Buffer.concat([prefixBuffer, pubkeyBuffer.slice(1, 1 + 32)]).toString(
    "hex"
  );
}
function deriveChildPublicKey(extendedPublicKey, bip32Path, network) {
  if (bip32Path.slice(0, 2) === "m/") {
    return deriveChildPublicKey(extendedPublicKey, bip32Path.slice(2), network);
  }
  const node = bip32.fromBase58(extendedPublicKey, networkData(network));
  const child = node.derivePath(bip32Path);
  return toHexString(child.publicKey);
}
function deriveChildExtendedPublicKey(extendedPublicKey, bip32Path, network) {
  if (bip32Path.slice(0, 2) === "m/") {
    return deriveChildExtendedPublicKey(
      extendedPublicKey,
      bip32Path.slice(2),
      network
    );
  }
  const node = bip32.fromBase58(extendedPublicKey, networkData(network));
  const child = node.derivePath(bip32Path);
  return child.toBase58();
}
function isKeyCompressed(_pubkey) {
  let pubkey = _pubkey;
  if (!Buffer.isBuffer(_pubkey))
    pubkey = Buffer.from(_pubkey, "hex");
  return pubkey.length === 33 && (pubkey[0] === 2 || pubkey[0] === 3);
}
function getFingerprintFromPublicKey(_pubkey) {
  let pubkey = _pubkey;
  if (!isKeyCompressed(_pubkey)) {
    pubkey = compressPublicKey(_pubkey);
  }
  const pubkeyBuffer = Buffer.from(pubkey, "hex");
  const hash = hash160(pubkeyBuffer);
  return (hash[0] << 24 | hash[1] << 16 | hash[2] << 8 | hash[3]) >>> 0;
}
function fingerprintToFixedLengthHex(xfp) {
  return (xfp + 4294967296).toString(16).substr(-8);
}
function extendedPublicKeyRootFingerprint(extendedPublicKey) {
  return extendedPublicKey.rootFingerprint ? extendedPublicKey.rootFingerprint : null;
}
function deriveExtendedPublicKey(bip32Path, pubkey, chaincode, parentFingerprint, network = "mainnet" /* MAINNET */) {
  const xpub = new ExtendedPublicKey({
    path: bip32Path,
    pubkey,
    chaincode,
    parentFingerprint,
    network
  });
  return xpub.toBase58();
}
function getMaskedDerivation({ xpub, bip32Path }, toMask = "unknown") {
  const unknownBip32 = bip32Path.toLowerCase().includes(toMask);
  const depth = ExtendedPublicKey.fromBase58(xpub).depth || 0;
  return unknownBip32 ? `m${"/0".repeat(depth)}` : bip32Path;
}

// src/braid.ts
var FAKE_ROOT_FINGERPRINT = "00000000";
var Braid = class extends Struct2 {
  addressType;
  network;
  extendedPublicKeys;
  requiredSigners;
  index;
  sequence;
  constructor(options) {
    super();
    if (!options || !Object.keys(options).length) {
      return this;
    }
    et(
      Object.values(MULTISIG_ADDRESS_TYPES).includes(options.addressType),
      `Expected addressType to be one of:  ${Object.values(
        MULTISIG_ADDRESS_TYPES
      )}. You sent ${options.addressType}`
    );
    this.addressType = options.addressType;
    et(
      Object.values(Network).includes(options.network),
      `Expected network to be one of:  ${Object.values(Network)}.`
    );
    this.network = options.network;
    options.extendedPublicKeys.forEach((xpub) => {
      const xpubValidationError = validateExtendedPublicKey(
        typeof xpub === "string" ? xpub : xpub.base58String,
        this.network
      );
      et(!xpubValidationError.length, xpubValidationError);
    });
    this.extendedPublicKeys = options.extendedPublicKeys;
    et(typeof options.requiredSigners === "number");
    et(
      options.requiredSigners <= this.extendedPublicKeys.length,
      `Can't have more requiredSigners than there are keys.`
    );
    this.requiredSigners = options.requiredSigners;
    const pathError = validateBIP32Index(options.index, { mode: "unhardened" });
    et(!pathError.length, pathError);
    this.index = options.index;
    this.sequence = bip32PathToSequence(this.index);
  }
  toJSON() {
    return braidConfig(this);
  }
  static fromData(data) {
    return new this(data);
  }
  static fromJSON(string) {
    return new this(JSON.parse(string));
  }
};
function braidConfig(braid) {
  return JSON.stringify({
    network: braid.network,
    addressType: braid.addressType,
    extendedPublicKeys: braid.extendedPublicKeys,
    requiredSigners: braid.requiredSigners,
    index: braid.index
  });
}
function braidNetwork(braid) {
  return braid.network;
}
function braidAddressType(braid) {
  return braid.addressType;
}
function braidExtendedPublicKeys(braid) {
  return braid.extendedPublicKeys;
}
function braidRequiredSigners(braid) {
  return braid.requiredSigners;
}
function braidIndex(braid) {
  return braid.index;
}
function validateBip32PathForBraid(braid, path) {
  const pathError = validateBIP32Path(path);
  et(!pathError.length, pathError);
  const pathToCheck = path.startsWith("m/") || path.startsWith("/") ? path : "/" + path;
  const pathSequence = bip32PathToSequence(pathToCheck);
  et(
    pathSequence[0].toString() === braid.index,
    `Cannot derive paths outside of the braid's index: ${braid.index}`
  );
}
function derivePublicKeyObjectsAtPath(braid, path) {
  validateBip32PathForBraid(braid, path);
  const dataRichPubKeyObjects = {};
  const actualPathSuffix = path.startsWith("m/") ? path.slice(2) : path;
  braidExtendedPublicKeys(braid).forEach((xpub) => {
    const completePath = xpub.path + "/" + actualPathSuffix;
    const pubkey = deriveChildPublicKey(
      typeof xpub === "string" ? xpub : xpub.base58String,
      path,
      braidNetwork(braid)
    );
    const rootFingerprint = extendedPublicKeyRootFingerprint(xpub);
    const masterFingerprint = rootFingerprint ? rootFingerprint : FAKE_ROOT_FINGERPRINT;
    dataRichPubKeyObjects[pubkey] = {
      masterFingerprint: Buffer.from(masterFingerprint, "hex"),
      path: completePath,
      pubkey: Buffer.from(pubkey, "hex")
    };
  });
  return dataRichPubKeyObjects;
}
function generatePublicKeysAtPath(braid, path) {
  return Object.keys(derivePublicKeyObjectsAtPath(braid, path)).sort();
}
function generatePublicKeysAtIndex(braid, index) {
  let pathToDerive = braidIndex(braid);
  pathToDerive += "/" + index.toString();
  return generatePublicKeysAtPath(braid, pathToDerive);
}
function generateBip32DerivationByPath(braid, path) {
  return Object.values(derivePublicKeyObjectsAtPath(braid, path));
}
function generateBip32DerivationByIndex(braid, index) {
  let pathToDerive = braidIndex(braid);
  pathToDerive += "/" + index.toString();
  return generateBip32DerivationByPath(braid, pathToDerive);
}
function deriveMultisigByPath(braid, path) {
  const pubkeys = generatePublicKeysAtPath(braid, path);
  const bip32Derivation = generateBip32DerivationByPath(braid, path);
  return generateBraidAwareMultisigFromPublicKeys(
    braid,
    pubkeys,
    bip32Derivation
  );
}
function deriveMultisigByIndex(braid, index) {
  let pathToDerive = braidIndex(braid);
  pathToDerive += "/" + index.toString();
  return deriveMultisigByPath(braid, pathToDerive);
}
function generateBraidAwareMultisigFromPublicKeys(braid, pubkeys, bip32Derivation) {
  let braidAwareMultisig = {};
  const multisig = generateMultisigFromPublicKeys(
    braidNetwork(braid),
    braidAddressType(braid),
    braidRequiredSigners(braid),
    ...pubkeys
  );
  braidAwareMultisig = {
    ...multisig,
    braidDetails: braidConfig(braid),
    bip32Derivation
  };
  return braidAwareMultisig;
}
function generateBraid(network, addressType, extendedPublicKeys, requiredSigners, index) {
  return new Braid({
    network,
    addressType,
    extendedPublicKeys,
    requiredSigners,
    index
  });
}

// src/fees.ts
import BigNumber2 from "bignumber.js";

// src/types/fees.ts
var FeeValidationError = /* @__PURE__ */ ((FeeValidationError2) => {
  FeeValidationError2[FeeValidationError2["FEE_CANNOT_BE_NEGATIVE"] = 0] = "FEE_CANNOT_BE_NEGATIVE";
  FeeValidationError2[FeeValidationError2["FEE_RATE_CANNOT_BE_NEGATIVE"] = 1] = "FEE_RATE_CANNOT_BE_NEGATIVE";
  FeeValidationError2[FeeValidationError2["FEE_TOO_HIGH"] = 2] = "FEE_TOO_HIGH";
  FeeValidationError2[FeeValidationError2["FEE_RATE_TOO_HIGH"] = 3] = "FEE_RATE_TOO_HIGH";
  FeeValidationError2[FeeValidationError2["INPUT_AMOUNT_MUST_BE_POSITIVE"] = 4] = "INPUT_AMOUNT_MUST_BE_POSITIVE";
  FeeValidationError2[FeeValidationError2["INVALID_FEE"] = 5] = "INVALID_FEE";
  FeeValidationError2[FeeValidationError2["INVALID_FEE_RATE"] = 6] = "INVALID_FEE_RATE";
  FeeValidationError2[FeeValidationError2["INVALID_INPUT_AMOUNT"] = 7] = "INVALID_INPUT_AMOUNT";
  return FeeValidationError2;
})(FeeValidationError || {});

// src/fees.ts
BigNumber2.config({ EXPONENTIAL_AT: 16 });
var MAX_FEE_RATE_SATS_PER_VBYTE = new BigNumber2(1e3);
var MAX_FEE_SATS = new BigNumber2(25e5);
function getFeeErrorMessage(error) {
  let errorMessage = "";
  switch (error) {
    case 0 /* FEE_CANNOT_BE_NEGATIVE */:
      errorMessage = "Fee cannot be negative.";
      break;
    case 1 /* FEE_RATE_CANNOT_BE_NEGATIVE */:
      errorMessage = "Fee rate cannot be negative.";
      break;
    case 2 /* FEE_TOO_HIGH */:
      errorMessage = "Fee is too high.";
      break;
    case 3 /* FEE_RATE_TOO_HIGH */:
      errorMessage = "Fee rate is too high.";
      break;
    case 4 /* INPUT_AMOUNT_MUST_BE_POSITIVE */:
      errorMessage = "Total input amount must be positive.";
      break;
    case 5 /* INVALID_FEE */:
      errorMessage = "Invalid fee.";
      break;
    case 6 /* INVALID_FEE_RATE */:
      errorMessage = "Invalid fee rate.";
      break;
    case 7 /* INVALID_INPUT_AMOUNT */:
      errorMessage = "Invalid total input amount.";
      break;
    default:
      break;
  }
  return errorMessage;
}
function checkFeeError(feeSats, inputsTotalSats) {
  let fs, its;
  try {
    fs = new BigNumber2(feeSats);
  } catch (e4) {
    return 5 /* INVALID_FEE */;
  }
  if (!fs.isFinite()) {
    return 5 /* INVALID_FEE */;
  }
  try {
    its = new BigNumber2(inputsTotalSats);
  } catch (e4) {
    return 7 /* INVALID_INPUT_AMOUNT */;
  }
  if (!its.isFinite()) {
    return 7 /* INVALID_INPUT_AMOUNT */;
  }
  if (fs.isLessThan(ZERO)) {
    return 0 /* FEE_CANNOT_BE_NEGATIVE */;
  }
  if (its.isLessThanOrEqualTo(ZERO)) {
    return 4 /* INPUT_AMOUNT_MUST_BE_POSITIVE */;
  }
  if (fs.isGreaterThan(its)) {
    return 2 /* FEE_TOO_HIGH */;
  }
  if (fs.isGreaterThan(MAX_FEE_SATS)) {
    return 2 /* FEE_TOO_HIGH */;
  }
  return null;
}
function checkFeeRateError(feeRateSatsPerVbyte) {
  let fr;
  try {
    fr = new BigNumber2(feeRateSatsPerVbyte);
  } catch (e4) {
    return 6 /* INVALID_FEE_RATE */;
  }
  if (!fr.isFinite()) {
    return 6 /* INVALID_FEE_RATE */;
  }
  if (fr.isLessThan(ZERO)) {
    return 1 /* FEE_RATE_CANNOT_BE_NEGATIVE */;
  }
  if (fr.isGreaterThan(MAX_FEE_RATE_SATS_PER_VBYTE)) {
    return 3 /* FEE_RATE_TOO_HIGH */;
  }
  return null;
}
function validateFeeRate(feeRateSatsPerVbyte) {
  return getFeeErrorMessage(checkFeeRateError(feeRateSatsPerVbyte));
}
function validateFee(feeSats, inputsTotalSats) {
  return getFeeErrorMessage(checkFeeError(feeSats, inputsTotalSats));
}
function estimateMultisigTransactionFeeRate(config) {
  const vSize = estimateMultisigTransactionVSize(config);
  if (vSize === null) {
    return null;
  }
  return new BigNumber2(config.feesInSatoshis).dividedBy(vSize).toString();
}
function estimateMultisigTransactionFee(config) {
  const vSize = estimateMultisigTransactionVSize(config);
  if (vSize === null) {
    return null;
  }
  const feeAsNumber = new BigNumber2(config.feesPerByteInSatoshis).multipliedBy(vSize).toNumber();
  return Math.ceil(feeAsNumber).toString();
}
function estimateMultisigTransactionVSize(config) {
  switch (config.addressType) {
    case P2SH:
      return estimateMultisigP2SHTransactionVSize(config);
    case P2SH_P2WSH:
      return estimateMultisigP2SH_P2WSHTransactionVSize(config);
    case P2WSH:
      return estimateMultisigP2WSHTransactionVSize(config);
    default:
      return null;
  }
}

// src/fixtures.ts
import BigNumber3 from "bignumber.js";

// src/inputs.ts
function sortInputs(inputs) {
  return inputs.sort((input1, input2) => {
    if (input1.txid > input2.txid) {
      return 1;
    } else {
      if (input1.txid < input2.txid) {
        return -1;
      } else {
        return input1.index < input2.index ? -1 : 1;
      }
    }
  });
}
function validateMultisigInputs(inputs, braidRequired = false) {
  if (!inputs || inputs.length === 0) {
    return "At least one input is required.";
  }
  const utxoIDs = [];
  for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
    const input = inputs[inputIndex];
    if (braidRequired && input.multisig && !multisigBraidDetails(input.multisig)) {
      return "At least one input cannot be traced back to its set of extended public keys.";
    }
    const error = validateMultisigInput(input);
    if (error) {
      return error;
    }
    const utxoID = `${input.txid}:${input.index}`;
    if (utxoIDs.includes(utxoID)) {
      return `Duplicate input: ${utxoID}`;
    }
    utxoIDs.push(utxoID);
  }
  return "";
}
function validateMultisigInput(input) {
  if (!input.txid) {
    return "Does not have a transaction ID ('txid') property.";
  }
  let error = validateTransactionID(input.txid);
  if (error) {
    return error;
  }
  if (input.index !== 0 && !input.index) {
    return "Does not have a transaction index ('index') property.";
  }
  error = validateTransactionIndex(input.index);
  if (error) {
    return error;
  }
  if (!input.multisig) {
    return "Does not have a multisig object ('multisig') property.";
  }
  return "";
}
var TXID_LENGTH = 64;
function validateTransactionID(txid) {
  if (txid === null || txid === void 0 || txid === "") {
    return "TXID cannot be blank.";
  }
  const error = validateHex(txid);
  if (error) {
    return `TXID is invalid (${error})`;
  }
  if (txid.length !== TXID_LENGTH) {
    return `TXID is invalid (must be ${TXID_LENGTH}-characters)`;
  }
  return "";
}
function validateTransactionIndex(indexString) {
  if (indexString === null || indexString === void 0 || indexString === "") {
    return "Index cannot be blank.";
  }
  const index = parseInt(indexString, 10);
  if (!isFinite(index)) {
    return "Index is invalid";
  }
  if (index < 0) {
    return "Index cannot be negative.";
  }
  return "";
}

// src/fixtures.ts
BigNumber3.config({ EXPONENTIAL_AT: 16 });
var RECEIVING_ADDRESSES = {
  ["testnet" /* TESTNET */]: {
    [P2SH]: "2NE1LH35XT4YrdnEebk5oKMmRpGiYcUvpNR",
    [P2SH_P2WSH]: "2NE1LH35XT4YrdnEebk5oKMmRpGiYcUvpNR",
    [P2WSH]: "tb1q9hj5j7mh9f7t6cwdvz34nj6pyzva5ftj2ecarcdqph5wc3n49hyqchh3cg"
  },
  ["mainnet" /* MAINNET */]: {
    [P2SH]: "3DRVz9YUhoXSMgBngvv2JkNReBHvkeJwLs",
    [P2SH_P2WSH]: "3DRVz9YUhoXSMgBngvv2JkNReBHvkeJwLs",
    [P2WSH]: "bc1qxkl8fcuas3fv6mk79tk7d0nsug0909qcgvpjuj2asgltnafp46nsn4jnrh"
  }
};
var CHANGE_ADDRESSES = {
  ["testnet" /* TESTNET */]: {
    [P2SH]: "2NB3tTnpcUanDenNhWbXxymTJhheWtj5Mu1",
    [P2SH_P2WSH]: "2MyCBSwFWSXpagqKtrnckNtNQBnKdUZRhKc",
    [P2WSH]: "tb1qhjtyry0qwm5l6v5v7y27hc6m60vm0d8exlr3cswdrxsgaygqvd2q5zsl0n"
  },
  ["mainnet" /* MAINNET */]: {
    [P2SH]: "36NMegVbRPbMv9RC4Ge2aKLUQHYXKbyooZ",
    [P2SH_P2WSH]: "32M6VKsKw1X2EXFawpcHosMEhSxswLHRwX",
    [P2WSH]: "bc1qnzky4hcwcutvktfstp0u3kmtgxkjvscl25snvg45xu3ausv2lapqrvmkeh"
  }
};
var BIP39_PHRASE = [
  "merge",
  "alley",
  "lucky",
  "axis",
  "penalty",
  "manage",
  "latin",
  "gasp",
  "virus",
  "captain",
  "wheel",
  "deal",
  "chase",
  "fragile",
  "chapter",
  "boss",
  "zero",
  "dirt",
  "stadium",
  "tooth",
  "physical",
  "valve",
  "kid",
  "plunge"
];
var ROOT_FINGERPRINT = "f57ec65d";
var NODES = {
  "m/45'/0'/0'": {
    pub: "0387cb4929c287665fbda011b1afbebb0e691a5ee11ee9a561fcd6adba266afe03",
    xpub: "xpub6CCHViYn5VzKFqrKjAzSSqP8XXSU5fEC6ZYSncX5pvSKoRLrPDcF8cEaZkrQvvnuwRUXeKVjoGmAqvbwVkNBFLaRiqcdVhWPyuShUrbcZsv",
    tpub: "tpubDCZv1xNTnmwmXe3BBMyXekiVreY853jFeC8k9AaEAqCDYi1ZTSTLH3uQonwCTRk9jL1SFu1cLNbDY76YtcDR8n2inSMwBEAdZs37EpYS9px",
    zpub: "zpub6qrp73tcNs5GxSEZPtZgs1a8sTjMxuDBvnatMQJrawC5ucyJtXwNNjYrcAmavk6kkhi99GgribUGcVq4w9CCqowdTX1UfX9NXMZzG2XWQdj",
    ypub: "ypub6X2YoPDhEBXo793SZXn4evUdhVav2HDh1g4fa1QyCvpCrXA5dsmokftiaxozvqSqM4bLPo6JFw7ijDDWDSnC3aG2bBK45cKtFdWLsUKgtyo",
    Ypub: "Ypub6hvdvcx8o96AXiCpWCF3UzpSRHdBEduHKwiLVGgWahecUhizQHA5qnkePfmUVGfjaXfKGP6R99WDrNqGWfw9C4NhReRTV1nt9MnDTNALmuh",
    Zpub: "Zpub72kuEHd3wpdeP1PwLZ2fh5uwbFmdBFtnF4EZGfaPxi2VXoYDewKeTrQnQsj4VBKezAn81rgybormjfSqENM9zJ4JHz7t4vcNR5qrqv8qja7",
    upub: "upub5DhVaiY2dTMshxGyE6dZpa6d1d18FoFhMDynSRqRguJge7uAdF7ZGRGAW8yewCq9iW87Pti4RHhXC4mFLf88rdXd7pXMjy3wAjFmK6jyHiX",
    vpub: "vpub5YXktPCwn8uMZFU64TRC2fC8Bb9aCRFCGLW1DpjK4ugZhDiPsuH7tUvJXLwEw7V589Ev9NJcsx455MNp4MY9esDDzADnKssRSTKQhgCrtoZ",
    Upub: "Upub5QbahxGUCQvF8XSMAm6YeeSRjR3PU9wHfVdTMh6y4g96GJU5PeVqMY86Jqw8Ve43wyC6GUiBJW62KEP1dtH617eHxHdm9NWw4TXdu1aWzdx",
    Jpub: "Vpub5jRr1cwPM6TiypdU17tArjXvuPBqQmvnac9g95zrSgWyKQHJeJfPybnEL3tiVYhyMcJu1xJjmASaCWzaMah6oMKtpdLBjHLRLBbHHcy3jDH",
    chaincode: "470bb034dbc8e7b5f5c0b19f747e3e768f0cc9ff298361b2741e1b7fd70d376d",
    parentFingerprint: 1240308660,
    rootFingerprint: ROOT_FINGERPRINT,
    index: 2147483648,
    depth: 3
  },
  "m/45'/0'/0'/0": {
    pub: "03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee",
    xpub: "xpub6EW9kGJQLjEGWpuKjViLuEw3pkNX5k2DzXhM3ctfHawh12aLXnrzYuRcvwTfv2VD2a8uzFCDJfLnrrD9Z46NbLyPHUQbbb4QyxKjf6c1gh4",
    tpub: "tpubDEsnGW8641Bind6BBghS7AGR9sUB58XHYAHeQAwodVhakKF3c1i5hM6TAyYTSXSSpUfpbpi5qmAqZ2hkwuwcUnRgM59uH7ieZuv9RAEJ5Rp",
    chaincode: "4522d0dc37c97548c43adc8fbbe285eea27921e8437562574d13c013e85c0fd3",
    parentFingerprint: 2213579839,
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/45'/0'/0'/0/0": {
    pub: "03102f0df5e34ffa1178a5310952221b8e26b3e761a9e328832c750a2de252f21a",
    xpub: "xpub6FjSpitFpSJB9BpSVwp3eJzhpaQFLbLefD1f3qaGRmok2Z2FDeSNsy5CL9TLwM3HpcV2kAyTNf2W1uUXs1jbeXGWjdWnsaqnUQ9PyWAYVhQ",
    tpub: "tpubDG75LxhwXiFdQz1Hx8o8rEL59hVuKyqiCqbxQPdQmgZdmqgxHsHU2Qk2aBY8TqzXcX1wMkVKukrYi5y9FsaqXxiooEG6Z7W24MjojRNcVtA",
    chaincode: "4522d0dc37c97548c43adc8fbbe285eea27921e8437562574d13c013e85c0fd3",
    parentFingerprint: 724365675,
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/45'/1/0/0": {
    xpub: "tpubDE5K7wy1Mf254iUPx3CgMfzhx6EcaFCvYDiJb5DZxeod2tTgKsgNX89YVQ6uD9TkMgP6KbAHueWqgcCYUTdZXqTXuF9Vnha45Y26gCfno2G",
    extendedPublicKey: {
      base58String: "tpubDE5K7wy1Mf254iUPx3CgMfzhx6EcaFCvYDiJb5DZxeod2tTgKsgNX89YVQ6uD9TkMgP6KbAHueWqgcCYUTdZXqTXuF9Vnha45Y26gCfno2G",
      chaincode: "da92ac213968ea1a2c26dde7d83e556939519e5195c84120f3b803630c45194a",
      depth: 4,
      index: 0,
      parentFingerprint: 384854823,
      path: "m/45'/1/0/0",
      pubkey: "0226a8fce14d91bd85b2b61bdc994e75975c9b443d02a0428a7c9755228f35cba9",
      rootFingerprint: ROOT_FINGERPRINT,
      version: "043587cf"
    }
  },
  "m/45'/1/1/0": {
    xpub: "tpubDF1iV6MkK9BUvumPzq1MHxVGPNy2fFo1pEpcgnkriBdiE9EVrkndpmsg8QQ12T9cwn82Kg8wRburB8Avnvo1AyBijcWrDS9SHHkyRXfxcSQ",
    extendedPublicKey: {
      base58String: "tpubDF1iV6MkK9BUvumPzq1MHxVGPNy2fFo1pEpcgnkriBdiE9EVrkndpmsg8QQ12T9cwn82Kg8wRburB8Avnvo1AyBijcWrDS9SHHkyRXfxcSQ",
      chaincode: "ff6e55a2ae1b0b14824a08130fc3029d3d193ee0c1eb922696d3658f641a0e2b",
      depth: 4,
      index: 0,
      parentFingerprint: 2525848640,
      path: "m/45'/1/1/0",
      pubkey: "02ca80ff7fdc10be77b65da0b82cada1646f0c113e6cc10a5feb0dfb5d0487793e",
      rootFingerprint: ROOT_FINGERPRINT,
      version: "043587cf"
    }
  },
  "m/45'": {
    pub: "03c060f4c111a276807fc3a88966cc1d3a683eef9226a034ee2cd6982b478fa8e2",
    xpub: "xpub69h9wvon4GzP2S3cLmiBsNdznt29YXBk2TSyQueZsacKZyzMqMR1Fj5JwSiKu8agDRiLWPfw9gSChLW2Yfgpe4tzuhLUD2vFfGsfbtTA3r7",
    tpub: "tpubDA4nUAdTmYwqJEETnxhH5HyN817oXugoa63GmThiDVNDKGf4uaG6QAk9BUo7RdXv1LFF7yBognGFPWzdwXY4XWMHyJ5mtZaVFEU5MtMfj7H",
    rootFingerprint: "f57ec65d"
  },
  "m/45'/0": {
    pub: "02b04ac39b566b7353b5bf8e164be83bf90b090e7516170e88a8cb6c88a860f0a3",
    tpub: "tpubDBAj15fFkLimiBmDqapikSS4qkmvAS8LijMey9S9fAyjq65ERgjuzaa6GonVQXugcrBzfpEoH6SPBzevfowZgYJ3apWcHbMPaNJnBRkbsRY",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/45'/0/0": {
    xpub: "xpub6CsGPeBifUqr2szHmpFuNZ7Yd2ZnJtr95kPKu13LT96ZvTUthRsZbunhdyRp4HkQ93Gqr78mC9KEMVmGxcG6bFR4xT3GKpkdtgpr8T85JXP",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/45'/1/0": {
    pub: "036b5cfe4b7f29cb36e5261ad74f8a4f8602f77628e8d9d120f5580d3ccafaef74",
    tpub: "tpubDDhFRuipvJKBgPBDFooShZNtnkLwMkGDZXA1KBUd8xruQ8AA4QdZaiQYWj1hDpDW8r7va9D7GHeEp5ZzMsj5uDRX4s3hk4eQgJm8jMAqkLC",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/45'/0'/4'/99'/2147483647/3/1": {
    pub: "0211aa5c03e290dc0110103c3d3f817500e76061d35ea89072286cb6f7962eda81",
    xpub: "xpub6LCRwXBN9moqsJKhToW6K5qfBfTguMXuZw67q1BUuaWRyYD56P1zhqbyXsHqoo4WPsjUfeiJPu4JXnhtUz6cHbYgX6AFfDhUnPfCvbZD3JZ",
    tpub: "tpubDLa4Tm13s3mJ96WYuzVBX1B2WnZLtk2y7ZgRBZEdFVGKipsnAbs5rHGomuNdLJ1kBnGPHEEAvztMDyCVsqwrB2zyaguZLkMiNMFcgX4e2rG",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/45'/1'/0'/0/0": {
    pub: "037226e92491b2cf9691152fc2e9a0a7cff8f9ab7ad1b24b6f6506d7c8bf18911b",
    tpub: "tpubDFqzhdm1iDvKkHNwVMxFnWZjBX4m1QQK4qNELiux6RXteZdPidpymFeWFKm5koNvjTiwPZb4i456pW5JBymaCcKumuhN7DYLwX9wwGAJ71H",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/48'/0'/0'/1'/0/0": {
    pub: "02c63c7ae511c9902e885da3e2fbb4a8f227eefc7f53eda3cad4d8f9389331b5be",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/48'/1'/0'/1'/0/0": {
    pub: "03ff8a79f5016243a3959e2216e51cf90034cf510b379a34e6fdf565b19852baa2",
    rootFingerprint: ROOT_FINGERPRINT,
    Upub: "Upub5T4XUooQzDXL58NCHk8ZCw9BsRSLCtnyHeZEExAq1XdnBFXiXVrHFuvvmh3TnCR7XmKHxkwqdACv68z7QKT1vwru9L1SZSsw8B2fuBvtSa6",
    tpub: "tpubDKSvECbEtm6ZgXE7kmn2Sbr81JzJhDGVzz2Arnn86R5a3i42w2mxNoPHcA9MRPtS36zy5d4m7FWWiCrVY1fXJ9YvSjNMB4DJ2tRDifqJQmp"
  },
  "m/48'/0'/0'/2'/0/0": {
    pub: "032817ba5e2b76f6e2fab1d985224516f2b77a9c181e210def81ec2be8e17007c9",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/48'/1'/0'/2'/0/0": {
    pub: "03ecf349ecf63fcd0ece9de7eb1abfb8f8b243fecc443bd62ef47744f0f6b7eef6",
    tpub: "tpubDKVKJjFQrticLSSf77TWYmvFq6XTALifW1shoo4snhfh7YGhMHcsCB2WwvfAbQGQDJy8EwuD6kjfvYPqSxJptSKqZDvzxQFcpYy88iS85kd",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/45'/1'/0'": {
    xpub: "tpubDDQubdBx9cbs16zUhpiM135EpvjSbVz7SGJyGg4rvRVEYdncZy3Kzjg6NjuFWcShiCyNqviWTBiZPb25p4WcaLppVmAuiPMrkR1kahNoioL",
    rootFingerprint: ROOT_FINGERPRINT
  },
  "m/45'/1'/4'/99'/2147483647/3/1": {
    tpub: "tpubDLaKPLMBXicb8HnBkcwxCxYNqnypFd4PFhRaF1DMQu3t1qh9zscD4F7rPhkGqWJkaB4zG1gVZ4pFP14qRiEajwUPjnRg873gaPvvZYnnTnt",
    rootFingerprint: ROOT_FINGERPRINT
  },
  // P2SH-TESTNET
  "m/45'/1'/100'": {
    xpub: "tpubDDQubdBx9cbwQtdcRTisKF7wVCwHgHewhU7wh77VzCi62Q9q81qyQeLoZjKWZ62FnQbWU8k7CuKo2A21pAWaFtPGDHP9WuhtAx4smcCxqn1",
    rootFingerprint: ROOT_FINGERPRINT,
    open_source: {
      base58String: "tpubDDQubdBx9cbwQtdcRTisKF7wVCwHgHewhU7wh77VzCi62Q9q81qyQeLoZjKWZ62FnQbWU8k7CuKo2A21pAWaFtPGDHP9WuhtAx4smcCxqn1",
      chaincode: "eabe09a77940dd3e125be81bc25fcf04c611544f431967531bea80b12f2e72d2",
      depth: 3,
      index: 2147483748,
      parentFingerprint: 3168392141,
      path: "m/45'/1'/100'",
      pubkey: "02d419c2e37078468af97e07e240343a7e8691ef5dcca9fe59a7c774db9e6c4e62",
      rootFingerprint: ROOT_FINGERPRINT,
      version: "043587cf"
    },
    unchained: {
      base58String: "tpubDDinbKDXyddTUKcX6mv936Ux5utCJteq5S6EEKhfpM8CqN2rMAcccv6GecsB3cPt8eGL4e4K2eaZ9Jis9TGf7mbwBsRTN7ngnFR7yJZxBKC",
      chaincode: "1ade7f9d6099898d9851af05b488b94ad3ad4fcabab3970b8ee975fb0e33c517",
      depth: 3,
      index: 2147483748,
      parentFingerprint: 3872018966,
      path: "m/45'/1'/100'",
      pubkey: "03b30cf103f4775c366cdc9394dc42b9cfa9d05eb02fd07a2f98a8b1b22d867fec",
      rootFingerprint: "00000001",
      version: "043587cf"
    }
  },
  // P2SH_P2WSH-TESTNET
  "m/48'/1'/100'/1'": {
    xpub: "tpubDFc9Mm4tw6EkdXuk24MnQYRrDsdKEFh498vFffqa2KJmxytpcHbWrcFYwTKAdLxkSWpadzb5M5VVZ7PDAUjDjymvUmQ7pBbRecz2FM952Am",
    rootFingerprint: ROOT_FINGERPRINT,
    open_source: {
      base58String: "tpubDFc9Mm4tw6EkdXuk24MnQYRrDsdKEFh498vFffqa2KJmxytpcHbWrcFYwTKAdLxkSWpadzb5M5VVZ7PDAUjDjymvUmQ7pBbRecz2FM952Am",
      chaincode: "8f60b5470713d119000eb9f20716eaa21e4c7c96b1d8a605790e2a9621874b7b",
      depth: 4,
      index: 2147483649,
      parentFingerprint: 3880777331,
      path: "m/48'/1'/100'/1'",
      pubkey: "0374d98c47224e55e6244cfb407638d77ff1127f02c895983b5fe2d9174f37cd0c",
      rootFingerprint: "f57ec65d",
      version: "043587cf"
    },
    unchained: {
      base58String: "tpubDErWN5qfdLwY9ZJo9HWpxjcuEFuEBVHSbQbPqF35LQr3etWNGirKcgAa93DZ4DmtHm36p2gTf4aj6KybLqHaS3UePM5LtPqtb3d3dYVDs2F",
      chaincode: "0683fed20bd4e656ef5d6cb91dac510a80f1e425976dcc8b92060cca5a8fe0a9",
      depth: 4,
      index: 2147483649,
      parentFingerprint: 2163434281,
      path: "m/48'/1'/100'/1'",
      pubkey: "02fe3c640406f273d9acdd63ce45282cb9017c91e07b4b0118451823df95fd7821",
      rootFingerprint: "00000002",
      version: "043587cf"
    }
  },
  // P2WSH-TESTNET
  "m/48'/1'/100'/2'": {
    xpub: "tpubDFc9Mm4tw6EkgR4YTC1GrU6CGEd9yw7KSBnSssL4LXAXh89D4uMZigRyv3csdXbeU3BhLQc4vWKTLewboA1Pt8Fu6fbHKu81MZ6VGdc32eM",
    rootFingerprint: ROOT_FINGERPRINT,
    open_source: {
      base58String: "tpubDFc9Mm4tw6EkgR4YTC1GrU6CGEd9yw7KSBnSssL4LXAXh89D4uMZigRyv3csdXbeU3BhLQc4vWKTLewboA1Pt8Fu6fbHKu81MZ6VGdc32eM",
      chaincode: "b0d7d9283b766e79259dc38263ce06b474eeaefb3fab5f53946aaec6cd525f13",
      depth: 4,
      index: 2147483650,
      parentFingerprint: 3880777331,
      path: "m/48'/1'/100'/2'",
      pubkey: "0277d88e9d1395e980debe59476a17f202ba27c866d3637877e84958f2c65458ff",
      rootFingerprint: "f57ec65d",
      version: "043587cf"
    },
    unchained: {
      base58String: "tpubDErWN5qfdLwYE94mh12oWr4uURDDNKCjKVhCEcAgZ7jKnnAwq5tcTF2iEk3VuznkJuk2G8SCHft9gS6aKbBd18ptYWPqKLRSTRQY7e2rrDj",
      chaincode: "d2be31d3de92e6183d5a4bb918048fdf960ba9438d391afb5f7ac69a1c24caf1",
      depth: 4,
      index: 2147483650,
      parentFingerprint: 2163434281,
      path: "m/48'/1'/100'/2'",
      pubkey: "03a602ec9955461233f89560337ff7af353b838471d7f1625768b4e290544a154f",
      rootFingerprint: "00000003",
      version: "043587cf"
    }
  },
  // P2SH-MAINNET
  "m/45'/0'/100'": {
    xpub: "xpub6CCHViYn5VzPfSR7baop9FtGcbm3UnqHwa54Z2eNvJnRFCJCdo9HtCYoLJKZCoATMLUowDDA1BMGfQGauY3fDYU3HyMzX4NDkoLYCSkLpbH",
    rootFingerprint: ROOT_FINGERPRINT,
    open_source: {
      base58String: "xpub6CCHViYn5VzPfSR7baop9FtGcbm3UnqHwa54Z2eNvJnRFCJCdo9HtCYoLJKZCoATMLUowDDA1BMGfQGauY3fDYU3HyMzX4NDkoLYCSkLpbH",
      chaincode: "8f8521ebe6ac7fd6d6c468aa25cad78e34e9a4c02211a00bf2c6069ffdb11722",
      depth: 3,
      index: 2147483748,
      parentFingerprint: 1240308660,
      path: "m/45'/0'/100'",
      pubkey: "028257b519520e4a611b0fbf062bef41e815145b85e621887d267c695f2c508259",
      rootFingerprint: "f57ec65d",
      version: "0488b21e"
    },
    unchained: {
      base58String: "xpub6Ca5CwTgRASgkXbXE5TeddTP9mPCbYHreCpmGt9dhz9y6femstHGCoFESHHKKRcm414xMKnuLjP9LDS7TwaJC9n5gxua6XB1rwPcC6hqDub",
      chaincode: "17f7729ba7f11cc95c201d023c0a7f8315101ef1ee5bd6fc8193f440eef4483f",
      depth: 3,
      index: 2147483748,
      parentFingerprint: 2097768017,
      path: "m/45'/0'/100'",
      pubkey: "03540225fdc5f92c686f3ffa3fe7a912c66e94f7988bd6db92d466d7917ff7447c",
      rootFingerprint: "00000004",
      version: "0488b21e"
    }
  },
  // P2SH_P2WSH-MAINNET
  "m/48'/0'/100'/1'": {
    xpub: "xpub6DcqYQxnbefzEBJF6osEuT5yXoHVZu1YCCsS5YkATvqD2h7tdMBgdBrUXk26FrJwawDGX6fHKPvhhZxKc5b8dPAPb8uANDhsjAPMJqTFDjH",
    rootFingerprint: ROOT_FINGERPRINT,
    open_source: {
      base58String: "xpub6DcqYQxnbefzEBJF6osEuT5yXoHVZu1YCCsS5YkATvqD2h7tdMBgdBrUXk26FrJwawDGX6fHKPvhhZxKc5b8dPAPb8uANDhsjAPMJqTFDjH",
      chaincode: "cd1a105c93ed7c2bc01e99445f81e8674bcea6042405cb4244af2c598ab995b4",
      depth: 4,
      index: 2147483649,
      parentFingerprint: 194150729,
      path: "m/48'/0'/100'/1'",
      pubkey: "030d7b4de2784978a3352adaacf3182c737de75f1c07778019aad15b0b99b640a4",
      rootFingerprint: "f57ec65d",
      version: "0488b21e"
    },
    unchained: {
      base58String: "xpub6EwJjKaiocGvo9f7XSGXGwzo1GLB1URxSZ5Ccp1wqdxNkhrSoqNQkC2CeMsU675urdmFJLHSX62xz56HGcnn6u21wRy6uipovmzaE65PfBp",
      chaincode: "a4b98329bb145e79fa7485653f2b9dc4d8ca9519ee0f00093809dc1d3d8b3cd2",
      depth: 4,
      index: 2147483649,
      parentFingerprint: 3203536812,
      path: "m/48'/0'/100'/1'",
      pubkey: "0366e35ecc712f790e698e502ba2b3ed00645c6994b59c8884aded1eb29af87ef2",
      rootFingerprint: "00000005",
      version: "0488b21e"
    }
  },
  // P2WSH-MAINNET
  "m/48'/0'/100'/2'": {
    xpub: "xpub6DcqYQxnbefzFkaRBK63FSE2GzNuNnNhFGw1xV9RioVG7av6r3JDf1aELqBSq5gt5487CtNxvVtaiJjQU2HQWzgG5NzLyTPbYav6otW8qEc",
    rootFingerprint: ROOT_FINGERPRINT,
    open_source: {
      base58String: "xpub6DcqYQxnbefzFkaRBK63FSE2GzNuNnNhFGw1xV9RioVG7av6r3JDf1aELqBSq5gt5487CtNxvVtaiJjQU2HQWzgG5NzLyTPbYav6otW8qEc",
      chaincode: "6b2c97052334fd0333464fd7d7b6ed9b7bae25f9bcabfa54f15e041ac22971fc",
      depth: 4,
      index: 2147483650,
      parentFingerprint: 194150729,
      path: "m/48'/0'/100'/2'",
      pubkey: "038fce535133ea87f989ca0908f7e8de0fa965d0a6649b71bf5c74244ece64d490",
      rootFingerprint: "f57ec65d",
      version: "0488b21e"
    },
    unchained: {
      base58String: "xpub6EwJjKaiocGvqSuM2jRZSuQ9HEddiFUFu9RdjE47zG7kXVNDQpJ3GyvskwYiLmvU4SBTNZyv8UH53QcmFEE23YwozE61V3dwzZJEFQr6H2b",
      chaincode: "8b7900c703cdd0f752b13b7a95ee9cb0d5a0df7fb9bfe4678b074edd3dc59a11",
      depth: 4,
      index: 2147483650,
      parentFingerprint: 3203536812,
      path: "m/48'/0'/100'/2'",
      pubkey: "030a3dd68cd8d3a896209c9eee0a6b8ec28783458882ce1a7362d8b60b34de3097",
      rootFingerprint: "00000006",
      version: "0488b21e"
    }
  }
};
var BRAIDS = [
  {
    network: "testnet" /* TESTNET */,
    addressType: P2SH,
    extendedPublicKeys: [
      NODES["m/45'/1'/100'"].open_source,
      NODES["m/45'/1'/100'"].unchained
    ],
    stringExtendedPublicKeys: [
      NODES["m/45'/1'/100'"].open_source.base58String,
      NODES["m/45'/1'/100'"].unchained.base58String
    ],
    requiredSigners: 2,
    index: "0",
    pubKeySets: {
      index: {
        0: [
          "02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4",
          "03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba"
        ],
        1: [
          "0221ee4400a394e44b78592463eb07c9bae0cc9c2b11081be97df15cd561124e19",
          "03f31364b009d8019be56fa2569f336362e3e2b6a809623d87ffbef634ca6e1f27"
        ],
        48349: [
          "0308e27264d2b28b2e56104b36e562f69414027574998a53674b5db28a649f0f38",
          "037a911b48783ca769ae273ebe71d3a14d7af2301063c25564155e8764fa77c981"
        ]
      },
      path: {
        "0/0": [
          "02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4",
          "03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba"
        ]
      }
    },
    bip32Derivations: {
      index: {
        0: [
          {
            masterFingerprint: Buffer.from("f57ec65d", "hex"),
            path: "m/45'/1'/100'/0/0",
            pubkey: Buffer.from(
              "02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4",
              "hex"
            )
          },
          {
            masterFingerprint: Buffer.from("00000001", "hex"),
            path: "m/45'/1'/100'/0/0",
            pubkey: Buffer.from(
              "03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba",
              "hex"
            )
          }
        ],
        1: [
          {
            masterFingerprint: Buffer.from("f57ec65d", "hex"),
            path: "m/45'/1'/100'/0/1",
            pubkey: Buffer.from(
              "0221ee4400a394e44b78592463eb07c9bae0cc9c2b11081be97df15cd561124e19",
              "hex"
            )
          },
          {
            masterFingerprint: Buffer.from("00000001", "hex"),
            path: "m/45'/1'/100'/0/1",
            pubkey: Buffer.from(
              "03f31364b009d8019be56fa2569f336362e3e2b6a809623d87ffbef634ca6e1f27",
              "hex"
            )
          }
        ],
        48349: [
          {
            masterFingerprint: Buffer.from("f57ec65d", "hex"),
            path: "m/45'/1'/100'/0/48349",
            pubkey: Buffer.from(
              "0308e27264d2b28b2e56104b36e562f69414027574998a53674b5db28a649f0f38",
              "hex"
            )
          },
          {
            masterFingerprint: Buffer.from("00000001", "hex"),
            path: "m/45'/1'/100'/0/48349",
            pubkey: Buffer.from(
              "037a911b48783ca769ae273ebe71d3a14d7af2301063c25564155e8764fa77c981",
              "hex"
            )
          }
        ]
      },
      path: {
        "0/0": [
          {
            masterFingerprint: Buffer.from("f57ec65d", "hex"),
            path: "m/45'/1'/100'/0/0",
            pubkey: Buffer.from(
              "02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4",
              "hex"
            )
          },
          {
            masterFingerprint: Buffer.from("00000001", "hex"),
            path: "m/45'/1'/100'/0/0",
            pubkey: Buffer.from(
              "03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba",
              "hex"
            )
          }
        ]
      }
    }
  }
];
var MULTISIGS_BASE = [
  {
    network: "testnet" /* TESTNET */,
    type: P2SH,
    bip32Path: "m/45'/1'/100'/0/0",
    policyHmac: "fb633e6a50ff05a1a090e07f2586d11f04b4ee8052cd0ce9ed816f8c4446cdc3",
    publicKey: "02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4",
    publicKeys: [
      "02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4",
      "03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba"
    ],
    changePublicKeys: [
      "021a049747120345fa9017fb42d8ff3d4fb1d2ef4c80546872c5da513babd51585",
      "03a00095df48367ed21e5c6edd50af4352311bf060eb100425cb7af4331aa1aad0"
    ],
    redeemScriptOps: "OP_2 02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4 03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba OP_2 OP_CHECKMULTISIG",
    redeemScriptHex: "522102a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d42103938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba52ae",
    scriptOps: "OP_HASH160 8479072d5a550ee0900b5af7e70af575527a879d OP_EQUAL",
    scriptHex: "a9148479072d5a550ee0900b5af7e70af575527a879d87",
    address: "2N5KgAnFFpmk5TRMiCicRZDQS8FFNCKqKf1",
    utxos: [
      {
        txid: "65e7ef764030dabfb46e3ae1c357b0666d0dda722c9809fb73245d6d68665284",
        index: 1,
        amountSats: "100000",
        // 0.001 BTC
        value: 1e5,
        transactionHex: "0200000000010149c912d0e5e46f6ef933038c7fb7e1d665db9ae56b67fa57fe4c3476a95cf954000000001716001400e2f78f987a5a4493cf062994dbde49d040a922feffffff02631418000000000017a914c7ab6d103180a48181847d35732e93e0ce9ab07387a08601000000000017a9148479072d5a550ee0900b5af7e70af575527a879d870247304402202f538752e408b4817e7751ef243eee67d2242ca2061e8e6c9f22873247f10a8d02205b4622314efd733f12fc6557bc2f323ff2cbc1604ad97a351807e1be80875bc8012102e92335f6ecb1862f0eea0b99297f21bdb9beb9a1e8f41113788f5add306ca9fcee9b1800"
      },
      {
        txid: "ae9e1aa8312e102e806fa11d8e65965a624f88459e6bb5bcf48156a0c53e022a",
        index: 1,
        amountSats: "100000",
        // 0.001 BTC
        value: 1e5,
        transactionHex: "0200000000010101745e1daa28c1705dbf73edd183e5ef91ad0918d97ad3e2ec2c69b548086f4d00000000171600142b0b522ba87db1646898118860449fcb2c69dae3feffffff02329642000000000017a9140f894f7e3b70b8741f830e066b6ef508a9f7479d87a08601000000000017a9148479072d5a550ee0900b5af7e70af575527a879d870247304402202dc887e5d623bd974968285e9c8165cfa9facd943caf0f8472e7acef632fb94302205c60434061e6a4e45360d3b3c901a9c1dd148b38dd6c9623cd8fa2677587e632012102366538692ffb9622e75a05dc2004d85efa0ebc27b99961e694d88f9ede2b57cae49b1800"
      },
      {
        txid: "f243c1fbb85dd49da91477b89c76636202721be9c7df5ee6eee0c6a10861ae44",
        index: 0,
        amountSats: "100000",
        // 0.001 BTC
        value: 1e5,
        transactionHex: "02000000000101e5d6a0ffc5f8387a90c463bf614ae53609b72988c44afc6a577f22666bc971a7000000001716001428386489d15b1cddfd245b506b8ff2d909b18d36feffffff02a08601000000000017a9148479072d5a550ee0900b5af7e70af575527a879d8786ce18050000000017a914d2fb0a8958e55d4c6c3ff58f970fdbba3006ec078702473044022007a7186e6afb93de749b3a905d1c7437f470f97095ea410538b6ac33d15a947802205a66118c7dc2e14d7325a122eb0021f54e1dbd5dfb8fd56b253fa3782716af3d012103f5951ccccf00964d54eefa78280ae083e0f0f0cc6382fd27b3fbfdfeda8dd2c7b29b1800"
      }
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES["testnet" /* TESTNET */][P2SH],
          amountSats: "291590",
          value: 291590
        },
        {
          address: CHANGE_ADDRESSES["testnet" /* TESTNET */][P2SH],
          amountSats: "7535",
          value: 7535,
          bip32Derivation: [
            {
              masterFingerprint: Buffer.from("f57ec65d", "hex"),
              path: "m/45'/1'/100'/1/0",
              pubkey: Buffer.from(
                "03a00095df48367ed21e5c6edd50af4352311bf060eb100425cb7af4331aa1aad0",
                "hex"
              )
            },
            {
              masterFingerprint: Buffer.from("00000001", "hex"),
              path: "m/45'/1'/100'/1/0",
              pubkey: Buffer.from(
                "021a049747120345fa9017fb42d8ff3d4fb1d2ef4c80546872c5da513babd51585",
                "hex"
              )
            }
          ],
          redeemScript: Buffer.from(
            "5221021a049747120345fa9017fb42d8ff3d4fb1d2ef4c80546872c5da513babd515852103a00095df48367ed21e5c6edd50af4352311bf060eb100425cb7af4331aa1aad052ae",
            "hex"
          )
        }
      ],
      hex: "0100000003845266686d5d2473fb09982c72da0d6d66b057c3e13a6eb4bfda304076efe7650100000000ffffffff2a023ec5a05681f4bcb56b9e45884f625a96658e1da16f802e102e31a81a9eae0100000000ffffffff44ae6108a1c6e0eee65edfc7e91b72026263769cb87714a99dd45db8fbc143f20000000000ffffffff02067304000000000017a914e3ba1151b75effbf7adc4673c83c8feec3ddc367876f1d00000000000017a914c34d63a6720866070490a8cb244c6bdc7ce2fa138700000000",
      signature: [
        "3045022100c82920c7d99e0a4055a8459c53362d15f5f8ce275322be8fd2045b43a5ae7f8d0220478b3856327a4b7809a1f858159bd437e4d93ca480e35bbe21c5cd914b6d722a01",
        "304402200464b13a701b9ac16eea29d1604a73d82ba5b3aed1435a8c2c3d4f940a2499ce02206be000a5cc605b284ab6c40039d56d49b7af304fea53079ec9ac838732b8765d01",
        "30450221008af4884f2bfbd4565e58c1e7d0f4cb36f8ebc210466d165c48311ddc40df7dc8022017196f4355f66621de0fed97002cfbd6ef7163c882a709f04e5dd0bbe960bcbd01"
      ],
      // Coldcard is now grinding nonces on signatures to produce low s-value (71 bytes or fewer ... e.g. starts with 0x3044 ...)
      byteCeilingSignature: [
        "3044022004e0fcf5a1df39db158d754361f933fa07ceceb6a230e51658f3daa5d55013780220274f6257aa8b6a10f2f901340fdc083926b7c3b2acd3ba5304c8d3d41383131901",
        "304402200464b13a701b9ac16eea29d1604a73d82ba5b3aed1435a8c2c3d4f940a2499ce02206be000a5cc605b284ab6c40039d56d49b7af304fea53079ec9ac838732b8765d01",
        "3044022030a64cec8dc9affe3380264f81292b2bc41036a815d157f2cadeff4ef360e043022042d385ff128b7ed6a3f4197182de1b7d7960420a9183756b600b2f6fa2d4a7cc01"
      ]
    },
    bip32Derivation: [
      {
        masterFingerprint: Buffer.from("f57ec65d", "hex"),
        path: "m/45'/1'/100'/0/0",
        pubkey: Buffer.from(
          "02a8513d9931896d5d3afc8063148db75d8851fd1fc41b1098ba2a6a766db563d4",
          "hex"
        )
      },
      {
        masterFingerprint: Buffer.from("00000001", "hex"),
        path: "m/45'/1'/100'/0/0",
        pubkey: Buffer.from(
          "03938dd09bf3dd29ddf41f264858accfa40b330c98e0ed27caf77734fac00139ba",
          "hex"
        )
      }
    ],
    changeBip32Derivation: [
      {
        masterFingerprint: Buffer.from("f57ec65d", "hex"),
        path: "m/45'/1'/100'/1/0",
        pubkey: Buffer.from(
          "03a00095df48367ed21e5c6edd50af4352311bf060eb100425cb7af4331aa1aad0",
          "hex"
        )
      },
      {
        masterFingerprint: Buffer.from("00000001", "hex"),
        path: "m/45'/1'/100'/1/0",
        pubkey: Buffer.from(
          "021a049747120345fa9017fb42d8ff3d4fb1d2ef4c80546872c5da513babd51585",
          "hex"
        )
      }
    ],
    braidDetails: {
      network: "testnet" /* TESTNET */,
      addressType: P2SH,
      extendedPublicKeys: [
        NODES["m/45'/1'/100'"].open_source,
        NODES["m/45'/1'/100'"].unchained
      ],
      requiredSigners: 2,
      index: "0"
    },
    changeBraidDetails: {
      network: "testnet" /* TESTNET */,
      addressType: P2SH,
      extendedPublicKeys: [
        NODES["m/45'/1'/100'"].open_source,
        NODES["m/45'/1'/100'"].unchained
      ],
      requiredSigners: 2,
      index: "1"
    },
    psbtNoChange: "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",
    psbt: "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",
    psbtWithGlobalXpub: "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",
    psbtPartiallySigned: "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",
    // FIXME: it appears ^that^ isn't ordering the pubkeys lexicographically... Doesn't seem to matter, it's still valid.
    psbtOrderedPartiallySigned: "cHNidP8BAMUBAAAAA4RSZmhtXSRz+wmYLHLaDW1msFfD4TputL/aMEB27+dlAQAAAAD/////KgI+xaBWgfS8tWueRYhPYlqWZY4doW+ALhAuMaganq4BAAAAAP////9ErmEIocbg7uZe38fpG3ICYmN2nLh3FKmd1F24+8FD8gAAAAAA/////wIGcwQAAAAAABepFOO6EVG3Xv+/etxGc8g8j+7D3cNnh28dAAAAAAAAF6kUw01jpnIIZgcEkKjLJExr3Hzi+hOHAAAAAAABAPcCAAAAAAEBSckS0OXkb275MwOMf7fh1mXbmuVrZ/pX/kw0dqlc+VQAAAAAFxYAFADi94+YelpEk88GKZTb3knQQKki/v///wJjFBgAAAAAABepFMerbRAxgKSBgYR9NXMuk+DOmrBzh6CGAQAAAAAAF6kUhHkHLVpVDuCQC1r35wr1dVJ6h52HAkcwRAIgL1OHUuQItIF+d1HvJD7uZ9IkLKIGHo5snyKHMkfxCo0CIFtGIjFO/XM/EvxlV7wvMj/yy8FgStl6NRgH4b6Ah1vIASEC6SM19uyxhi8O6guZKX8hvbm+uaHo9BETeI9a3TBsqfzumxgAIgICqFE9mTGJbV06/IBjFI23XYhR/R/EGxCYuipqdm21Y9RIMEUCIQDIKSDH2Z4KQFWoRZxTNi0V9fjOJ1Mivo/SBFtDpa5/jQIgR4s4VjJ6S3gJofhYFZvUN+TZPKSA41u+IcXNkUttcioBAQRHUiECqFE9mTGJbV06/IBjFI23XYhR/R/EGxCYuipqdm21Y9QhA5ON0Jvz3Snd9B8mSFisz6QLMwyY4O0nyvd3NPrAATm6Uq4iBgKoUT2ZMYltXTr8gGMUjbddiFH9H8QbEJi6Kmp2bbVj1Bj1fsZdLQAAgAEAAIBkAACAAAAAAAAAAAAiBgOTjdCb890p3fQfJkhYrM+kCzMMmODtJ8r3dzT6wAE5uhgAAAABLQAAgAEAAIBkAACAAAAAAAAAAAAAAQD3AgAAAAABAQF0Xh2qKMFwXb9z7dGD5e+RrQkY2XrT4uwsabVICG9NAAAAABcWABQrC1IrqH2xZGiYEYhgRJ/LLGna4/7///8CMpZCAAAAAAAXqRQPiU9+O3C4dB+DDgZrbvUIqfdHnYeghgEAAAAAABepFIR5By1aVQ7gkAta9+cK9XVSeoedhwJHMEQCIC3Ih+XWI72XSWgoXpyBZc+p+s2UPK8PhHLnrO9jL7lDAiBcYENAYeak5FNg07PJAanB3RSLON1sliPNj6JndYfmMgEhAjZlOGkv+5Yi51oF3CAE2F76DrwnuZlh5pTYj57eK1fK5JsYACICAqhRPZkxiW1dOvyAYxSNt12IUf0fxBsQmLoqanZttWPURzBEAiAEZLE6cBuawW7qKdFgSnPYK6WzrtFDWowsPU+UCiSZzgIga+AApcxgWyhKtsQAOdVtSbevME/qUweeyayDhzK4dl0BAQRHUiECqFE9mTGJbV06/IBjFI23XYhR/R/EGxCYuipqdm21Y9QhA5ON0Jvz3Snd9B8mSFisz6QLMwyY4O0nyvd3NPrAATm6Uq4iBgKoUT2ZMYltXTr8gGMUjbddiFH9H8QbEJi6Kmp2bbVj1Bj1fsZdLQAAgAEAAIBkAACAAAAAAAAAAAAiBgOTjdCb890p3fQfJkhYrM+kCzMMmODtJ8r3dzT6wAE5uhgAAAABLQAAgAEAAIBkAACAAAAAAAAAAAAAAQD3AgAAAAABAeXWoP/F+Dh6kMRjv2FK5TYJtymIxEr8ald/ImZryXGnAAAAABcWABQoOGSJ0Vsc3f0kW1Brj/LZCbGNNv7///8CoIYBAAAAAAAXqRSEeQctWlUO4JALWvfnCvV1UnqHnYeGzhgFAAAAABepFNL7ColY5V1MbD/1j5cP27owBuwHhwJHMEQCIAenGG5q+5PedJs6kF0cdDf0cPlwlepBBTi2rDPRWpR4AiBaZhGMfcLhTXMloSLrACH1Th29XfuP1WslP6N4JxavPQEhA/WVHMzPAJZNVO76eCgK4IPg8PDMY4L9J7P7/f7ajdLHspsYACICAqhRPZkxiW1dOvyAYxSNt12IUf0fxBsQmLoqanZttWPUSDBFAiEAivSITyv71FZeWMHn0PTLNvjrwhBGbRZcSDEd3EDffcgCIBcZb0NV9mYh3g/tlwAs+9bvcWPIgqcJ8E5d0LvpYLy9AQEER1IhAqhRPZkxiW1dOvyAYxSNt12IUf0fxBsQmLoqanZttWPUIQOTjdCb890p3fQfJkhYrM+kCzMMmODtJ8r3dzT6wAE5ulKuIgYCqFE9mTGJbV06/IBjFI23XYhR/R/EGxCYuipqdm21Y9QY9X7GXS0AAIABAACAZAAAgAAAAAAAAAAAIgYDk43Qm/PdKd30HyZIWKzPpAszDJjg7SfK93c0+sABOboYAAAAAS0AAIABAACAZAAAgAAAAAAAAAAAAAABAEdSIQIaBJdHEgNF+pAX+0LY/z1PsdLvTIBUaHLF2lE7q9UVhSEDoACV30g2ftIeXG7dUK9DUjEb8GDrEAQly3r0MxqhqtBSriICAhoEl0cSA0X6kBf7Qtj/PU+x0u9MgFRocsXaUTur1RWFGAAAAAEtAACAAQAAgGQAAIABAAAAAAAAACICA6AAld9INn7SHlxu3VCvQ1IxG/Bg6xAEJct69DMaoarQGPV+xl0tAACAAQAAgGQAAIABAAAAAAAAAAA="
  },
  {
    network: "testnet" /* TESTNET */,
    type: P2SH_P2WSH,
    bip32Path: "m/48'/1'/100'/1'/0/0",
    policyHmac: "209c71790a3745bc398a86dc20bc058101f44e3c05fb4430907464555fca61d7",
    publicKey: "026aaa7c4697ff439bfd6c7a70abf66253b4e329654b41ee2ad21d68b854e4a422",
    publicKeys: [
      "025566585b3a8066b7d0bba4d2b24c3c59a5f527d62c100bbb7073a7cb2565418c",
      "026aaa7c4697ff439bfd6c7a70abf66253b4e329654b41ee2ad21d68b854e4a422"
    ],
    witnessScriptOps: "OP_2 025566585b3a8066b7d0bba4d2b24c3c59a5f527d62c100bbb7073a7cb2565418c 026aaa7c4697ff439bfd6c7a70abf66253b4e329654b41ee2ad21d68b854e4a422 OP_2 OP_CHECKMULTISIG",
    witnessScriptHex: "5221025566585b3a8066b7d0bba4d2b24c3c59a5f527d62c100bbb7073a7cb2565418c21026aaa7c4697ff439bfd6c7a70abf66253b4e329654b41ee2ad21d68b854e4a42252ae",
    redeemScriptOps: "OP_0 deeb888c0a0a1871a3da4c2e75ffab5eb17e9d27fccd41bc3d683a2674f93aa1",
    redeemScriptHex: "0020deeb888c0a0a1871a3da4c2e75ffab5eb17e9d27fccd41bc3d683a2674f93aa1",
    scriptOps: "OP_HASH160 dac0270cbf87a65c0cf4fd2295eb44c756b288ec OP_EQUAL",
    scriptHex: "a914dac0270cbf87a65c0cf4fd2295eb44c756b288ec87",
    address: "2NDBsV6VBe4d2Ukp2XB644dg2xZ2SuWGkyG",
    utxos: [
      {
        txid: "429da41d05db69d7c006e91b15031e6d47faab15adba3c97059eeea093c36a23",
        index: 0,
        amountSats: "100000",
        // 0.001 BTC
        transactionHex: "02000000000101845266686d5d2473fb09982c72da0d6d66b057c3e13a6eb4bfda304076efe7650000000017160014a89baf1e6b16698bf34927d4a1f71270a57972d6feffffff02a08601000000000017a914dac0270cbf87a65c0cf4fd2295eb44c756b288ec871d8d16000000000017a91471e39bcec3aead7b1d45ad04aea8ad231be756768702473044022067dbe8b2623bd3948bfca811f934c1b512d7add1a09ff70a5b0e083edccbee780220325924a596ce2b567797b53eaa7eec3f6a989427829479ea5619ed72aaeffea40121023251e686167dbea8774b3510a78caa67550d566bd078c1285aa69ec0c561f767ee9b1800"
      },
      {
        txid: "d8edcd3ef4293a2554a147f048442d735fb54b901c1e39ffdb59448c1abae812",
        index: 0,
        amountSats: "100000",
        // 0.001 BTC
        transactionHex: "02000000000101236ac393a0ee9e05973cbaad15abfa476d1e03151be906c0d769db051da49d4201000000171600149df8fa8c17c034dd0e4f96c1eb0110113037ff71feffffff02a08601000000000017a914dac0270cbf87a65c0cf4fd2295eb44c756b288ec87d70515000000000017a9144b1d195a2cf70e3233aaf8e229d9d2a2da1b7845870247304402205c2e3d2cb7c8aa461aabb5c74210f795ec018db703910c9556f8b222012bb3ad02200f8c63fd859b575a6a762df0019f18ad917cf9de1e128e33bc540c4e5356b9ea012103280eb7fdde76317c63664c46bfe7602f6ff64a0dc22695c7e7093f34b40c5536ee9b1800"
      },
      {
        txid: "ff43f4cc8473341ce9effb91d715a4deb4e8a8cb669dd1d119a3a30552a829d1",
        index: 0,
        amountSats: "100000",
        // 0.001 BTC
        transactionHex: "02000000000101eef67cc41c10722be710952296866ea13ed1608acdf15e453e8d874e6a15c6d50000000017160014a989c1c6a3dbbf44d508d5f36df2d08c97e9fca4feffffff02a08601000000000017a914dac0270cbf87a65c0cf4fd2295eb44c756b288ec87a5b90d000000000017a914d0324b98895786d859ae3ee3df0c384249f1a4ab870247304402200621a08b242b807a0c39b6e0bf302e503b9a2596acdd218b176cb62afba31824022027bb2cc91b5ae57500a2e3c440d4d45cc42617f4db665a1b25974122b3789ddd01210209bb437e2e4658c6eb92c20a1ef459a2d1da50757dfba0c49a19dd3dbd621d87e09b1800"
      }
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES["testnet" /* TESTNET */][P2SH_P2WSH],
          amountSats: "291590"
        },
        {
          address: CHANGE_ADDRESSES["testnet" /* TESTNET */][P2SH_P2WSH],
          amountSats: "7922",
          value: 7922,
          bip32Derivation: [
            {
              masterFingerprint: Buffer.from("f57ec65d", "hex"),
              path: "m/48'/1'/100'/1'/1/0",
              pubkey: Buffer.from(
                "02ade44fc6568a4a334b1797140534707a5dd60c247a59523c577ad9eb59d798ba",
                "hex"
              )
            },
            {
              masterFingerprint: Buffer.from("00000002", "hex"),
              path: "m/48'/1'/100'/1'/1/0",
              pubkey: Buffer.from(
                "02489bfaa3dc33e5d2325295d9d1367f35a45fce09c96db6456fc712938dc2c0c7",
                "hex"
              )
            }
          ],
          redeemScript: Buffer.from(
            "0020d6a0f404c62823b51ca0468c3d58e8a210d8afb377372060a58e0ad1471466e0",
            "hex"
          ),
          witnessScript: Buffer.from(
            "522102489bfaa3dc33e5d2325295d9d1367f35a45fce09c96db6456fc712938dc2c0c72102ade44fc6568a4a334b1797140534707a5dd60c247a59523c577ad9eb59d798ba52ae",
            "hex"
          )
        }
      ],
      hex: "0100000003236ac393a0ee9e05973cbaad15abfa476d1e03151be906c0d769db051da49d420000000000ffffffff12e8ba1a8c4459dbff391e1c904bb55f732d4448f047a154253a29f43ecdedd80000000000ffffffffd129a85205a3a319d1d19d66cba8e8b4dea415d791fbefe91c347384ccf443ff0000000000ffffffff02067304000000000017a914e3ba1151b75effbf7adc4673c83c8feec3ddc36787f21e00000000000017a914413d62d98e2bbbf3f8f35f1d00cff58ee25eea178700000000",
      signature: [
        "3044022014672c552254e724b1677849ed4e973f9b60d2d5ae343772b6f2b2220ce1187002206f54a595bc1bc0c430936d27a5ccbd72c8d96aa5fe1fb9ef51778caabeb820dc01",
        "3045022100d23276b4de50e1fa41140e03d295551e868fb51bdf6cca303087be2bb2bf15b30220399b2f7678879eda4e59124cd7f3137b8ef9c2c1770119a2b5124503decc4b0501",
        "3045022100af3b112d039fb101483a87639b96439fa32d654a971d060afafa7a2ee08f3abc0220513fd7823d06d89c3cb58107ea9e94042cffe57ae5e6a7fe9c965cc3e961677401"
      ],
      // Coldcard is now grinding nonces on signatures to produce low s-value (71 bytes or fewer ... e.g. starts with 0x3044 ...)
      byteCeilingSignature: [
        "3044022014672c552254e724b1677849ed4e973f9b60d2d5ae343772b6f2b2220ce1187002206f54a595bc1bc0c430936d27a5ccbd72c8d96aa5fe1fb9ef51778caabeb820dc01",
        "304402200d890939820ede1525454bf673e1b3682cb21e80f52304e57cc8e5d6882fe3bb022030f44d9c4213d38dc649feebcd48a3bd24de896da137e86618881a85915cdc0501",
        "3044022065bbb9e3ab14a82680bb845de2e55b84d224f773722807f78c7be69aa1ede2bb02206bbcd5bf52039bc3049e683a441efdcde011435625b8709c59cf9680c2837f2501"
      ]
    },
    braidDetails: {
      network: "testnet" /* TESTNET */,
      addressType: P2SH_P2WSH,
      extendedPublicKeys: [
        NODES["m/48'/1'/100'/1'"].open_source,
        NODES["m/48'/1'/100'/1'"].unchained
      ],
      requiredSigners: 2,
      index: "0"
    },
    psbtNoChange: "cHNidP8BAKUBAAAAAyNqw5Og7p4Flzy6rRWr+kdtHgMVG+kGwNdp2wUdpJ1CAAAAAAD/////Eui6GoxEWdv/OR4ckEu1X3MtREjwR6FUJTop9D7N7dgAAAAAAP/////RKahSBaOjGdHRnWbLqOi03qQV15H77+kcNHOEzPRD/wAAAAAA/////wEGcwQAAAAAABepFOO6EVG3Xv+/etxGc8g8j+7D3cNnhwAAAAAAAQEgoIYBAAAAAAAXqRTawCcMv4emXAz0/SKV60THVrKI7IcBBCIAIN7riIwKChhxo9pMLnX/q16xfp0n/M1BvD1oOiZ0+TqhAQVHUiECVWZYWzqAZrfQu6TSskw8WaX1J9YsEAu7cHOnyyVlQYwhAmqqfEaX/0Ob/Wx6cKv2YlO04yllS0HuKtIdaLhU5KQiUq4iBgJVZlhbOoBmt9C7pNKyTDxZpfUn1iwQC7twc6fLJWVBjBzvpdkWMAAAgAEAAIBkAACAAQAAgAAAAAAAAAAAIgYCaqp8Rpf/Q5v9bHpwq/ZiU7TjKWVLQe4q0h1ouFTkpCIc9X7GXTAAAIABAACAZAAAgAEAAIAAAAAAAAAAAAABASCghgEAAAAAABepFNrAJwy/h6ZcDPT9IpXrRMdWsojshwEEIgAg3uuIjAoKGHGj2kwudf+rXrF+nSf8zUG8PWg6JnT5OqEBBUdSIQJVZlhbOoBmt9C7pNKyTDxZpfUn1iwQC7twc6fLJWVBjCECaqp8Rpf/Q5v9bHpwq/ZiU7TjKWVLQe4q0h1ouFTkpCJSriIGAlVmWFs6gGa30Luk0rJMPFml9SfWLBALu3Bzp8slZUGMHO+l2RYwAACAAQAAgGQAAIABAACAAAAAAAAAAAAiBgJqqnxGl/9Dm/1senCr9mJTtOMpZUtB7irSHWi4VOSkIhz1fsZdMAAAgAEAAIBkAACAAQAAgAAAAAAAAAAAAAEBIKCGAQAAAAAAF6kU2sAnDL+HplwM9P0iletEx1ayiOyHAQQiACDe64iMCgoYcaPaTC51/6tesX6dJ/zNQbw9aDomdPk6oQEFR1IhAlVmWFs6gGa30Luk0rJMPFml9SfWLBALu3Bzp8slZUGMIQJqqnxGl/9Dm/1senCr9mJTtOMpZUtB7irSHWi4VOSkIlKuIgYCVWZYWzqAZrfQu6TSskw8WaX1J9YsEAu7cHOnyyVlQYwc76XZFjAAAIABAACAZAAAgAEAAIAAAAAAAAAAACIGAmqqfEaX/0Ob/Wx6cKv2YlO04yllS0HuKtIdaLhU5KQiHPV+xl0wAACAAQAAgGQAAIABAACAAAAAAAAAAAAAAA==",
    psbt: "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",
    psbtWithGlobalXpub: "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",
    psbtPartiallySigned: "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"
  },
  {
    network: "testnet" /* TESTNET */,
    type: P2WSH,
    bip32Path: "m/48'/1'/100'/2'/0/0",
    policyHmac: "ff8e053e3417029696f0222355adb2b386a825c85a40fa4bb125501d59fef416",
    publicKey: "03bc34c50cf768f802290269c2ddabd086c73514c880cecb6db3f67676a4b72469",
    publicKeys: [
      "035a763e0480f858ef626b649fa0efe9eb647abbf77db54f3af904d2de50c4342d",
      "03bc34c50cf768f802290269c2ddabd086c73514c880cecb6db3f67676a4b72469"
    ],
    witnessScriptOps: "OP_2 035a763e0480f858ef626b649fa0efe9eb647abbf77db54f3af904d2de50c4342d 03bc34c50cf768f802290269c2ddabd086c73514c880cecb6db3f67676a4b72469 OP_2 OP_CHECKMULTISIG",
    witnessScriptHex: "5221035a763e0480f858ef626b649fa0efe9eb647abbf77db54f3af904d2de50c4342d2103bc34c50cf768f802290269c2ddabd086c73514c880cecb6db3f67676a4b7246952ae",
    scriptOps: "OP_0 ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d068",
    scriptHex: "0020ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d068",
    address: "tb1qhgj3fnwn50pq966rjnj4pg8uz9ktsd8nge32qxd73ffvvg636p5q54g7m0",
    utxos: [
      {
        txid: "84df8dcc9b86e8c7bb39ce0ba9f577ec750f0b64df97a5c9559cf39243a1f501",
        index: 0,
        amountSats: "100000",
        // 0.001 BTC
        transactionHex: "020000000001018342873aa48ba6b2e5a796f34b7431bb56f9c569a6bd8f7e539cb3147a86b3f80000000000feffffff02a086010000000000220020ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d068a9873f0000000000160014208e4178e48f2d270a06475ad8caeb2e01f55ae80247304402205369dedb14963e0bfa22748a546e03e47fcf994c85944ae0d6b507d15ebba57d022073cdd6c8af057aabac652ec438de7fc7e201d6a3b8619e54a2db5c1b509865e9012103ba504ae1099d8f38163c90540fa10e09cac4fa2df95b8b91bc2aba01571c27d9ee9b1800"
      },
      {
        txid: "f010998e033355636c2ba34af753cd6d5f198889a379bc30625bb38f646f3d72",
        index: 0,
        amountSats: "100000",
        // 0.001 BTC
        transactionHex: "0200000000010144ae6108a1c6e0eee65edfc7e91b72026263769cb87714a99dd45db8fbc143f201000000171600142ff3a6303add9138957b880c73a331cf718a418ffeffffff02a086010000000000220020ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d068364717050000000016001403f4d726aec3c06aa8a31b230e9997288faea72a02473044022032368bd2b2441840850b62f86bfa4434854b5e83da1e5cac43cd613a88f91839022042b2f9f7ea20c97d889a89b0f7cb649b8bb3acc20c4207b5665e235b340766a101210216bb0c99eb498379d5c7b7ad0f3afb9ff3eec9be622fffe821c5456003f22c02ee9b1800"
      },
      {
        txid: "f8b3867a14b39c537e8fbda669c5f956bb31744bf396a7e5b2a68ba43a874283",
        index: 1,
        amountSats: "100000",
        // 0.001 BTC
        transactionHex: "020000000001012a023ec5a05681f4bcb56b9e45884f625a96658e1da16f802e102e31a81a9eae0000000017160014c4733d80022a7a3dde9a7e3112b39e390500713cfeffffff02e20e410000000000160014060213b00b3d902d2bd7e90c4b7e9e34830d2f9da086010000000000220020ba2514cdd3a3c202eb4394e550a0fc116cb834f34662a019be8a52c62351d0680247304402201504b1dbf14cf216c7de1fa78dd649a319b2274361034aaa9bc82473632650d1022013da0cb0bb740a95010821e451e7fc699bb2489e71c20093d8d3cd3f4e8c2efc012102db49c46b1a64061d15d0faa234e8da59defe0f4164009e73be9be540265cf0caee9b1800"
      }
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES["testnet" /* TESTNET */][P2WSH],
          amountSats: "291590"
        },
        {
          address: CHANGE_ADDRESSES["testnet" /* TESTNET */][P2WSH],
          amountSats: "8023",
          value: 8023,
          bip32Derivation: [
            {
              masterFingerprint: Buffer.from("f57ec65d", "hex"),
              path: "m/48'/1'/100'/2'/1/0",
              pubkey: Buffer.from(
                "02f45fa86e1ac4e69c0f183c769db9157740586c78b24c495be0404c1e6ae029e5",
                "hex"
              )
            },
            {
              masterFingerprint: Buffer.from("00000003", "hex"),
              path: "m/48'/1'/100'/2'/1/0",
              pubkey: Buffer.from(
                "03610bec03e459c7fa28c9a36c4c9db6e2c4bc2ae4e2764aa3d035599c7052e33f",
                "hex"
              )
            }
          ],
          witnessScript: Buffer.from(
            "522102f45fa86e1ac4e69c0f183c769db9157740586c78b24c495be0404c1e6ae029e52103610bec03e459c7fa28c9a36c4c9db6e2c4bc2ae4e2764aa3d035599c7052e33f52ae",
            "hex"
          )
        }
      ],
      hex: "010000000301f5a14392f39c55c9a597df640b0f75ec77f5a90bce39bbc7e8869bcc8ddf840000000000ffffffff723d6f648fb35b6230bc79a38988195f6dcd53f74aa32b6c635533038e9910f00000000000ffffffff8342873aa48ba6b2e5a796f34b7431bb56f9c569a6bd8f7e539cb3147a86b3f80100000000ffffffff0206730400000000002200202de5497b772a7cbd61cd60a359cb412099da25725671d1e1a00de8ec46752dc8571f000000000000220020bc964191e076e9fd328cf115ebe35bd3d9b7b4f937c71c41cd19a08e9100635400000000",
      signature: [
        "304402202269a8c0bd3baa357cb0bad6dc8c1808bdf1b9f4ded6ad321f25dfb3b9f8fe1002206cad4a70c21531032c586f6e2016c657dbd8c69a01c806e3382465269876b5db01",
        "304402205a414f8c1c55ee8d3d05cc6e3b5accc413297baa3d061c570c44af3ccbd01b7902205d99aad28720be4c4f80afc64870c3edbb9f28e8ddf5ac6a0d1ab149699c61b501",
        "30440220019a8b7a875af9429305a89b63d919aeae3bf87354e4043958b51fa1f5525df902200723f42838800a698a5c97bdffc53a80e6901346cc8e6000e52a92180f41462f01"
      ],
      // Coldcard is now grinding nonces on signatures to produce low s-value (71 bytes or fewer ... e.g. starts with 0x3044 ...)
      // Here all signatures were already <= 71 bytes in length, so duplicate
      byteCeilingSignature: [
        "304402202269a8c0bd3baa357cb0bad6dc8c1808bdf1b9f4ded6ad321f25dfb3b9f8fe1002206cad4a70c21531032c586f6e2016c657dbd8c69a01c806e3382465269876b5db01",
        "304402205a414f8c1c55ee8d3d05cc6e3b5accc413297baa3d061c570c44af3ccbd01b7902205d99aad28720be4c4f80afc64870c3edbb9f28e8ddf5ac6a0d1ab149699c61b501",
        "30440220019a8b7a875af9429305a89b63d919aeae3bf87354e4043958b51fa1f5525df902200723f42838800a698a5c97bdffc53a80e6901346cc8e6000e52a92180f41462f01"
      ]
    },
    braidDetails: {
      network: "testnet" /* TESTNET */,
      addressType: P2WSH,
      extendedPublicKeys: [
        NODES["m/48'/1'/100'/2'"].open_source,
        NODES["m/48'/1'/100'/2'"].unchained
      ],
      requiredSigners: 2,
      index: "0"
    },
    psbtNoChange: "cHNidP8BALABAAAAAwH1oUOS85xVyaWX32QLD3Xsd/WpC845u8fohpvMjd+EAAAAAAD/////cj1vZI+zW2IwvHmjiYgZX23NU/dKoytsY1UzA46ZEPAAAAAAAP////+DQoc6pIumsuWnlvNLdDG7VvnFaaa9j35TnLMUeoaz+AEAAAAA/////wEGcwQAAAAAACIAIC3lSXt3Kny9Yc1go1nLQSCZ2iVyVnHR4aAN6OxGdS3IAAAAAAABASughgEAAAAAACIAILolFM3To8IC60OU5VCg/BFsuDTzRmKgGb6KUsYjUdBoAQVHUiEDWnY+BID4WO9ia2SfoO/p62R6u/d9tU86+QTS3lDENC0hA7w0xQz3aPgCKQJpwt2r0IbHNRTIgM7LbbP2dnaktyRpUq4iBgNadj4EgPhY72JrZJ+g7+nrZHq79321Tzr5BNLeUMQ0LRzvpdkWMAAAgAEAAIBkAACAAgAAgAAAAAAAAAAAIgYDvDTFDPdo+AIpAmnC3avQhsc1FMiAzstts/Z2dqS3JGkc9X7GXTAAAIABAACAZAAAgAIAAIAAAAAAAAAAAAABASughgEAAAAAACIAILolFM3To8IC60OU5VCg/BFsuDTzRmKgGb6KUsYjUdBoAQVHUiEDWnY+BID4WO9ia2SfoO/p62R6u/d9tU86+QTS3lDENC0hA7w0xQz3aPgCKQJpwt2r0IbHNRTIgM7LbbP2dnaktyRpUq4iBgNadj4EgPhY72JrZJ+g7+nrZHq79321Tzr5BNLeUMQ0LRzvpdkWMAAAgAEAAIBkAACAAgAAgAAAAAAAAAAAIgYDvDTFDPdo+AIpAmnC3avQhsc1FMiAzstts/Z2dqS3JGkc9X7GXTAAAIABAACAZAAAgAIAAIAAAAAAAAAAAAABASughgEAAAAAACIAILolFM3To8IC60OU5VCg/BFsuDTzRmKgGb6KUsYjUdBoAQVHUiEDWnY+BID4WO9ia2SfoO/p62R6u/d9tU86+QTS3lDENC0hA7w0xQz3aPgCKQJpwt2r0IbHNRTIgM7LbbP2dnaktyRpUq4iBgNadj4EgPhY72JrZJ+g7+nrZHq79321Tzr5BNLeUMQ0LRzvpdkWMAAAgAEAAIBkAACAAgAAgAAAAAAAAAAAIgYDvDTFDPdo+AIpAmnC3avQhsc1FMiAzstts/Z2dqS3JGkc9X7GXTAAAIABAACAZAAAgAIAAIAAAAAAAAAAAAAA",
    psbt: "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",
    psbtWithGlobalXpub: "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",
    psbtPartiallySigned: "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"
  },
  {
    network: "mainnet" /* MAINNET */,
    type: P2SH,
    bip32Path: "m/45'/0'/100'/0/0",
    policyHmac: "c9f3e4cb4ca50a9a7042e72d0099e2848431b7008773cd96f40bc406a71ceb33",
    publicKey: "02583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace79",
    publicKeys: [
      "02583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace79",
      "02b024e76d6c2d8c22d9550467e97ced251ead5592529f9c813c1d818f7e89a35a"
    ],
    redeemScriptOps: "OP_2 02583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace79 02b024e76d6c2d8c22d9550467e97ced251ead5592529f9c813c1d818f7e89a35a OP_2 OP_CHECKMULTISIG",
    redeemScriptHex: "522102583c4776b51691f4e036c8e0eb160f3464a2de9ae4c6818b7945c78fc6bace792102b024e76d6c2d8c22d9550467e97ced251ead5592529f9c813c1d818f7e89a35a52ae",
    scriptOps: "OP_HASH160 f18bcbf45f7805fe663339d838d5c8a086d79e53 OP_EQUAL",
    scriptHex: "a914f18bcbf45f7805fe663339d838d5c8a086d79e5387",
    address: "3PiCF26aq57Wo5DJEbFNTVwD1bLCUEpAYZ",
    utxos: [
      {
        txid: "456813be8389d17e945c0b91b5112938a7268bb7c6721147bce6521eeabde7b0",
        index: 0,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "0200000000010216ac0943cd43bb8168c591016a0a5439b3124427bf5df0582f68f2ae52fc86560000000017160014f827ea2db54a62d5027b411ff9d2d6e9234796a8feffffffd9bde17e907b90631edc22f83a4f849d9527e4a3d3b3096fdfc8131eeb8c4c8201000000171600141aabdcba4979e2772ad5da60e757f6d992c09d41feffffff02102700000000000017a914f18bcbf45f7805fe663339d838d5c8a086d79e5387ac0700000000000017a914df0aa2a92361822c637c0e44fb1cae2f1a22f0df870247304402204f91360c63c8ce6c98ebec06a6710e5f016cac8d8733c3855401f821f437c5650220611c87d76c2e72accb892cff110f0837d6d60942fdaea2edf86098af355016570121033c5f5b6c028649dedbe089033d6736788199041567b510d88448d0d1bcd5675d024730440220296ce4c551c6945176d8f057c9d05d7a21aa7ccb4c1d8d692c8937b00e3a9be4022024a514a72e4c52ee9c7bcf5c60dd7fb8ee4e83059d0869d85a6659e4d6737535012103c86c2e648f8e34be880b5f12d33bfd712c552ebf68fe01a1daebf2a24a44cbfa99490900"
      },
      {
        txid: "5bbf64e036e46bf93dadc770f0415f6566453b9ae2d932df00fd5b5e49bdbbd5",
        index: 1,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "0200000000010133f0ca4e94d7ad6673a3777ed56fbcf0d2ebc5f6578578746c989ba2ec20cfaa0300000017160014c530831acb421c9ac89d1a83113acf4b46b3a2affeffffff02f00602000000000017a914939b4923002a1f44854a671be64cf55846d4f5f887102700000000000017a914f18bcbf45f7805fe663339d838d5c8a086d79e5387024730440220044dac81ef05b655fb6e72a21423f2db9fd4fc938243ba8293f7f0f24c7e56e202201fa946e11c0be1eeae81fe2418a8d30bf39048fc110e6aaf253149ef47dc8d28012103fb20014d5c613fc2d5a588cf6ea9292afa843a8e5f14dfe9d4e18e5cb158ecee99490900"
      },
      {
        txid: "74c11de1a3f1a5daa06441d78d7fb45609b3415721466c6256bffd881451cda5",
        index: 0,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "02000000000101d748779bd254dce3523c691a9ce1bf8836d524ba97d26cc24127e3367a2027f600000000171600141aabdcba4979e2772ad5da60e757f6d992c09d41feffffff02102700000000000017a914f18bcbf45f7805fe663339d838d5c8a086d79e5387025b00000000000017a9145d0e078b76ff5e990bf628bf28f593d217caaeb9870247304402206b99e2475b2424db1e47fdb9689036fa44d5c9dea3e5419f26759eed86920c91022011c38e5e69280e62353088d5bf28ecf15a3ff348edcad8c31e441f9f57da172a012103c86c2e648f8e34be880b5f12d33bfd712c552ebf68fe01a1daebf2a24a44cbfa99490900"
      }
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES["mainnet" /* MAINNET */][P2SH],
          amountSats: "21590"
        },
        {
          address: CHANGE_ADDRESSES["mainnet" /* MAINNET */][P2SH],
          amountSats: "7535",
          value: 7535,
          bip32Derivation: [
            {
              masterFingerprint: Buffer.from("f57ec65d", "hex"),
              path: "m/45'/0'/100'/1/0",
              pubkey: Buffer.from(
                "0360fc2c3410b3700822c31d4901640cf763714f30ff45f887e86bee8733509ebe",
                "hex"
              )
            },
            {
              masterFingerprint: Buffer.from("00000004", "hex"),
              path: "m/45'/0'/100'/1/0",
              pubkey: Buffer.from(
                "039c064999a7c238c31ee018b1b7983fb657edfdf23f4d46bde919817a39cbcbb3",
                "hex"
              )
            }
          ],
          redeemScript: Buffer.from(
            "52210360fc2c3410b3700822c31d4901640cf763714f30ff45f887e86bee8733509ebe21039c064999a7c238c31ee018b1b7983fb657edfdf23f4d46bde919817a39cbcbb352ae",
            "hex"
          )
        }
      ],
      hex: "0100000003b0e7bdea1e52e6bc471172c6b78b26a7382911b5910b5c947ed18983be1368450000000000ffffffffd5bbbd495e5bfd00df32d9e29a3b4566655f41f070c7ad3df96be436e064bf5b0100000000ffffffffa5cd511488fdbf56626c46215741b30956b47f8dd74164a0daa5f1a3e11dc1740000000000ffffffff02565400000000000017a91480b2477411a78b2a939d7da08bfa1939a871a4b9876f1d00000000000017a914335131487569e42724cb7fe4818a348aa6bc7afa8700000000",
      signature: [
        "30440220518d201f915aa1379e4dfd986b6f6bf083e07f9d132ecf1e29d79e292f4c610402207df5c8ff1b0e5958d60b45b5475f3a88065ab64d5f3e6f56162d4f32c423b52c01",
        "3045022100f401617786808a938b0ae8a954ea32a0466eb6f49ae0b196fc0ae50ff43036f002200f72df0f6bb0710eeb61999a96d005f9853183ecbdad7bc5fb65f1169796f49d01",
        "3044022077baef2ae7425a978d67356ea033274909bbd787076f9b5567268e1c1548db76022022367961eea5cb177ccf974e6df1091aa4ee7ea9451afb157541a71078ecd97d01"
      ],
      // Coldcard is now grinding nonces on signatures to produce low s-value (71 bytes or fewer ... e.g. starts with 0x3044 ...)
      byteCeilingSignature: [
        "30440220518d201f915aa1379e4dfd986b6f6bf083e07f9d132ecf1e29d79e292f4c610402207df5c8ff1b0e5958d60b45b5475f3a88065ab64d5f3e6f56162d4f32c423b52c01",
        "3044022000cd3b6d7c190049e051421d50310da4ca0f46471b517f41b18e2a26897454f8022026fd1a3e0874a9ca7f8c359a9044b38c2f5be3004b1fe10d6da51c3cbab546af01",
        "3044022077baef2ae7425a978d67356ea033274909bbd787076f9b5567268e1c1548db76022022367961eea5cb177ccf974e6df1091aa4ee7ea9451afb157541a71078ecd97d01"
      ]
    },
    braidDetails: {
      network: "mainnet" /* MAINNET */,
      addressType: P2SH,
      extendedPublicKeys: [
        NODES["m/45'/0'/100'"].open_source,
        NODES["m/45'/0'/100'"].unchained
      ],
      requiredSigners: 2,
      index: "0"
    },
    psbtNoChange: "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",
    psbt: "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",
    psbtWithGlobalXpub: "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",
    psbtPartiallySigned: "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"
  },
  {
    network: "mainnet" /* MAINNET */,
    type: P2SH_P2WSH,
    bip32Path: "m/48'/0'/100'/1'/0/0",
    policyHmac: "d7461610bc48a84f199e1c9a081227d8f36a0c32e8adb141f4bc410aa999375f",
    publicKey: "0342997f6fcd7fa4a3c7e290c8867148992e6194742120985c664d9e214461af7c",
    publicKeys: [
      "0328b57c2f65c98ed7cde4bca54cc3a13afa4d47117fd9dae06663a4169e05ef86",
      "0342997f6fcd7fa4a3c7e290c8867148992e6194742120985c664d9e214461af7c"
    ],
    witnessScriptOps: "OP_2 0328b57c2f65c98ed7cde4bca54cc3a13afa4d47117fd9dae06663a4169e05ef86 0342997f6fcd7fa4a3c7e290c8867148992e6194742120985c664d9e214461af7c OP_2 OP_CHECKMULTISIG",
    witnessScriptHex: "52210328b57c2f65c98ed7cde4bca54cc3a13afa4d47117fd9dae06663a4169e05ef86210342997f6fcd7fa4a3c7e290c8867148992e6194742120985c664d9e214461af7c52ae",
    redeemScriptOps: "OP_0 049d6e945074525b03e0487759368ff663f10bb88976017bdd9d3cce849085e5",
    redeemScriptHex: "0020049d6e945074525b03e0487759368ff663f10bb88976017bdd9d3cce849085e5",
    scriptOps: "OP_HASH160 1abcf8cea321ca874de4beb4f975077fe864a54a OP_EQUAL",
    scriptHex: "a9141abcf8cea321ca874de4beb4f975077fe864a54a87",
    address: "348PsXezZAHcW7RjmCoMJ8PHWx1QBTXJvm",
    utxos: [
      {
        txid: "2062282a8c6644740d4a5c85a74ad21c6a0fda8d753e8a4bdfba09a26d20eb40",
        index: 1,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "02000000000104e7f99e90ef69f7bf577cc34c695469d1ef2e021320f4f5d312a439fa5119214c010000001716001458ff1cdc218f9baaf9a5ac278206e8f8cc2d55a2feffffffb0e7bdea1e52e6bc471172c6b78b26a7382911b5910b5c947ed18983be13684501000000171600144245d8387278181e8f5d61e35427fa055f891ccefeffffffb68f87f28f11710b7005426340c4c4d9795c331f027549bd383b6f179d709a280000000000feffffff79d037447d0706083212ec168a5b3e24f97bd7a9e0099b105b042781853780810000000017160014ec62a1ca200abdc755c8b34faae78202b6dd3fc3feffffff02920500000000000017a91449e9133aaffa9192d802655f2db8fa1db9eec00887102700000000000017a9141abcf8cea321ca874de4beb4f975077fe864a54a8702473044022069c0985164d17c746fb818179f969740e39d6569ec5a144a83c72de2473b6b8002204f62217bbb2b34efedda454c85dfa960788d4c7f538c7fdf22c5074f5a2c78bb012103e74f757ceb0288ac7c051b7db87fb059a19eac05a480c65c913068a6f80d23b80247304402200f827b64e5feb6071f5d4278e4fa3643e164316ab897f53df0482658e753110202201143f4348812122322876aa29a7285cc8ea51a3e32fb0392fd2e6422d63793f501210350de53693c9da7f849cab9479304ee2b2af317f28ee00ed1e112cd95bc200bd2024730440220025e0eff09b09817e8d595c01bfd2fdba6082e2c4f8f286545f9a2a2e9f148ba02205725704e14c2969a1afcf0084dd29bdbc5136b75438158ecf76992e3c24b561f012102e24e7df260cb56ffbcdb52bea6f8c8bc267d849f5799cf919e32574568ed85d602473044022011bbd9ec6338f174fa0a386acb1fb4dfe348343b2eed5017b11e96151ad214ca02207e7bb5443f34d33147f28fafb4cd661dccc7c6993ad7c58ed47197c85b48c849012102587990c5f71d9e4c894069589845c5f2649b83006160b9d1b8f31bab54133a9399490900"
      },
      {
        txid: "4c211951fa39a412d3f5f42013022eefd16954694cc37c57bff769ef909ef9e7",
        index: 0,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "02000000000101a5cd511488fdbf56626c46215741b30956b47f8dd74164a0daa5f1a3e11dc1740100000017160014eeeff0e10da2973449331a9e48f246b18488e965feffffff02102700000000000017a9141abcf8cea321ca874de4beb4f975077fe864a54a87bd2a00000000000017a91445a77947cf42db7fec41cec25c28af0b73becf2e8702473044022044858a87117fd8af2fa92db123935019d76ee9157fb9a48a9cd97ee085b128f90220572b799eae6f3f8cf6aa287450ff46b21588840dabeeb63e57c6f3f320f49eea0121025abd982f0c9ebbb7238900326af437c393eb2c5e875f5bd63152ddd756e5049a99490900"
      },
      {
        txid: "c5d0e548e2332450057ce5bd2a6fb720b2c8bd6f595ed11fdba71488b1bf7b31",
        index: 1,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "02000000000101d5bbbd495e5bfd00df32d9e29a3b4566655f41f070c7ad3df96be436e064bf5b00000000171600140e021c1c3313ef991acd0c5d9f63ca12ce110005feffffff02abd601000000000017a9145d27db58f13d4851260174d9dc9eacdf62074a4e87102700000000000017a9141abcf8cea321ca874de4beb4f975077fe864a54a8702473044022077b4f0f2d1480443f8b29ed68a29b606b83a3ebbda4349bf813c33330b7f4aa902202061823fd25330b6c0adb68afce4546ada193eb63982f28a7562bc605ea6b0e5012102930a7b8a6fd51a8ce36039bacf160239cfb7dbc72dc1a051aaac333bc7f8e7924e490900"
      }
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES["mainnet" /* MAINNET */][P2SH_P2WSH],
          amountSats: "21590"
        },
        {
          address: CHANGE_ADDRESSES["mainnet" /* MAINNET */][P2SH_P2WSH],
          amountSats: "7922",
          value: 7922,
          bip32Derivation: [
            {
              masterFingerprint: Buffer.from("f57ec65d", "hex"),
              path: "m/48'/0'/100'/1'/1/0",
              pubkey: Buffer.from(
                "029997f9c7094881d241b13b14d8567cdedcaccd411844c55fe09b0b8ca1b254b1",
                "hex"
              )
            },
            {
              masterFingerprint: Buffer.from("00000005", "hex"),
              path: "m/48'/0'/100'/1'/1/0",
              pubkey: Buffer.from(
                "0272834f652444910e1cc157b99f52fd6052826a11f9099879a55490f6b8190be7",
                "hex"
              )
            }
          ],
          redeemScript: Buffer.from(
            "0020581e9806610ac1c8249dc3446e01f8365ecfc506462379d6948baa0d128c519a",
            "hex"
          ),
          witnessScript: Buffer.from(
            "52210272834f652444910e1cc157b99f52fd6052826a11f9099879a55490f6b8190be721029997f9c7094881d241b13b14d8567cdedcaccd411844c55fe09b0b8ca1b254b152ae",
            "hex"
          )
        }
      ],
      hex: "010000000340eb206da209badf4b8a3e758dda0f6a1cd24aa7855c4a0d7444668c2a2862200100000000ffffffffe7f99e90ef69f7bf577cc34c695469d1ef2e021320f4f5d312a439fa5119214c0000000000ffffffff317bbfb18814a7db1fd15e596fbdc8b220b76f2abde57c05502433e248e5d0c50100000000ffffffff02565400000000000017a91480b2477411a78b2a939d7da08bfa1939a871a4b987f21e00000000000017a91407339e0dab9b912f9972f96e7d6c6d09e38b7c828700000000",
      signature: [
        "3045022100e218d80acbbf41b2ad630d7c4b7eb345934466cf205ac119bd41ce2bd3ab0daa022048a1238dc01d06ed57cf5715d5e74397fcb433001b1e39a6821d653ea0ac683601",
        "3045022100bdfd743229bafc6ff66524413528ac920d8bc5ba002f5112d24a6c19f2035247022073b55186e98329c3d0790d701107491d8a06ccc593f87b00df511bf41fe4d5c101",
        "30440220342d08c89ee1fa13f855eddb253855f94b17ca80390893c832615d35cccdac1102205b9381e2021ed174aff66adcd83a6baa9af0ad98de5f8c66aad1c75f030e275b01"
      ],
      // Coldcard is now grinding nonces on signatures to produce low s-value (71 bytes or fewer ... e.g. starts with 0x3044 ...)
      byteCeilingSignature: [
        "3044022043898cd12541009f4612dc263af1542c785f76d0d17d174d9a6f70d86aa8a5b50220332b539f6afec6de56e399205ef83c9feb4568dff3ca1795ce56081a45978dd401",
        "3044022002953c3d45efc91aab969abfdbe603458a5738a00f8faa5415df6dba0e305a8002200cae08ed7df228c4fdc7725429090dabbad6e5abee729f78519df21ee7fd75f101",
        "30440220342d08c89ee1fa13f855eddb253855f94b17ca80390893c832615d35cccdac1102205b9381e2021ed174aff66adcd83a6baa9af0ad98de5f8c66aad1c75f030e275b01"
      ]
    },
    braidDetails: {
      network: "mainnet" /* MAINNET */,
      addressType: P2SH_P2WSH,
      extendedPublicKeys: [
        NODES["m/48'/0'/100'/1'"].open_source,
        NODES["m/48'/0'/100'/1'"].unchained
      ],
      requiredSigners: 2,
      index: "0"
    },
    psbtNoChange: "cHNidP8BAKUBAAAAA0DrIG2iCbrfS4o+dY3aD2oc0kqnhVxKDXREZowqKGIgAQAAAAD/////5/mekO9p979XfMNMaVRp0e8uAhMg9PXTEqQ5+lEZIUwAAAAAAP////8xe7+xiBSn2x/RXllvvciyILdvKr3lfAVQJDPiSOXQxQEAAAAA/////wFWVAAAAAAAABepFICyR3QRp4sqk519oIv6GTmocaS5hwAAAAAAAQEgECcAAAAAAAAXqRQavPjOoyHKh03kvrT5dQd/6GSlSocBBCIAIASdbpRQdFJbA+BId1k2j/Zj8Qu4iXYBe92dPM6EkIXlAQVHUiEDKLV8L2XJjtfN5LylTMOhOvpNRxF/2drgZmOkFp4F74YhA0KZf2/Nf6Sjx+KQyIZxSJkuYZR0ISCYXGZNniFEYa98Uq4iBgMotXwvZcmO183kvKVMw6E6+k1HEX/Z2uBmY6QWngXvhhzvpdkWMAAAgAAAAIBkAACAAQAAgAAAAAAAAAAAIgYDQpl/b81/pKPH4pDIhnFImS5hlHQhIJhcZk2eIURhr3wc9X7GXTAAAIAAAACAZAAAgAEAAIAAAAAAAAAAAAABASAQJwAAAAAAABepFBq8+M6jIcqHTeS+tPl1B3/oZKVKhwEEIgAgBJ1ulFB0UlsD4Eh3WTaP9mPxC7iJdgF73Z08zoSQheUBBUdSIQMotXwvZcmO183kvKVMw6E6+k1HEX/Z2uBmY6QWngXvhiEDQpl/b81/pKPH4pDIhnFImS5hlHQhIJhcZk2eIURhr3xSriIGAyi1fC9lyY7XzeS8pUzDoTr6TUcRf9na4GZjpBaeBe+GHO+l2RYwAACAAAAAgGQAAIABAACAAAAAAAAAAAAiBgNCmX9vzX+ko8fikMiGcUiZLmGUdCEgmFxmTZ4hRGGvfBz1fsZdMAAAgAAAAIBkAACAAQAAgAAAAAAAAAAAAAEBIBAnAAAAAAAAF6kUGrz4zqMhyodN5L60+XUHf+hkpUqHAQQiACAEnW6UUHRSWwPgSHdZNo/2Y/ELuIl2AXvdnTzOhJCF5QEFR1IhAyi1fC9lyY7XzeS8pUzDoTr6TUcRf9na4GZjpBaeBe+GIQNCmX9vzX+ko8fikMiGcUiZLmGUdCEgmFxmTZ4hRGGvfFKuIgYDKLV8L2XJjtfN5LylTMOhOvpNRxF/2drgZmOkFp4F74Yc76XZFjAAAIAAAACAZAAAgAEAAIAAAAAAAAAAACIGA0KZf2/Nf6Sjx+KQyIZxSJkuYZR0ISCYXGZNniFEYa98HPV+xl0wAACAAAAAgGQAAIABAACAAAAAAAAAAAAAAA==",
    psbt: "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",
    psbtWithGlobalXpub: "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",
    psbtPartiallySigned: "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"
  },
  {
    network: "mainnet" /* MAINNET */,
    type: P2WSH,
    bip32Path: "m/48'/0'/100'/2'/0/0",
    policyHmac: "c18feb515eb8a44070450c38f93aeab036a86192fa6133dcbe55645f89de278a",
    publicKey: "0369e74fc954355b6f7acf9bbec5b861c186852b759a85f92558e420a0202047f4",
    publicKeys: [
      "02e21b7318cfbd482bdbb66441420b9018e5b440bf9b0cdedd427626d81f32605b",
      "0369e74fc954355b6f7acf9bbec5b861c186852b759a85f92558e420a0202047f4"
    ],
    witnessScriptOps: "OP_2 02e21b7318cfbd482bdbb66441420b9018e5b440bf9b0cdedd427626d81f32605b 0369e74fc954355b6f7acf9bbec5b861c186852b759a85f92558e420a0202047f4 OP_2 OP_CHECKMULTISIG",
    witnessScriptHex: "522102e21b7318cfbd482bdbb66441420b9018e5b440bf9b0cdedd427626d81f32605b210369e74fc954355b6f7acf9bbec5b861c186852b759a85f92558e420a0202047f452ae",
    scriptOps: "OP_0 497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa9",
    scriptHex: "0020497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa9",
    address: "bc1qf9asympax4r6xrndsqrw8p0qxe40tm9zkk69tkrc8p6eg8ju075sjeekkt",
    utxos: [
      {
        txid: "4ab356fef8b8205a3b96b4924e8e94f18c4b8ecdefa0bb1ee28ce19f091c3f58",
        index: 0,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "020000000001011aa35769284e2822b65a98ac46472bb5c455831927da993dbe9ad1959c296eaf0100000000feffffff021027000000000000220020497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa94c76010000000000160014553e9be0af92386ae6b4065262dc97fdee9979170247304402206407b5c1fa2fd49b92e6f1802a0eed9e75f55c3db1ea179f077072d0c6e9031602205823ba8d01a6b96db9334affcb9b1e7dfb434cfdc1389287016d6b68c5c2cf0c0121029de99c2fec6fad0a90fb5a7792775477b8d82fa4f213903a2f67d3e2c1d802eb99490900"
      },
      {
        txid: "a21b384dc72b9ef2559339cecd5ad2652171589b1e479497817b617734859d90",
        index: 1,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "02000000000101583f1c099fe18ce21ebba0efcd8e4b8cf1948e4e92b4963b5a20b8f8fe56b34a0100000000feffffff02c04601000000000016001416d8412d77ae6d6280c60091a7197a3f98546c911027000000000000220020497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa90247304402204fada6ffa61f578f647ace8c8d02b678ff95ed0feca83b3a4750a97c5aa3ddca02203dc438b53e7aef6bd4f9152e37d6cbce4e64306932cc27f7e2072d764990cb530121020b500126d56d6f17b28e90f254b4b38c260ecd8e941b65c557b8af6c767027dd99490900"
      },
      {
        txid: "af6e299c95d19abe3d99da27198355c4b52b4746ac985ab622284e286957a31a",
        index: 0,
        amountSats: "10000",
        // 0.0001 BTC
        transactionHex: "02000000000101317bbfb18814a7db1fd15e596fbdc8b220b76f2abde57c05502433e248e5d0c500000000171600147e88fb2bc740d5efffef8b6f53d5eb68b83317b6feffffff021027000000000000220020497b026c3d3547a30e6d8006e385e0366af5eca2b5b455d8783875941e5c7fa9d8a50100000000001600144ddfedfd823ee5dc953f4792a855b262a85ed77c0247304402202fc8347a8801fbbd13db5bd2694cdabb2c3428b6cfa6edda02ff16bc6cacb6b8022054604d07510ede500197deefe9d39abe277fb97a837ae40ea815b6aa38f0329701210247348c03f596b52730429ea89df4b3d75b219fd3c30cbcb66dae04779e0de6d236490900"
      }
    ],
    transaction: {
      outputs: [
        {
          address: RECEIVING_ADDRESSES["mainnet" /* MAINNET */][P2WSH],
          amountSats: "21590"
        },
        {
          address: CHANGE_ADDRESSES["mainnet" /* MAINNET */][P2WSH],
          amountSats: "8023",
          value: 8023,
          bip32Derivation: [
            {
              masterFingerprint: Buffer.from("f57ec65d", "hex"),
              path: "m/48'/0'/100'/2'/1/0",
              pubkey: Buffer.from(
                "038b5e295f14f6a848f55b7d62efddef4679dc361ecda5f6cd074cc24ae2174510",
                "hex"
              )
            },
            {
              masterFingerprint: Buffer.from("00000006", "hex"),
              path: "m/48'/0'/100'/2'/1/0",
              pubkey: Buffer.from(
                "0318a60afc9aa7e3191f9e49051c70764f7688d9a567b327c095e5a3f75f8847e7",
                "hex"
              )
            }
          ],
          witnessScript: Buffer.from(
            "52210318a60afc9aa7e3191f9e49051c70764f7688d9a567b327c095e5a3f75f8847e721038b5e295f14f6a848f55b7d62efddef4679dc361ecda5f6cd074cc24ae217451052ae",
            "hex"
          )
        }
      ],
      hex: "0100000003583f1c099fe18ce21ebba0efcd8e4b8cf1948e4e92b4963b5a20b8f8fe56b34a0000000000ffffffff909d853477617b819794471e9b58712165d25acdce399355f29e2bc74d381ba20100000000ffffffff1aa35769284e2822b65a98ac46472bb5c455831927da993dbe9ad1959c296eaf0000000000ffffffff02565400000000000022002035be74e39d8452cd6ede2aede6be70e21e57941843032e495d823eb9f521aea7571f00000000000022002098ac4adf0ec716cb2d30585fc8db6b41ad26431f55213622b43723de418aff4200000000",
      signature: [
        "304402207eddd9d5b7335468c5166e9d76f88d5538bf0ff531680765f813e95edf8a13a502205a6b33c0cd780b4e036e2e35777e888ec33658777cece1b494b7aadb421c35cb01",
        "304402207d2809f871f60d5c6d44e41decdfc856f08c69bb4471ec4652ee295c21becd6d022033ac79f8baa9c663e3aa8ffa2aab5cae27524537dd762d2f6cb1f5879375cae201",
        "3045022100ce3fea96bde970eab9aab5a3d8a00e1be5515cdd534db0d7c8a1755408c2c9c402204842d008cbacd7ce5df38035d55682ee03036751563d7b20253966bdb131a44801"
      ],
      // Coldcard is now grinding nonces on signatures to produce low s-value (71 bytes or fewer ... e.g. starts with 0x3044 ...)
      byteCeilingSignature: [
        "304402207eddd9d5b7335468c5166e9d76f88d5538bf0ff531680765f813e95edf8a13a502205a6b33c0cd780b4e036e2e35777e888ec33658777cece1b494b7aadb421c35cb01",
        "304402207d2809f871f60d5c6d44e41decdfc856f08c69bb4471ec4652ee295c21becd6d022033ac79f8baa9c663e3aa8ffa2aab5cae27524537dd762d2f6cb1f5879375cae201",
        "304402202dd767bfc22fe0c68703d32359e2d649d499426df47e76cdf298d62a8094631e0220133c0516991eb18885e5b2171d5bdbbab58e635c2412ec14b7f3db9f5fa2ef1a01"
      ]
    },
    braidDetails: {
      network: "mainnet" /* MAINNET */,
      addressType: P2WSH,
      extendedPublicKeys: [
        NODES["m/48'/0'/100'/2'"].open_source,
        NODES["m/48'/0'/100'/2'"].unchained
      ],
      requiredSigners: 2,
      index: "0"
    },
    psbtNoChange: "cHNidP8BAKUBAAAAA1g/HAmf4YziHrug782OS4zxlI5OkrSWO1oguPj+VrNKAAAAAAD/////kJ2FNHdhe4GXlEcem1hxIWXSWs3OOZNV8p4rx004G6IBAAAAAP////8ao1dpKE4oIrZamKxGRyu1xFWDGSfamT2+mtGVnClurwAAAAAA/////wFWVAAAAAAAABepFICyR3QRp4sqk519oIv6GTmocaS5hwAAAAAAAQErECcAAAAAAAAiACBJewJsPTVHow5tgAbjheA2avXsorW0Vdh4OHWUHlx/qQEFR1IhAuIbcxjPvUgr27ZkQUILkBjltEC/mwze3UJ2JtgfMmBbIQNp50/JVDVbb3rPm77FuGHBhoUrdZqF+SVY5CCgICBH9FKuIgYC4htzGM+9SCvbtmRBQguQGOW0QL+bDN7dQnYm2B8yYFsc76XZFjAAAIAAAACAZAAAgAIAAIAAAAAAAAAAACIGA2nnT8lUNVtves+bvsW4YcGGhSt1moX5JVjkIKAgIEf0HPV+xl0wAACAAAAAgGQAAIACAACAAAAAAAAAAAAAAQErECcAAAAAAAAiACBJewJsPTVHow5tgAbjheA2avXsorW0Vdh4OHWUHlx/qQEFR1IhAuIbcxjPvUgr27ZkQUILkBjltEC/mwze3UJ2JtgfMmBbIQNp50/JVDVbb3rPm77FuGHBhoUrdZqF+SVY5CCgICBH9FKuIgYC4htzGM+9SCvbtmRBQguQGOW0QL+bDN7dQnYm2B8yYFsc76XZFjAAAIAAAACAZAAAgAIAAIAAAAAAAAAAACIGA2nnT8lUNVtves+bvsW4YcGGhSt1moX5JVjkIKAgIEf0HPV+xl0wAACAAAAAgGQAAIACAACAAAAAAAAAAAAAAQErECcAAAAAAAAiACBJewJsPTVHow5tgAbjheA2avXsorW0Vdh4OHWUHlx/qQEFR1IhAuIbcxjPvUgr27ZkQUILkBjltEC/mwze3UJ2JtgfMmBbIQNp50/JVDVbb3rPm77FuGHBhoUrdZqF+SVY5CCgICBH9FKuIgYC4htzGM+9SCvbtmRBQguQGOW0QL+bDN7dQnYm2B8yYFsc76XZFjAAAIAAAACAZAAAgAIAAIAAAAAAAAAAACIGA2nnT8lUNVtves+bvsW4YcGGhSt1moX5JVjkIKAgIEf0HPV+xl0wAACAAAAAgGQAAIACAACAAAAAAAAAAAAAAA==",
    psbt: "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",
    psbtWithGlobalXpub: "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",
    psbtPartiallySigned: "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"
  }
];
var MULTISIGS = MULTISIGS_BASE.map((test) => {
  let braidAwareMultisig = {};
  const multisig = generateMultisigFromPublicKeys(
    test.network,
    test.type,
    2,
    ...test.publicKeys
  );
  braidAwareMultisig = {
    ...multisig,
    braidDetails: braidConfig(test.braidDetails),
    bip32Derivation: test.bip32Derivation
  };
  return {
    ...test,
    ...{
      description: `${test.network} ${test.type} 2-of-2 multisig address`,
      utxos: test.utxos.map((utxo) => ({
        ...utxo,
        ...{
          amountSats: new BigNumber3(utxo.amountSats).toString(),
          multisig: braidAwareMultisig,
          braidAwareMultisig
        },
        bip32Path: test.bip32Path
        // this only works because all of these fixtures are single address.
      })),
      transaction: {
        ...test.transaction,
        ...{
          outputs: test.transaction.outputs.map((output) => ({
            ...output,
            ...{ amountSats: new BigNumber3(output.amountSats).toString() },
            ...{
              multisig: (output.redeemScript || output.witnessScript) && {
                address: output.address,
                bip32Derivation: output.bip32Derivation,
                redeem: {
                  output: [P2SH, P2SH_P2WSH].includes(test.type) ? output.redeemScript : output.witnessScript,
                  redeem: [P2SH_P2WSH].includes(test.type) && {
                    output: output.witnessScript
                  }
                }
              }
            }
          }))
        }
      },
      multisig: braidAwareMultisig,
      braidAwareMultisig,
      multisigScript: test.type === P2SH ? multisigRedeemScript(braidAwareMultisig) : multisigWitnessScript(braidAwareMultisig),
      multisigScriptOps: test.type === P2SH ? test.redeemScriptOps : test.witnessScriptOps,
      multisigScriptHex: test.type === P2SH ? test.redeemScriptHex : test.witnessScriptHex
    }
  };
});
function singleMultisigTransaction(test) {
  return {
    ...{
      name: `Sign ${test.description}`,
      description: `spends multiple UTXOs from a single ${test.description}`,
      network: test.network,
      inputs: sortInputs(test.utxos),
      bip32Paths: test.utxos.map(() => test.bip32Path),
      publicKeys: test.utxos.map(() => test.publicKey),
      segwit: test.type !== P2SH,
      psbt: test.psbt,
      psbtWithGlobalXpub: test.psbtWithGlobalXpub,
      format: test.type,
      derivation: test.bip32Path.slice(0, -4),
      extendedPublicKeys: test.braidDetails.extendedPublicKeys,
      braidDetails: test.braidDetails,
      walletName: test.walletName,
      policyHmac: test.policyHmac
    },
    ...test.transaction
  };
}
var TRANSACTIONS = MULTISIGS.map(
  (test) => singleMultisigTransaction(test)
).concat([
  // {
  //   ...selectFirstUTXOFromEach(MULTISIGS.filter((test) => test.network === TESTNET)),
  //   ...{
  //     name: `Sign across ${TESTNET} 2-of-2 multisig address types`,
  //     description: `spends a UTXO from each ${TESTNET} 2-of-2 address type`,
  //     network: Network.TESTNET,
  //     segwit: true,
  //     outputs: [
  //       {
  //         address: RECEIVING_ADDRESSES[Network.TESTNET],
  //         amountSats: BigNumber('291590'),
  //       }
  //     ],
  //   },
  //   hex: "0100000003236ac393a0ee9e05973cbaad15abfa476d1e03151be906c0d769db051da49d420000000000ffffffff845266686d5d2473fb09982c72da0d6d66b057c3e13a6eb4bfda304076efe7650100000000ffffffff01f5a14392f39c55c9a597df640b0f75ec77f5a90bce39bbc7e8869bcc8ddf840000000000ffffffff01067304000000000017a914e3ba1151b75effbf7adc4673c83c8feec3ddc3678700000000",
  //   signature: ["30440220583a0f9f0dec594d16cee927dc10d10e99b075c2cbdaad75daf1adf1a9f34900022058311ae12f952a4707f8c4966a50ed96b21e049ef35afc91e77c9a1b991f93b801","304502210084f12880a76b33e4bbf7bc896e76ccd726f59e24876261d1f9c999a2203d10c70220327e7daf28cf6dca83ff24c2b1dbded308e71f11941c14fa2b3bb1623d240b7201","3045022100aeeaa8c07be892ff1dcbbcf76ab6f202fa3f6b3f41e0476294f8df2d0afb457f02206d7eecc49e1ff32f1f25b7649a127e4334c0f9272aa92051364f5094b3d796ad01"],
  // },
  // {
  //   ...selectFirstUTXOFromEach(MULTISIGS.filter((test) => test.network === MAINNET)),
  //   ...{
  //     name: `Sign across ${MAINNET} 2-of-2 multisig address types`,
  //     description: `spends a UTXO from each ${MAINNET} 2-of-2 address type`,
  //     network: Network.MAINNET,
  //     segwit: true,
  //     outputs: [
  //       {
  //         address: RECEIVING_ADDRESSES[Network.MAINNET],
  //         amountSats: BigNumber('21590'),
  //       }
  //     ],
  //     hex: "010000000340eb206da209badf4b8a3e758dda0f6a1cd24aa7855c4a0d7444668c2a2862200100000000ffffffffb0e7bdea1e52e6bc471172c6b78b26a7382911b5910b5c947ed18983be1368450000000000ffffffff583f1c099fe18ce21ebba0efcd8e4b8cf1948e4e92b4963b5a20b8f8fe56b34a0000000000ffffffff01565400000000000017a91480b2477411a78b2a939d7da08bfa1939a871a4b98700000000",
  //     signature: ["304502210088188fe088e22872e06ddad13c2586f6abb5d8040b2bb919bf00f6a855e3788902202517f77ae39ac37c0522864dfb996dc86272f328ee4d7b614cad17899f5bbc3a01","3044022078e151ce21dab691a35f8aa2a080478cd15369653bc8ecd250019e62f2d1557102204349f260f9233558b8a71c9e2dc9888b6666451de97ea12b890ee7526f9f404001","3044022005e44b81d321ce6cc27e7d64cf482844e0dd30220a776c62199d2fac33c6a41502201beacca9c4d4f00d31c797b9441222e67ada8d4e0706d1cd29805af363de615c01"],
  //   }
  // },
]);
var TEST_FIXTURES = {
  keys: {
    open_source: {
      bip39Phrase: BIP39_PHRASE,
      nodes: Object.keys(NODES).reduce((openSourceNodes, node) => {
        const { unchained, ...rest } = NODES[node];
        if (!unchained) {
          openSourceNodes[node] = NODES[node];
        } else {
          openSourceNodes[node] = rest;
        }
        return openSourceNodes;
      }, {})
    },
    unchained: {
      nodes: Object.keys(NODES).reduce((unchainedNodes, node) => {
        const { unchained } = NODES[node];
        if (unchained)
          unchainedNodes[node] = unchained;
        return unchainedNodes;
      }, {})
    }
  },
  braids: BRAIDS,
  multisigs: MULTISIGS,
  transactions: TRANSACTIONS
};

// src/outputs.ts
import BigNumber4 from "bignumber.js";
function validateOutputs(network, outputs, inputsTotalSats) {
  if (!outputs || outputs.length === 0) {
    return "At least one output is required.";
  }
  for (let outputIndex = 0; outputIndex < outputs.length; outputIndex++) {
    const output = outputs[outputIndex];
    const error = validateOutput(network, output, inputsTotalSats);
    if (error) {
      return error;
    }
  }
  return "";
}
function validateOutput(network, output, inputsTotalSats) {
  if (output.amountSats !== 0 && !output.amountSats) {
    return `Does not have an 'amountSats' property.`;
  }
  let error = validateOutputAmount(output.amountSats, inputsTotalSats);
  if (error) {
    return error;
  }
  if (!output.address) {
    return `Does not have an 'address' property.`;
  }
  error = validateAddress(output.address, network);
  if (error) {
    return `Has an invalid 'address' property: ${error}.`;
  }
  return "";
}
var DUST_LIMIT_SATS = "546";
function validateOutputAmount(amountSats, maxSats, minSats = DUST_LIMIT_SATS) {
  let a3, its;
  try {
    a3 = new BigNumber4(amountSats);
  } catch (e4) {
    return "Invalid output amount.";
  }
  if (!a3.isFinite()) {
    return "Invalid output amount.";
  }
  if (a3.isLessThanOrEqualTo(ZERO)) {
    return "Output amount must be positive.";
  }
  if (a3.isLessThanOrEqualTo(minSats)) {
    return "Output amount is too small.";
  }
  if (maxSats !== void 0) {
    try {
      its = new BigNumber4(maxSats);
    } catch (e4) {
      return "Invalid total input amount.";
    }
    if (!its.isFinite()) {
      return "Invalid total input amount.";
    }
    if (its.isLessThanOrEqualTo(ZERO)) {
      return "Total input amount must be positive.";
    }
    if (a3.isGreaterThan(its)) {
      return "Output amount is too large.";
    }
  }
  return "";
}

// src/psbt.ts
import { Psbt, Transaction } from "bitcoinjs-lib-v5";
import { reverseBuffer } from "bitcoinjs-lib-v5/src/bufferutils.js";
import BigNumber5 from "bignumber.js";
var PSBT_MAGIC_HEX = "70736274ff";
var PSBT_MAGIC_B64 = "cHNidP8";
var PSBT_MAGIC_BYTES = Buffer.from([112, 115, 98, 116, 255]);
function autoLoadPSBT(psbtFromFile, options) {
  if (typeof psbtFromFile !== "string")
    return null;
  if (psbtFromFile.substring(0, 10) === PSBT_MAGIC_HEX) {
    return Psbt.fromHex(psbtFromFile, options);
  } else if (psbtFromFile.substring(0, 7) === PSBT_MAGIC_B64) {
    return Psbt.fromBase64(psbtFromFile, options);
  } else {
    return null;
  }
}
function getBip32Derivation(multisig, index = 0) {
  if (multisig.bip32Derivation) {
    return multisig.bip32Derivation;
  }
  const config = JSON.parse(multisigBraidDetails(multisig));
  const braid = generateBraid(
    config.network,
    config.addressType,
    config.extendedPublicKeys,
    config.requiredSigners,
    config.index
  );
  return generateBip32DerivationByIndex(braid, index);
}
function psbtInputDerivation(input) {
  const index = input.bip32Path ? bip32PathToSequence(input.bip32Path).slice(-1)[0] : 0;
  return getBip32Derivation(input.multisig, index);
}
function psbtOutputDerivation(output) {
  return getBip32Derivation(output.multisig);
}
function getWitnessOutputScriptFromInput(input) {
  const tx = Transaction.fromHex(input.transactionHex);
  return tx.outs[input.index];
}
function psbtMultisigLock(multisig) {
  const multisigLock = {};
  switch (multisigAddressType(multisig)) {
    case P2SH:
      multisigLock.redeemScript = multisigRedeemScript(multisig).output;
      break;
    case P2WSH:
      multisigLock.witnessScript = multisigWitnessScript(multisig).output;
      break;
    case P2SH_P2WSH:
      multisigLock.witnessScript = multisigWitnessScript(multisig).output;
      multisigLock.redeemScript = multisigRedeemScript(multisig).output;
      break;
  }
  return multisigLock;
}
function psbtInputFormatter(input) {
  const witnessUtxo = getWitnessOutputScriptFromInput(input);
  const nonWitnessUtxo = Buffer.from(input.transactionHex, "hex");
  const isSegWit = multisigWitnessScript(input.multisig) !== null;
  const utxoToVerify = isSegWit ? { nonWitnessUtxo, witnessUtxo } : { nonWitnessUtxo };
  const multisigScripts = psbtMultisigLock(input.multisig);
  const bip32Derivation = psbtInputDerivation(input);
  return {
    hash: input.txid,
    index: input.index,
    ...utxoToVerify,
    ...multisigScripts,
    bip32Derivation
  };
}
function psbtOutputFormatter(output) {
  let multisigScripts = {};
  let bip32Derivation = [];
  if (output.multisig) {
    multisigScripts = psbtMultisigLock(output.multisig);
    bip32Derivation = psbtOutputDerivation(output);
    return {
      address: output.address,
      value: new BigNumber5(output.amountSats).toNumber(),
      ...multisigScripts,
      bip32Derivation
    };
  }
  return {
    address: output.address,
    value: new BigNumber5(output.amountSats).toNumber(),
    ...output
    // the output may have come in already decorated with bip32Derivation/multisigScripts
  };
}
function getUnchainedInputsFromPSBT(network, addressType, psbt) {
  return psbt.txInputs.map((input, index) => {
    const dataInput = psbt.data.inputs[index];
    const fundingTxHex = dataInput.nonWitnessUtxo.toString("hex");
    const fundingTx = Transaction.fromHex(fundingTxHex);
    const multisig = generateMultisigFromHex(
      network,
      addressType,
      dataInput.redeemScript.toString("hex")
    );
    return {
      amountSats: fundingTx.outs[input.index].value,
      index: input.index,
      transactionHex: fundingTxHex,
      txid: reverseBuffer(input.hash).toString("hex"),
      multisig
    };
  });
}
function getUnchainedOutputsFromPSBT(psbt) {
  return psbt.txOutputs.map((output) => ({
    address: output.address,
    amountSats: output.value
  }));
}
function filterRelevantBip32Derivations(psbt, signingKeyDetails) {
  return psbt.data.inputs.map((input) => {
    const bip32Derivation = input.bip32Derivation.filter(
      (b32d) => b32d.path.startsWith(signingKeyDetails.path) && b32d.masterFingerprint.toString("hex") === signingKeyDetails.xfp
    );
    if (!bip32Derivation.length) {
      throw new Error("Signing key details not included in PSBT");
    }
    return bip32Derivation[0];
  });
}
function translatePSBT(network, addressType, psbt, signingKeyDetails) {
  if (addressType !== P2SH) {
    throw new Error(
      "Unsupported addressType -- only P2SH is supported right now"
    );
  }
  const localPSBT = autoLoadPSBT(psbt, { network: networkData(network) });
  if (localPSBT === null)
    return null;
  const bip32Derivations = filterRelevantBip32Derivations(
    localPSBT,
    signingKeyDetails
  );
  const unchainedInputs = getUnchainedInputsFromPSBT(
    network,
    addressType,
    localPSBT
  );
  const unchainedOutputs = getUnchainedOutputsFromPSBT(localPSBT);
  return {
    unchainedInputs,
    unchainedOutputs,
    bip32Derivations
  };
}
function addSignatureToPSBT(psbt, inputIndex, pubkey, signature) {
  const partialSig = [
    {
      pubkey,
      signature
    }
  ];
  psbt.data.updateInput(inputIndex, { partialSig });
  if (!psbt.validateSignaturesOfInput(inputIndex, pubkey)) {
    throw new Error("One or more invalid signatures.");
  }
  return psbt;
}
function addSignaturesToPSBT(network, psbt, pubkeys, signatures) {
  let psbtWithSignatures = autoLoadPSBT(psbt, {
    network: networkData(network)
  });
  if (psbtWithSignatures === null)
    return null;
  signatures.forEach((sig, idx) => {
    const pubkey = pubkeys[idx];
    psbtWithSignatures = addSignatureToPSBT(
      psbtWithSignatures,
      idx,
      pubkey,
      sig
    );
  });
  return psbtWithSignatures.toBase64();
}
function getNumSigners(psbt) {
  const partialSignatures = psbt && psbt.data && psbt.data.inputs && psbt.data.inputs[0] ? psbt.data.inputs[0].partialSig : void 0;
  return partialSignatures === void 0 ? 0 : partialSignatures.length;
}
function parseSignaturesFromPSBT(psbtFromFile) {
  const psbt = autoLoadPSBT(psbtFromFile, {});
  if (psbt === null) {
    return null;
  }
  const numSigners = getNumSigners(psbt);
  const signatureSet = {};
  let pubKey = "";
  const inputs = psbt.data.inputs;
  if (numSigners >= 1) {
    for (let i3 = 0; i3 < inputs.length; i3++) {
      for (let j3 = 0; j3 < numSigners; j3++) {
        pubKey = toHexString(
          Array.prototype.slice.call(inputs?.[i3]?.partialSig?.[j3].pubkey)
        );
        if (pubKey in signatureSet) {
          signatureSet[pubKey].push(
            inputs?.[i3]?.partialSig?.[j3].signature.toString("hex")
          );
        } else {
          signatureSet[pubKey] = [
            inputs?.[i3]?.partialSig?.[j3].signature.toString("hex")
          ];
        }
      }
    }
  } else {
    return null;
  }
  return signatureSet;
}
function parseSignatureArrayFromPSBT(psbtFromFile) {
  const psbt = autoLoadPSBT(psbtFromFile);
  if (psbt === null)
    return null;
  const numSigners = getNumSigners(psbt);
  const signatureArrays = Array.from(
    { length: numSigners },
    () => []
  );
  const { inputs } = psbt.data;
  if (numSigners >= 1) {
    for (let i3 = 0; i3 < inputs.length; i3 += 1) {
      for (let j3 = 0; j3 < numSigners; j3 += 1) {
        const signature = inputs?.[i3]?.partialSig?.[j3].signature.toString("hex");
        if (signature) {
          signatureArrays[j3].push(signature);
        }
      }
    }
  } else {
    return null;
  }
  return numSigners === 1 ? signatureArrays[0] : signatureArrays;
}

// src/psbtv2.ts
import { BufferReader as BufferReader2, BufferWriter as BufferWriter2 } from "bufio";
import { Psbt as Psbt2 } from "bitcoinjs-lib-v5";
var PSBT_MAP_SEPARATOR = Buffer.from([0]);
var BIP_32_NODE_REGEX = /(\/[0-9]+'?)/gi;
var BIP_32_HARDENING_OFFSET = 2147483648;
function bufferize(psbt) {
  if (Buffer.isBuffer(psbt)) {
    return psbt;
  }
  if (typeof psbt === "string") {
    if (validateHex(psbt) === "") {
      return Buffer.from(psbt, "hex");
    }
    if (validBase64(psbt)) {
      return Buffer.from(psbt, "base64");
    }
  }
  throw Error("Input cannot be bufferized.");
}
function getNonUniqueKeyTypeValues(maps, keytype) {
  if (Array.isArray(maps)) {
    const values2 = maps.map(
      (map2) => (
        // TODO: Figure out a better way to type this
        getNonUniqueKeyTypeValues(map2, keytype)
      )
    );
    return values2;
  }
  const map = maps;
  const values = [];
  for (const [key, value] of map.entries()) {
    if (key.startsWith(keytype)) {
      values.push({ key, value: value?.toString("hex") || null });
    }
  }
  return values;
}
function getOptionalMappedBytesAsHex(maps, keytype) {
  return maps.map((map) => map.get(keytype)?.toString("hex") ?? null);
}
function getOptionalMappedBytesAsUInt(maps, keytype) {
  return maps.map((map) => map.get(keytype)?.readUInt32LE(0) ?? null);
}
function parseDerivationPathNodesToBytes(path) {
  const validationMessage = validateBIP32Path(path);
  if (validationMessage !== "") {
    throw Error(validationMessage);
  }
  const bw = new BufferWriter2();
  for (const node of path.match(BIP_32_NODE_REGEX) ?? []) {
    let num = parseInt(node.slice(1), 10);
    if (node.indexOf("'") > -1) {
      num += BIP_32_HARDENING_OFFSET;
    }
    bw.writeU32(num);
  }
  return bw.render();
}
function readAndSetKeyPairs(map, br) {
  const nextByte = br.readBytes(1);
  if (nextByte.equals(PSBT_MAP_SEPARATOR)) {
    return;
  }
  const keyLen = nextByte.readUInt8(0);
  const key = br.readBytes(keyLen);
  const value = br.readVarBytes();
  map.set(key.toString("hex"), value);
  readAndSetKeyPairs(map, br);
}
function serializeMap(map, bw) {
  map.forEach((value, key) => {
    const keyBuf = Buffer.from(key, "hex");
    const keyLen = keyBuf.length;
    bw.writeVarint(keyLen);
    bw.writeString(key, "hex");
    bw.writeVarint(value.length);
    bw.writeBytes(value);
  });
  bw.writeBytes(PSBT_MAP_SEPARATOR);
}
var PsbtV2Maps = class {
  // These maps directly correspond to the maps defined in BIP0174
  globalMap = /* @__PURE__ */ new Map();
  inputMaps = [];
  outputMaps = [];
  constructor(psbt) {
    if (!psbt) {
      return;
    }
    const buf = bufferize(psbt);
    const br = new BufferReader2(buf);
    if (!br.readBytes(PSBT_MAGIC_BYTES.length, true).equals(PSBT_MAGIC_BYTES)) {
      throw Error("PsbtV2 magic bytes are incorrect.");
    }
    readAndSetKeyPairs(this.globalMap, br);
    if (
      // Assuming that psbt being passed in is a valid psbtv2
      !this.globalMap.has("fb" /* PSBT_GLOBAL_VERSION */) || !this.globalMap.has("02" /* PSBT_GLOBAL_TX_VERSION */) || !this.globalMap.has("04" /* PSBT_GLOBAL_INPUT_COUNT */) || !this.globalMap.has("05" /* PSBT_GLOBAL_OUTPUT_COUNT */) || this.globalMap.has("00")
    ) {
      throw Error("Provided PsbtV2 not valid. Missing required global keys.");
    }
    const inputCount = this.globalMap.get("04" /* PSBT_GLOBAL_INPUT_COUNT */)?.readUInt8(0) ?? 0;
    for (let i3 = 0; i3 < inputCount; i3++) {
      const map = /* @__PURE__ */ new Map();
      readAndSetKeyPairs(map, br);
      this.inputMaps.push(map);
    }
    const outputCount = this.globalMap.get("05" /* PSBT_GLOBAL_OUTPUT_COUNT */)?.readUInt8(0) ?? 0;
    for (let i3 = 0; i3 < outputCount; i3++) {
      const map = /* @__PURE__ */ new Map();
      readAndSetKeyPairs(map, br);
      this.outputMaps.push(map);
    }
  }
  // Return the current state of the psbt as a string in the specified format.
  serialize(format = "base64") {
    const bw = new BufferWriter2();
    bw.writeBytes(PSBT_MAGIC_BYTES);
    serializeMap(this.globalMap, bw);
    for (const map of this.inputMaps) {
      serializeMap(map, bw);
    }
    for (const map of this.outputMaps) {
      serializeMap(map, bw);
    }
    return bw.render().toString(format);
  }
  // NOTE: This set of copy methods is made available to
  // achieve parity with the PSBT api required by ledger-bitcoin
  // for creating merklized PSBTs. HOWEVER, it is not recommended
  // to use this when avoidable as copying maps bypasses the validation
  // defined in the constructor, so it could create a psbtv2 in an invalid psbt status.
  // PsbtV2.serialize is preferable whenever possible.
  copy(to) {
    this.copyMap(this.globalMap, to.globalMap);
    this.copyMaps(this.inputMaps, to.inputMaps);
    this.copyMaps(this.outputMaps, to.outputMaps);
  }
  copyMaps(from, to) {
    from.forEach((m4, index) => {
      const to_index = /* @__PURE__ */ new Map();
      this.copyMap(m4, to_index);
      to[index] = to_index;
    });
  }
  // eslint-disable-next-line class-methods-use-this
  copyMap(from, to) {
    from.forEach((v3, k3) => to.set(k3, Buffer.from(v3)));
  }
};
var PsbtV2 = class _PsbtV2 extends PsbtV2Maps {
  constructor(psbt) {
    super(psbt);
    if (!psbt) {
      this.create();
    }
    this.validate();
  }
  /**
   * Globals Getters/Setters
   */
  get PSBT_GLOBAL_XPUB() {
    return getNonUniqueKeyTypeValues(this.globalMap, "01" /* PSBT_GLOBAL_XPUB */);
  }
  get PSBT_GLOBAL_TX_VERSION() {
    const val = this.globalMap.get("02" /* PSBT_GLOBAL_TX_VERSION */);
    if (val === void 0) {
      throw Error("PSBT_GLOBAL_TX_VERSION not set");
    }
    return val.readInt32LE(0);
  }
  set PSBT_GLOBAL_TX_VERSION(version) {
    if (version < 2) {
      throw Error(
        `PsbtV2 cannot have a global tx version less than 2. Version ${version} specified.`
      );
    }
    const bw = new BufferWriter2();
    bw.writeI32(version);
    this.globalMap.set("02" /* PSBT_GLOBAL_TX_VERSION */, bw.render());
  }
  get PSBT_GLOBAL_FALLBACK_LOCKTIME() {
    return this.globalMap.get("03" /* PSBT_GLOBAL_FALLBACK_LOCKTIME */)?.readUInt32LE(0) ?? null;
  }
  set PSBT_GLOBAL_FALLBACK_LOCKTIME(locktime) {
    if (locktime === null) {
      this.globalMap.delete("03" /* PSBT_GLOBAL_FALLBACK_LOCKTIME */);
    } else {
      const bw = new BufferWriter2();
      bw.writeI32(locktime);
      this.globalMap.set("03" /* PSBT_GLOBAL_FALLBACK_LOCKTIME */, bw.render());
    }
  }
  get PSBT_GLOBAL_INPUT_COUNT() {
    const val = this.globalMap.get("04" /* PSBT_GLOBAL_INPUT_COUNT */);
    if (val === void 0) {
      throw Error("PSBT_GLOBAL_INPUT_COUNT not set");
    }
    return val.readUInt8(0);
  }
  set PSBT_GLOBAL_INPUT_COUNT(count) {
    const bw = new BufferWriter2();
    bw.writeU8(count);
    this.globalMap.set("04" /* PSBT_GLOBAL_INPUT_COUNT */, bw.render());
  }
  get PSBT_GLOBAL_OUTPUT_COUNT() {
    const val = this.globalMap.get("05" /* PSBT_GLOBAL_OUTPUT_COUNT */);
    if (val === void 0) {
      throw Error("PSBT_GLOBAL_OUTPUT_COUNT not set");
    }
    return val.readUInt8(0);
  }
  set PSBT_GLOBAL_OUTPUT_COUNT(count) {
    const bw = new BufferWriter2();
    bw.writeU8(count);
    this.globalMap.set("05" /* PSBT_GLOBAL_OUTPUT_COUNT */, bw.render());
  }
  get PSBT_GLOBAL_TX_MODIFIABLE() {
    const val = this.globalMap.get("06" /* PSBT_GLOBAL_TX_MODIFIABLE */)?.readUInt8(0) || 0;
    const modifiable = [];
    if (val & 1) {
      modifiable.push("INPUTS" /* INPUTS */);
    }
    if (val & 2) {
      modifiable.push("OUTPUTS" /* OUTPUTS */);
    }
    if (val & 4) {
      modifiable.push("SIGHASH_SINGLE" /* SIGHASH_SINGLE */);
    }
    return modifiable;
  }
  set PSBT_GLOBAL_TX_MODIFIABLE(modifiable) {
    let val = 0;
    if (modifiable.includes("INPUTS" /* INPUTS */)) {
      val |= 1;
    }
    if (modifiable.includes("OUTPUTS" /* OUTPUTS */)) {
      val |= 2;
    }
    if (modifiable.includes("SIGHASH_SINGLE" /* SIGHASH_SINGLE */)) {
      val |= 4;
    }
    const br = new BufferWriter2();
    br.writeU8(val);
    this.globalMap.set("06" /* PSBT_GLOBAL_TX_MODIFIABLE */, br.render());
  }
  get PSBT_GLOBAL_VERSION() {
    const version = this.globalMap.get("fb" /* PSBT_GLOBAL_VERSION */)?.readUInt32LE(0);
    if (version === void 0) {
      console.warn("PSBT_GLOBAL_VERSION key is missing! Setting to version 2.");
      this.PSBT_GLOBAL_VERSION = 2;
    }
    return version ?? 2;
  }
  set PSBT_GLOBAL_VERSION(version) {
    let workingVersion = version;
    if (workingVersion < 2) {
      console.warn(
        `PsbtV2 cannot have a global version less than 2. Version ${workingVersion} specified. Setting to version 2.`
      );
      workingVersion = 2;
    }
    const bw = new BufferWriter2();
    bw.writeU32(workingVersion);
    this.globalMap.set("fb" /* PSBT_GLOBAL_VERSION */, bw.render());
  }
  get PSBT_GLOBAL_PROPRIETARY() {
    return getNonUniqueKeyTypeValues(
      this.globalMap,
      "fc" /* PSBT_GLOBAL_PROPRIETARY */
    );
  }
  /**
   * Input Getters/Setters
   */
  get PSBT_IN_NON_WITNESS_UTXO() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "00" /* PSBT_IN_NON_WITNESS_UTXO */
    );
  }
  get PSBT_IN_WITNESS_UTXO() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "01" /* PSBT_IN_WITNESS_UTXO */
    );
  }
  get PSBT_IN_PARTIAL_SIG() {
    return getNonUniqueKeyTypeValues(
      this.inputMaps,
      "02" /* PSBT_IN_PARTIAL_SIG */
    );
  }
  get PSBT_IN_SIGHASH_TYPE() {
    return getOptionalMappedBytesAsUInt(
      this.inputMaps,
      "03" /* PSBT_IN_SIGHASH_TYPE */
    );
  }
  get PSBT_IN_REDEEM_SCRIPT() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "04" /* PSBT_IN_REDEEM_SCRIPT */
    );
  }
  get PSBT_IN_WITNESS_SCRIPT() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "05" /* PSBT_IN_WITNESS_SCRIPT */
    );
  }
  get PSBT_IN_BIP32_DERIVATION() {
    return getNonUniqueKeyTypeValues(
      this.inputMaps,
      "06" /* PSBT_IN_BIP32_DERIVATION */
    );
  }
  get PSBT_IN_FINAL_SCRIPTSIG() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "07" /* PSBT_IN_FINAL_SCRIPTSIG */
    );
  }
  get PSBT_IN_FINAL_SCRIPTWITNESS() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "08" /* PSBT_IN_FINAL_SCRIPTWITNESS */
    );
  }
  get PSBT_IN_POR_COMMITMENT() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "09" /* PSBT_IN_POR_COMMITMENT */
    );
  }
  get PSBT_IN_RIPEMD160() {
    return getNonUniqueKeyTypeValues(this.inputMaps, "0a" /* PSBT_IN_RIPEMD160 */);
  }
  get PSBT_IN_SHA256() {
    return getNonUniqueKeyTypeValues(this.inputMaps, "0b" /* PSBT_IN_SHA256 */);
  }
  get PSBT_IN_HASH160() {
    return getNonUniqueKeyTypeValues(this.inputMaps, "0c" /* PSBT_IN_HASH160 */);
  }
  get PSBT_IN_HASH256() {
    return getNonUniqueKeyTypeValues(this.inputMaps, "0d" /* PSBT_IN_HASH256 */);
  }
  get PSBT_IN_PREVIOUS_TXID() {
    const indices = [];
    for (const map of this.inputMaps) {
      const value = map.get("0e" /* PSBT_IN_PREVIOUS_TXID */);
      if (!value) {
        throw Error("PSBT_IN_PREVIOUS_TXID not set for an input");
      }
      indices.push(value.toString("hex"));
    }
    return indices;
  }
  get PSBT_IN_OUTPUT_INDEX() {
    const indices = [];
    for (const map of this.inputMaps) {
      const value = map.get("0f" /* PSBT_IN_OUTPUT_INDEX */);
      if (!value) {
        throw Error("PSBT_IN_OUTPUT_INDEX not set for an input");
      }
      indices.push(value.readUInt32LE(0));
    }
    return indices;
  }
  get PSBT_IN_SEQUENCE() {
    return getOptionalMappedBytesAsUInt(
      this.inputMaps,
      "10" /* PSBT_IN_SEQUENCE */
    );
  }
  get PSBT_IN_REQUIRED_TIME_LOCKTIME() {
    return getOptionalMappedBytesAsUInt(
      this.inputMaps,
      "11" /* PSBT_IN_REQUIRED_TIME_LOCKTIME */
    );
  }
  get PSBT_IN_REQUIRED_HEIGHT_LOCKTIME() {
    return getOptionalMappedBytesAsUInt(
      this.inputMaps,
      "12" /* PSBT_IN_REQUIRED_HEIGHT_LOCKTIME */
    );
  }
  get PSBT_IN_TAP_KEY_SIG() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "13" /* PSBT_IN_TAP_KEY_SIG */
    );
  }
  get PSBT_IN_TAP_SCRIPT_SIG() {
    return getNonUniqueKeyTypeValues(
      this.inputMaps,
      "14" /* PSBT_IN_TAP_SCRIPT_SIG */
    );
  }
  get PSBT_IN_TAP_LEAF_SCRIPT() {
    return getNonUniqueKeyTypeValues(
      this.inputMaps,
      "15" /* PSBT_IN_TAP_LEAF_SCRIPT */
    );
  }
  get PSBT_IN_TAP_BIP32_DERIVATION() {
    return getNonUniqueKeyTypeValues(
      this.inputMaps,
      "16" /* PSBT_IN_TAP_BIP32_DERIVATION */
    );
  }
  get PSBT_IN_TAP_INTERNAL_KEY() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "17" /* PSBT_IN_TAP_INTERNAL_KEY */
    );
  }
  get PSBT_IN_TAP_MERKLE_ROOT() {
    return getOptionalMappedBytesAsHex(
      this.inputMaps,
      "18" /* PSBT_IN_TAP_MERKLE_ROOT */
    );
  }
  get PSBT_IN_PROPRIETARY() {
    return getNonUniqueKeyTypeValues(
      this.inputMaps,
      "fc" /* PSBT_IN_PROPRIETARY */
    );
  }
  /**
   * Output Getters/Setters
   */
  get PSBT_OUT_REDEEM_SCRIPT() {
    return getOptionalMappedBytesAsHex(
      this.outputMaps,
      "00" /* PSBT_OUT_REDEEM_SCRIPT */
    );
  }
  get PSBT_OUT_WITNESS_SCRIPT() {
    return getOptionalMappedBytesAsHex(
      this.outputMaps,
      "01" /* PSBT_OUT_WITNESS_SCRIPT */
    );
  }
  get PSBT_OUT_BIP32_DERIVATION() {
    return getNonUniqueKeyTypeValues(
      this.outputMaps,
      "02" /* PSBT_OUT_BIP32_DERIVATION */
    );
  }
  get PSBT_OUT_AMOUNT() {
    const indices = [];
    for (const map of this.outputMaps) {
      const value = map.get("03" /* PSBT_OUT_AMOUNT */);
      if (!value) {
        throw Error("PSBT_OUT_AMOUNT not set for an output");
      }
      const br = new BufferReader2(value);
      indices.push(br.readBigI64(value));
    }
    return indices;
  }
  get PSBT_OUT_SCRIPT() {
    const indices = [];
    for (const map of this.outputMaps) {
      const value = map.get("04" /* PSBT_OUT_SCRIPT */);
      if (!value) {
        throw Error("PSBT_OUT_SCRIPT not set for an output");
      }
      indices.push(value.toString("hex"));
    }
    return indices;
  }
  get PSBT_OUT_TAP_INTERNAL_KEY() {
    return getOptionalMappedBytesAsHex(
      this.outputMaps,
      "05" /* PSBT_OUT_TAP_INTERNAL_KEY */
    );
  }
  get PSBT_OUT_TAP_TREE() {
    return getOptionalMappedBytesAsHex(
      this.outputMaps,
      "06" /* PSBT_OUT_TAP_TREE */
    );
  }
  get PSBT_OUT_TAP_BIP32_DERIVATION() {
    return getNonUniqueKeyTypeValues(
      this.outputMaps,
      "07" /* PSBT_OUT_TAP_BIP32_DERIVATION */
    );
  }
  get PSBT_OUT_PROPRIETARY() {
    return getNonUniqueKeyTypeValues(
      this.outputMaps,
      "fc" /* PSBT_OUT_PROPRIETARY */
    );
  }
  /**
   * Other Getters/Setters
   */
  get nLockTime() {
    const inputCount = this.PSBT_GLOBAL_INPUT_COUNT;
    const heightLocks = this.PSBT_IN_REQUIRED_HEIGHT_LOCKTIME;
    const timeLocks = this.PSBT_IN_REQUIRED_TIME_LOCKTIME;
    const heights = [];
    const times = [];
    for (let i3 = 0; i3 < this.PSBT_GLOBAL_INPUT_COUNT; i3++) {
      if (heightLocks[i3] !== null) {
        heights.push(heightLocks[i3]);
      }
      if (timeLocks[i3] !== null) {
        times.push(timeLocks[i3]);
      }
    }
    if (heights.length === 0 && times.length === 0) {
      return this.PSBT_GLOBAL_FALLBACK_LOCKTIME || 0;
    }
    if (heights.length === inputCount || heights.length > times.length) {
      return Math.max(...heights);
    }
    if (times.length > heights.length) {
      return Math.max(...times);
    }
    return null;
  }
  /**
   * Creator/Constructor Methods
   */
  // This method ensures that global fields have initial values required by a
  // PsbtV2 Creator. It is called by the constructor if constructed without a
  // psbt.
  create() {
    this.PSBT_GLOBAL_VERSION = 2;
    this.PSBT_GLOBAL_TX_VERSION = 2;
    this.PSBT_GLOBAL_INPUT_COUNT = 0;
    this.PSBT_GLOBAL_OUTPUT_COUNT = 0;
    this.PSBT_GLOBAL_FALLBACK_LOCKTIME = 0;
  }
  // This method should check initial construction of any valid PsbtV2. It is
  // called when a psbt is passed to the constructor or when a new psbt is being
  // created. If constructed with a psbt, this method acts outside of the
  // Creator role to validate the current state of the psbt.
  validate() {
    if (this.PSBT_GLOBAL_VERSION < 2) {
      throw Error("PsbtV2 has a version field set less than 2");
    }
    if (this.PSBT_GLOBAL_TX_VERSION < 2) {
      throw Error("PsbtV2 has a tx version field set less than 2");
    }
    for (const prevInTxid of this.PSBT_IN_PREVIOUS_TXID) {
      if (!prevInTxid) {
        throw Error("PsbtV2 input is missing PSBT_IN_PREVIOUS_TXID");
      }
    }
    for (const prevInVOut of this.PSBT_IN_OUTPUT_INDEX) {
      if (prevInVOut === void 0) {
        throw Error("PsbtV2 input is missing PSBT_IN_OUTPUT_INDEX");
      }
    }
    for (const amount of this.PSBT_OUT_AMOUNT) {
      if (!amount) {
        throw Error("PsbtV2 input is missing PSBT_OUT_AMOUNT");
      }
    }
    for (const script3 of this.PSBT_OUT_SCRIPT) {
      if (!script3) {
        throw Error("PsbtV2 input is missing PSBT_OUT_SCRIPT");
      }
    }
    for (const locktime of this.PSBT_IN_REQUIRED_TIME_LOCKTIME) {
      if (locktime && locktime < 5e8) {
        throw Error("PsbtV2 input time locktime is less than 500000000.");
      }
    }
    for (const locktime of this.PSBT_IN_REQUIRED_HEIGHT_LOCKTIME) {
      if (locktime && locktime >= 5e8) {
        throw Error("PsbtV2 input hight locktime is gte 500000000.");
      }
    }
  }
  // This method is provided for compatibility issues and probably shouldn't be
  // used since a PsbtV2 with PSBT_GLOBAL_TX_VERSION = 1 is BIP0370
  // non-compliant. No guarantees can be made here that a serialized PsbtV2
  // which used this method will be compatible with outside consumers.
  //
  // One may wish to instance this class from a partially signed
  // PSBTv0 with a txn version 1 by using the static PsbtV2.FromV0. This method
  // provides a way to override validation logic for the txn version and roles
  // lifecycle defined for PsbtV2.
  dangerouslySetGlobalTxVersion1() {
    console.warn("Dangerously setting PsbtV2.PSBT_GLOBAL_TX_VERSION to 1!");
    const bw = new BufferWriter2();
    bw.writeI32(1);
    this.globalMap.set("02" /* PSBT_GLOBAL_TX_VERSION */, bw.render());
  }
  // Is this a Creator/Constructor role action, or something else. BIPs don't
  // define it well.
  addGlobalXpub(xpub, fingerprint, path) {
    const bw = new BufferWriter2();
    bw.writeBytes(Buffer.from("01" /* PSBT_GLOBAL_XPUB */, "hex"));
    bw.writeBytes(xpub);
    const key = bw.render().toString("hex");
    bw.writeBytes(fingerprint);
    const pathBytes = parseDerivationPathNodesToBytes(path);
    bw.writeBytes(pathBytes);
    const value = bw.render();
    this.globalMap.set(key, value);
  }
  addInput({
    previousTxId,
    outputIndex,
    sequence,
    nonWitnessUtxo,
    witnessUtxo,
    redeemScript,
    witnessScript,
    bip32Derivation
  }) {
    if (!this.isModifiable(["INPUTS" /* INPUTS */])) {
      throw Error(
        "PsbtV2.PSBT_GLOBAL_TX_MODIFIABLE inputs cannot be modified."
      );
    }
    const map = /* @__PURE__ */ new Map();
    const bw = new BufferWriter2();
    const prevTxIdBuf = bufferize(previousTxId);
    bw.writeBytes(prevTxIdBuf);
    map.set("0e" /* PSBT_IN_PREVIOUS_TXID */, bw.render());
    bw.writeI32(outputIndex);
    map.set("0f" /* PSBT_IN_OUTPUT_INDEX */, bw.render());
    if (sequence) {
      bw.writeI32(sequence);
      map.set("10" /* PSBT_IN_SEQUENCE */, bw.render());
    }
    if (nonWitnessUtxo) {
      bw.writeBytes(nonWitnessUtxo);
      map.set("00" /* PSBT_IN_NON_WITNESS_UTXO */, bw.render());
    }
    if (witnessUtxo) {
      bw.writeI64(witnessUtxo.amount);
      bw.writeU8(witnessUtxo.script.length);
      bw.writeBytes(witnessUtxo.script);
      map.set("01" /* PSBT_IN_WITNESS_UTXO */, bw.render());
    }
    if (redeemScript) {
      bw.writeBytes(redeemScript);
      map.set("04" /* PSBT_IN_REDEEM_SCRIPT */, bw.render());
    }
    if (witnessScript) {
      bw.writeBytes(witnessScript);
      map.set("05" /* PSBT_IN_WITNESS_SCRIPT */, bw.render());
    }
    if (bip32Derivation) {
      for (const bip322 of bip32Derivation) {
        bw.writeString("06" /* PSBT_IN_BIP32_DERIVATION */, "hex");
        bw.writeBytes(bip322.pubkey);
        const key = bw.render().toString("hex");
        bw.writeBytes(bip322.masterFingerprint);
        bw.writeBytes(parseDerivationPathNodesToBytes(bip322.path));
        map.set(key, bw.render());
      }
    }
    this.PSBT_GLOBAL_INPUT_COUNT = this.inputMaps.push(map);
  }
  addOutput({
    amount,
    script: script3,
    redeemScript,
    witnessScript,
    bip32Derivation
  }) {
    if (!this.isModifiable(["OUTPUTS" /* OUTPUTS */])) {
      throw Error(
        "PsbtV2.PSBT_GLOBAL_TX_MODIFIABLE outputs cannot be modified."
      );
    }
    const map = /* @__PURE__ */ new Map();
    const bw = new BufferWriter2();
    bw.writeI64(amount);
    map.set("03" /* PSBT_OUT_AMOUNT */, bw.render());
    bw.writeBytes(script3);
    map.set("04" /* PSBT_OUT_SCRIPT */, bw.render());
    if (redeemScript) {
      bw.writeBytes(redeemScript);
      map.set("00" /* PSBT_OUT_REDEEM_SCRIPT */, bw.render());
    }
    if (witnessScript) {
      bw.writeBytes(witnessScript);
      map.set("01" /* PSBT_OUT_WITNESS_SCRIPT */, bw.render());
    }
    if (bip32Derivation) {
      for (const bip322 of bip32Derivation) {
        bw.writeString("02" /* PSBT_OUT_BIP32_DERIVATION */, "hex");
        bw.writeBytes(bip322.pubkey);
        const key = bw.render().toString("hex");
        bw.writeBytes(bip322.masterFingerprint);
        bw.writeBytes(parseDerivationPathNodesToBytes(bip322.path));
        map.set(key, bw.render());
      }
    }
    this.outputMaps.push(map);
    this.PSBT_GLOBAL_OUTPUT_COUNT = this.outputMaps.length;
  }
  /**
   * Updater/Signer Methods
   */
  // Removes an input-map from inputMaps
  deleteInput(index) {
    if (!this.isModifiable(["INPUTS" /* INPUTS */])) {
      throw Error(
        "PsbtV2.PSBT_GLOBAL_TX_MODIFIABLE inputs cannot be modified."
      );
    }
    const newInputs = this.inputMaps.filter((_3, i3) => i3 !== index);
    this.inputMaps = newInputs;
    this.PSBT_GLOBAL_INPUT_COUNT = this.inputMaps.length;
  }
  // Removes an output-map from outputMaps
  deleteOutput(index) {
    if (!this.isModifiable(["OUTPUTS" /* OUTPUTS */])) {
      throw Error(
        "PsbtV2.PSBT_GLOBAL_TX_MODIFIABLE outputs cannot be modified."
      );
    }
    const newOutputs = this.outputMaps.filter((_3, i3) => i3 !== index);
    if (this.isModifiable(["SIGHASH_SINGLE" /* SIGHASH_SINGLE */])) {
      this.removePartialSig(index);
    }
    this.outputMaps = newOutputs;
    this.PSBT_GLOBAL_OUTPUT_COUNT = this.outputMaps.length;
  }
  // Checks that provided flags are present in PSBT_GLOBAL_TX_MODIFIABLE.
  isModifiable(flags) {
    for (const flag of flags) {
      if (!this.PSBT_GLOBAL_TX_MODIFIABLE.includes(flag)) {
        return false;
      }
    }
    return true;
  }
  // The Signer, when it creates a signature, must add the partial sig keypair
  // to the psbt for the input which it is signing. In the case that a
  // particular signer does not, this method can be used to add a signature to
  // the psbt. This method assumes the Signer did the validation outlined in
  // BIP0174 before creating a signature.
  // https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki#signer
  addPartialSig(inputIndex, pubkey, sig) {
    if (!this.inputMaps[inputIndex]) {
      throw Error(`PsbtV2 has no input at ${inputIndex}`);
    }
    if (!pubkey || !sig) {
      throw Error(
        `PsbtV2.addPartialSig() missing argument ${!pubkey && "pubkey" || !sig && "sig"}`
      );
    }
    const key = `${"02" /* PSBT_IN_PARTIAL_SIG */}${pubkey.toString("hex")}`;
    if (this.inputMaps[inputIndex].has(key)) {
      throw Error(
        "PsbtV2 already has a signature for this input with this pubkey"
      );
    }
    const modBackup = this.PSBT_GLOBAL_TX_MODIFIABLE;
    try {
      this.inputMaps[inputIndex].set(key, sig);
      this.handleSighashType(sig);
    } catch (err) {
      console.error(err);
      this.inputMaps[inputIndex].delete(key);
      this.PSBT_GLOBAL_TX_MODIFIABLE = modBackup;
    }
  }
  // Removes all sigs for an input unless a pubkey is specified.
  removePartialSig(inputIndex, pubkey) {
    const input = this.inputMaps[inputIndex];
    if (!input) {
      throw Error(`PsbtV2 has no input at ${inputIndex}`);
    }
    if (pubkey) {
      const key = `${"02" /* PSBT_IN_PARTIAL_SIG */}${pubkey.toString("hex")}`;
      const sig = this.PSBT_IN_PARTIAL_SIG[inputIndex].find(
        (el) => el.key === key
      );
      if (!sig) {
        throw Error(
          `PsbtV2 input has no signature from pubkey ${pubkey.toString("hex")}`
        );
      }
      input.delete(key);
    } else {
      const sigs = this.PSBT_IN_PARTIAL_SIG[inputIndex];
      for (const sig of sigs) {
        input.delete(sig.key);
      }
    }
  }
  // Used to ensure the PSBT is in the proper state when adding a partial sig
  // keypair.
  // https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki#signer
  handleSighashType(sig) {
    const br = new BufferReader2(sig.slice(-1));
    let sighashVal = br.readU8();
    let modifiable = this.PSBT_GLOBAL_TX_MODIFIABLE;
    if (!(sighashVal & 128 /* SIGHASH_ANYONECANPAY */)) {
      modifiable = modifiable.filter(
        (val) => val !== "INPUTS" /* INPUTS */
      );
    } else {
      sighashVal ^= 128 /* SIGHASH_ANYONECANPAY */;
    }
    if (sighashVal !== 2 /* SIGHASH_NONE */) {
      modifiable = modifiable.filter(
        (val) => val !== "OUTPUTS" /* OUTPUTS */
      );
    }
    if (sighashVal === 3 /* SIGHASH_SINGLE */ && !modifiable.includes("SIGHASH_SINGLE" /* SIGHASH_SINGLE */)) {
      modifiable.push("SIGHASH_SINGLE" /* SIGHASH_SINGLE */);
    }
    this.PSBT_GLOBAL_TX_MODIFIABLE = modifiable;
  }
  // Attempt to return a PsbtV2 by converting from a PsbtV0 string or Buffer
  static FromV0(psbt, allowTxnVersion1 = false) {
    const psbtv0Buf = bufferize(psbt);
    const psbtv0 = Psbt2.fromBuffer(psbtv0Buf);
    const psbtv0GlobalMap = psbtv0.data.globalMap;
    const psbtv2 = new _PsbtV2();
    psbtv2.PSBT_GLOBAL_TX_MODIFIABLE = [
      "INPUTS" /* INPUTS */,
      "OUTPUTS" /* OUTPUTS */
    ];
    const txVersion = psbtv0.data.getTransaction().readInt32LE(0);
    if (txVersion === 1 && allowTxnVersion1) {
      psbtv2.dangerouslySetGlobalTxVersion1();
    } else {
      psbtv2.PSBT_GLOBAL_TX_VERSION = psbtv0.data.getTransaction().readInt32LE(0);
    }
    for (const globalXpub of psbtv0GlobalMap.globalXpub ?? []) {
      psbtv2.addGlobalXpub(
        globalXpub.extendedPubkey,
        globalXpub.masterFingerprint,
        globalXpub.path
      );
    }
    const txInputs = [];
    for (const [index, txInput] of psbtv0.txInputs.entries()) {
      txInputs[index] = txInput;
    }
    for (const [index, input] of psbtv0.data.inputs.entries()) {
      const txInput = txInputs[index];
      psbtv2.addInput({
        previousTxId: txInput.hash,
        outputIndex: txInput.index,
        sequence: txInput.sequence,
        nonWitnessUtxo: input.nonWitnessUtxo,
        witnessUtxo: input.witnessUtxo && {
          amount: input.witnessUtxo.value,
          script: input.witnessUtxo.script
        },
        redeemScript: input.redeemScript,
        witnessScript: input.witnessScript,
        bip32Derivation: input.bip32Derivation
      });
    }
    const txOutputs = [];
    for (const [index, txOutput] of psbtv0.txOutputs.entries()) {
      txOutputs[index] = txOutput;
    }
    for (const [index, output] of psbtv0.data.outputs.entries()) {
      const txOutput = txOutputs[index];
      psbtv2.addOutput({
        amount: txOutput.value,
        script: txOutput.script,
        redeemScript: output.redeemScript,
        witnessScript: output.witnessScript,
        bip32Derivation: output.bip32Derivation
      });
    }
    for (const [index, input] of psbtv0.data.inputs.entries()) {
      for (const sig of input.partialSig || []) {
        psbtv2.addPartialSig(index, sig.pubkey, sig.signature);
      }
    }
    return psbtv2;
  }
};
function getPsbtVersionNumber(psbt) {
  const map = /* @__PURE__ */ new Map();
  const buf = bufferize(psbt);
  const br = new BufferReader2(buf.slice(PSBT_MAGIC_BYTES.length));
  readAndSetKeyPairs(map, br);
  return map.get("fb" /* PSBT_GLOBAL_VERSION */)?.readUInt32LE(0) || 0;
}

// src/script.ts
import { script } from "bitcoinjs-lib-v5";
function scriptToOps(multisig) {
  return script.toASM(multisig.output);
}
function scriptToHex(multisigScript2) {
  return multisigScript2.output.toString("hex");
}

// src/signatures.ts
import BigNumber7 from "bignumber.js";
import bip66 from "bip66";
import { ECPair as ECPair2, Transaction as Transaction3 } from "bitcoinjs-lib-v5";

// src/transactions.ts
import BigNumber6 from "bignumber.js";
import {
  TransactionBuilder,
  Psbt as Psbt3,
  Transaction as Transaction2,
  script as script2,
  payments as payments2
} from "bitcoinjs-lib-v5";
function unsignedMultisigTransaction(network, inputs, outputs) {
  const multisigInputError = validateMultisigInputs(inputs);
  et(!multisigInputError.length, multisigInputError);
  const multisigOutputError = validateOutputs(network, outputs);
  et(!multisigOutputError.length, multisigOutputError);
  const transactionBuilder = new TransactionBuilder();
  transactionBuilder.setVersion(1);
  transactionBuilder.network = networkData(network);
  for (let inputIndex = 0; inputIndex < inputs.length; inputIndex += 1) {
    const input = inputs[inputIndex];
    transactionBuilder.addInput(input.txid, input.index);
  }
  for (let outputIndex = 0; outputIndex < outputs.length; outputIndex += 1) {
    const output = outputs[outputIndex];
    transactionBuilder.addOutput(
      output.address,
      new BigNumber6(output.amountSats).toNumber()
    );
  }
  return transactionBuilder.buildIncomplete();
}
function unsignedMultisigPSBT(network, inputs, outputs, includeGlobalXpubs = false) {
  const multisigInputError = validateMultisigInputs(inputs, true);
  et(!multisigInputError.length, multisigInputError);
  const multisigOutputError = validateOutputs(network, outputs);
  et(!multisigOutputError.length, multisigOutputError);
  const psbt = new Psbt3({ network: networkData(network) });
  psbt.setVersion(1);
  const globalExtendedPublicKeys = [];
  inputs.forEach((input) => {
    const formattedInput = psbtInputFormatter({ ...input });
    psbt.addInput(formattedInput);
    const braidDetails = input.multisig.braidDetails;
    if (braidDetails && includeGlobalXpubs) {
      const braid = Braid.fromData(JSON.parse(braidDetails));
      braid.extendedPublicKeys.forEach((extendedPublicKeyData) => {
        const extendedPublicKey = new ExtendedPublicKey({
          ...extendedPublicKeyData,
          network
        });
        const alreadyFound = globalExtendedPublicKeys.find(
          (existingExtendedPublicKey) => existingExtendedPublicKey.toBase58() === extendedPublicKey.toBase58()
        );
        if (!alreadyFound) {
          globalExtendedPublicKeys.push(extendedPublicKey);
        }
      });
    }
  });
  if (includeGlobalXpubs && globalExtendedPublicKeys.length > 0) {
    const globalXpubs = globalExtendedPublicKeys.map((extendedPublicKey) => ({
      extendedPubkey: extendedPublicKey.encode(),
      masterFingerprint: extendedPublicKey.rootFingerprint ? Buffer.from(extendedPublicKey.rootFingerprint, "hex") : Buffer.alloc(0),
      path: extendedPublicKey.path || ""
    }));
    psbt.updateGlobal({ globalXpub: globalXpubs });
  }
  const psbtOutputs = outputs.map(
    (output) => psbtOutputFormatter({ ...output })
  );
  psbt.addOutputs(psbtOutputs);
  const txn = psbt.data.globalMap.unsignedTx.toBuffer().toString("hex");
  return { ...psbt, txn };
}
function unsignedTransactionObjectFromPSBT(psbt) {
  return Transaction2.fromHex(psbt.txn);
}
function signedMultisigTransaction(network, inputs, outputs, transactionSignatures) {
  const unsignedTransaction = unsignedMultisigTransaction(
    network,
    inputs,
    outputs
  );
  if (!transactionSignatures || transactionSignatures.length === 0) {
    throw new Error("At least one transaction signature is required.");
  }
  transactionSignatures.forEach(
    (transactionSignature, transactionSignatureIndex) => {
      if (transactionSignature.length < inputs.length) {
        throw new Error(
          `Insufficient input signatures for transaction signature ${transactionSignatureIndex + 1}: require ${inputs.length}, received ${transactionSignature.length}.`
        );
      }
    }
  );
  const signedTransaction = Transaction2.fromHex(unsignedTransaction.toHex());
  for (let inputIndex = 0; inputIndex < inputs.length; inputIndex++) {
    const input = inputs[inputIndex];
    const inputSignatures = transactionSignatures.map((transactionSignature) => transactionSignature[inputIndex]).filter((inputSignature) => Boolean(inputSignature));
    const requiredSignatures = multisigRequiredSigners(input.multisig);
    if (inputSignatures.length < requiredSignatures) {
      throw new Error(
        `Insufficient signatures for input  ${inputIndex + 1}: require ${requiredSignatures},  received ${inputSignatures.length}.`
      );
    }
    const inputSignaturesByPublicKey = {};
    inputSignatures.forEach((inputSignature) => {
      let publicKey;
      try {
        publicKey = validateMultisigSignature(
          network,
          inputs,
          outputs,
          inputIndex,
          inputSignature
        );
      } catch (e4) {
        throw new Error(
          `Invalid signature for input ${inputIndex + 1}: ${inputSignature} (${e4})`
        );
      }
      if (inputSignaturesByPublicKey[publicKey]) {
        throw new Error(
          `Duplicate signature for input ${inputIndex + 1}: ${inputSignature}`
        );
      }
      inputSignaturesByPublicKey[publicKey] = inputSignature;
    });
    const publicKeys = multisigPublicKeys(input.multisig);
    const sortedSignatures = publicKeys.map((publicKey) => inputSignaturesByPublicKey[publicKey]).filter(
      (signature) => signature ? signatureNoSighashType(signature) : signature
    );
    if (multisigAddressType(input.multisig) === P2WSH) {
      const witness = multisigWitnessField(input.multisig, sortedSignatures);
      signedTransaction.setWitness(inputIndex, witness);
    } else if (multisigAddressType(input.multisig) === P2SH_P2WSH) {
      const witness = multisigWitnessField(input.multisig, sortedSignatures);
      signedTransaction.setWitness(inputIndex, witness);
      const scriptSig = multisigRedeemScript(input.multisig);
      signedTransaction.ins[inputIndex].script = Buffer.from([
        scriptSig.output.length,
        ...scriptSig.output
      ]);
    } else {
      const scriptSig = multisigScriptSig(input.multisig, sortedSignatures);
      signedTransaction.ins[inputIndex].script = scriptSig?.input ?? Buffer.alloc(0);
    }
  }
  return signedTransaction;
}
function multisigWitnessField(multisig, sortedSignatures) {
  const witness = [""].concat(
    sortedSignatures.map((s3) => signatureNoSighashType(s3) + "01")
  );
  const witnessScript = multisigWitnessScript(multisig);
  witness.push(scriptToHex(witnessScript));
  return witness.map((wit) => Buffer.from(wit, "hex"));
}
function multisigScriptSig(multisig, signersInputSignatures) {
  const signatureOps = signersInputSignatures.map((signature) => `${signatureNoSighashType(signature)}01`).join(" ");
  const inputScript = `OP_0 ${signatureOps}`;
  const inputScriptBuffer = script2.fromASM(inputScript);
  const rawMultisig = payments2.p2ms({
    network: multisig.network,
    output: Buffer.from(multisigRedeemScript(multisig).output, "hex"),
    input: inputScriptBuffer
  });
  return generateMultisigFromRaw(multisigAddressType(multisig), rawMultisig);
}

// src/signatures.ts
function validateMultisigSignature(network, inputs, outputs, inputIndex, inputSignature) {
  const hash = multisigSignatureHash(network, inputs, outputs, inputIndex);
  const signatureBuffer = multisigSignatureBuffer(
    signatureNoSighashType(inputSignature)
  );
  const input = inputs[inputIndex];
  const publicKeys = multisigPublicKeys(input.multisig);
  for (let publicKeyIndex = 0; publicKeyIndex < multisigTotalSigners(input.multisig); publicKeyIndex++) {
    const publicKey = publicKeys[publicKeyIndex];
    const publicKeyBuffer = Buffer.from(publicKey, "hex");
    if (isValidSignature(publicKeyBuffer, hash, signatureBuffer)) {
      return publicKey;
    }
  }
  return false;
}
function signatureNoSighashType(signature) {
  const len = parseInt(signature.slice(2, 4), 16);
  if (len === (signature.length - 4) / 2)
    return signature;
  else
    return signature.slice(0, -2);
}
function multisigSignatureHash(network, inputs, outputs, inputIndex) {
  const unsignedTransaction = unsignedMultisigTransaction(
    network,
    inputs,
    outputs
  );
  const input = inputs[inputIndex];
  if (multisigAddressType(input.multisig) === P2WSH || multisigAddressType(input.multisig) === P2SH_P2WSH) {
    return unsignedTransaction.hashForWitnessV0(
      inputIndex,
      multisigWitnessScript(input.multisig).output,
      new BigNumber7(input.amountSats).toNumber(),
      Transaction3.SIGHASH_ALL
    );
  } else {
    return unsignedTransaction.hashForSignature(
      inputIndex,
      multisigRedeemScript(input.multisig).output,
      Transaction3.SIGHASH_ALL
    );
  }
}
function multisigSignatureBuffer(signature) {
  const encodedSignerInputSignatureBuffer = Buffer.from(signature, "hex");
  const decodedSignerInputSignatureBuffer = bip66.decode(
    encodedSignerInputSignatureBuffer
  );
  const { r: r4, s: s3 } = decodedSignerInputSignatureBuffer;
  const rToUse = r4.byteLength > 32 ? r4.slice(1) : r4;
  const signatureBuffer = Buffer.alloc(64);
  signatureBuffer.set(Buffer.from(rToUse), 32 - rToUse.byteLength);
  signatureBuffer.set(Buffer.from(s3), 64 - s3.byteLength);
  return signatureBuffer;
}
var isValidSignature = (pubkey, msghash, signature) => ECPair2.fromPublicKey(pubkey).verify(msghash, signature);
export {
  Braid,
  EXTENDED_PUBLIC_KEY_VERSIONS,
  ExtendedPublicKey,
  FeeValidationError,
  MULTISIG_ADDRESS_TYPES,
  Network,
  P2SH,
  P2SH_P2WSH,
  P2WSH,
  PSBT_MAGIC_B64,
  PSBT_MAGIC_BYTES,
  PSBT_MAGIC_HEX,
  PsbtV2,
  PsbtV2Maps,
  ROOT_FINGERPRINT,
  TEST_FIXTURES,
  ZERO,
  addSignaturesToPSBT,
  autoLoadPSBT,
  bip32PathToSequence,
  bip32SequenceToPath,
  bitcoinsToSatoshis,
  blockExplorerAPIURL,
  blockExplorerAddressURL,
  blockExplorerTransactionURL,
  blockExplorerURL,
  braidAddressType,
  braidConfig,
  braidExtendedPublicKeys,
  braidIndex,
  braidNetwork,
  braidRequiredSigners,
  calculateBase,
  calculateTotalWitnessSize,
  checkFeeError,
  checkFeeRateError,
  compressPublicKey,
  convertExtendedPublicKey,
  deriveChildExtendedPublicKey,
  deriveChildPublicKey,
  deriveExtendedPublicKey,
  deriveMultisigByIndex,
  deriveMultisigByPath,
  estimateMultisigP2SHTransactionVSize,
  estimateMultisigP2SH_P2WSHTransactionVSize,
  estimateMultisigP2WSHTransactionVSize,
  estimateMultisigTransactionFee,
  estimateMultisigTransactionFeeRate,
  extendedPublicKeyRootFingerprint,
  fingerprintToFixedLengthHex,
  generateBip32DerivationByIndex,
  generateBip32DerivationByPath,
  generateBraid,
  generateMultisigFromHex,
  generateMultisigFromPublicKeys,
  generateMultisigFromRaw,
  generatePublicKeysAtIndex,
  generatePublicKeysAtPath,
  getAddressType,
  getFeeErrorMessage,
  getFingerprintFromPublicKey,
  getMaskedDerivation,
  getNetworkFromPrefix,
  getParentBIP32Path,
  getPsbtVersionNumber,
  getRedeemScriptSize,
  getRelativeBIP32Path,
  getWitnessSize,
  hardenedBIP32Index,
  hash160,
  isKeyCompressed,
  isValidSignature,
  multisigAddress,
  multisigAddressType,
  multisigBIP32Path,
  multisigBIP32Root,
  multisigBraidDetails,
  multisigPublicKeys,
  multisigRedeemScript,
  multisigRequiredSigners,
  multisigScript,
  multisigSignatureBuffer,
  multisigTotalSigners,
  multisigWitnessScript,
  networkData,
  networkLabel,
  parseSignatureArrayFromPSBT,
  parseSignaturesFromPSBT,
  psbtInputFormatter,
  psbtOutputFormatter,
  satoshisToBitcoins,
  scriptToHex,
  scriptToOps,
  signatureNoSighashType,
  signedMultisigTransaction,
  sortInputs,
  toHexString,
  translatePSBT,
  unsignedMultisigPSBT,
  unsignedMultisigTransaction,
  unsignedTransactionObjectFromPSBT,
  validBase64,
  validateAddress,
  validateBIP32Index,
  validateBIP32Path,
  validateBip32PathForBraid,
  validateExtendedPublicKey,
  validateExtendedPublicKeyForNetwork,
  validateFee,
  validateFeeRate,
  validateHex,
  validateMultisigInput,
  validateMultisigInputs,
  validateMultisigSignature,
  validateOutput,
  validateOutputAmount,
  validateOutputs,
  validatePrefix,
  validatePublicKey,
  validateRootFingerprint,
  validateTransactionID,
  validateTransactionIndex
};
/*! Bundled license information:

@jspm/core/nodelibs/browser/assert.js:
  (*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   *)
*/
