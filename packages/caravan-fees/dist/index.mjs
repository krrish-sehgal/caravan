// ../../node_modules/@jspm/core/nodelibs/browser/buffer.js
var exports$3 = {};
var _dewExec$2 = false;
function dew$2() {
  if (_dewExec$2)
    return exports$3;
  _dewExec$2 = true;
  exports$3.byteLength = byteLength;
  exports$3.toByteArray = toByteArray;
  exports$3.fromByteArray = fromByteArray;
  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
  var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }
  revLookup["-".charCodeAt(0)] = 62;
  revLookup["_".charCodeAt(0)] = 63;
  function getLens(b64) {
    var len2 = b64.length;
    if (len2 % 4 > 0) {
      throw new Error("Invalid string. Length must be a multiple of 4");
    }
    var validLen = b64.indexOf("=");
    if (validLen === -1)
      validLen = len2;
    var placeHoldersLen = validLen === len2 ? 0 : 4 - validLen % 4;
    return [validLen, placeHoldersLen];
  }
  function byteLength(b64) {
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function _byteLength(b64, validLen, placeHoldersLen) {
    return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
  }
  function toByteArray(b64) {
    var tmp;
    var lens = getLens(b64);
    var validLen = lens[0];
    var placeHoldersLen = lens[1];
    var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
    var curByte = 0;
    var len2 = placeHoldersLen > 0 ? validLen - 4 : validLen;
    var i2;
    for (i2 = 0; i2 < len2; i2 += 4) {
      tmp = revLookup[b64.charCodeAt(i2)] << 18 | revLookup[b64.charCodeAt(i2 + 1)] << 12 | revLookup[b64.charCodeAt(i2 + 2)] << 6 | revLookup[b64.charCodeAt(i2 + 3)];
      arr[curByte++] = tmp >> 16 & 255;
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 2) {
      tmp = revLookup[b64.charCodeAt(i2)] << 2 | revLookup[b64.charCodeAt(i2 + 1)] >> 4;
      arr[curByte++] = tmp & 255;
    }
    if (placeHoldersLen === 1) {
      tmp = revLookup[b64.charCodeAt(i2)] << 10 | revLookup[b64.charCodeAt(i2 + 1)] << 4 | revLookup[b64.charCodeAt(i2 + 2)] >> 2;
      arr[curByte++] = tmp >> 8 & 255;
      arr[curByte++] = tmp & 255;
    }
    return arr;
  }
  function tripletToBase64(num) {
    return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
  }
  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i2 = start; i2 < end; i2 += 3) {
      tmp = (uint8[i2] << 16 & 16711680) + (uint8[i2 + 1] << 8 & 65280) + (uint8[i2 + 2] & 255);
      output.push(tripletToBase64(tmp));
    }
    return output.join("");
  }
  function fromByteArray(uint8) {
    var tmp;
    var len2 = uint8.length;
    var extraBytes = len2 % 3;
    var parts = [];
    var maxChunkLength = 16383;
    for (var i2 = 0, len22 = len2 - extraBytes; i2 < len22; i2 += maxChunkLength) {
      parts.push(encodeChunk(uint8, i2, i2 + maxChunkLength > len22 ? len22 : i2 + maxChunkLength));
    }
    if (extraBytes === 1) {
      tmp = uint8[len2 - 1];
      parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
    } else if (extraBytes === 2) {
      tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
      parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
    }
    return parts.join("");
  }
  return exports$3;
}
var exports$2 = {};
var _dewExec$1 = false;
function dew$1() {
  if (_dewExec$1)
    return exports$2;
  _dewExec$1 = true;
  exports$2.read = function(buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];
    i += d;
    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }
    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
    }
    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  };
  exports$2.write = function(buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
    value = Math.abs(value);
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }
      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }
    for (; mLen >= 8; buffer[offset + i] = m & 255, i += d, m /= 256, mLen -= 8) {
    }
    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 255, i += d, e /= 256, eLen -= 8) {
    }
    buffer[offset + i - d] |= s * 128;
  };
  return exports$2;
}
var exports$1 = {};
var _dewExec = false;
function dew() {
  if (_dewExec)
    return exports$1;
  _dewExec = true;
  const base64 = dew$2();
  const ieee754 = dew$1();
  const customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
  exports$1.Buffer = Buffer2;
  exports$1.SlowBuffer = SlowBuffer;
  exports$1.INSPECT_MAX_BYTES = 50;
  const K_MAX_LENGTH = 2147483647;
  exports$1.kMaxLength = K_MAX_LENGTH;
  Buffer2.TYPED_ARRAY_SUPPORT = typedArraySupport();
  if (!Buffer2.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
    console.error("This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
  }
  function typedArraySupport() {
    try {
      const arr = new Uint8Array(1);
      const proto = {
        foo: function() {
          return 42;
        }
      };
      Object.setPrototypeOf(proto, Uint8Array.prototype);
      Object.setPrototypeOf(arr, proto);
      return arr.foo() === 42;
    } catch (e) {
      return false;
    }
  }
  Object.defineProperty(Buffer2.prototype, "parent", {
    enumerable: true,
    get: function() {
      if (!Buffer2.isBuffer(this))
        return void 0;
      return this.buffer;
    }
  });
  Object.defineProperty(Buffer2.prototype, "offset", {
    enumerable: true,
    get: function() {
      if (!Buffer2.isBuffer(this))
        return void 0;
      return this.byteOffset;
    }
  });
  function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('The value "' + length + '" is invalid for option "size"');
    }
    const buf = new Uint8Array(length);
    Object.setPrototypeOf(buf, Buffer2.prototype);
    return buf;
  }
  function Buffer2(arg, encodingOrOffset, length) {
    if (typeof arg === "number") {
      if (typeof encodingOrOffset === "string") {
        throw new TypeError('The "string" argument must be of type string. Received type number');
      }
      return allocUnsafe(arg);
    }
    return from(arg, encodingOrOffset, length);
  }
  Buffer2.poolSize = 8192;
  function from(value, encodingOrOffset, length) {
    if (typeof value === "string") {
      return fromString(value, encodingOrOffset);
    }
    if (ArrayBuffer.isView(value)) {
      return fromArrayView(value);
    }
    if (value == null) {
      throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
    }
    if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }
    if (typeof value === "number") {
      throw new TypeError('The "value" argument must not be of type number. Received type number');
    }
    const valueOf = value.valueOf && value.valueOf();
    if (valueOf != null && valueOf !== value) {
      return Buffer2.from(valueOf, encodingOrOffset, length);
    }
    const b = fromObject(value);
    if (b)
      return b;
    if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
      return Buffer2.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
    }
    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value);
  }
  Buffer2.from = function(value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
  };
  Object.setPrototypeOf(Buffer2.prototype, Uint8Array.prototype);
  Object.setPrototypeOf(Buffer2, Uint8Array);
  function assertSize(size) {
    if (typeof size !== "number") {
      throw new TypeError('"size" argument must be of type number');
    } else if (size < 0) {
      throw new RangeError('The value "' + size + '" is invalid for option "size"');
    }
  }
  function alloc(size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(size);
    }
    if (fill !== void 0) {
      return typeof encoding === "string" ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
    }
    return createBuffer(size);
  }
  Buffer2.alloc = function(size, fill, encoding) {
    return alloc(size, fill, encoding);
  };
  function allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
  }
  Buffer2.allocUnsafe = function(size) {
    return allocUnsafe(size);
  };
  Buffer2.allocUnsafeSlow = function(size) {
    return allocUnsafe(size);
  };
  function fromString(string, encoding) {
    if (typeof encoding !== "string" || encoding === "") {
      encoding = "utf8";
    }
    if (!Buffer2.isEncoding(encoding)) {
      throw new TypeError("Unknown encoding: " + encoding);
    }
    const length = byteLength(string, encoding) | 0;
    let buf = createBuffer(length);
    const actual = buf.write(string, encoding);
    if (actual !== length) {
      buf = buf.slice(0, actual);
    }
    return buf;
  }
  function fromArrayLike(array) {
    const length = array.length < 0 ? 0 : checked(array.length) | 0;
    const buf = createBuffer(length);
    for (let i = 0; i < length; i += 1) {
      buf[i] = array[i] & 255;
    }
    return buf;
  }
  function fromArrayView(arrayView) {
    if (isInstance(arrayView, Uint8Array)) {
      const copy = new Uint8Array(arrayView);
      return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
    }
    return fromArrayLike(arrayView);
  }
  function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('"offset" is outside of buffer bounds');
    }
    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('"length" is outside of buffer bounds');
    }
    let buf;
    if (byteOffset === void 0 && length === void 0) {
      buf = new Uint8Array(array);
    } else if (length === void 0) {
      buf = new Uint8Array(array, byteOffset);
    } else {
      buf = new Uint8Array(array, byteOffset, length);
    }
    Object.setPrototypeOf(buf, Buffer2.prototype);
    return buf;
  }
  function fromObject(obj) {
    if (Buffer2.isBuffer(obj)) {
      const len = checked(obj.length) | 0;
      const buf = createBuffer(len);
      if (buf.length === 0) {
        return buf;
      }
      obj.copy(buf, 0, 0, len);
      return buf;
    }
    if (obj.length !== void 0) {
      if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
        return createBuffer(0);
      }
      return fromArrayLike(obj);
    }
    if (obj.type === "Buffer" && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data);
    }
  }
  function checked(length) {
    if (length >= K_MAX_LENGTH) {
      throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + K_MAX_LENGTH.toString(16) + " bytes");
    }
    return length | 0;
  }
  function SlowBuffer(length) {
    if (+length != length) {
      length = 0;
    }
    return Buffer2.alloc(+length);
  }
  Buffer2.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true && b !== Buffer2.prototype;
  };
  Buffer2.compare = function compare(a, b) {
    if (isInstance(a, Uint8Array))
      a = Buffer2.from(a, a.offset, a.byteLength);
    if (isInstance(b, Uint8Array))
      b = Buffer2.from(b, b.offset, b.byteLength);
    if (!Buffer2.isBuffer(a) || !Buffer2.isBuffer(b)) {
      throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
    }
    if (a === b)
      return 0;
    let x = a.length;
    let y = b.length;
    for (let i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
      }
    }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  Buffer2.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "latin1":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
        return true;
      default:
        return false;
    }
  };
  Buffer2.concat = function concat(list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }
    if (list.length === 0) {
      return Buffer2.alloc(0);
    }
    let i;
    if (length === void 0) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }
    const buffer = Buffer2.allocUnsafe(length);
    let pos = 0;
    for (i = 0; i < list.length; ++i) {
      let buf = list[i];
      if (isInstance(buf, Uint8Array)) {
        if (pos + buf.length > buffer.length) {
          if (!Buffer2.isBuffer(buf))
            buf = Buffer2.from(buf);
          buf.copy(buffer, pos);
        } else {
          Uint8Array.prototype.set.call(buffer, buf, pos);
        }
      } else if (!Buffer2.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      } else {
        buf.copy(buffer, pos);
      }
      pos += buf.length;
    }
    return buffer;
  };
  function byteLength(string, encoding) {
    if (Buffer2.isBuffer(string)) {
      return string.length;
    }
    if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
      return string.byteLength;
    }
    if (typeof string !== "string") {
      throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string);
    }
    const len = string.length;
    const mustMatch = arguments.length > 2 && arguments[2] === true;
    if (!mustMatch && len === 0)
      return 0;
    let loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "ascii":
        case "latin1":
        case "binary":
          return len;
        case "utf8":
        case "utf-8":
          return utf8ToBytes(string).length;
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return len * 2;
        case "hex":
          return len >>> 1;
        case "base64":
          return base64ToBytes(string).length;
        default:
          if (loweredCase) {
            return mustMatch ? -1 : utf8ToBytes(string).length;
          }
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer2.byteLength = byteLength;
  function slowToString(encoding, start, end) {
    let loweredCase = false;
    if (start === void 0 || start < 0) {
      start = 0;
    }
    if (start > this.length) {
      return "";
    }
    if (end === void 0 || end > this.length) {
      end = this.length;
    }
    if (end <= 0) {
      return "";
    }
    end >>>= 0;
    start >>>= 0;
    if (end <= start) {
      return "";
    }
    if (!encoding)
      encoding = "utf8";
    while (true) {
      switch (encoding) {
        case "hex":
          return hexSlice(this, start, end);
        case "utf8":
        case "utf-8":
          return utf8Slice(this, start, end);
        case "ascii":
          return asciiSlice(this, start, end);
        case "latin1":
        case "binary":
          return latin1Slice(this, start, end);
        case "base64":
          return base64Slice(this, start, end);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return utf16leSlice(this, start, end);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = (encoding + "").toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer2.prototype._isBuffer = true;
  function swap(b, n, m) {
    const i = b[n];
    b[n] = b[m];
    b[m] = i;
  }
  Buffer2.prototype.swap16 = function swap16() {
    const len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 16-bits");
    }
    for (let i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this;
  };
  Buffer2.prototype.swap32 = function swap32() {
    const len = this.length;
    if (len % 4 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 32-bits");
    }
    for (let i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this;
  };
  Buffer2.prototype.swap64 = function swap64() {
    const len = this.length;
    if (len % 8 !== 0) {
      throw new RangeError("Buffer size must be a multiple of 64-bits");
    }
    for (let i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this;
  };
  Buffer2.prototype.toString = function toString() {
    const length = this.length;
    if (length === 0)
      return "";
    if (arguments.length === 0)
      return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };
  Buffer2.prototype.toLocaleString = Buffer2.prototype.toString;
  Buffer2.prototype.equals = function equals(b) {
    if (!Buffer2.isBuffer(b))
      throw new TypeError("Argument must be a Buffer");
    if (this === b)
      return true;
    return Buffer2.compare(this, b) === 0;
  };
  Buffer2.prototype.inspect = function inspect() {
    let str = "";
    const max = exports$1.INSPECT_MAX_BYTES;
    str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
    if (this.length > max)
      str += " ... ";
    return "<Buffer " + str + ">";
  };
  if (customInspectSymbol) {
    Buffer2.prototype[customInspectSymbol] = Buffer2.prototype.inspect;
  }
  Buffer2.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (isInstance(target, Uint8Array)) {
      target = Buffer2.from(target, target.offset, target.byteLength);
    }
    if (!Buffer2.isBuffer(target)) {
      throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target);
    }
    if (start === void 0) {
      start = 0;
    }
    if (end === void 0) {
      end = target ? target.length : 0;
    }
    if (thisStart === void 0) {
      thisStart = 0;
    }
    if (thisEnd === void 0) {
      thisEnd = this.length;
    }
    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError("out of range index");
    }
    if (thisStart >= thisEnd && start >= end) {
      return 0;
    }
    if (thisStart >= thisEnd) {
      return -1;
    }
    if (start >= end) {
      return 1;
    }
    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;
    if (this === target)
      return 0;
    let x = thisEnd - thisStart;
    let y = end - start;
    const len = Math.min(x, y);
    const thisCopy = this.slice(thisStart, thisEnd);
    const targetCopy = target.slice(start, end);
    for (let i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break;
      }
    }
    if (x < y)
      return -1;
    if (y < x)
      return 1;
    return 0;
  };
  function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    if (buffer.length === 0)
      return -1;
    if (typeof byteOffset === "string") {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 2147483647) {
      byteOffset = 2147483647;
    } else if (byteOffset < -2147483648) {
      byteOffset = -2147483648;
    }
    byteOffset = +byteOffset;
    if (numberIsNaN(byteOffset)) {
      byteOffset = dir ? 0 : buffer.length - 1;
    }
    if (byteOffset < 0)
      byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir)
        return -1;
      else
        byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir)
        byteOffset = 0;
      else
        return -1;
    }
    if (typeof val === "string") {
      val = Buffer2.from(val, encoding);
    }
    if (Buffer2.isBuffer(val)) {
      if (val.length === 0) {
        return -1;
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === "number") {
      val = val & 255;
      if (typeof Uint8Array.prototype.indexOf === "function") {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        }
      }
      return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
    }
    throw new TypeError("val must be string, number or Buffer");
  }
  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    let indexSize = 1;
    let arrLength = arr.length;
    let valLength = val.length;
    if (encoding !== void 0) {
      encoding = String(encoding).toLowerCase();
      if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }
    function read(buf, i2) {
      if (indexSize === 1) {
        return buf[i2];
      } else {
        return buf.readUInt16BE(i2 * indexSize);
      }
    }
    let i;
    if (dir) {
      let foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1)
            foundIndex = i;
          if (i - foundIndex + 1 === valLength)
            return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1)
            i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength)
        byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        let found = true;
        for (let j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break;
          }
        }
        if (found)
          return i;
      }
    }
    return -1;
  }
  Buffer2.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
  };
  Buffer2.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };
  Buffer2.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  };
  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    const remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }
    const strLen = string.length;
    if (length > strLen / 2) {
      length = strLen / 2;
    }
    let i;
    for (i = 0; i < length; ++i) {
      const parsed = parseInt(string.substr(i * 2, 2), 16);
      if (numberIsNaN(parsed))
        return i;
      buf[offset + i] = parsed;
    }
    return i;
  }
  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }
  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }
  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }
  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }
  Buffer2.prototype.write = function write(string, offset, length, encoding) {
    if (offset === void 0) {
      encoding = "utf8";
      length = this.length;
      offset = 0;
    } else if (length === void 0 && typeof offset === "string") {
      encoding = offset;
      length = this.length;
      offset = 0;
    } else if (isFinite(offset)) {
      offset = offset >>> 0;
      if (isFinite(length)) {
        length = length >>> 0;
        if (encoding === void 0)
          encoding = "utf8";
      } else {
        encoding = length;
        length = void 0;
      }
    } else {
      throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
    }
    const remaining = this.length - offset;
    if (length === void 0 || length > remaining)
      length = remaining;
    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
      throw new RangeError("Attempt to write outside buffer bounds");
    }
    if (!encoding)
      encoding = "utf8";
    let loweredCase = false;
    for (; ; ) {
      switch (encoding) {
        case "hex":
          return hexWrite(this, string, offset, length);
        case "utf8":
        case "utf-8":
          return utf8Write(this, string, offset, length);
        case "ascii":
        case "latin1":
        case "binary":
          return asciiWrite(this, string, offset, length);
        case "base64":
          return base64Write(this, string, offset, length);
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return ucs2Write(this, string, offset, length);
        default:
          if (loweredCase)
            throw new TypeError("Unknown encoding: " + encoding);
          encoding = ("" + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };
  Buffer2.prototype.toJSON = function toJSON() {
    return {
      type: "Buffer",
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };
  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }
  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    const res = [];
    let i = start;
    while (i < end) {
      const firstByte = buf[i];
      let codePoint = null;
      let bytesPerSequence = firstByte > 239 ? 4 : firstByte > 223 ? 3 : firstByte > 191 ? 2 : 1;
      if (i + bytesPerSequence <= end) {
        let secondByte, thirdByte, fourthByte, tempCodePoint;
        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 128) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 192) === 128) {
              tempCodePoint = (firstByte & 31) << 6 | secondByte & 63;
              if (tempCodePoint > 127) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 12 | (secondByte & 63) << 6 | thirdByte & 63;
              if (tempCodePoint > 2047 && (tempCodePoint < 55296 || tempCodePoint > 57343)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 192) === 128 && (thirdByte & 192) === 128 && (fourthByte & 192) === 128) {
              tempCodePoint = (firstByte & 15) << 18 | (secondByte & 63) << 12 | (thirdByte & 63) << 6 | fourthByte & 63;
              if (tempCodePoint > 65535 && tempCodePoint < 1114112) {
                codePoint = tempCodePoint;
              }
            }
        }
      }
      if (codePoint === null) {
        codePoint = 65533;
        bytesPerSequence = 1;
      } else if (codePoint > 65535) {
        codePoint -= 65536;
        res.push(codePoint >>> 10 & 1023 | 55296);
        codePoint = 56320 | codePoint & 1023;
      }
      res.push(codePoint);
      i += bytesPerSequence;
    }
    return decodeCodePointsArray(res);
  }
  const MAX_ARGUMENTS_LENGTH = 4096;
  function decodeCodePointsArray(codePoints) {
    const len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints);
    }
    let res = "";
    let i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }
    return res;
  }
  function asciiSlice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 127);
    }
    return ret;
  }
  function latin1Slice(buf, start, end) {
    let ret = "";
    end = Math.min(buf.length, end);
    for (let i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }
  function hexSlice(buf, start, end) {
    const len = buf.length;
    if (!start || start < 0)
      start = 0;
    if (!end || end < 0 || end > len)
      end = len;
    let out = "";
    for (let i = start; i < end; ++i) {
      out += hexSliceLookupTable[buf[i]];
    }
    return out;
  }
  function utf16leSlice(buf, start, end) {
    const bytes = buf.slice(start, end);
    let res = "";
    for (let i = 0; i < bytes.length - 1; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }
  Buffer2.prototype.slice = function slice(start, end) {
    const len = this.length;
    start = ~~start;
    end = end === void 0 ? len : ~~end;
    if (start < 0) {
      start += len;
      if (start < 0)
        start = 0;
    } else if (start > len) {
      start = len;
    }
    if (end < 0) {
      end += len;
      if (end < 0)
        end = 0;
    } else if (end > len) {
      end = len;
    }
    if (end < start)
      end = start;
    const newBuf = this.subarray(start, end);
    Object.setPrototypeOf(newBuf, Buffer2.prototype);
    return newBuf;
  };
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0)
      throw new RangeError("offset is not uint");
    if (offset + ext > length)
      throw new RangeError("Trying to access beyond buffer length");
  }
  Buffer2.prototype.readUintLE = Buffer2.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
    offset = offset >>> 0;
    byteLength2 = byteLength2 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength2, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength2 && (mul *= 256)) {
      val += this[offset + i] * mul;
    }
    return val;
  };
  Buffer2.prototype.readUintBE = Buffer2.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
    offset = offset >>> 0;
    byteLength2 = byteLength2 >>> 0;
    if (!noAssert) {
      checkOffset(offset, byteLength2, this.length);
    }
    let val = this[offset + --byteLength2];
    let mul = 1;
    while (byteLength2 > 0 && (mul *= 256)) {
      val += this[offset + --byteLength2] * mul;
    }
    return val;
  };
  Buffer2.prototype.readUint8 = Buffer2.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    return this[offset];
  };
  Buffer2.prototype.readUint16LE = Buffer2.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
  };
  Buffer2.prototype.readUint16BE = Buffer2.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
  };
  Buffer2.prototype.readUint32LE = Buffer2.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
  };
  Buffer2.prototype.readUint32BE = Buffer2.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
  };
  Buffer2.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const lo = first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24;
    const hi = this[++offset] + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + last * 2 ** 24;
    return BigInt(lo) + (BigInt(hi) << BigInt(32));
  });
  Buffer2.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const hi = first * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    const lo = this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last;
    return (BigInt(hi) << BigInt(32)) + BigInt(lo);
  });
  Buffer2.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
    offset = offset >>> 0;
    byteLength2 = byteLength2 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength2, this.length);
    let val = this[offset];
    let mul = 1;
    let i = 0;
    while (++i < byteLength2 && (mul *= 256)) {
      val += this[offset + i] * mul;
    }
    mul *= 128;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength2);
    return val;
  };
  Buffer2.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
    offset = offset >>> 0;
    byteLength2 = byteLength2 >>> 0;
    if (!noAssert)
      checkOffset(offset, byteLength2, this.length);
    let i = byteLength2;
    let mul = 1;
    let val = this[offset + --i];
    while (i > 0 && (mul *= 256)) {
      val += this[offset + --i] * mul;
    }
    mul *= 128;
    if (val >= mul)
      val -= Math.pow(2, 8 * byteLength2);
    return val;
  };
  Buffer2.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 1, this.length);
    if (!(this[offset] & 128))
      return this[offset];
    return (255 - this[offset] + 1) * -1;
  };
  Buffer2.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    const val = this[offset] | this[offset + 1] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer2.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 2, this.length);
    const val = this[offset + 1] | this[offset] << 8;
    return val & 32768 ? val | 4294901760 : val;
  };
  Buffer2.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
  };
  Buffer2.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
  };
  Buffer2.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const val = this[offset + 4] + this[offset + 5] * 2 ** 8 + this[offset + 6] * 2 ** 16 + (last << 24);
    return (BigInt(val) << BigInt(32)) + BigInt(first + this[++offset] * 2 ** 8 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 24);
  });
  Buffer2.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
    offset = offset >>> 0;
    validateNumber(offset, "offset");
    const first = this[offset];
    const last = this[offset + 7];
    if (first === void 0 || last === void 0) {
      boundsError(offset, this.length - 8);
    }
    const val = (first << 24) + // Overflow
    this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + this[++offset];
    return (BigInt(val) << BigInt(32)) + BigInt(this[++offset] * 2 ** 24 + this[++offset] * 2 ** 16 + this[++offset] * 2 ** 8 + last);
  });
  Buffer2.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, true, 23, 4);
  };
  Buffer2.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, false, 23, 4);
  };
  Buffer2.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, true, 52, 8);
  };
  Buffer2.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert)
      checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, false, 52, 8);
  };
  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer2.isBuffer(buf))
      throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min)
      throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
  }
  Buffer2.prototype.writeUintLE = Buffer2.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength2 = byteLength2 >>> 0;
    if (!noAssert) {
      const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
      checkInt(this, value, offset, byteLength2, maxBytes, 0);
    }
    let mul = 1;
    let i = 0;
    this[offset] = value & 255;
    while (++i < byteLength2 && (mul *= 256)) {
      this[offset + i] = value / mul & 255;
    }
    return offset + byteLength2;
  };
  Buffer2.prototype.writeUintBE = Buffer2.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength2 = byteLength2 >>> 0;
    if (!noAssert) {
      const maxBytes = Math.pow(2, 8 * byteLength2) - 1;
      checkInt(this, value, offset, byteLength2, maxBytes, 0);
    }
    let i = byteLength2 - 1;
    let mul = 1;
    this[offset + i] = value & 255;
    while (--i >= 0 && (mul *= 256)) {
      this[offset + i] = value / mul & 255;
    }
    return offset + byteLength2;
  };
  Buffer2.prototype.writeUint8 = Buffer2.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 255, 0);
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer2.prototype.writeUint16LE = Buffer2.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer2.prototype.writeUint16BE = Buffer2.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 65535, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer2.prototype.writeUint32LE = Buffer2.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 255;
    return offset + 4;
  };
  Buffer2.prototype.writeUint32BE = Buffer2.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 4294967295, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  function wrtBigUInt64LE(buf, value, offset, min, max) {
    checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    lo = lo >> 8;
    buf[offset++] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    hi = hi >> 8;
    buf[offset++] = hi;
    return offset;
  }
  function wrtBigUInt64BE(buf, value, offset, min, max) {
    checkIntBI(value, min, max, buf, offset, 7);
    let lo = Number(value & BigInt(4294967295));
    buf[offset + 7] = lo;
    lo = lo >> 8;
    buf[offset + 6] = lo;
    lo = lo >> 8;
    buf[offset + 5] = lo;
    lo = lo >> 8;
    buf[offset + 4] = lo;
    let hi = Number(value >> BigInt(32) & BigInt(4294967295));
    buf[offset + 3] = hi;
    hi = hi >> 8;
    buf[offset + 2] = hi;
    hi = hi >> 8;
    buf[offset + 1] = hi;
    hi = hi >> 8;
    buf[offset] = hi;
    return offset + 8;
  }
  Buffer2.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer2.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
  });
  Buffer2.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit = Math.pow(2, 8 * byteLength2 - 1);
      checkInt(this, value, offset, byteLength2, limit - 1, -limit);
    }
    let i = 0;
    let mul = 1;
    let sub = 0;
    this[offset] = value & 255;
    while (++i < byteLength2 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength2;
  };
  Buffer2.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      const limit = Math.pow(2, 8 * byteLength2 - 1);
      checkInt(this, value, offset, byteLength2, limit - 1, -limit);
    }
    let i = byteLength2 - 1;
    let mul = 1;
    let sub = 0;
    this[offset + i] = value & 255;
    while (--i >= 0 && (mul *= 256)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = (value / mul >> 0) - sub & 255;
    }
    return offset + byteLength2;
  };
  Buffer2.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 1, 127, -128);
    if (value < 0)
      value = 255 + value + 1;
    this[offset] = value & 255;
    return offset + 1;
  };
  Buffer2.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };
  Buffer2.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 2, 32767, -32768);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 255;
    return offset + 2;
  };
  Buffer2.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    this[offset] = value & 255;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
  };
  Buffer2.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert)
      checkInt(this, value, offset, 4, 2147483647, -2147483648);
    if (value < 0)
      value = 4294967295 + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 255;
    return offset + 4;
  };
  Buffer2.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
    return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  Buffer2.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
    return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
  });
  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length)
      throw new RangeError("Index out of range");
    if (offset < 0)
      throw new RangeError("Index out of range");
  }
  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    ieee754.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }
  Buffer2.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };
  Buffer2.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };
  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    ieee754.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }
  Buffer2.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };
  Buffer2.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };
  Buffer2.prototype.copy = function copy(target, targetStart, start, end) {
    if (!Buffer2.isBuffer(target))
      throw new TypeError("argument should be a Buffer");
    if (!start)
      start = 0;
    if (!end && end !== 0)
      end = this.length;
    if (targetStart >= target.length)
      targetStart = target.length;
    if (!targetStart)
      targetStart = 0;
    if (end > 0 && end < start)
      end = start;
    if (end === start)
      return 0;
    if (target.length === 0 || this.length === 0)
      return 0;
    if (targetStart < 0) {
      throw new RangeError("targetStart out of bounds");
    }
    if (start < 0 || start >= this.length)
      throw new RangeError("Index out of range");
    if (end < 0)
      throw new RangeError("sourceEnd out of bounds");
    if (end > this.length)
      end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }
    const len = end - start;
    if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
      this.copyWithin(targetStart, start, end);
    } else {
      Uint8Array.prototype.set.call(target, this.subarray(start, end), targetStart);
    }
    return len;
  };
  Buffer2.prototype.fill = function fill(val, start, end, encoding) {
    if (typeof val === "string") {
      if (typeof start === "string") {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === "string") {
        encoding = end;
        end = this.length;
      }
      if (encoding !== void 0 && typeof encoding !== "string") {
        throw new TypeError("encoding must be a string");
      }
      if (typeof encoding === "string" && !Buffer2.isEncoding(encoding)) {
        throw new TypeError("Unknown encoding: " + encoding);
      }
      if (val.length === 1) {
        const code = val.charCodeAt(0);
        if (encoding === "utf8" && code < 128 || encoding === "latin1") {
          val = code;
        }
      }
    } else if (typeof val === "number") {
      val = val & 255;
    } else if (typeof val === "boolean") {
      val = Number(val);
    }
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError("Out of range index");
    }
    if (end <= start) {
      return this;
    }
    start = start >>> 0;
    end = end === void 0 ? this.length : end >>> 0;
    if (!val)
      val = 0;
    let i;
    if (typeof val === "number") {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      const bytes = Buffer2.isBuffer(val) ? val : Buffer2.from(val, encoding);
      const len = bytes.length;
      if (len === 0) {
        throw new TypeError('The value "' + val + '" is invalid for argument "value"');
      }
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }
    return this;
  };
  const errors = {};
  function E(sym, getMessage, Base) {
    errors[sym] = class NodeError extends Base {
      constructor() {
        super();
        Object.defineProperty(this, "message", {
          value: getMessage.apply(this, arguments),
          writable: true,
          configurable: true
        });
        this.name = `${this.name} [${sym}]`;
        this.stack;
        delete this.name;
      }
      get code() {
        return sym;
      }
      set code(value) {
        Object.defineProperty(this, "code", {
          configurable: true,
          enumerable: true,
          value,
          writable: true
        });
      }
      toString() {
        return `${this.name} [${sym}]: ${this.message}`;
      }
    };
  }
  E("ERR_BUFFER_OUT_OF_BOUNDS", function(name) {
    if (name) {
      return `${name} is outside of buffer bounds`;
    }
    return "Attempt to access memory outside buffer bounds";
  }, RangeError);
  E("ERR_INVALID_ARG_TYPE", function(name, actual) {
    return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
  }, TypeError);
  E("ERR_OUT_OF_RANGE", function(str, range, input) {
    let msg = `The value of "${str}" is out of range.`;
    let received = input;
    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
      received = addNumericalSeparator(String(input));
    } else if (typeof input === "bigint") {
      received = String(input);
      if (input > BigInt(2) ** BigInt(32) || input < -(BigInt(2) ** BigInt(32))) {
        received = addNumericalSeparator(received);
      }
      received += "n";
    }
    msg += ` It must be ${range}. Received ${received}`;
    return msg;
  }, RangeError);
  function addNumericalSeparator(val) {
    let res = "";
    let i = val.length;
    const start = val[0] === "-" ? 1 : 0;
    for (; i >= start + 4; i -= 3) {
      res = `_${val.slice(i - 3, i)}${res}`;
    }
    return `${val.slice(0, i)}${res}`;
  }
  function checkBounds(buf, offset, byteLength2) {
    validateNumber(offset, "offset");
    if (buf[offset] === void 0 || buf[offset + byteLength2] === void 0) {
      boundsError(offset, buf.length - (byteLength2 + 1));
    }
  }
  function checkIntBI(value, min, max, buf, offset, byteLength2) {
    if (value > max || value < min) {
      const n = typeof min === "bigint" ? "n" : "";
      let range;
      if (byteLength2 > 3) {
        if (min === 0 || min === BigInt(0)) {
          range = `>= 0${n} and < 2${n} ** ${(byteLength2 + 1) * 8}${n}`;
        } else {
          range = `>= -(2${n} ** ${(byteLength2 + 1) * 8 - 1}${n}) and < 2 ** ${(byteLength2 + 1) * 8 - 1}${n}`;
        }
      } else {
        range = `>= ${min}${n} and <= ${max}${n}`;
      }
      throw new errors.ERR_OUT_OF_RANGE("value", range, value);
    }
    checkBounds(buf, offset, byteLength2);
  }
  function validateNumber(value, name) {
    if (typeof value !== "number") {
      throw new errors.ERR_INVALID_ARG_TYPE(name, "number", value);
    }
  }
  function boundsError(value, length, type) {
    if (Math.floor(value) !== value) {
      validateNumber(value, type);
      throw new errors.ERR_OUT_OF_RANGE(type || "offset", "an integer", value);
    }
    if (length < 0) {
      throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
    }
    throw new errors.ERR_OUT_OF_RANGE(type || "offset", `>= ${type ? 1 : 0} and <= ${length}`, value);
  }
  const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
  function base64clean(str) {
    str = str.split("=")[0];
    str = str.trim().replace(INVALID_BASE64_RE, "");
    if (str.length < 2)
      return "";
    while (str.length % 4 !== 0) {
      str = str + "=";
    }
    return str;
  }
  function utf8ToBytes(string, units) {
    units = units || Infinity;
    let codePoint;
    const length = string.length;
    let leadSurrogate = null;
    const bytes = [];
    for (let i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);
      if (codePoint > 55295 && codePoint < 57344) {
        if (!leadSurrogate) {
          if (codePoint > 56319) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          } else if (i + 1 === length) {
            if ((units -= 3) > -1)
              bytes.push(239, 191, 189);
            continue;
          }
          leadSurrogate = codePoint;
          continue;
        }
        if (codePoint < 56320) {
          if ((units -= 3) > -1)
            bytes.push(239, 191, 189);
          leadSurrogate = codePoint;
          continue;
        }
        codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
      } else if (leadSurrogate) {
        if ((units -= 3) > -1)
          bytes.push(239, 191, 189);
      }
      leadSurrogate = null;
      if (codePoint < 128) {
        if ((units -= 1) < 0)
          break;
        bytes.push(codePoint);
      } else if (codePoint < 2048) {
        if ((units -= 2) < 0)
          break;
        bytes.push(codePoint >> 6 | 192, codePoint & 63 | 128);
      } else if (codePoint < 65536) {
        if ((units -= 3) < 0)
          break;
        bytes.push(codePoint >> 12 | 224, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
      } else if (codePoint < 1114112) {
        if ((units -= 4) < 0)
          break;
        bytes.push(codePoint >> 18 | 240, codePoint >> 12 & 63 | 128, codePoint >> 6 & 63 | 128, codePoint & 63 | 128);
      } else {
        throw new Error("Invalid code point");
      }
    }
    return bytes;
  }
  function asciiToBytes(str) {
    const byteArray = [];
    for (let i = 0; i < str.length; ++i) {
      byteArray.push(str.charCodeAt(i) & 255);
    }
    return byteArray;
  }
  function utf16leToBytes(str, units) {
    let c, hi, lo;
    const byteArray = [];
    for (let i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0)
        break;
      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }
    return byteArray;
  }
  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }
  function blitBuffer(src, dst, offset, length) {
    let i;
    for (i = 0; i < length; ++i) {
      if (i + offset >= dst.length || i >= src.length)
        break;
      dst[i + offset] = src[i];
    }
    return i;
  }
  function isInstance(obj, type) {
    return obj instanceof type || obj != null && obj.constructor != null && obj.constructor.name != null && obj.constructor.name === type.name;
  }
  function numberIsNaN(obj) {
    return obj !== obj;
  }
  const hexSliceLookupTable = function() {
    const alphabet = "0123456789abcdef";
    const table = new Array(256);
    for (let i = 0; i < 16; ++i) {
      const i16 = i * 16;
      for (let j = 0; j < 16; ++j) {
        table[i16 + j] = alphabet[i] + alphabet[j];
      }
    }
    return table;
  }();
  function defineBigIntMethod(fn) {
    return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
  }
  function BufferBigIntNotDefined() {
    throw new Error("BigInt not supported");
  }
  return exports$1;
}
var exports = dew();
exports["Buffer"];
exports["SlowBuffer"];
exports["INSPECT_MAX_BYTES"];
exports["kMaxLength"];
var Buffer = exports.Buffer;
var INSPECT_MAX_BYTES = exports.INSPECT_MAX_BYTES;
var kMaxLength = exports.kMaxLength;

// src/types.ts
import { MULTISIG_ADDRESS_TYPES } from "@caravan/bitcoin";
var FeeBumpStrategy = /* @__PURE__ */ ((FeeBumpStrategy2) => {
  FeeBumpStrategy2["RBF"] = "RBF";
  FeeBumpStrategy2["CPFP"] = "CPFP";
  FeeBumpStrategy2["NONE"] = "NONE";
  return FeeBumpStrategy2;
})(FeeBumpStrategy || {});
var SCRIPT_TYPES = {
  /** Pay to Public Key Hash */
  P2PKH: "P2PKH",
  /** Pay to Witness Public Key Hash (Native SegWit) */
  P2WPKH: "P2WPKH",
  /** Pay to Script Hash wrapping a Pay to Witness Public Key Hash (Nested SegWit) */
  P2SH_P2WPKH: "P2SH_P2WPKH",
  /** Unknown or unsupported script type */
  UNKNOWN: "UNKNOWN",
  /** Pay to Script Hash */
  P2SH: MULTISIG_ADDRESS_TYPES.P2SH,
  /** Pay to Script Hash wrapping a Pay to Witness Script Hash */
  P2SH_P2WSH: MULTISIG_ADDRESS_TYPES.P2SH_P2WSH,
  /** Pay to Witness Script Hash (Native SegWit for scripts) */
  P2WSH: MULTISIG_ADDRESS_TYPES.P2WSH
};

// src/utils.ts
import {
  estimateMultisigP2SHTransactionVSize,
  estimateMultisigP2SH_P2WSHTransactionVSize,
  estimateMultisigP2WSHTransactionVSize,
  Network,
  validateAddress
} from "@caravan/bitcoin";
import {
  payments,
  address as bitcoinAddress,
  networks,
  Transaction
} from "bitcoinjs-lib-v6";
import { PsbtV2 } from "@caravan/psbt";
import BigNumber from "bignumber.js";
function createOutputScript(destinationAddress, network) {
  const addressValidationError = validateAddress(destinationAddress, network);
  if (addressValidationError) {
    throw new Error(addressValidationError);
  }
  const bitcoinJsNetwork = network === Network.TESTNET ? networks.testnet : networks.bitcoin;
  try {
    return bitcoinAddress.toOutputScript(destinationAddress, bitcoinJsNetwork);
  } catch (error) {
    try {
      const p2wpkh = payments.p2wpkh({
        address: destinationAddress,
        network: bitcoinJsNetwork
      });
      if (p2wpkh.output) {
        return p2wpkh.output;
      }
      const p2wsh = payments.p2wsh({
        address: destinationAddress,
        network: bitcoinJsNetwork
      });
      if (p2wsh.output) {
        return p2wsh.output;
      }
      const p2tr = payments.p2tr({
        address: destinationAddress,
        network: bitcoinJsNetwork
      });
      if (p2tr.output) {
        return p2tr.output;
      }
      throw new Error("Unsupported address type");
    } catch (segwitError) {
      throw new Error(`Invalid or unsupported address: ${destinationAddress}`);
    }
  }
}
function getOutputAddress(script, network) {
  const bitcoinjsNetwork = mapCaravanNetworkToBitcoinJS(network);
  try {
    if (script.length === 25 && script[0] === 118 && script[1] === 169) {
      const p2pkhAddress = payments.p2pkh({
        output: script,
        network: bitcoinjsNetwork
      }).address;
      if (p2pkhAddress)
        return p2pkhAddress;
    }
    if (script.length === 22 && script[0] === 0 && script[1] === 20) {
      const p2wpkhAddress = payments.p2wpkh({
        output: script,
        network: bitcoinjsNetwork
      }).address;
      if (p2wpkhAddress)
        return p2wpkhAddress;
    }
    if (script.length === 34 && script[0] === 0 && script[1] === 32) {
      const p2wshAddress = payments.p2wsh({
        output: script,
        network: bitcoinjsNetwork
      }).address;
      if (p2wshAddress)
        return p2wshAddress;
    }
    if (script.length === 23 && script[0] === 169 && script[22] === 135) {
      return payments.p2sh({ output: script, network: bitcoinjsNetwork }).address || "";
    }
    if (script.length === 34 && script[0] === 81) {
      const p2trAddress = payments.p2tr({
        output: script,
        network: bitcoinjsNetwork
      }).address;
      if (p2trAddress)
        return p2trAddress;
    }
    return "Unable to derive address";
  } catch (e) {
    console.error("Error deriving address:", e);
    return "Unable to derive address";
  }
}
function estimateTransactionVsize({
  addressType = SCRIPT_TYPES.P2SH,
  numInputs = 1,
  numOutputs = 1,
  m = 1,
  n = 2
} = {}) {
  switch (addressType) {
    case SCRIPT_TYPES.P2SH:
      return estimateMultisigP2SHTransactionVSize({
        numInputs,
        numOutputs,
        m,
        n
      });
    case SCRIPT_TYPES.P2SH_P2WSH:
      return estimateMultisigP2SH_P2WSHTransactionVSize({
        numInputs,
        numOutputs,
        m,
        n
      });
    case SCRIPT_TYPES.P2WSH:
      return estimateMultisigP2WSHTransactionVSize({
        numInputs,
        numOutputs,
        m,
        n
      });
    default:
      throw new Error(`Unsupported address type: ${addressType}`);
  }
}
function initializePsbt(psbt) {
  if (psbt instanceof PsbtV2) {
    return psbt;
  }
  try {
    return new PsbtV2(psbt);
  } catch (error) {
    try {
      return PsbtV2.FromV0(psbt);
    } catch (conversionError) {
      throw new Error(
        "Unable to initialize PSBT. Neither V2 nor V0 format recognized."
      );
    }
  }
}
function calculateTotalInputValue(psbt) {
  let total = new BigNumber(0);
  for (let i = 0; i < psbt.PSBT_GLOBAL_INPUT_COUNT; i++) {
    const witnessUtxo = psbt.PSBT_IN_WITNESS_UTXO[i];
    const nonWitnessUtxo = psbt.PSBT_IN_NON_WITNESS_UTXO[i];
    if (witnessUtxo) {
      total = total.plus(parseWitnessUtxoValue(witnessUtxo, i));
    } else if (nonWitnessUtxo) {
      if (!nonWitnessUtxo) {
        throw new Error(
          `Output index for non-witness UTXO at index ${i} is undefined`
        );
      }
      total = total.plus(parseNonWitnessUtxoValue(nonWitnessUtxo, i));
    } else {
      throw new Error(`No UTXO data found for input at index ${i}`);
    }
  }
  return total;
}
function parseWitnessUtxoValue(utxo, index) {
  if (!utxo) {
    console.warn(`Witness UTXO at index ${index} is null`);
    return new BigNumber(0);
  }
  try {
    const buffer = Buffer.from(utxo, "hex");
    const value = buffer.readBigUInt64LE(0);
    return new BigNumber(value.toString());
  } catch (error) {
    console.warn(`Failed to parse witness UTXO at index ${index}:`, error);
    return new BigNumber(0);
  }
}
function parseNonWitnessUtxoValue(rawTx, outputIndex) {
  try {
    const tx = Transaction.fromHex(rawTx);
    if (outputIndex < 0 || outputIndex >= tx.outs.length) {
      throw new Error(`Invalid output index: ${outputIndex}`);
    }
    const output = tx.outs[outputIndex];
    return new BigNumber(output.value);
  } catch (error) {
    throw new Error(
      `Failed to parse non-witness UTXO: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
function calculateTotalOutputValue(psbt) {
  const sum = psbt.PSBT_OUT_AMOUNT.reduce((acc, amount) => acc + amount, 0n);
  return new BigNumber(sum.toString());
}
function mapCaravanNetworkToBitcoinJS(network) {
  switch (network) {
    case Network.MAINNET:
      return networks.bitcoin;
    case Network.TESTNET:
      return networks.testnet;
    case Network.REGTEST:
      return networks.regtest;
    case Network.SIGNET:
      throw new Error(
        "Signet is not directly supported in bitcoinjs-lib. Consider defining a custom network if needed."
      );
    default:
      throw new Error(`Unsupported network: ${network}`);
  }
}
function validateNonWitnessUtxo(utxoBuffer, txid, vout) {
  try {
    const tx = Transaction.fromBuffer(utxoBuffer);
    if (vout < 0 || vout >= tx.outs.length) {
      return false;
    }
    const output = tx.outs[vout];
    if (typeof output.value !== "number" || output.value <= 0) {
      return false;
    }
    if (!Buffer.isBuffer(output.script)) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error validating non-witness UTXO:", error);
    return false;
  }
}
function validateSequence(sequence) {
  return Number.isInteger(sequence) && sequence >= 0 && sequence <= 4294967295;
}

// src/transactionAnalyzer.ts
import { Transaction as Transaction2 } from "bitcoinjs-lib-v6";
import { Network as Network2 } from "@caravan/bitcoin";

// src/btcTransactionComponents.ts
import { satoshisToBitcoins } from "@caravan/bitcoin";
import BigNumber2 from "bignumber.js";
var BtcTxComponent = class {
  _amountSats;
  /**
   * @param amountSats - The amount in satoshis (as a string)
   */
  constructor(amountSats) {
    this._amountSats = new BigNumber2(amountSats);
  }
  /**
   * Get the amount in satoshis
   * @returns The amount in satoshis (as a string)
   */
  get amountSats() {
    return this._amountSats.toString();
  }
  /**
   * Set  amount in satoshis
   * @param amountSats - New amount in satoshis (as a string)
   */
  set amountSats(value) {
    this._amountSats = new BigNumber2(value);
  }
  /**
   * Get the amount in BTC
   * @returns The amount in BTC (as a string)
   */
  get amountBTC() {
    return satoshisToBitcoins(this._amountSats.toString());
  }
  hasAmount() {
    return this._amountSats.isGreaterThanOrEqualTo(0);
  }
};
var BtcTxInputTemplate = class _BtcTxInputTemplate extends BtcTxComponent {
  _txid;
  _vout;
  _nonWitnessUtxo;
  _witnessUtxo;
  _sequence;
  /**
   * @param {Object} params - The parameters for creating a BtcTxInputTemplate
   * @param {string} params.txid - The transaction ID of the UTXO (reversed, big-endian)
   * @param {number} params.vout - The output index in the transaction
   * @param {Satoshis} params.amountSats - The amount in satoshis
   */
  constructor(params) {
    super(params.amountSats || "0");
    this._txid = params.txid;
    this._vout = params.vout;
  }
  /**
   * Creates a BtcTxInputTemplate from a UTXO object.
   */
  static fromUTXO(utxo) {
    const template = new _BtcTxInputTemplate({
      txid: utxo.txid,
      vout: utxo.vout,
      amountSats: utxo.value
    });
    if (utxo.prevTxHex) {
      template.setNonWitnessUtxo(Buffer.from(utxo.prevTxHex, "hex"));
    }
    if (utxo.witnessUtxo) {
      template.setWitnessUtxo(utxo.witnessUtxo);
    }
    return template;
  }
  /**
   * The transaction ID of the UTXO (reversed, big-endian).
   * Required for all PSBT inputs.
   */
  get txid() {
    return this._txid;
  }
  /**
   * The output index in the transaction.
   * Required for all PSBT inputs.
   */
  get vout() {
    return this._vout;
  }
  /** Get the sequence number */
  get sequence() {
    return this._sequence;
  }
  /**
   * Sets the sequence number for the input.
   * Optional, but useful for RBF signaling.
   * @param {number} sequence - The sequence number
   */
  setSequence(sequence) {
    if (!validateSequence(sequence)) {
      throw new Error("Invalid sequence number");
    }
    this._sequence = sequence;
  }
  /**
   * Enables Replace-By-Fee (RBF) signaling for this input.
   * Sets the sequence number to 0xfffffffd .
   */
  enableRBF() {
    this.setSequence(4294967293);
  }
  /**
   * Disables Replace-By-Fee (RBF) signaling for this input.
   * Sets the sequence number to 0xffffffff.
   */
  disableRBF() {
    this.setSequence(4294967295);
  }
  /**
   * Checks if RBF is enabled for this input.
   * @returns {boolean} True if RBF is enabled, false otherwise.
   */
  isRBFEnabled() {
    return this._sequence !== void 0 && this._sequence < 4294967294;
  }
  /**
   * Gets the non-witness UTXO.
   */
  get nonWitnessUtxo() {
    return this._nonWitnessUtxo;
  }
  /**
   * Sets the non-witness UTXO.
   * Required for non-segwit inputs in PSBTs.
   * @param {Buffer} value - The full transaction containing the UTXO being spent
   */
  setNonWitnessUtxo(value) {
    if (!validateNonWitnessUtxo(value, this._txid, this._vout)) {
      throw new Error("Invalid non-witness UTXO");
    }
    this._nonWitnessUtxo = value;
  }
  /**
   * Gets the witness UTXO.
   */
  get witnessUtxo() {
    return this._witnessUtxo;
  }
  /**
   * Sets the witness UTXO.
   * Required for segwit inputs in PSBTs.
   * @param {Object} value - The witness UTXO
   * @param {Buffer} value.script - The scriptPubKey of the output
   * @param {number} value.value - The value of the output in satoshis
   */
  setWitnessUtxo(value) {
    this._witnessUtxo = value;
  }
  /**
   * Check if the input is valid
   * @returns True if the amount is positive and exists, and txid and vout are valid
   */
  isValid() {
    return this.hasAmount() && this._txid !== "" && this._vout >= 0;
  }
  /**
   * Checks if the input has the required fields for PSBT creation.
   */
  hasRequiredFieldsforPSBT() {
    return Boolean(
      this._txid && this._vout >= 0 && (this._nonWitnessUtxo || this._witnessUtxo)
    );
  }
  /**
   * Converts the input template to a UTXO object.
   */
  toUTXO() {
    return {
      txid: this._txid,
      vout: this._vout,
      value: this._amountSats.toString(),
      prevTxHex: this._nonWitnessUtxo?.toString("hex"),
      witnessUtxo: this._witnessUtxo
    };
  }
};
var BtcTxOutputTemplate = class extends BtcTxComponent {
  _address;
  _malleable = true;
  /**
   * @param params - Output parameters
   * @param params.address - Recipient address
   * @param params.amountSats - Amount in satoshis  (as a string)
   * @param params.locked - Whether the output is locked (immutable), defaults to false
   * @throws Error if trying to create a locked output with zero amount
   */
  constructor(params) {
    super(params.amountSats || "0");
    this._address = params.address;
    this._malleable = !params.locked;
    if (!this._malleable && this._amountSats.isEqualTo(0)) {
      throw new Error("Locked outputs must have an amount specified.");
    }
  }
  /** Get the recipient address */
  get address() {
    return this._address;
  }
  /** Check if the output is malleable (can be modified) */
  get isMalleable() {
    return this._malleable;
  }
  /**
   * Set a new amount for the output
   * @param amountSats - New amount in satoshis(as a string)
   * @throws Error if trying to modify a non-malleable output
   */
  setAmount(amountSats) {
    if (!this._malleable) {
      throw new Error("Cannot modify non-malleable output");
    }
    this._amountSats = new BigNumber2(amountSats);
  }
  /**
   * Add amount to the output
   * @param amountSats - Amount to add in satoshis (as a string)
   * @throws Error if trying to modify a non-malleable output
   */
  addAmount(amountSats) {
    if (!this._malleable) {
      throw new Error("Cannot modify non-malleable output");
    }
    this._amountSats = this._amountSats.plus(new BigNumber2(amountSats));
  }
  /**
   * Subtract amount from the output
   * @param amountSats - Amount to subtract in satoshis (as a string)
   * @throws Error if trying to modify a non-malleable output or if subtracting more than the current amount
   */
  subtractAmount(amountSats) {
    if (!this._malleable) {
      throw new Error("Cannot modify non-malleable output");
    }
    const subtractAmount = new BigNumber2(amountSats);
    if (subtractAmount.isGreaterThan(this._amountSats)) {
      throw new Error("Cannot subtract more than the current amount");
    }
    this.setAmount(this._amountSats.minus(subtractAmount).toString());
  }
  /**
   * Locks the output, preventing further modifications to its amount.
   *
   * This method sets the malleability of the output to false. Once called,
   * the output amount cannot be changed. If the output is already locked,
   * this method has no effect.
   *
   * Typical use cases include:
   * - Finalizing a transaction before signing
   * - Ensuring that certain outputs (like recipient amounts) are not accidentally modified
   *
   * An amount must be specified before locking. This is to prevent
   * locking an output with a zero amount, which could lead to invalid transactions.
   *
   * @throws {Error} If trying to lock an output with a zero amount
   */
  lock() {
    if (!this.isMalleable) {
      return;
    }
    if (this._amountSats.isEqualTo(0)) {
      throw new Error("Cannot lock an output with a zero amount.");
    }
    this._malleable = false;
  }
  /**
   * Checks if the output is valid according to basic Bitcoin transaction rules.
   *
   * This method performs several checks to ensure the output is properly formed:
   *
   * 1. For locked outputs:
   *    - Ensures that a non-zero amount is specified.
   *    - Throws an error if the amount is zero, as locked outputs must always have a valid amount.
   *
   * 2. For all output types:
   *    - Checks if the output has a non-zero amount (via hasAmount() method).
   *    - Verifies that the address is not an empty string.
   *
   * Note: This method does not perform exhaustive validation. For more thorough checks,
   * consider implementing a separate, comprehensive validation method.
   *
   * Special considerations:
   * - OP_RETURN outputs might require different validation logic (not implemented here).
   * - Zero-amount outputs for certain special cases (like Ephemeral Anchors) are not
   *   considered valid by this basic check. Implement custom logic if needed for such cases.
   *
   * @returns {boolean} True if the output is valid, false otherwise.
   * @throws {Error} If a locked output has a zero amount.
   */
  isValid() {
    if (!this.isMalleable && this._amountSats.isEqualTo(0)) {
      throw new Error("Locked outputs must have a non-zero amount specified");
    }
    return this.hasAmount() && this._address !== "";
  }
};

// src/transactionAnalyzer.ts
import BigNumber3 from "bignumber.js";
var TransactionAnalyzer = class _TransactionAnalyzer {
  _rawTx;
  _network;
  _targetFeeRate;
  _absoluteFee;
  _availableUtxos;
  _changeOutputIndex;
  _incrementalRelayFeeRate;
  _requiredSigners;
  _totalSigners;
  _addressType;
  _canRBF = null;
  _canCPFP = null;
  _assumeRBF = false;
  /**
   * Creates an instance of TransactionAnalyzer.
   * @param {AnalyzerOptions} options - Configuration options for the analyzer
   * @throws {Error} If the transaction is invalid or lacks inputs/outputs
   */
  constructor(options) {
    const validatedOptions = _TransactionAnalyzer.validateOptions(options);
    this._rawTx = validatedOptions.rawTx;
    this._network = validatedOptions.network;
    this._targetFeeRate = validatedOptions.targetFeeRate;
    this._absoluteFee = validatedOptions.absoluteFee;
    this._availableUtxos = validatedOptions.availableUtxos;
    this._changeOutputIndex = validatedOptions.changeOutputIndex;
    this._incrementalRelayFeeRate = validatedOptions.incrementalRelayFeeRate;
    this._requiredSigners = validatedOptions.requiredSigners;
    this._totalSigners = validatedOptions.totalSigners;
    this._addressType = validatedOptions.addressType;
  }
  /**
   * Gets the transaction ID (txid) of the analyzed transaction.
   * @returns {string} The transaction ID
   */
  get txid() {
    return this._rawTx.getId();
  }
  /**
   * Gets the virtual size (vsize) of the transaction in virtual bytes.
   * Note: This uses bitcoinjs-lib's implementation which applies Math.ceil()
   * for segwit transactions, potentially slightly overestimating the vsize.
   * This is generally acceptable, especially for fee bumping scenarios.
   * @returns {number} The virtual size of the transaction
   */
  get vsize() {
    return this._rawTx.virtualSize();
  }
  /**
   * Gets the weight of the transaction in weight units.
   * @returns {number} The weight of the transaction
   */
  get weight() {
    return this._rawTx.weight();
  }
  /**
   * Gets the deserialized inputs of the transaction.
   * @returns {BtcTxInputTemplate[]} An array of transaction inputs
   */
  get inputs() {
    return this.deserializeInputs();
  }
  /**
   * Gets the deserialized outputs of the transaction.
   * @returns {BtcTxOutputTemplate[]} An array of transaction outputs
   */
  get outputs() {
    return this.deserializeOutputs();
  }
  /**
   * Calculates and returns the fee of the transaction in satoshis.
   * @returns {Satoshis} The transaction fee in satoshis
   */
  get fee() {
    return this._absoluteFee.toString();
  }
  /**
   * Calculates and returns the fee rate of the transaction in satoshis per vbyte.
   * @returns {FeeRateSatsPerVByte} The transaction fee rate in satoshis per vbyte
   */
  get feeRate() {
    return this._absoluteFee.dividedBy(this.vsize).toNumber();
  }
  /**
   * Gets whether RBF is assumed to be always possible, regardless of signaling.
   * @returns {boolean} True if RBF is assumed to be always possible, false otherwise
   */
  get assumeRBF() {
    return this._assumeRBF;
  }
  /**
   * Sets whether to assume RBF is always possible, regardless of signaling.
   * @param {boolean} value - Whether to assume RBF is always possible
   */
  set assumeRBF(value) {
    this._assumeRBF = value;
    if (value && !this.isRBFSignaled()) {
      console.warn(
        "Assuming full RBF is possible, but transaction does not signal RBF. This may cause issues with some nodes or services and could lead to delayed or failed transaction replacement."
      );
    }
  }
  /**
   * Checks if RBF (Replace-By-Fee) can be performed on this transaction.
   *
   * RBF allows unconfirmed transactions to be replaced with a new version
   * that pays a higher fee. There are two types of RBF:
   *
   * 1. Signaled RBF (BIP125): At least one input has a sequence number < 0xfffffffe.
   * 2. Full RBF: Replacing any unconfirmed transaction, regardless of signaling.
   *
   * This method determines if RBF is possible based on three criteria:
   * 1. The transaction signals RBF (or full RBF is assumed).
   * 2. The wallet controls at least one input of the transaction.
   * 3. The necessary input is available in the wallet's UTXO set.
   *
   * It uses the transaction's input templates and compares them against the available UTXOs
   * to ensure that the wallet has control over at least one input, which is necessary for RBF.
   *
   *
   * While BIP125 defines the standard for signaled RBF, some nodes and miners
   * may accept full RBF, allowing replacement of any unconfirmed transaction.
   *
   * CAUTION: Assuming full RBF when a transaction doesn't signal it may lead to:
   * - Rejected replacements by nodes not accepting full RBF
   * - Delayed or failed transaction replacement
   * - Potential double-spend risks if recipients accept unconfirmed transactions
   *
   * @see https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki
   * @see https://bitcoinops.org/en/topics/replace-by-fee/
   *
   * @returns {boolean} True if RBF can be performed (signaled or assumed), false otherwise
   *
   */
  get canRBF() {
    const signaled = this.isRBFSignaled();
    if (this._assumeRBF && !signaled) {
      console.warn(
        "Assuming RBF is possible, but transaction does not signal RBF. This may cause issues with some nodes or services."
      );
    }
    if (!(signaled || this._assumeRBF)) {
      return false;
    }
    const inputTemplates = this.getInputTemplates();
    const hasControlledInput = this._availableUtxos.some(
      (utxo) => inputTemplates.some(
        (template) => template.txid === utxo.txid && template.vout === utxo.vout
      )
    );
    return hasControlledInput;
  }
  /**
   * Check if Child-Pays-for-Parent (CPFP) is possible for the transaction.
   * @returns {boolean} True if CPFP is possible, false otherwise.
   */
  get canCPFP() {
    return this.canPerformCPFP();
  }
  /**
   * Recommends the optimal fee bumping strategy based on the current transaction state.
   * @returns {FeeBumpStrategy} The recommended fee bumping strategy
   */
  get recommendedStrategy() {
    return this.recommendStrategy();
  }
  /**
   * Gets the list of available UTXOs for potential use in fee bumping.
   * @returns {UTXO[]} An array of available UTXOs
   */
  get availableUTXOs() {
    return this._availableUtxos;
  }
  /**
   * Gets the current target fee rate in satoshis per vbyte.
   * @returns {FeeRateSatsPerVByte } The target fee rate in satoshis per vbyte.
   */
  get targetFeeRate() {
    return this._targetFeeRate;
  }
  /**
   * Calculates and returns the fee rate required for a successful CPFP.
   * @returns {string} The CPFP fee rate in satoshis per vbyte
   */
  get cpfpFeeRate() {
    const desiredPackageFee = new BigNumber3(this.targetFeeRate).multipliedBy(
      this.CPFPPackageSize
    );
    const expectedFeeRate = BigNumber3.max(
      desiredPackageFee.minus(this.fee).dividedBy(this.estimatedCPFPChildSize),
      new BigNumber3(0)
    );
    return expectedFeeRate.toString();
  }
  /**
   * Calculates the minimum total fee required for a valid RBF (Replace-By-Fee) replacement transaction.
   *
   * This method determines the minimum fee needed to replace the current transaction
   * using the RBF protocol, as defined in BIP 125. It considers two key factors:
   * 1. The current transaction fee
   * 2. The minimum required fee increase (incremental relay fee * transaction size)
   *
   * Key considerations:
   * - BIP 125 Rule 4: Replacement must pay for its own bandwidth at minimum relay fee
   *   This rule doesn't explicitly consider fee rates, focusing on anti-DDoS protection.
   * - Modern mining preferences favor higher fee rates over absolute fees.
   *
   * The calculation ensures that the new transaction meets the minimum fee increase
   * required by the RBF rules, which is:
   * minimum_fee = original_fee + (incremental_relay_fee * transaction_size)
   *
   *
   *
   * References:
   * - BIP 125 (RBF): https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki
   * - Bitcoin Core RBF implementation: https://github.com/bitcoin/bitcoin/blob/master/src/policy/rbf.cpp
   * - RBF discussion (2018): https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2018-February/015724.html
   * - One-Shot Replace-By-Fee-Rate proposal: https://lists.linuxfoundation.org/pipermail/bitcoin-dev/2024-January/022298.html
   *
   * @returns {Satoshis} The minimum total fee required for the replacement transaction in satoshis.
   *                     This is always at least the current fee plus the minimum required increase.
   * @note This getter does not consider the user's target fee rate. It's the responsibility
   *       of the RBF function to ensure that the new transaction's fee is the maximum of
   *       this minimum fee and the fee calculated using the user's target fee rate.
   */
  get minimumRBFFee() {
    return new BigNumber3(this.fee).plus(this._incrementalRelayFeeRate.multipliedBy(this.vsize)).integerValue(BigNumber3.ROUND_CEIL).toString();
  }
  /**
   * Calculates the minimum total fee required for a successful CPFP (Child-Pays-For-Parent) operation.
   *
   * This method calculates the  fee needed for a child transaction to boost the
   * fee rate of the current (parent) transaction using the CPFP technique. It considers:
   * 1. The current transaction's size and fee
   * 2. An estimated size for a simple child transaction (1 input, 1 output)
   * 3. The target fee rate for the combined package (parent + child)
   *
   * The calculation aims to determine how much additional fee the child transaction
   * needs to contribute to bring the overall package fee rate up to the target.
   *
   * Assumptions:
   * - The child transaction will have 1 input (spending an output from this transaction)
   * - The child transaction will have 1 output (change back to the user's wallet)
   * - The multisig configuration (m-of-n) is the same as the parent transaction
   *
   * References:
   * - Bitcoin Core CPFP implementation:
   *   https://github.com/bitcoin/bitcoin/blob/master/src/policy/fees.cpp
   * - CPFP overview: https://bitcoinops.org/en/topics/cpfp/
   * - Package relay for CPFP: https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki#implementation-notes
   *
   * @returns {Satoshis} The estimated additional CPFP fee in satoshis.
   *                     This value represents how much extra fee the child transaction
   *                     should include above its own minimum required fee.
   *                     A positive value indicates the amount of additional fee required.
   *                     A zero or negative value (rare) could indicate that the current
   *                     transaction's fee is already sufficient for the desired rate.
   */
  get minimumCPFPFee() {
    return new BigNumber3(this.cpfpFeeRate).multipliedBy(this.CPFPPackageSize).toString();
  }
  /**
   * Estimates the virtual size of a potential CPFP child transaction.
   * @returns {number} The estimated vsize of the child transaction in vbytes
   */
  get estimatedCPFPChildSize() {
    const config = {
      addressType: this._addressType,
      numInputs: 1,
      // Assuming 1 input for the child transaction
      numOutputs: 1,
      // Assuming 1 output for the child transaction
      m: this._requiredSigners,
      n: this._totalSigners
    };
    return estimateTransactionVsize(config);
  }
  /**
   * Calculates the total package size for a potential CPFP transaction.
   * This includes the size of the current (parent) transaction and the estimated size of the child transaction.
   * @returns {number} The total package size in vbytes
   */
  get CPFPPackageSize() {
    return this.vsize + this.estimatedCPFPChildSize;
  }
  /**
   * Performs a comprehensive analysis of the Bitcoin transaction.
   *
   * This method aggregates various metrics and properties of the transaction,
   * including size, fees, RBF and CPFP capabilities, and the recommended
   * fee bumping strategy. It utilizes internal calculations and checks
   * performed by other methods of the TransactionAnalyzer class.
   *
   * @returns {TxAnalysis} A TxAnalysis object containing detailed information about the transaction.
   *
   * @property {string} txid - The transaction ID (hash) of the analyzed transaction.
   * @property {number} vsize - The virtual size of the transaction in virtual bytes (vBytes).
   * @property {number} weight - The weight of the transaction in weight units (WU).
   * @property {Satoshis} fee - The total fee of the transaction in satoshis.
   * @property {FeeRateSatsPerVByte} feeRate - The fee rate of the transaction in satoshis per virtual byte.
   * @property {BtcTxInputTemplate[]} inputs - An array of the transaction's inputs.
   * @property {BtcTxOutputTemplate[]} outputs - An array of the transaction's outputs.
   * @property {boolean} isRBFSignaled - Indicates whether the transaction signals RBF (Replace-By-Fee).
   * @property {boolean} canRBF - Indicates whether RBF is possible for this transaction.
   * @property {boolean} canCPFP - Indicates whether CPFP (Child-Pays-For-Parent) is possible for this transaction.
   * @property {FeeBumpStrategy} recommendedStrategy - The recommended fee bumping strategy for this transaction.
   * @property {Satoshis} estimatedRBFFee - The estimated fee required for a successful RBF, in satoshis.
   * @property {Satoshis} estimatedCPFPFee - The estimated fee required for a successful CPFP, in satoshis.
   *
   * @throws {Error} May throw an error if any of the internal calculations fail.
   *
   * @example
   * const txAnalyzer = new TransactionAnalyzer(options);
   * try {
   *   const analysis = txAnalyzer.analyze();
   *   console.log(`Transaction ${analysis.txid} analysis:`);
   *   console.log(`Fee rate: ${analysis.feeRate} sat/vB`);
   *   console.log(`Can RBF: ${analysis.canRBF}`);
   *   console.log(`Can CPFP: ${analysis.canCPFP}`);
   *   console.log(`Recommended strategy: ${analysis.recommendedStrategy}`);
   * } catch (error) {
   *   console.error('Analysis failed:', error);
   * }
   *
   */
  analyze() {
    return {
      txid: this.txid,
      vsize: this.vsize,
      weight: this.weight,
      fee: this.fee,
      feeRate: this.feeRate,
      inputs: this.inputs,
      outputs: this.outputs,
      isRBFSignaled: this.isRBFSignaled(),
      canRBF: this.canRBF,
      canCPFP: this.canCPFP,
      recommendedStrategy: this.recommendedStrategy,
      estimatedRBFFee: this.minimumRBFFee,
      estimatedCPFPFee: this.minimumCPFPFee
    };
  }
  /**
   * Creates input templates from the transaction's inputs.
   *
   * This method maps each input of the analyzed transaction to a BtcTxInputTemplate.
   * It extracts the transaction ID (txid) and output index (vout) from each input
   * to create the templates. Note that the amount in satoshis is not included, as
   * this information is not available in the raw transaction data.
   *
   * @returns {BtcTxInputTemplate[]} An array of BtcTxInputTemplate objects representing
   *          the inputs of the analyzed transaction. These templates will not have
   *          amounts set and will need to be populated later with data from an external
   *          source (e.g., bitcoind wallet, blockchain explorer, or local UTXO set).
   */
  getInputTemplates() {
    return this.inputs.map((input) => {
      return new BtcTxInputTemplate({
        txid: input.txid,
        vout: input.vout
      });
    });
  }
  /**
   * Creates output templates from the transaction's outputs.
   *
   * This method maps each output of the analyzed transaction to a BtcTxOutputTemplate.
   * It extracts the recipient address, determines whether it's a change output or not,
   * and includes the amount in satoshis. The output type is set to "change" if the
   * output is spendable (typically indicating a change output), and "destination" otherwise.
   *
   * @returns {BtcTxOutputTemplate[]} An array of BtcTxOutputTemplate objects representing
   *          the outputs of the analyzed transaction.
   */
  getOutputTemplates() {
    return this.outputs.map((output, index) => {
      return new BtcTxOutputTemplate({
        address: output.address,
        locked: index !== this._changeOutputIndex,
        amountSats: output.amountSats
      });
    });
  }
  /**
   * Retrieves the change output of the transaction, if it exists.
   * @returns {BtcTxComponent | null} The change output or null if no change output exists
   */
  getChangeOutput() {
    if (this._changeOutputIndex !== void 0) {
      return this.outputs[this._changeOutputIndex];
    }
    return null;
  }
  // Protected methods
  /**
   * Deserializes and formats the transaction inputs.
   *
   * This method processes the raw input data from the original transaction
   * and converts it into a more easily manageable format. It performs the
   * following operations for each input:
   *
   * 1. Reverses the transaction ID (txid) from little-endian to big-endian format.
   * 2. Extracts the output index (vout) being spent.
   * 3. Captures the sequence number, which is used for RBF signaling.
   *
   * @returns {BtcTxInputTemplate[]}
   *
   * @protected
   */
  deserializeInputs() {
    return this._rawTx.ins.map((input) => {
      const template = new BtcTxInputTemplate({
        txid: Buffer.from(input.hash).reverse().toString("hex"),
        // reversed (big-endian) format
        vout: input.index,
        amountSats: "0"
        // We don't have this information from the raw transaction
      });
      template.setSequence(input.sequence);
      return template;
    });
  }
  /**
   * Deserializes and formats the transaction outputs.
   *
   * This method processes the raw output data from the original transaction
   * and converts it into a more easily manageable format. It performs the
   * following operations for each output:
   *
   * 1. Extracts the output value in satoshis.
   * 2. Derives the recipient address from the scriptPubKey.
   * 3. Determines if the output is spendable (i.e., if it's a change output).
   *
   * @returns {BtcTxOutputTemplate[]}
   *
   * @protected
   */
  deserializeOutputs() {
    return this._rawTx.outs.map((output, index) => {
      return new BtcTxOutputTemplate({
        amountSats: output.value.toString(),
        address: getOutputAddress(output.script, this._network),
        locked: index !== this._changeOutputIndex
      });
    });
  }
  /**
   * Checks if the transaction signals RBF (Replace-By-Fee).
   * @returns {boolean} True if the transaction signals RBF, false otherwise
   * @protected
   */
  isRBFSignaled() {
    if (!this._canRBF) {
      this._canRBF = this._rawTx.ins.some(
        (input) => input.sequence < 4294967294
      );
    }
    return this._canRBF;
  }
  /**
   * Determines if CPFP (Child-Pays-For-Parent) can be performed on this transaction.
   * @returns {boolean} True if CPFP can be performed, false otherwise
   * @protected
   */
  canPerformCPFP() {
    if (!this._canCPFP) {
      this._canCPFP = this.outputs.some((output) => output.isMalleable);
    }
    return this._canCPFP;
  }
  /**
   * Recommends the optimal fee bumping strategy based on the current transaction state.
   * @returns {FeeBumpStrategy} The recommended fee bumping strategy
   * @protected
   */
  recommendStrategy() {
    if (new BigNumber3(this.feeRate).isGreaterThanOrEqualTo(this.targetFeeRate)) {
      return "NONE" /* NONE */;
    }
    const rbfFee = this.minimumRBFFee;
    const cpfpFee = this.minimumCPFPFee;
    if (this.canRBF && (!this.canCPFP || new BigNumber3(rbfFee).isLessThan(cpfpFee))) {
      return "RBF" /* RBF */;
    } else if (this.canCPFP) {
      return "CPFP" /* CPFP */;
    }
    return "NONE" /* NONE */;
  }
  static validateOptions(options) {
    const validatedOptions = {};
    try {
      const tx = Transaction2.fromHex(options.txHex);
      if (tx.outs.length === 0) {
        throw new Error("Transaction has no outputs");
      }
    } catch (error) {
      throw new Error(
        `Invalid transaction: ${error instanceof Error ? error.message : String(error)}`
      );
    }
    validatedOptions.rawTx = Transaction2.fromHex(options.txHex);
    if (!Object.values(Network2).includes(options.network)) {
      throw new Error(`Invalid network: ${options.network}`);
    }
    validatedOptions.network = options.network;
    if (options.targetFeeRate === void 0) {
      throw new Error("Target fee rate is required");
    }
    if (typeof options.targetFeeRate !== "number" || options.targetFeeRate <= 0) {
      throw new Error(
        `Invalid target fee rate: ${options.targetFeeRate}. Must be a positive number.`
      );
    }
    validatedOptions.targetFeeRate = options.targetFeeRate;
    const absoluteFee = new BigNumber3(options.absoluteFee);
    if (absoluteFee.isLessThanOrEqualTo(0)) {
      throw new Error(`Invalid absolute fee: ${options.absoluteFee}`);
    }
    validatedOptions.absoluteFee = absoluteFee;
    if (!Array.isArray(options.availableUtxos)) {
      throw new Error("Available UTXOs must be an array");
    }
    validatedOptions.availableUtxos = options.availableUtxos;
    if (options.changeOutputIndex) {
      if (options.changeOutputIndex !== void 0 && (typeof options.changeOutputIndex !== "number" || options.changeOutputIndex < 0)) {
        throw new Error(
          `Invalid change output index: ${options.changeOutputIndex}`
        );
      }
    }
    validatedOptions.changeOutputIndex = options.changeOutputIndex;
    const incrementalRelayFee = new BigNumber3(
      options.incrementalRelayFeeRate || 1
    );
    if (incrementalRelayFee.isLessThanOrEqualTo(0)) {
      throw new Error(
        `Invalid incremental relay fee: ${options.incrementalRelayFeeRate}`
      );
    }
    validatedOptions.incrementalRelayFeeRate = incrementalRelayFee;
    if (typeof options.requiredSigners !== "number" || options.requiredSigners <= 0) {
      throw new Error(`Invalid required signers: ${options.requiredSigners}`);
    }
    if (typeof options.totalSigners !== "number" || options.totalSigners <= 0) {
      throw new Error(`Invalid total signers: ${options.totalSigners}`);
    }
    if (options.requiredSigners > options.totalSigners) {
      throw new Error(
        `Required signers (${options.requiredSigners}) cannot be greater than total signers (${options.totalSigners})`
      );
    }
    validatedOptions.requiredSigners = options.requiredSigners;
    validatedOptions.totalSigners = options.totalSigners;
    if (!Object.values(SCRIPT_TYPES).includes(options.addressType)) {
      throw new Error(`Invalid address type: ${options.addressType}`);
    }
    validatedOptions.addressType = options.addressType;
    return validatedOptions;
  }
};

// src/btcTransactionTemplate.ts
import { PsbtV2 as PsbtV22 } from "@caravan/psbt";
import BigNumber4 from "bignumber.js";

// src/constants.ts
var DEFAULT_DUST_THRESHOLD_IN_SATS = "546";
var RBF_SEQUENCE = 4294967295 - 2;
var ABSURDLY_HIGH_FEE_RATE = "1000";
var ABSURDLY_HIGH_ABS_FEE = "2500000";

// src/btcTransactionTemplate.ts
var BtcTransactionTemplate = class _BtcTransactionTemplate {
  _inputs;
  _outputs;
  _targetFeeRate;
  _dustThreshold;
  _network;
  _scriptType;
  _requiredSigners;
  _totalSigners;
  /**
   * Creates a new BtcTransactionTemplate instance.
   * @param options - Configuration options for the transaction template
   */
  constructor(options) {
    this._inputs = options.inputs || [];
    this._outputs = options.outputs || [];
    this._targetFeeRate = new BigNumber4(options.targetFeeRate);
    this._dustThreshold = new BigNumber4(
      options.dustThreshold || DEFAULT_DUST_THRESHOLD_IN_SATS
    );
    this._network = options.network;
    this._scriptType = options.scriptType;
    this._requiredSigners = options.requiredSigners;
    this._totalSigners = options.totalSigners;
  }
  /**
   * Creates a BtcTransactionTemplate from a raw PSBT hex string.
   * This method parses the PSBT, extracts input and output information,
   * and creates a new BtcTransactionTemplate instance.
   *
   * @param rawPsbt - The raw PSBT {PsbtV2 | string | Buffer}
   * @param options - Additional options for creating the template
   * @returns A new BtcTransactionTemplate instance
   * @throws Error if PSBT parsing fails or required information is missing
   */
  static fromPsbt(rawPsbt, options) {
    const psbt = initializePsbt(rawPsbt);
    const inputs = _BtcTransactionTemplate.processInputs(psbt);
    const outputs = _BtcTransactionTemplate.processOutputs(
      psbt,
      options.network
    );
    return new _BtcTransactionTemplate({
      ...options,
      inputs,
      outputs
    });
  }
  /**
   * Gets the inputs of the transaction.
   * @returns A read-only array of inputs
   */
  get inputs() {
    return this._inputs;
  }
  /**
   * Gets the outputs of the transaction.
   * @returns A read-only array of outputs
   */
  get outputs() {
    return this._outputs;
  }
  /**
   * Gets the malleable outputs of the transaction.
   * Malleable outputs are all those that can have their amount changed, e.g. change outputs.
   * @returns An array of malleable outputs
   */
  get malleableOutputs() {
    return this._outputs.filter((output) => output.isMalleable);
  }
  /**
   * Calculates the target fees to pay based on the estimated size and target fee rate.
   * @returns {Satoshis} The target fees in satoshis (as a string)
   */
  get targetFeesToPay() {
    return this.targetFees().toString();
  }
  /**
   * Calculates the current fee of the transaction.
   * @returns {Satoshis} The current fee in satoshis (as a string)
   */
  get currentFee() {
    return this.calculateCurrentFee().toString();
  }
  /**
   * Checks if the transaction needs a change output.
   * @returns {boolean} True if there's enough leftover funds for a change output above the dust threshold.
   */
  get needsChange() {
    const totalInput = this.calculateTotalInputAmount();
    const totalOutput = this.calculateTotalOutputAmount();
    const fee = new BigNumber4(this.targetFeesToPay);
    const leftover = totalInput.minus(totalOutput).minus(fee);
    return leftover.isGreaterThan(this._dustThreshold);
  }
  /**
   * Checks if the current fees are sufficient to meet the target fee rate.
   * @returns True if the fees are paid, false otherwise
   */
  areFeesPaid() {
    return this.calculateCurrentFee().gte(this.targetFees());
  }
  /**
   * Checks if the current fee rate meets or exceeds the target fee rate.
   * @returns True if the fee rate is satisfied, false otherwise
   */
  get feeRateSatisfied() {
    return new BigNumber4(this.estimatedFeeRate).gte(this._targetFeeRate);
  }
  /**
   * Determines if a change output is needed.
   * @returns True if a change output is needed, false otherwise
   */
  get needsChangeOutput() {
    const MAX_OUTPUT_SIZE = 43;
    const changeOutputFee = new BigNumber4(this._targetFeeRate).multipliedBy(
      MAX_OUTPUT_SIZE
    );
    const changeOutputCost = this.targetFees().plus(changeOutputFee).plus(this._dustThreshold);
    return !this.malleableOutputs.length && this.calculateCurrentFee().gt(changeOutputCost);
  }
  /**
   * Calculates the total input amount.
   * @returns {Satoshis} The total input amount in satoshis (as a string)
   */
  get totalInputAmount() {
    return this.calculateTotalInputAmount().toString();
  }
  /**
   * Calculates the total change amount. (Total Inputs Amount - Total Non-change (non-malleable) Outputs Amount )
   * @returns {Satoshis} The total change amount in satoshis (as a string)
   */
  get changeAmount() {
    return this.calculateChangeAmount().toString();
  }
  /**
   * Calculates the total output amount.
   * @returns {Satoshis} The total output amount in satoshis (as a string)
   */
  get totalOutputAmount() {
    return this.calculateTotalOutputAmount().toString();
  }
  /**
   * Estimates the virtual size of the transaction.
   * @returns The estimated virtual size in vbytes
   */
  get estimatedVsize() {
    return estimateTransactionVsize({
      addressType: this._scriptType,
      numInputs: this._inputs.length,
      numOutputs: this._outputs.length,
      m: this._requiredSigners,
      n: this._totalSigners
    });
  }
  /**
   * Calculates the estimated fee rate of the transaction.
   * @returns {string} The estimated fee rate in satoshis per vbyte
   */
  get estimatedFeeRate() {
    return this.calculateCurrentFee().dividedBy(this.calculateEstimatedVsize()).toString();
  }
  /**
   * Adds an input to the transaction.
   * @param input - The input to add
   */
  addInput(input) {
    this._inputs.push(input);
  }
  /**
   * Adds an output to the transaction.
   * @param output - The output to add
   */
  addOutput(output) {
    this._outputs.push(output);
  }
  /**
   * Removes an output from the transaction.
   * @param index - The index of the output to remove
   */
  removeOutput(index) {
    this._outputs.splice(index, 1);
  }
  /**
   * Adjusts the change output of the transaction.
   * This method calculates a new change amount based on the current inputs,
   * non-change outputs, and the target fee. It then updates the change output
   * or removes it if the new amount is below the dust threshold.
   *
   * Key behaviors:
   * 1. If there are multiple outputs and the change becomes dust, it removes the change output.
   * 2. If there's only one output (which must be the change output) and it becomes dust,
   *    it keeps the output to maintain a valid transaction structure.
   * 3. It calculates the difference between the new and current change amount.
   * 4. It ensures the transaction remains balanced after adjustment.
   *
   * @returns {string | null} The new change amount in satoshis as a string, or null if no adjustment was made or the change output was removed.
   * @throws {Error} If there's not enough input to satisfy non-change outputs and fees, or if the transaction doesn't balance after adjustment.
   */
  adjustChangeOutput() {
    if (this.malleableOutputs.length === 0)
      return null;
    const changeOutput = this.malleableOutputs[0];
    const totalOutWithoutChange = this.calculateTotalOutputAmount().minus(
      this.calculateChangeAmount()
    );
    const currentChangeAmount = new BigNumber4(changeOutput.amountSats);
    const newChangeAmount = this.calculateTotalInputAmount().minus(totalOutWithoutChange).minus(this.targetFees());
    if (newChangeAmount.lt(0)) {
      throw new Error(
        `Input amount ${newChangeAmount.toString()} not enough to satisfy non-change output amounts.`
      );
    }
    const changeAmountDiff = newChangeAmount.minus(currentChangeAmount);
    changeOutput.addAmount(changeAmountDiff.toString());
    if (new BigNumber4(changeOutput.amountSats).lt(this._dustThreshold)) {
      if (this.outputs.length > 1) {
        const changeOutputIndex = this.outputs.findIndex(
          (output) => output === changeOutput
        );
        if (changeOutputIndex !== -1) {
          this.removeOutput(changeOutputIndex);
        }
        return null;
      } else {
        console.warn(
          "Change output is below dust threshold but cannot be removed as it's the only output."
        );
      }
    }
    const balanceCheck = this.calculateTotalInputAmount().minus(this.calculateTotalOutputAmount()).minus(this.targetFees());
    if (!balanceCheck.isZero()) {
      throw new Error(
        `Transaction does not balance. Discrepancy: ${balanceCheck.toString()} satoshis`
      );
    }
    return newChangeAmount.toString();
  }
  /**
   * Validates the entire transaction template.
   *
   * This method performs a comprehensive check of the transaction, including:
   * 1. Validation of all inputs:
   *    - Checks if each input has the required fields for PSBT creation.
   *    - Validates each input's general structure and data.
   * 2. Validation of all outputs:
   *    - Ensures each output has a valid address and amount.
   * 3. Verification that the current fee meets or exceeds the target fee
   * 4. Check that the fee rate is not absurdly high
   * 5. Check that the absolute fee is not absurdly high
   *
   * @returns {boolean} True if the transaction is valid according to all checks, false otherwise.
   *
   * @throws {Error} If any validation check encounters an unexpected error.
   *
   * @example
   * const txTemplate = new BtcTransactionTemplate(options);
   * if (txTemplate.validate()) {
   *   console.log("Transaction is valid");
   * } else {
   *   console.log("Transaction is invalid");
   * }
   */
  validate() {
    if (!this.validateInputs()) {
      return false;
    }
    if (!this._outputs.every((output) => output.isValid())) {
      return false;
    }
    if (this.calculateCurrentFee().lt(this.targetFees())) {
      return false;
    }
    const feeRate = new BigNumber4(this.estimatedFeeRate);
    if (feeRate.gte(new BigNumber4(ABSURDLY_HIGH_FEE_RATE))) {
      return false;
    }
    if (this.calculateCurrentFee().gte(new BigNumber4(ABSURDLY_HIGH_ABS_FEE))) {
      return false;
    }
    return true;
  }
  /**
   * Converts the transaction template to a base64-encoded PSBT (Partially Signed Bitcoin Transaction) string.
   * This method creates a new PSBT, adds all valid inputs and outputs from the template,
   * and then serializes the PSBT to a base64 string.
   *
   * By default, it validates the entire transaction before creating the PSBT. This validation
   * can be optionally skipped for partial or in-progress transactions.
   *
   * The method performs the following steps:
   * 1. If validation is enabled (default), it calls the `validate()` method to ensure
   *    the transaction is valid.
   * 2. Creates a new PsbtV2 instance.
   * 3. Adds all inputs from the template to the PSBT, including UTXO information.
   * 4. Adds all outputs from the template to the PSBT.
   * 5. Serializes the PSBT to a base64-encoded string.
   *
   * @param {boolean} [validated=true] - Whether to validate the transaction before creating the PSBT.
   *                                     Set to false to skip validation for partial transactions.
   *
   * @returns A base64-encoded string representation of the PSBT.
   *
   * @throws {Error} If validation is enabled and the transaction fails validation checks.
   * @throws {Error} If an invalid address is encountered when creating an output script.
   * @throws {Error} If there's an issue with input or output data that prevents PSBT creation.
   * @throws {Error} If serialization of the PSBT fails.
   *
   * @remarks
   * - Only inputs and outputs that pass the `isInputValid` and `isOutputValid` checks are included.
   * - Input amounts are not included in the PSBT. If needed, they should be added separately.
   * - Output amounts are converted from string to integer (satoshis) when added to the PSBT.
   * - The resulting PSBT is not signed and may require further processing (e.g., signing) before it can be broadcast.
   */
  toPsbt(validated = true) {
    if (validated && !this.validate()) {
      throw new Error("Invalid transaction: failed validation checks");
    }
    const psbt = new PsbtV22();
    this._inputs.forEach((input) => this.addInputToPsbt(psbt, input));
    this._outputs.forEach((output) => this.addOutputToPsbt(psbt, output));
    return psbt.serialize("base64");
  }
  /**
   * Validates all inputs in the transaction.
   *
   * This method checks each input to ensure it has the necessary previous
   * transaction data (`witness utxo, non-witness utxo`). The previous transaction data is
   * crucial for validating the input, as it allows verification of the
   * UTXO being spent, ensuring the input references a legitimate and
   * unspent output.
   *
   * @param input - The input to check.
   * @returns {boolean} - Returns true if all inputs are valid, meaning they have
   *                      the required previous transaction data and meet other
   *                      validation criteria; returns false otherwise.
   */
  validateInputs() {
    return this._inputs.every(
      (input) => input.hasRequiredFieldsforPSBT() && input.isValid()
    );
  }
  /**
   * Calculates the total input amount.
   * @returns {BigNumber} The total input amount in satoshis
   * @private
   */
  calculateTotalInputAmount() {
    return this.inputs.reduce((sum, input) => {
      if (!input.isValid()) {
        throw new Error(`Invalid input: ${JSON.stringify(input)}`);
      }
      return sum.plus(new BigNumber4(input.amountSats));
    }, new BigNumber4(0));
  }
  /**
   * Calculates the total output amount.
   * @returns {BigNumber} The total output amount in satoshis
   * @private
   */
  calculateTotalOutputAmount() {
    return this.outputs.reduce((sum, output) => {
      if (!output.isValid()) {
        throw new Error(`Invalid output: ${JSON.stringify(output)}`);
      }
      return sum.plus(new BigNumber4(output.amountSats));
    }, new BigNumber4(0));
  }
  /**
   * Calculates the total change amount.
   * @returns {BigNumber} The total change amount in satoshis
   * @private
   */
  calculateChangeAmount() {
    return this.outputs.reduce(
      (acc, output) => output.isMalleable ? acc.plus(new BigNumber4(output.amountSats)) : acc,
      new BigNumber4(0)
    );
  }
  /**
   * Calculates the estimated virtual size of the transaction.
   * @returns {number} The estimated virtual size in vbytes
   * @private
   */
  calculateEstimatedVsize() {
    return estimateTransactionVsize({
      addressType: this._scriptType,
      numInputs: this.inputs.length,
      numOutputs: this.outputs.length,
      m: this._requiredSigners,
      n: this._totalSigners
    });
  }
  /**
   * Calculates the current fee of the transaction.
   * @returns {BigNumber} The current fee in satoshis (as a BN)
   * @private
   */
  calculateCurrentFee() {
    return this.calculateTotalInputAmount().minus(
      this.calculateTotalOutputAmount()
    );
  }
  /**
   * Calculates the target fees to pay based on the estimated size and target fee rate.
   * @returns {Satoshis} The target fees in satoshis (as a BN)
   * @private
   */
  targetFees() {
    return this._targetFeeRate.times(this.calculateEstimatedVsize()).integerValue(BigNumber4.ROUND_CEIL);
  }
  /**
   * Processes the inputs from a PSBT and creates BtcTxInputTemplate instances.
   *
   * @param psbt - The initialized PSBT
   * @returns An array of BtcTxInputTemplate instances
   * @throws Error if required input information is missing
   */
  static processInputs(psbt) {
    const inputs = [];
    for (let i = 0; i < psbt.PSBT_GLOBAL_INPUT_COUNT; i++) {
      const txid = psbt.PSBT_IN_PREVIOUS_TXID[i];
      const vout = psbt.PSBT_IN_OUTPUT_INDEX[i];
      if (!txid || vout === void 0) {
        throw new Error(`Missing txid or vout for input ${i}`);
      }
      const input = new BtcTxInputTemplate({
        txid: Buffer.from(txid, "hex").reverse().toString("hex"),
        vout
      });
      _BtcTransactionTemplate.setInputUtxo(input, psbt, i);
      inputs.push(input);
    }
    return inputs;
  }
  /**
   * Sets the UTXO information for a given input.
   *
   * @param input - The BtcTxInputTemplate to update
   * @param psbt - The PSBT containing the input information
   * @param index - The index of the input in the PSBT
   * @throws Error if UTXO information is missing
   */
  static setInputUtxo(input, psbt, index) {
    const witnessUtxo = psbt.PSBT_IN_WITNESS_UTXO[index];
    const nonWitnessUtxo = psbt.PSBT_IN_NON_WITNESS_UTXO[index];
    if (witnessUtxo) {
      const amountSats = parseWitnessUtxoValue(witnessUtxo, index).toString();
      const witnessUtxoBuffer = Buffer.from(witnessUtxo, "hex");
      const value = witnessUtxoBuffer.readUInt32LE(0);
      const script = witnessUtxoBuffer.slice(4);
      input.setWitnessUtxo({ script, value });
      input.amountSats = amountSats;
    } else if (nonWitnessUtxo) {
      const amountSats = parseNonWitnessUtxoValue(
        nonWitnessUtxo,
        index
      ).toString();
      input.setNonWitnessUtxo(Buffer.from(nonWitnessUtxo, "hex"));
      input.amountSats = amountSats;
      input.setNonWitnessUtxo(Buffer.from(nonWitnessUtxo, "hex"));
      input.amountSats = amountSats;
    } else {
      throw new Error(`Missing UTXO information for input ${index}`);
    }
  }
  /**
   * Processes the outputs from a PSBT and creates BtcTxOutputTemplate instances.
   *
   * @param psbt - The initialized PSBT
   * @param network - The Bitcoin network
   * @returns An array of BtcTxOutputTemplate instances
   * @throws Error if required output information is missing
   */
  static processOutputs(psbt, network) {
    const outputs = [];
    for (let i = 0; i < psbt.PSBT_GLOBAL_OUTPUT_COUNT; i++) {
      const script = Buffer.from(psbt.PSBT_OUT_SCRIPT[i], "hex");
      const amount = psbt.PSBT_OUT_AMOUNT[i];
      if (!script || amount === void 0) {
        throw new Error(`Missing script or amount for output ${i}`);
      }
      const address = getOutputAddress(script, network);
      if (!address) {
        throw new Error(`Unable to derive address for output ${i}`);
      }
      outputs.push(
        new BtcTxOutputTemplate({
          address,
          amountSats: amount.toString(),
          locked: true
          // We don't want to change these outputs
        })
      );
    }
    return outputs;
  }
  /**
   * Adds a single input to the provided PSBT based on the given input template (used in BtcTransactionTemplate)
   * @param {PsbtV2} psbt - The PsbtV2 object.
   * @param input - The input template to be processed and added.
   * @throws {Error} - Throws an error if script extraction or PSBT input addition fails.
   */
  addInputToPsbt(psbt, input) {
    if (!input.hasRequiredFieldsforPSBT()) {
      throw new Error(
        `Input ${input.txid}:${input.vout} lacks required UTXO information`
      );
    }
    const inputData = {
      previousTxId: input.txid,
      outputIndex: input.vout
    };
    if (input.nonWitnessUtxo) {
      inputData.nonWitnessUtxo = input.nonWitnessUtxo;
    }
    if (input.witnessUtxo) {
      inputData.witnessUtxo = {
        amount: input.witnessUtxo.value,
        script: input.witnessUtxo.script
      };
    }
    if (input.sequence !== void 0) {
      inputData.sequence = input.sequence;
    }
    try {
      psbt.addInput(inputData);
    } catch (error) {
      throw new Error(
        `Failed to add input to PSBT: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  /**
   * Adds an output to the PSBT(used in BtcTransactionTemplate)
   *
   * @param {PsbtV2} psbt - The PsbtV2 object.
   * @param {BtcTxOutputTemplate} output - The output template to be processed and added.
   * @throws {Error} - Throws an error if output script creation fails.
   */
  addOutputToPsbt(psbt, output) {
    const script = createOutputScript(output.address, this._network);
    if (!script) {
      throw new Error(
        `Unable to create output script for address: ${output.address}`
      );
    }
    psbt.addOutput({
      script,
      amount: parseInt(output.amountSats)
    });
  }
};

// src/rbf.ts
import BigNumber5 from "bignumber.js";
var validateRbfPossibility = (txAnalyzer, fullRBF, strict) => {
  if (!txAnalyzer.canRBF) {
    if (fullRBF) {
      console.warn(
        "Transaction does not signal RBF. Proceeding with full RBF, which may not be accepted by all nodes."
      );
    } else {
      throw new Error(
        "RBF is not possible for this transaction. Ensure at least one input has a sequence number < 0xfffffffe."
      );
    }
  }
  if (txAnalyzer.recommendedStrategy !== "RBF" /* RBF */) {
    if (strict) {
      throw new Error(
        `RBF is not the recommended strategy for this transaction. The recommended strategy is: ${txAnalyzer.recommendedStrategy}`
      );
    }
    console.warn(
      `RBF is not the recommended strategy for this transaction. Consider using the recommended strategy: ${txAnalyzer.recommendedStrategy}`
    );
  }
  if (new BigNumber5(txAnalyzer.targetFeeRate).isLessThanOrEqualTo(
    txAnalyzer.feeRate
  )) {
    throw new Error(
      `Target fee rate (${txAnalyzer.targetFeeRate} sat/vB) must be higher than the original transaction's fee rate (${txAnalyzer.feeRate} sat/vB).`
    );
  }
};
var addOriginalInputs = (txAnalyzer, newTxTemplate, availableInputs, reuseAllInputs, isAccelerated) => {
  const originalInputTemplates = txAnalyzer.getInputTemplates();
  const addedInputs = /* @__PURE__ */ new Set();
  if (reuseAllInputs) {
    originalInputTemplates.forEach((template) => {
      const input = availableInputs.find(
        (utxo) => utxo.txid === template.txid && utxo.vout === template.vout
      );
      if (input) {
        newTxTemplate.addInput(BtcTxInputTemplate.fromUTXO(input));
        addedInputs.add(`${input.txid}:${input.vout}`);
      }
    });
  } else if (isAccelerated) {
    console.warn(
      "Not reusing all inputs can lead to a replacement cycle attack. See: https://bitcoinops.org/en/newsletters/2023/10/25/#fn:rbf-warning"
    );
    const originalInput = availableInputs.find(
      (utxo) => originalInputTemplates.some(
        (template) => template.txid === utxo.txid && template.vout === template.vout
      )
    );
    if (!originalInput) {
      throw new Error(
        "None of the original transaction inputs found in available UTXOs."
      );
    }
    newTxTemplate.addInput(BtcTxInputTemplate.fromUTXO(originalInput));
    addedInputs.add(`${originalInput.txid}:${originalInput.vout}`);
  }
  return addedInputs;
};
var addAdditionalInputs = (newTxTemplate, availableInputs, addedInputs, txAnalyzer) => {
  for (const utxo of availableInputs) {
    if (newTxTemplate.feeRateSatisfied && new BigNumber5(newTxTemplate.currentFee).gte(txAnalyzer.minimumRBFFee) && (newTxTemplate.needsChange || newTxTemplate.outputs.length > 0)) {
      break;
    }
    const utxoKey = `${utxo.txid}:${utxo.vout}`;
    if (addedInputs.has(utxoKey)) {
      continue;
    }
    newTxTemplate.addInput(BtcTxInputTemplate.fromUTXO(utxo));
    addedInputs.add(utxoKey);
  }
};
var validateRbfRequirements = (newTxTemplate, txAnalyzer) => {
  const currentFee = new BigNumber5(newTxTemplate.currentFee);
  const minRequiredFee = new BigNumber5(txAnalyzer.minimumRBFFee);
  const targetFee = new BigNumber5(newTxTemplate.targetFeesToPay);
  if (currentFee.isLessThan(minRequiredFee)) {
    throw new Error(
      `New transaction fee (${currentFee.toString()} sats) must be at least the minimum RBF fee (${minRequiredFee.toString()} sats).`
    );
  }
  if (currentFee.isLessThan(targetFee)) {
    throw new Error(
      `New transaction fee (${currentFee.toString()} sats) is less than the target fee (${targetFee.toString()} sats).`
    );
  }
};
var createCancelRbfTransaction = (options) => {
  const {
    fullRBF = false,
    strict = false,
    originalTx,
    network,
    targetFeeRate,
    absoluteFee,
    availableInputs,
    requiredSigners,
    totalSigners,
    scriptType,
    cancelAddress,
    reuseAllInputs = false
  } = options;
  const txAnalyzer = new TransactionAnalyzer({
    txHex: originalTx,
    network,
    targetFeeRate,
    absoluteFee,
    availableUtxos: availableInputs,
    requiredSigners,
    totalSigners,
    addressType: scriptType
  });
  txAnalyzer.assumeRBF = fullRBF;
  if (new BigNumber5(targetFeeRate).isLessThanOrEqualTo(txAnalyzer.feeRate)) {
    throw new Error(
      `Target fee rate (${targetFeeRate} sat/vB) must be higher than the original transaction's fee rate (${txAnalyzer.feeRate} sat/vB).`
    );
  }
  validateRbfPossibility(txAnalyzer, fullRBF, strict);
  const newTxTemplate = new BtcTransactionTemplate({
    inputs: [],
    outputs: [],
    targetFeeRate: options.targetFeeRate,
    dustThreshold: options.dustThreshold,
    network: options.network,
    scriptType: options.scriptType,
    requiredSigners: options.requiredSigners,
    totalSigners: options.totalSigners
  });
  const addedInputs = addOriginalInputs(
    txAnalyzer,
    newTxTemplate,
    availableInputs,
    reuseAllInputs,
    false
    // Not an accelerated transaction
  );
  newTxTemplate.addOutput(
    new BtcTxOutputTemplate({
      address: cancelAddress,
      amountSats: "0",
      // Temporary amount, will be adjusted later
      locked: false
    })
  );
  addAdditionalInputs(newTxTemplate, availableInputs, addedInputs, txAnalyzer);
  const totalInputAmount = new BigNumber5(newTxTemplate.totalInputAmount);
  const totalOutputAmount = new BigNumber5(newTxTemplate.totalOutputAmount);
  const fee = BigNumber5.max(
    newTxTemplate.targetFeesToPay,
    txAnalyzer.minimumRBFFee
  );
  const cancelOutputAmount = totalInputAmount.minus(totalOutputAmount).minus(fee);
  newTxTemplate.outputs[0].setAmount(cancelOutputAmount.toString());
  validateRbfRequirements(newTxTemplate, txAnalyzer);
  return newTxTemplate.toPsbt(true);
};
var createAcceleratedRbfTransaction = (options) => {
  const {
    fullRBF = false,
    strict = false,
    originalTx,
    network,
    targetFeeRate,
    absoluteFee,
    availableInputs,
    requiredSigners,
    totalSigners,
    scriptType,
    changeIndex,
    changeAddress,
    reuseAllInputs = true
  } = options;
  if (changeIndex !== void 0 && changeAddress !== void 0) {
    throw new Error(
      "Provide either changeIndex or changeAddress, not both. This ensures unambiguous handling of the change output."
    );
  }
  if (changeIndex === void 0 && changeAddress === void 0) {
    throw new Error(
      "Either changeIndex or changeAddress must be provided for handling the change output."
    );
  }
  const txAnalyzer = new TransactionAnalyzer({
    txHex: originalTx,
    network,
    targetFeeRate,
    absoluteFee,
    availableUtxos: availableInputs,
    requiredSigners,
    totalSigners,
    addressType: scriptType,
    changeOutputIndex: changeIndex
  });
  txAnalyzer.assumeRBF = fullRBF;
  validateRbfPossibility(txAnalyzer, fullRBF, strict);
  const newTxTemplate = new BtcTransactionTemplate({
    inputs: [],
    outputs: [],
    targetFeeRate: BigNumber5.max(
      options.targetFeeRate,
      new BigNumber5(txAnalyzer.minimumRBFFee).dividedBy(txAnalyzer.vsize)
    ).toNumber(),
    dustThreshold: options.dustThreshold,
    network: options.network,
    scriptType: options.scriptType,
    requiredSigners: options.requiredSigners,
    totalSigners: options.totalSigners
  });
  const addedInputs = addOriginalInputs(
    txAnalyzer,
    newTxTemplate,
    availableInputs,
    reuseAllInputs,
    true
    // This is an accelerated transaction
  );
  txAnalyzer.getOutputTemplates().forEach((outputTemplate) => {
    if (!outputTemplate.isMalleable) {
      newTxTemplate.addOutput(
        new BtcTxOutputTemplate({
          address: outputTemplate.address,
          amountSats: outputTemplate.amountSats,
          locked: true
        })
      );
    }
  });
  addAdditionalInputs(newTxTemplate, availableInputs, addedInputs, txAnalyzer);
  if (newTxTemplate.needsChangeOutput) {
    const changeOutput = new BtcTxOutputTemplate({
      address: changeAddress || txAnalyzer.outputs[changeIndex].address,
      amountSats: "0",
      // adjusted with adjustChangeOutput call below
      locked: false
    });
    newTxTemplate.addOutput(changeOutput);
    newTxTemplate.adjustChangeOutput();
  }
  validateRbfRequirements(newTxTemplate, txAnalyzer);
  return newTxTemplate.toPsbt(true);
};

// src/cpfp.ts
import BigNumber6 from "bignumber.js";
var createCPFPTransaction = (options) => {
  const {
    strict = false,
    originalTx,
    network,
    targetFeeRate,
    absoluteFee,
    availableInputs,
    requiredSigners,
    totalSigners,
    scriptType,
    dustThreshold,
    spendableOutputIndex,
    changeAddress
  } = options;
  const txAnalyzer = new TransactionAnalyzer({
    txHex: originalTx,
    network,
    changeOutputIndex: spendableOutputIndex,
    targetFeeRate,
    // We need this param. It is required for the analyzer to make decisions and so cannot be 0.
    absoluteFee,
    availableUtxos: availableInputs,
    requiredSigners,
    totalSigners,
    addressType: scriptType
  });
  const analysis = txAnalyzer.analyze();
  if (!analysis.canCPFP) {
    throw new Error(
      "CPFP is not possible for this transaction. Ensure the specified output is available for spending."
    );
  }
  if (analysis.recommendedStrategy !== "CPFP" /* CPFP */) {
    if (strict) {
      throw new Error(
        `CPFP is not the recommended strategy for this transaction. The recommended strategy is: ${analysis.recommendedStrategy}`
      );
    }
    console.warn(
      "CPFP is not the recommended strategy for this transaction. Consider using the recommended strategy: " + analysis.recommendedStrategy
    );
  }
  const childTxTemplate = new BtcTransactionTemplate({
    inputs: [],
    outputs: [],
    targetFeeRate: Number(txAnalyzer.cpfpFeeRate),
    // Use CPFP-specific fee rate from analyzer
    dustThreshold,
    network,
    scriptType,
    requiredSigners,
    totalSigners
  });
  const parentOutput = txAnalyzer.outputs[spendableOutputIndex];
  if (!parentOutput) {
    throw new Error(
      `Spendable output at index ${spendableOutputIndex} not found in the parent transaction.`
    );
  }
  const parentOutputUTXO = {
    txid: analysis.txid,
    vout: spendableOutputIndex,
    value: parentOutput.amountSats,
    witnessUtxo: {
      script: createOutputScript(parentOutput.address, network),
      value: parseInt(parentOutput.amountSats)
    },
    prevTxHex: originalTx
  };
  childTxTemplate.addInput(BtcTxInputTemplate.fromUTXO(parentOutputUTXO));
  childTxTemplate.addOutput(
    new BtcTxOutputTemplate({
      address: changeAddress,
      amountSats: "0"
      // Initial amount, will be adjusted later
    })
  );
  for (const utxo of availableInputs) {
    if (isCPFPFeeSatisfied(txAnalyzer, childTxTemplate) && childTxTemplate.needsChange) {
      break;
    }
    if (childTxTemplate.inputs.some(
      (input) => input.txid === utxo.txid && input.vout === utxo.vout
    )) {
      continue;
    }
    childTxTemplate.addInput(BtcTxInputTemplate.fromUTXO(utxo));
  }
  if (!childTxTemplate.needsChange && strict) {
    throw new Error(
      "Not enough inputs to create a non-dusty change output in the child transaction"
    );
  }
  childTxTemplate.adjustChangeOutput();
  if (!childTxTemplate.validate()) {
    throw new Error(
      "Failed to create a valid CPFP transaction. Ensure all inputs and outputs are valid and fee requirements are met."
    );
  }
  validateCPFPPackage(txAnalyzer, childTxTemplate, strict);
  return childTxTemplate.toPsbt(true);
};
function isCPFPFeeSatisfied(txAnalyzer, childTxTemplate) {
  if (!txAnalyzer || !childTxTemplate) {
    throw new Error("Invalid analyzer or child transaction template.");
  }
  const parentFee = new BigNumber6(txAnalyzer.fee);
  const parentVsize = txAnalyzer.vsize;
  const childFee = new BigNumber6(childTxTemplate.currentFee);
  const childVsize = childTxTemplate.estimatedVsize;
  const targetFeeRate = parseFloat(txAnalyzer.cpfpFeeRate);
  const combinedFee = parentFee.plus(childFee);
  const combinedVsize = parentVsize + childVsize;
  const combinedFeeRate = combinedFee.dividedBy(combinedVsize);
  return combinedFeeRate.gte(targetFeeRate);
}
function validateCPFPPackage(txAnalyzer, childTxTemplate, strict) {
  const parentFee = new BigNumber6(txAnalyzer.fee);
  const parentSize = new BigNumber6(txAnalyzer.vsize);
  const childFee = new BigNumber6(childTxTemplate.currentFee);
  const childSize = new BigNumber6(childTxTemplate.estimatedVsize);
  const combinedFeeRate = parentFee.plus(childFee).dividedBy(parentSize.plus(childSize));
  if (combinedFeeRate.isLessThan(txAnalyzer.targetFeeRate)) {
    const message = `Combined fee rate (${combinedFeeRate.toFixed(2)} sat/vB) is below the target CPFP fee rate (${txAnalyzer.targetFeeRate.toFixed(2)} sat/vB). ${strict ? "Increase inputs or reduce fee rate." : "Transaction may confirm slower than expected."}`;
    if (strict) {
      throw new Error(message);
    } else {
      console.warn(message);
    }
  }
}
export {
  ABSURDLY_HIGH_ABS_FEE,
  ABSURDLY_HIGH_FEE_RATE,
  BtcTransactionTemplate,
  BtcTxComponent,
  BtcTxInputTemplate,
  BtcTxOutputTemplate,
  DEFAULT_DUST_THRESHOLD_IN_SATS,
  FeeBumpStrategy,
  RBF_SEQUENCE,
  SCRIPT_TYPES,
  TransactionAnalyzer,
  calculateTotalInputValue,
  calculateTotalOutputValue,
  createAcceleratedRbfTransaction,
  createCPFPTransaction,
  createCancelRbfTransaction,
  createOutputScript,
  estimateTransactionVsize,
  getOutputAddress,
  initializePsbt,
  isCPFPFeeSatisfied,
  mapCaravanNetworkToBitcoinJS,
  parseNonWitnessUtxoValue,
  parseWitnessUtxoValue,
  validateCPFPPackage,
  validateNonWitnessUtxo,
  validateSequence
};
/*! Bundled license information:

@jspm/core/nodelibs/browser/buffer.js:
  (*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> *)
*/
