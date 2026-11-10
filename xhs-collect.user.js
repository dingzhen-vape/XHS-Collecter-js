// ==UserScript==
// @name         小红书收藏批量归类
// @namespace    local.xhs.picker
// @version      1.2.0
// @description  收藏页勾选笔记，用官方接口批量归入指定专辑
// @match        https://www.xiaohongshu.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res, err) => function __init() {
    if (err) throw err[0];
    try {
      return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
    } catch (e) {
      throw err = [e], e;
    }
  };
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js
  var require_base64_js = __commonJS({
    "node_modules/.pnpm/base64-js@1.5.1/node_modules/base64-js/index.js"(exports) {
      "use strict";
      init_inject_buffer();
      exports.byteLength = byteLength;
      exports.toByteArray = toByteArray;
      exports.fromByteArray = fromByteArray;
      var lookup = [];
      var revLookup = [];
      var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
      var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      for (i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i];
        revLookup[code.charCodeAt(i)] = i;
      }
      var i;
      var len;
      revLookup["-".charCodeAt(0)] = 62;
      revLookup["_".charCodeAt(0)] = 63;
      function getLens(b64) {
        var len2 = b64.length;
        if (len2 % 4 > 0) {
          throw new Error("Invalid string. Length must be a multiple of 4");
        }
        var validLen = b64.indexOf("=");
        if (validLen === -1) validLen = len2;
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
          parts.push(
            lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "=="
          );
        } else if (extraBytes === 2) {
          tmp = (uint8[len2 - 2] << 8) + uint8[len2 - 1];
          parts.push(
            lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
          );
        }
        return parts.join("");
      }
    }
  });

  // node_modules/.pnpm/ieee754@1.2.1/node_modules/ieee754/index.js
  var require_ieee754 = __commonJS({
    "node_modules/.pnpm/ieee754@1.2.1/node_modules/ieee754/index.js"(exports) {
      init_inject_buffer();
      /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
      exports.read = function(buffer, offset, isLE, mLen, nBytes) {
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
      exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
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
    }
  });

  // node_modules/.pnpm/buffer@6.0.3/node_modules/buffer/index.js
  var require_buffer = __commonJS({
    "node_modules/.pnpm/buffer@6.0.3/node_modules/buffer/index.js"(exports) {
      "use strict";
      init_inject_buffer();
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <https://feross.org>
       * @license  MIT
       */
      var base64 = require_base64_js();
      var ieee754 = require_ieee754();
      var customInspectSymbol = typeof Symbol === "function" && typeof Symbol["for"] === "function" ? Symbol["for"]("nodejs.util.inspect.custom") : null;
      exports.Buffer = Buffer4;
      exports.SlowBuffer = SlowBuffer;
      exports.INSPECT_MAX_BYTES = 50;
      var K_MAX_LENGTH = 2147483647;
      exports.kMaxLength = K_MAX_LENGTH;
      Buffer4.TYPED_ARRAY_SUPPORT = typedArraySupport();
      if (!Buffer4.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
        console.error(
          "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
        );
      }
      function typedArraySupport() {
        try {
          const arr = new Uint8Array(1);
          const proto = { foo: function() {
            return 42;
          } };
          Object.setPrototypeOf(proto, Uint8Array.prototype);
          Object.setPrototypeOf(arr, proto);
          return arr.foo() === 42;
        } catch (e) {
          return false;
        }
      }
      Object.defineProperty(Buffer4.prototype, "parent", {
        enumerable: true,
        get: function() {
          if (!Buffer4.isBuffer(this)) return void 0;
          return this.buffer;
        }
      });
      Object.defineProperty(Buffer4.prototype, "offset", {
        enumerable: true,
        get: function() {
          if (!Buffer4.isBuffer(this)) return void 0;
          return this.byteOffset;
        }
      });
      function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
          throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer4.prototype);
        return buf;
      }
      function Buffer4(arg, encodingOrOffset, length) {
        if (typeof arg === "number") {
          if (typeof encodingOrOffset === "string") {
            throw new TypeError(
              'The "string" argument must be of type string. Received type number'
            );
          }
          return allocUnsafe(arg);
        }
        return from(arg, encodingOrOffset, length);
      }
      Buffer4.poolSize = 8192;
      function from(value, encodingOrOffset, length) {
        if (typeof value === "string") {
          return fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
          return fromArrayView(value);
        }
        if (value == null) {
          throw new TypeError(
            "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
          );
        }
        if (isInstance(value, ArrayBuffer) || value && isInstance(value.buffer, ArrayBuffer)) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof SharedArrayBuffer !== "undefined" && (isInstance(value, SharedArrayBuffer) || value && isInstance(value.buffer, SharedArrayBuffer))) {
          return fromArrayBuffer(value, encodingOrOffset, length);
        }
        if (typeof value === "number") {
          throw new TypeError(
            'The "value" argument must not be of type number. Received type number'
          );
        }
        const valueOf = value.valueOf && value.valueOf();
        if (valueOf != null && valueOf !== value) {
          return Buffer4.from(valueOf, encodingOrOffset, length);
        }
        const b = fromObject(value);
        if (b) return b;
        if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof value[Symbol.toPrimitive] === "function") {
          return Buffer4.from(value[Symbol.toPrimitive]("string"), encodingOrOffset, length);
        }
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof value
        );
      }
      Buffer4.from = function(value, encodingOrOffset, length) {
        return from(value, encodingOrOffset, length);
      };
      Object.setPrototypeOf(Buffer4.prototype, Uint8Array.prototype);
      Object.setPrototypeOf(Buffer4, Uint8Array);
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
      Buffer4.alloc = function(size, fill, encoding) {
        return alloc(size, fill, encoding);
      };
      function allocUnsafe(size) {
        assertSize(size);
        return createBuffer(size < 0 ? 0 : checked(size) | 0);
      }
      Buffer4.allocUnsafe = function(size) {
        return allocUnsafe(size);
      };
      Buffer4.allocUnsafeSlow = function(size) {
        return allocUnsafe(size);
      };
      function fromString(string, encoding) {
        if (typeof encoding !== "string" || encoding === "") {
          encoding = "utf8";
        }
        if (!Buffer4.isEncoding(encoding)) {
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
        Object.setPrototypeOf(buf, Buffer4.prototype);
        return buf;
      }
      function fromObject(obj) {
        if (Buffer4.isBuffer(obj)) {
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
        return Buffer4.alloc(+length);
      }
      Buffer4.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true && b !== Buffer4.prototype;
      };
      Buffer4.compare = function compare(a, b) {
        if (isInstance(a, Uint8Array)) a = Buffer4.from(a, a.offset, a.byteLength);
        if (isInstance(b, Uint8Array)) b = Buffer4.from(b, b.offset, b.byteLength);
        if (!Buffer4.isBuffer(a) || !Buffer4.isBuffer(b)) {
          throw new TypeError(
            'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
          );
        }
        if (a === b) return 0;
        let x = a.length;
        let y = b.length;
        for (let i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i];
            y = b[i];
            break;
          }
        }
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      Buffer4.isEncoding = function isEncoding(encoding) {
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
      Buffer4.concat = function concat(list, length) {
        if (!Array.isArray(list)) {
          throw new TypeError('"list" argument must be an Array of Buffers');
        }
        if (list.length === 0) {
          return Buffer4.alloc(0);
        }
        let i;
        if (length === void 0) {
          length = 0;
          for (i = 0; i < list.length; ++i) {
            length += list[i].length;
          }
        }
        const buffer = Buffer4.allocUnsafe(length);
        let pos = 0;
        for (i = 0; i < list.length; ++i) {
          let buf = list[i];
          if (isInstance(buf, Uint8Array)) {
            if (pos + buf.length > buffer.length) {
              if (!Buffer4.isBuffer(buf)) buf = Buffer4.from(buf);
              buf.copy(buffer, pos);
            } else {
              Uint8Array.prototype.set.call(
                buffer,
                buf,
                pos
              );
            }
          } else if (!Buffer4.isBuffer(buf)) {
            throw new TypeError('"list" argument must be an Array of Buffers');
          } else {
            buf.copy(buffer, pos);
          }
          pos += buf.length;
        }
        return buffer;
      };
      function byteLength(string, encoding) {
        if (Buffer4.isBuffer(string)) {
          return string.length;
        }
        if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
          return string.byteLength;
        }
        if (typeof string !== "string") {
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof string
          );
        }
        const len = string.length;
        const mustMatch = arguments.length > 2 && arguments[2] === true;
        if (!mustMatch && len === 0) return 0;
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
      Buffer4.byteLength = byteLength;
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
        if (!encoding) encoding = "utf8";
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
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = (encoding + "").toLowerCase();
              loweredCase = true;
          }
        }
      }
      Buffer4.prototype._isBuffer = true;
      function swap(b, n, m) {
        const i = b[n];
        b[n] = b[m];
        b[m] = i;
      }
      Buffer4.prototype.swap16 = function swap16() {
        const len = this.length;
        if (len % 2 !== 0) {
          throw new RangeError("Buffer size must be a multiple of 16-bits");
        }
        for (let i = 0; i < len; i += 2) {
          swap(this, i, i + 1);
        }
        return this;
      };
      Buffer4.prototype.swap32 = function swap32() {
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
      Buffer4.prototype.swap64 = function swap64() {
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
      Buffer4.prototype.toString = function toString() {
        const length = this.length;
        if (length === 0) return "";
        if (arguments.length === 0) return utf8Slice(this, 0, length);
        return slowToString.apply(this, arguments);
      };
      Buffer4.prototype.toLocaleString = Buffer4.prototype.toString;
      Buffer4.prototype.equals = function equals(b) {
        if (!Buffer4.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
        if (this === b) return true;
        return Buffer4.compare(this, b) === 0;
      };
      Buffer4.prototype.inspect = function inspect() {
        let str = "";
        const max = exports.INSPECT_MAX_BYTES;
        str = this.toString("hex", 0, max).replace(/(.{2})/g, "$1 ").trim();
        if (this.length > max) str += " ... ";
        return "<Buffer " + str + ">";
      };
      if (customInspectSymbol) {
        Buffer4.prototype[customInspectSymbol] = Buffer4.prototype.inspect;
      }
      Buffer4.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
        if (isInstance(target, Uint8Array)) {
          target = Buffer4.from(target, target.offset, target.byteLength);
        }
        if (!Buffer4.isBuffer(target)) {
          throw new TypeError(
            'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof target
          );
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
        if (this === target) return 0;
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
        if (x < y) return -1;
        if (y < x) return 1;
        return 0;
      };
      function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
        if (buffer.length === 0) return -1;
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
        if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
        if (byteOffset >= buffer.length) {
          if (dir) return -1;
          else byteOffset = buffer.length - 1;
        } else if (byteOffset < 0) {
          if (dir) byteOffset = 0;
          else return -1;
        }
        if (typeof val === "string") {
          val = Buffer4.from(val, encoding);
        }
        if (Buffer4.isBuffer(val)) {
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
              if (foundIndex === -1) foundIndex = i;
              if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
            } else {
              if (foundIndex !== -1) i -= i - foundIndex;
              foundIndex = -1;
            }
          }
        } else {
          if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
          for (i = byteOffset; i >= 0; i--) {
            let found = true;
            for (let j = 0; j < valLength; j++) {
              if (read(arr, i + j) !== read(val, j)) {
                found = false;
                break;
              }
            }
            if (found) return i;
          }
        }
        return -1;
      }
      Buffer4.prototype.includes = function includes(val, byteOffset, encoding) {
        return this.indexOf(val, byteOffset, encoding) !== -1;
      };
      Buffer4.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
        return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
      };
      Buffer4.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
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
          if (numberIsNaN(parsed)) return i;
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
      Buffer4.prototype.write = function write(string, offset, length, encoding) {
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
            if (encoding === void 0) encoding = "utf8";
          } else {
            encoding = length;
            length = void 0;
          }
        } else {
          throw new Error(
            "Buffer.write(string, encoding, offset[, length]) is no longer supported"
          );
        }
        const remaining = this.length - offset;
        if (length === void 0 || length > remaining) length = remaining;
        if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
          throw new RangeError("Attempt to write outside buffer bounds");
        }
        if (!encoding) encoding = "utf8";
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
              if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
              encoding = ("" + encoding).toLowerCase();
              loweredCase = true;
          }
        }
      };
      Buffer4.prototype.toJSON = function toJSON() {
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
      var MAX_ARGUMENTS_LENGTH = 4096;
      function decodeCodePointsArray(codePoints) {
        const len = codePoints.length;
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints);
        }
        let res = "";
        let i = 0;
        while (i < len) {
          res += String.fromCharCode.apply(
            String,
            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          );
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
        if (!start || start < 0) start = 0;
        if (!end || end < 0 || end > len) end = len;
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
      Buffer4.prototype.slice = function slice(start, end) {
        const len = this.length;
        start = ~~start;
        end = end === void 0 ? len : ~~end;
        if (start < 0) {
          start += len;
          if (start < 0) start = 0;
        } else if (start > len) {
          start = len;
        }
        if (end < 0) {
          end += len;
          if (end < 0) end = 0;
        } else if (end > len) {
          end = len;
        }
        if (end < start) end = start;
        const newBuf = this.subarray(start, end);
        Object.setPrototypeOf(newBuf, Buffer4.prototype);
        return newBuf;
      };
      function checkOffset(offset, ext, length) {
        if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
        if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
      }
      Buffer4.prototype.readUintLE = Buffer4.prototype.readUIntLE = function readUIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        return val;
      };
      Buffer4.prototype.readUintBE = Buffer4.prototype.readUIntBE = function readUIntBE(offset, byteLength2, noAssert) {
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
      Buffer4.prototype.readUint8 = Buffer4.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        return this[offset];
      };
      Buffer4.prototype.readUint16LE = Buffer4.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] | this[offset + 1] << 8;
      };
      Buffer4.prototype.readUint16BE = Buffer4.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        return this[offset] << 8 | this[offset + 1];
      };
      Buffer4.prototype.readUint32LE = Buffer4.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 16777216;
      };
      Buffer4.prototype.readUint32BE = Buffer4.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] * 16777216 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
      };
      Buffer4.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(offset) {
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
      Buffer4.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(offset) {
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
      Buffer4.prototype.readIntLE = function readIntLE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let val = this[offset];
        let mul = 1;
        let i = 0;
        while (++i < byteLength2 && (mul *= 256)) {
          val += this[offset + i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer4.prototype.readIntBE = function readIntBE(offset, byteLength2, noAssert) {
        offset = offset >>> 0;
        byteLength2 = byteLength2 >>> 0;
        if (!noAssert) checkOffset(offset, byteLength2, this.length);
        let i = byteLength2;
        let mul = 1;
        let val = this[offset + --i];
        while (i > 0 && (mul *= 256)) {
          val += this[offset + --i] * mul;
        }
        mul *= 128;
        if (val >= mul) val -= Math.pow(2, 8 * byteLength2);
        return val;
      };
      Buffer4.prototype.readInt8 = function readInt8(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 1, this.length);
        if (!(this[offset] & 128)) return this[offset];
        return (255 - this[offset] + 1) * -1;
      };
      Buffer4.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset] | this[offset + 1] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer4.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 2, this.length);
        const val = this[offset + 1] | this[offset] << 8;
        return val & 32768 ? val | 4294901760 : val;
      };
      Buffer4.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
      };
      Buffer4.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
      };
      Buffer4.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(offset) {
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
      Buffer4.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(offset) {
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
      Buffer4.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, true, 23, 4);
      };
      Buffer4.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 4, this.length);
        return ieee754.read(this, offset, false, 23, 4);
      };
      Buffer4.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, true, 52, 8);
      };
      Buffer4.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        offset = offset >>> 0;
        if (!noAssert) checkOffset(offset, 8, this.length);
        return ieee754.read(this, offset, false, 52, 8);
      };
      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer4.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
      }
      Buffer4.prototype.writeUintLE = Buffer4.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength2, noAssert) {
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
      Buffer4.prototype.writeUintBE = Buffer4.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength2, noAssert) {
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
      Buffer4.prototype.writeUint8 = Buffer4.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 255, 0);
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer4.prototype.writeUint16LE = Buffer4.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer4.prototype.writeUint16BE = Buffer4.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 65535, 0);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer4.prototype.writeUint32LE = Buffer4.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
        this[offset + 3] = value >>> 24;
        this[offset + 2] = value >>> 16;
        this[offset + 1] = value >>> 8;
        this[offset] = value & 255;
        return offset + 4;
      };
      Buffer4.prototype.writeUint32BE = Buffer4.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 4294967295, 0);
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
      Buffer4.prototype.writeBigUInt64LE = defineBigIntMethod(function writeBigUInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer4.prototype.writeBigUInt64BE = defineBigIntMethod(function writeBigUInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, BigInt(0), BigInt("0xffffffffffffffff"));
      });
      Buffer4.prototype.writeIntLE = function writeIntLE(value, offset, byteLength2, noAssert) {
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
      Buffer4.prototype.writeIntBE = function writeIntBE(value, offset, byteLength2, noAssert) {
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
      Buffer4.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 1, 127, -128);
        if (value < 0) value = 255 + value + 1;
        this[offset] = value & 255;
        return offset + 1;
      };
      Buffer4.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        return offset + 2;
      };
      Buffer4.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 2, 32767, -32768);
        this[offset] = value >>> 8;
        this[offset + 1] = value & 255;
        return offset + 2;
      };
      Buffer4.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        this[offset] = value & 255;
        this[offset + 1] = value >>> 8;
        this[offset + 2] = value >>> 16;
        this[offset + 3] = value >>> 24;
        return offset + 4;
      };
      Buffer4.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) checkInt(this, value, offset, 4, 2147483647, -2147483648);
        if (value < 0) value = 4294967295 + value + 1;
        this[offset] = value >>> 24;
        this[offset + 1] = value >>> 16;
        this[offset + 2] = value >>> 8;
        this[offset + 3] = value & 255;
        return offset + 4;
      };
      Buffer4.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(value, offset = 0) {
        return wrtBigUInt64LE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      Buffer4.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(value, offset = 0) {
        return wrtBigUInt64BE(this, value, offset, -BigInt("0x8000000000000000"), BigInt("0x7fffffffffffffff"));
      });
      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError("Index out of range");
        if (offset < 0) throw new RangeError("Index out of range");
      }
      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 34028234663852886e22, -34028234663852886e22);
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4);
        return offset + 4;
      }
      Buffer4.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert);
      };
      Buffer4.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert);
      };
      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        value = +value;
        offset = offset >>> 0;
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 17976931348623157e292, -17976931348623157e292);
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8);
        return offset + 8;
      }
      Buffer4.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert);
      };
      Buffer4.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert);
      };
      Buffer4.prototype.copy = function copy(target, targetStart, start, end) {
        if (!Buffer4.isBuffer(target)) throw new TypeError("argument should be a Buffer");
        if (!start) start = 0;
        if (!end && end !== 0) end = this.length;
        if (targetStart >= target.length) targetStart = target.length;
        if (!targetStart) targetStart = 0;
        if (end > 0 && end < start) end = start;
        if (end === start) return 0;
        if (target.length === 0 || this.length === 0) return 0;
        if (targetStart < 0) {
          throw new RangeError("targetStart out of bounds");
        }
        if (start < 0 || start >= this.length) throw new RangeError("Index out of range");
        if (end < 0) throw new RangeError("sourceEnd out of bounds");
        if (end > this.length) end = this.length;
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start;
        }
        const len = end - start;
        if (this === target && typeof Uint8Array.prototype.copyWithin === "function") {
          this.copyWithin(targetStart, start, end);
        } else {
          Uint8Array.prototype.set.call(
            target,
            this.subarray(start, end),
            targetStart
          );
        }
        return len;
      };
      Buffer4.prototype.fill = function fill(val, start, end, encoding) {
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
          if (typeof encoding === "string" && !Buffer4.isEncoding(encoding)) {
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
        if (!val) val = 0;
        let i;
        if (typeof val === "number") {
          for (i = start; i < end; ++i) {
            this[i] = val;
          }
        } else {
          const bytes = Buffer4.isBuffer(val) ? val : Buffer4.from(val, encoding);
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
      var errors = {};
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
      E(
        "ERR_BUFFER_OUT_OF_BOUNDS",
        function(name) {
          if (name) {
            return `${name} is outside of buffer bounds`;
          }
          return "Attempt to access memory outside buffer bounds";
        },
        RangeError
      );
      E(
        "ERR_INVALID_ARG_TYPE",
        function(name, actual) {
          return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
        },
        TypeError
      );
      E(
        "ERR_OUT_OF_RANGE",
        function(str, range, input) {
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
        },
        RangeError
      );
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
        throw new errors.ERR_OUT_OF_RANGE(
          type || "offset",
          `>= ${type ? 1 : 0} and <= ${length}`,
          value
        );
      }
      var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;
      function base64clean(str) {
        str = str.split("=")[0];
        str = str.trim().replace(INVALID_BASE64_RE, "");
        if (str.length < 2) return "";
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
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              } else if (i + 1 === length) {
                if ((units -= 3) > -1) bytes.push(239, 191, 189);
                continue;
              }
              leadSurrogate = codePoint;
              continue;
            }
            if (codePoint < 56320) {
              if ((units -= 3) > -1) bytes.push(239, 191, 189);
              leadSurrogate = codePoint;
              continue;
            }
            codePoint = (leadSurrogate - 55296 << 10 | codePoint - 56320) + 65536;
          } else if (leadSurrogate) {
            if ((units -= 3) > -1) bytes.push(239, 191, 189);
          }
          leadSurrogate = null;
          if (codePoint < 128) {
            if ((units -= 1) < 0) break;
            bytes.push(codePoint);
          } else if (codePoint < 2048) {
            if ((units -= 2) < 0) break;
            bytes.push(
              codePoint >> 6 | 192,
              codePoint & 63 | 128
            );
          } else if (codePoint < 65536) {
            if ((units -= 3) < 0) break;
            bytes.push(
              codePoint >> 12 | 224,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
          } else if (codePoint < 1114112) {
            if ((units -= 4) < 0) break;
            bytes.push(
              codePoint >> 18 | 240,
              codePoint >> 12 & 63 | 128,
              codePoint >> 6 & 63 | 128,
              codePoint & 63 | 128
            );
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
          if ((units -= 2) < 0) break;
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
          if (i + offset >= dst.length || i >= src.length) break;
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
      var hexSliceLookupTable = (function() {
        const alphabet = "0123456789abcdef";
        const table = new Array(256);
        for (let i = 0; i < 16; ++i) {
          const i16 = i * 16;
          for (let j = 0; j < 16; ++j) {
            table[i16 + j] = alphabet[i] + alphabet[j];
          }
        }
        return table;
      })();
      function defineBigIntMethod(fn) {
        return typeof BigInt === "undefined" ? BufferBigIntNotDefined : fn;
      }
      function BufferBigIntNotDefined() {
        throw new Error("BigInt not supported");
      }
    }
  });

  // src/inject-buffer.js
  var import_buffer;
  var init_inject_buffer = __esm({
    "src/inject-buffer.js"() {
      import_buffer = __toESM(require_buffer(), 1);
    }
  });

  // src/main-src.js
  init_inject_buffer();

  // src/signing.js
  init_inject_buffer();

  // src/crypto-shim.js
  init_inject_buffer();
  var import_buffer2 = __toESM(require_buffer(), 1);

  // src/md5.js
  init_inject_buffer();
  var S = [
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    7,
    12,
    17,
    22,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    5,
    9,
    14,
    20,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    4,
    11,
    16,
    23,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21,
    6,
    10,
    15,
    21
  ];
  var K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296) >>> 0;
  function toBytes(x) {
    if (typeof x === "string") return new TextEncoder().encode(x);
    if (x instanceof Uint8Array) return x;
    if (Array.isArray(x)) return Uint8Array.from(x);
    return Uint8Array.from(x);
  }
  function wordsToHex(ws) {
    let s = "";
    for (let i = 0; i < ws.length; i++) {
      const w = ws[i] >>> 0;
      for (let j = 0; j < 4; j++) s += ((w >>> j * 8 & 255) + 256).toString(16).slice(1);
    }
    return s;
  }
  function md5Hex(input) {
    const bytes = toBytes(input);
    const len = bytes.length;
    const bitLen = len * 8;
    const total = (len + 8 >>> 6) + 1 << 6;
    const buf = new Uint8Array(total);
    buf.set(bytes, 0);
    buf[len] = 128;
    const dv = new DataView(buf.buffer, 0, total);
    dv.setUint32(total - 8, bitLen >>> 0, true);
    dv.setUint32(total - 4, Math.floor(bitLen / 4294967296) >>> 0, true);
    let a0 = 1732584193, b0 = 4023233417 | 0, c0 = 2562383102 | 0, d0 = 271733878;
    a0 = a0 >>> 0;
    const M = new Uint32Array(16);
    for (let off = 0; off < total; off += 64) {
      for (let i = 0; i < 16; i++) M[i] = dv.getUint32(off + i * 4, true);
      let A = a0, B = b0, C = c0, D = d0;
      for (let i = 0; i < 64; i++) {
        let F, g;
        if (i < 16) {
          F = B & C | ~B & D;
          g = i;
        } else if (i < 32) {
          F = D & B | ~D & C;
          g = 5 * i + 1 & 15;
        } else if (i < 48) {
          F = B ^ C ^ D;
          g = 3 * i + 5 & 15;
        } else {
          F = C ^ (B | ~D);
          g = 7 * i & 15;
        }
        const sum = A + F + K[i] + M[g] >>> 0;
        const s = S[i];
        const rot = (sum << s | sum >>> 32 - s) >>> 0;
        const nb = B + rot >>> 0;
        A = D;
        D = C;
        C = B;
        B = nb;
      }
      a0 = a0 + A >>> 0;
      b0 = b0 + B >>> 0;
      c0 = c0 + C >>> 0;
      d0 = d0 + D >>> 0;
    }
    return wordsToHex([a0, b0, c0, d0]);
  }

  // src/crypto-shim.js
  function toBytes2(x) {
    if (typeof x === "string") return new TextEncoder().encode(x);
    if (x instanceof Uint8Array) return x;
    if (Array.isArray(x)) return Uint8Array.from(x);
    return Uint8Array.from(x);
  }
  var crypto = {
    createHash(alg) {
      if (String(alg).toLowerCase() !== "md5") throw new Error("unsupported hash: " + alg);
      const chunks = [];
      return {
        update(d) {
          chunks.push(toBytes2(d));
          return this;
        },
        digest(enc) {
          let total = 0;
          for (const c of chunks) total += c.length;
          const all = new Uint8Array(total);
          let o = 0;
          for (const c of chunks) {
            all.set(c, o);
            o += c.length;
          }
          const hex = md5Hex(all);
          if (!enc) return import_buffer2.Buffer.from(hex, "hex");
          if (enc === "hex") return hex;
          throw new Error("unsupported digest encoding: " + enc);
        }
      };
    },
    randomBytes(n) {
      const b = import_buffer2.Buffer.alloc(n);
      if (globalThis.__XHS_RANDBYTES__) {
        b.set(globalThis.__XHS_RANDBYTES__(n));
        return b;
      }
      globalThis.crypto.getRandomValues(b);
      return b;
    },
    createCipheriv() {
      throw new Error("XYW/AES \u672A\u6253\u5305\uFF0C\u672C\u811A\u672C\u53EA\u7528 XYS");
    }
  };
  var crypto_shim_default = crypto;

  // src/fingerprint-data.js
  init_inject_buffer();
  var GPU_VENDORS = [
    "Google Inc. (Intel)|ANGLE (Intel, Intel(R) HD Graphics 520 (0x1912) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (Intel)|ANGLE (Intel, Intel(R) UHD Graphics 620 (0x00003EA0) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (Intel)|ANGLE (Intel, Intel(R) UHD Graphics 630 (0x00003E9B) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (Intel)|ANGLE (Intel, Intel(R) Iris(R) Xe Graphics (0x000046A8) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (AMD)|ANGLE (AMD, AMD Radeon Graphics (0x00001636) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (AMD)|ANGLE (AMD, AMD Radeon RX 580 2048SP (0x00006FDF) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (AMD)|ANGLE (AMD, AMD Radeon RX 6600 XT (0x000073FF) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (NVIDIA)|ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 6GB (0x000010DE) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (NVIDIA)|ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 (0x0000250F) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (NVIDIA)|ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 (0x00002488) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (NVIDIA)|ANGLE (NVIDIA, NVIDIA GeForce RTX 4060 (0x00002882) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (NVIDIA)|ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 (0x00002786) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (NVIDIA)|ANGLE (NVIDIA, NVIDIA GeForce RTX 4090 (0x00002684) Direct3D11 vs_5_0 ps_5_0, D3D11)",
    "Google Inc. (Google)|ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)"
  ];
  var SCREEN_RESOLUTIONS = {
    resolutions: [
      "1366;768",
      "1600;900",
      "1920;1080",
      "2560;1440",
      "3840;2160"
    ],
    weights: [0.25, 0.15, 0.4, 0.15, 0.05]
  };
  var FINGERPRINT_DEFAULTS = {
    browserPlugins: "PDF Viewer,Chrome PDF Viewer,Chromium PDF Viewer,Microsoft Edge PDF Viewer,WebKit built-in PDF",
    fonts: 'system-ui, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, BlinkMacSystemFont, "Helvetica Neue", Arial, "PingFang SC", "PingFang TC", "PingFang HK", "Microsoft Yahei", "Microsoft JhengHei"'
  };

  // src/signing.js
  var STANDARD_BASE64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var CUSTOM_BASE64 = "ZmserbBoHQtNP+wOcza/LpngG8yJq42KWYj0DSfdikx3VT16IlUAFM97hECvuRX5";
  var X3_BASE64 = "MfgqrsbcyzPQRStuvC7mn501HIJBo2DEFTKdeNOwxWXYZap89+/A4UVLhijkl63G";
  var HEX_KEY = "71a302257793271ddd273bcee3e4b98d9d7935e1da33f5765e2ea8afb6dc77a51a499d23b67c20660025860cbf13d4540d92497f58686c574e508f46e1956344f39139bf4faf22a3eef120b79258145b2feb5193b6478669961298e79bedca646e1a693a926154a5a7a1bd1cf0dedb742f917a747a1e388b234f2277516db7116035439730fa61e9822a0eca7bff72d8";
  var VERSION_BYTES = [121, 104, 96, 41];
  var PAYLOAD_LENGTH = 144;
  var ENV_TABLE = [115, 248, 83, 102, 103, 201, 181, 131, 99, 94, 4, 68, 250, 132, 21];
  var ENV_CHECKS_DEFAULT = [0, 1, 18, 1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0];
  var A3_PREFIX = [2, 97, 51, 16];
  var HASH_IV = [1831565813, 461845907, 2246822507, 3266489909];
  var MAX_32BIT = 4294967295;
  var SDK_VERSION = "4.3.5";
  var APP_ID = "xhs-pc-web";
  var PLATFORM = "Windows";
  var X3_PREFIX = "mns0301_";
  var XYS_PREFIX = "XYS_";
  var XYW_PREFIX = "XYW_";
  var XYW_AES_KEY = "7cc4adla5ay0701v";
  var XYW_AES_IV = "4uzjr7mbsibcaldp";
  var XYW_ENV_FLAGS = "0|0|0|1|0|0|1|0|0|0|1|0|0|0|0|1|0|0|1";
  var B1_SECRET_KEY = "xhswebmplfbt";
  var HEX_CHARS = "abcdef0123456789";
  var XSCOMMON_TEMPLATE = {
    s0: 5,
    s1: "",
    x0: "1",
    x1: SDK_VERSION,
    x2: PLATFORM,
    x3: APP_ID,
    x4: "4.86.0",
    x5: "",
    x6: "",
    x7: "",
    x8: "",
    x9: -596800761,
    x10: 0,
    x11: "normal"
  };
  var SIGNATURE_DATA_TEMPLATE = {
    x0: SDK_VERSION,
    x1: APP_ID,
    x2: PLATFORM,
    x3: "",
    x4: "object"
  };
  var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0";
  function makeTranslateTable(from, to) {
    const table = /* @__PURE__ */ new Map();
    for (let i = 0; i < from.length; i++) {
      table.set(from.charCodeAt(i), to.charCodeAt(i));
    }
    return table;
  }
  function translateString(s, table) {
    const chars = [];
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      const mapped = table.get(code);
      chars.push(String.fromCharCode(mapped ?? code));
    }
    return chars.join("");
  }
  var customEncodeTable = makeTranslateTable(STANDARD_BASE64, CUSTOM_BASE64);
  var x3EncodeTable = makeTranslateTable(STANDARD_BASE64, X3_BASE64);
  function customBase64Encode(data) {
    const buf = typeof data === "string" ? import_buffer.Buffer.from(data, "utf-8") : import_buffer.Buffer.from(data);
    const standard = buf.toString("base64");
    return translateString(standard, customEncodeTable);
  }
  function x3Base64Encode(data) {
    const standard = import_buffer.Buffer.from(data).toString("base64");
    return translateString(standard, x3EncodeTable);
  }
  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randomUint32() {
    return crypto_shim_default.randomBytes(4).readUInt32LE(0);
  }
  function intToLeBytes(val, length = 4) {
    if (length <= 4) {
      const arr = [];
      for (let i = 0; i < length; i++) {
        arr.push(val & 255);
        val = val >>> 8;
      }
      return arr;
    }
    const buf = import_buffer.Buffer.alloc(length);
    buf.writeBigUInt64LE(BigInt(val));
    return Array.from(buf);
  }
  function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }
  function rotateLeft(val, n) {
    return (val << n | val >>> 32 - n) >>> 0;
  }
  function customHashV2(inputBytes) {
    let [s0, s1, s2, s3] = HASH_IV;
    const length = inputBytes.length;
    s0 = (s0 ^ length) >>> 0;
    s1 = (s1 ^ length << 8 & MAX_32BIT) >>> 0;
    s2 = (s2 ^ length << 16 & MAX_32BIT) >>> 0;
    s3 = (s3 ^ length << 24 & MAX_32BIT) >>> 0;
    const buf = import_buffer.Buffer.from(inputBytes);
    for (let i = 0; i < Math.floor(length / 8); i++) {
      const v0 = buf.readUInt32LE(i * 8);
      const v1 = buf.readUInt32LE(i * 8 + 4);
      s0 = rotateLeft(s0 + v0 & MAX_32BIT ^ s2, 7);
      s1 = rotateLeft((v0 ^ s1) + s3 & MAX_32BIT, 11);
      s2 = rotateLeft(s2 + v1 & MAX_32BIT ^ s0, 13);
      s3 = rotateLeft((s3 ^ v1) + s1 & MAX_32BIT, 17);
    }
    const t0 = (s0 ^ length) >>> 0;
    const t1 = (s1 ^ t0) >>> 0;
    const t2 = (s2 + t1 & MAX_32BIT) >>> 0;
    const t3 = (s3 ^ t2) >>> 0;
    const rot_t0 = rotateLeft(t0, 9);
    const rot_t1 = rotateLeft(t1, 13);
    const rot_t2 = rotateLeft(t2, 17);
    const rot_t3 = rotateLeft(t3, 19);
    s0 = (rot_t0 + rot_t2 & MAX_32BIT) >>> 0;
    s1 = (rot_t1 ^ rot_t3) >>> 0;
    s2 = (rot_t2 + s0 & MAX_32BIT) >>> 0;
    s3 = (rot_t3 ^ s1) >>> 0;
    const result = [];
    for (const s of [s0, s1, s2, s3]) {
      result.push(...intToLeBytes(s, 4));
    }
    return result;
  }
  function buildPayloadArray(hexParameter, md5PathHex, a1Value, contentString, timestamp) {
    const payload = [];
    payload.push(...VERSION_BYTES);
    const seed = randomUint32();
    const seedBytes = intToLeBytes(seed, 4);
    payload.push(...seedBytes);
    const seedByte0 = seedBytes[0];
    const ts = timestamp ?? Date.now() / 1e3;
    const tsMs = Math.floor(ts * 1e3);
    const tsBytes = intToLeBytes(tsMs, 8);
    payload.push(...tsBytes);
    const timeOffset = randomInt(10, 50);
    const pageLoadTs = Math.floor((ts - timeOffset) * 1e3);
    payload.push(...intToLeBytes(pageLoadTs, 8));
    const sequenceValue = randomInt(15, 50);
    payload.push(...intToLeBytes(sequenceValue, 4));
    const windowPropsLength = randomInt(1e3, 1200);
    payload.push(...intToLeBytes(windowPropsLength, 4));
    payload.push(...intToLeBytes(import_buffer.Buffer.byteLength(contentString, "utf-8"), 4));
    const md5Bytes = hexToBytes(hexParameter);
    for (let i = 0; i < 8; i++) {
      payload.push(md5Bytes[i] ^ seedByte0);
    }
    payload.push(52);
    const a1Bytes = import_buffer.Buffer.from(a1Value, "utf-8");
    for (let i = 0; i < 52; i++) {
      payload.push(i < a1Bytes.length ? a1Bytes[i] : 0);
    }
    payload.push(10);
    const sourceBytes = import_buffer.Buffer.from(APP_ID, "utf-8");
    for (let i = 0; i < 10; i++) {
      payload.push(i < sourceBytes.length ? sourceBytes[i] : 0);
    }
    payload.push(1);
    payload.push(seedByte0 ^ ENV_TABLE[0]);
    for (let i = 1; i < 15; i++) {
      payload.push(ENV_TABLE[i] ^ ENV_CHECKS_DEFAULT[i]);
    }
    const md5PathBytes = Array.from(hexToBytes(md5PathHex));
    const hashInput = [...tsBytes, ...md5PathBytes];
    const hashOutput = customHashV2(hashInput);
    payload.push(...A3_PREFIX);
    for (const b of hashOutput) {
      payload.push(b ^ seedByte0);
    }
    return payload;
  }
  function xorTransform(source) {
    const keyBytes = hexToBytes(HEX_KEY);
    const result = new Uint8Array(source.length);
    for (let i = 0; i < source.length; i++) {
      if (i < keyBytes.length) {
        result[i] = (source[i] ^ keyBytes[i]) & 255;
      } else {
        result[i] = source[i] & 255;
      }
    }
    return result;
  }
  var CRC32_POLY = 3988292384;
  var crc32Table = null;
  function ensureCrc32Table() {
    if (crc32Table)
      return crc32Table;
    const table = new Uint32Array(256);
    for (let d = 0; d < 256; d++) {
      let r = d;
      for (let j = 0; j < 8; j++) {
        r = r & 1 ? r >>> 1 ^ CRC32_POLY : r >>> 1;
      }
      table[d] = r;
    }
    crc32Table = table;
    return table;
  }
  function crc32JsInt(data) {
    const table = ensureCrc32Table();
    let c = 4294967295;
    for (let i = 0; i < data.length; i++) {
      const b = data.charCodeAt(i) & 255;
      c = (table[c & 255 ^ b] ^ c >>> 8) >>> 0;
    }
    const u = (4294967295 ^ c ^ CRC32_POLY) >>> 0;
    return u > 2147483647 ? u - 4294967296 : u;
  }
  function rc4Encrypt(key, data) {
    const keyBuf = import_buffer.Buffer.from(key, "utf-8");
    const dataBuf = import_buffer.Buffer.from(data, "utf-8");
    const S2 = new Uint8Array(256);
    for (let i = 0; i < 256; i++)
      S2[i] = i;
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = j + S2[i] + keyBuf[i % keyBuf.length] & 255;
      [S2[i], S2[j]] = [S2[j], S2[i]];
    }
    const result = import_buffer.Buffer.alloc(dataBuf.length);
    let i2 = 0;
    let j2 = 0;
    for (let k = 0; k < dataBuf.length; k++) {
      i2 = i2 + 1 & 255;
      j2 = j2 + S2[i2] & 255;
      [S2[i2], S2[j2]] = [S2[j2], S2[i2]];
      result[k] = dataBuf[k] ^ S2[S2[i2] + S2[j2] & 255];
    }
    return result;
  }
  function weightedChoice(options, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < options.length; i++) {
      r -= weights[i];
      if (r <= 0)
        return options[i];
    }
    return options[options.length - 1];
  }
  function generateFingerprint(cookies, userAgent, signLocation = "https://www.xiaohongshu.com/explore") {
    const cookieString = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join("; ");
    const gpuEntry = GPU_VENDORS[Math.floor(Math.random() * GPU_VENDORS.length)];
    const [vendor, renderer] = gpuEntry.split("|");
    const screenRes = weightedChoice(SCREEN_RESOLUTIONS.resolutions, SCREEN_RESOLUTIONS.weights);
    const [widthStr, heightStr] = screenRes.split(";");
    const width = parseInt(widthStr);
    const height = parseInt(heightStr);
    const availWidth = Math.random() > 0.5 ? width - weightedChoice([0, 30, 60, 80], [0.1, 0.4, 0.3, 0.2]) : width;
    const availHeight = Math.random() > 0.5 ? height : height - weightedChoice([30, 60, 80, 100], [0.2, 0.5, 0.2, 0.1]);
    const colorDepth = weightedChoice([16, 24, 30, 32], [0.05, 0.6, 0.05, 0.3]);
    const deviceMemory = weightedChoice([1, 2, 4, 8, 12, 16], [0.1, 0.25, 0.4, 0.2, 0.03, 0.01]);
    const cores = weightedChoice([2, 4, 6, 8, 12, 16, 24, 32], [0.1, 0.4, 0.2, 0.15, 0.08, 0.04, 0.02, 0.01]);
    const webglHash = crypto_shim_default.createHash("md5").update(crypto_shim_default.randomBytes(32)).digest("hex");
    const canvasHash = "742cc32c";
    const isIncognito = Math.random() > 0.95 ? "true" : "false";
    const x78y = randomInt(2350, 2450);
    return {
      x1: userAgent,
      x2: "false",
      x3: "zh-CN",
      x4: String(colorDepth),
      x5: String(deviceMemory),
      x6: "24",
      x7: `${vendor},${renderer}`,
      x8: String(cores),
      x9: `${width};${height}`,
      x10: `${availWidth};${availHeight}`,
      x11: "-480",
      x12: "Asia/Shanghai",
      x13: isIncognito,
      x14: isIncognito,
      x15: isIncognito,
      x16: "false",
      x17: "false",
      x18: "un",
      x19: "Win32",
      x20: "",
      x21: FINGERPRINT_DEFAULTS.browserPlugins,
      x22: webglHash,
      x23: "false",
      x24: "false",
      x25: "false",
      x26: "false",
      x27: "false",
      x28: "0,false,false",
      x29: "4,7,8",
      x30: "swf object not loaded",
      x33: "0",
      x34: "0",
      x35: "0",
      x36: String(randomInt(1, 20)),
      x37: "0|0|0|0|0|0|0|0|0|1|0|0|0|0|0|0|0|0|1|0|0|0|0|0",
      x38: "0|0|1|0|1|0|0|0|0|0|1|0|1|0|1|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0|0",
      x39: 0,
      x40: "0",
      x41: "0",
      x42: "3.4.4",
      x43: canvasHash,
      x44: String(Date.now()),
      x45: "__SEC_CAV__1-1-1-1-1|__SEC_WSA__|",
      x46: "false",
      x47: "1|0|0|0|0|0",
      x48: "",
      x49: "{list:[],type:}",
      x50: "",
      x51: "",
      x52: "",
      x55: "380,380,360,400,380,400,420,380,400,400,360,360,440,420",
      x56: `${vendor}|${renderer}|${webglHash}|35`,
      x57: cookieString,
      x58: "180",
      x59: "2",
      x60: "63",
      x61: "1291",
      x62: "2047",
      x63: "0",
      x64: "0",
      x65: "0",
      x66: {
        referer: "",
        location: signLocation,
        frame: 0
      },
      x67: "1|0",
      x68: "0",
      x69: "326|1292|30",
      x70: ["location"],
      x71: "true",
      x72: "complete",
      x73: "1191",
      x74: "0|0|0",
      x75: "Google Inc.",
      x76: "true",
      x77: "1|1|1|1|1|1|1|1|1|1",
      x78: {
        x: 0,
        y: x78y,
        left: 0,
        right: 290.828125,
        bottom: x78y + 18,
        height: 18,
        top: x78y,
        width: 290.828125,
        font: FINGERPRINT_DEFAULTS.fonts
      },
      x82: "_0x17a2|_0x1954",
      x31: "124.04347527516074",
      x79: "144|599565058866",
      x53: crypto_shim_default.createHash("md5").update(crypto_shim_default.randomBytes(32)).digest("hex"),
      x54: "10311144241322244122",
      x80: "1|[object FileSystemDirectoryHandle]"
    };
  }
  function generateB1(fp) {
    const b1Fields = {};
    for (const key of [
      "x33",
      "x34",
      "x35",
      "x36",
      "x37",
      "x38",
      "x39",
      "x42",
      "x43",
      "x44",
      "x45",
      "x46",
      "x48",
      "x49",
      "x50",
      "x51",
      "x52",
      "x82"
    ]) {
      b1Fields[key] = fp[key];
    }
    const b1Json = JSON.stringify(b1Fields);
    const ciphertext = rc4Encrypt(B1_SECRET_KEY, b1Json);
    const latin1 = ciphertext.toString("latin1");
    const encoded = encodeURIComponent(latin1).replace(
      /[!'()*~._-]/g,
      (c) => c
      // keep these chars unencoded like Python's safe param
    );
    const bytes = [];
    const parts = encoded.split("%").slice(1);
    for (const part of parts) {
      bytes.push(parseInt(part.substring(0, 2), 16));
      for (let i = 2; i < part.length; i++) {
        bytes.push(part.charCodeAt(i));
      }
    }
    return customBase64Encode(import_buffer.Buffer.from(bytes));
  }
  function generateB3TraceId() {
    let id = "";
    for (let i = 0; i < 16; i++) {
      id += HEX_CHARS[Math.floor(Math.random() * 16)];
    }
    return id;
  }
  function generateXrayTraceId(timestamp) {
    const ts = timestamp ?? Date.now();
    const seq = Math.floor(Math.random() * 8388607);
    const part1 = (BigInt(ts) << 23n | BigInt(seq)).toString(16).padStart(16, "0");
    let part2 = "";
    for (let i = 0; i < 16; i++) {
      part2 += HEX_CHARS[Math.floor(Math.random() * 16)];
    }
    return part1 + part2;
  }
  function buildContentString(method, uri, payload) {
    if (method === "POST") {
      if (!payload)
        return uri;
      return uri + JSON.stringify(payload);
    }
    return uri;
  }
  function extractUri(url) {
    try {
      const parsed = new URL(url);
      return parsed.pathname;
    } catch {
      return url.split("?")[0];
    }
  }
  function encodeQueryValue(value) {
    return encodeURIComponent(value).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`).replace(/%2C/g, ",");
  }
  function buildGetUri(uri, params) {
    if (!params || Object.keys(params).length === 0)
      return uri;
    const parts = [];
    for (const [key, value] of Object.entries(params)) {
      const strVal = Array.isArray(value) ? value.join(",") : String(value);
      parts.push(`${key}=${encodeQueryValue(strVal)}`);
    }
    return `${uri}?${parts.join("&")}`;
  }
  function buildXywSignature(contentString, a1, tsMs) {
    const x1 = crypto_shim_default.createHash("md5").update(`url=${contentString}`, "utf-8").digest("hex");
    const message = `x1=${x1};x2=${XYW_ENV_FLAGS};x3=${a1};x4=${tsMs};`;
    const cipher = crypto_shim_default.createCipheriv("aes-128-cbc", import_buffer.Buffer.from(XYW_AES_KEY), import_buffer.Buffer.from(XYW_AES_IV));
    const plaintext = import_buffer.Buffer.from(message, "utf-8").toString("base64");
    const payload = import_buffer.Buffer.concat([cipher.update(plaintext, "utf-8"), cipher.final()]).toString("hex");
    const envelope = JSON.stringify({
      signSvn: "56",
      signType: "x2",
      appId: APP_ID,
      signVersion: "1",
      payload
    });
    return XYW_PREFIX + import_buffer.Buffer.from(envelope, "utf-8").toString("base64");
  }
  function signMainApi(method, uri, cookies, params, payload, timestamp, signLocation, signFormat = "xys") {
    const a1 = cookies.a1;
    if (!a1)
      throw new Error("Missing 'a1' in cookies");
    const ts = timestamp ?? Date.now() / 1e3;
    const tsMs = Math.floor(ts * 1e3);
    const uriPath = extractUri(uri);
    const fullUri = method === "GET" ? buildGetUri(uriPath, params) : uriPath;
    const contentString = buildContentString(method, fullUri, payload);
    const dValue = crypto_shim_default.createHash("md5").update(contentString, "utf-8").digest("hex");
    let xs;
    if (signFormat === "xyw") {
      xs = buildXywSignature(contentString, a1, tsMs);
    } else {
      const md5PathHex = method === "GET" ? dValue : crypto_shim_default.createHash("md5").update(uriPath, "utf-8").digest("hex");
      const payloadArray = buildPayloadArray(dValue, md5PathHex, a1, contentString, ts);
      const xorResult = xorTransform(payloadArray);
      const x3Signature = x3Base64Encode(xorResult.slice(0, PAYLOAD_LENGTH));
      const signatureData = { ...SIGNATURE_DATA_TEMPLATE };
      signatureData.x3 = X3_PREFIX + x3Signature;
      xs = XYS_PREFIX + customBase64Encode(JSON.stringify(signatureData));
    }
    const fingerprint = generateFingerprint(cookies, USER_AGENT, signLocation);
    const b1 = generateB1(fingerprint);
    const x9 = crc32JsInt(b1);
    const xsCommonStruct = { ...XSCOMMON_TEMPLATE, x5: a1, x8: b1, x9 };
    const xsCommonJson = JSON.stringify(xsCommonStruct);
    const xsCommon = customBase64Encode(xsCommonJson);
    return {
      "x-s": xs,
      "x-s-common": xsCommon,
      "x-t": String(tsMs),
      "x-b3-traceid": generateB3TraceId(),
      "x-xray-traceid": generateXrayTraceId(tsMs)
    };
  }

  // src/main-src.js
  var HOST = "https://edith.xiaohongshu.com";
  var P_BOARDS = "/api/sns/web/v1/board/user";
  var P_MOVE = "/api/sns/web/v1/note/move";
  var P_COLLECT = "/api/sns/web/v1/note/collect";
  var P_UNCOLLECT = "/api/sns/web/v1/note/uncollect";
  var CFG = {
    CARD: "section.note-item",
    BOARD_NUM: 30,
    DELAY: 600
  };
  var state = {
    selected: /* @__PURE__ */ new Set(),
    done: /* @__PURE__ */ new Set(),
    cards: /* @__PURE__ */ new Map(),
    boards: [],
    running: false,
    cancel: false,
    favSeen: false,
    recollect: false
  };
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  function cookie(name) {
    const m = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }
  function userId() {
    const m = location.pathname.match(/\/user\/profile\/([0-9a-f]{24})/);
    return m ? m[1] : null;
  }
  function noteIdOf(card) {
    const direct = card.getAttribute("data-note-id");
    if (direct) return direct;
    const a = card.querySelector('a[href*="/explore/"]');
    if (a) {
      const m = (a.getAttribute("href") || "").match(/\/explore\/([0-9a-f]{24})/);
      if (m) return m[1];
    }
    return null;
  }
  function sign(method, path, params, body) {
    const a1 = cookie("a1");
    if (!a1) throw new Error("\u53D6\u4E0D\u5230 a1 cookie\uFF0C\u786E\u8BA4\u5DF2\u767B\u5F55");
    return signMainApi(method, path, { a1 }, params || null, body || null, Date.now() / 1e3, location.href);
  }
  async function api(method, path, params, body) {
    const h = sign(method, path, params, body);
    let url = HOST + path;
    if (params) {
      url += "?" + Object.keys(params).map((k) => k + "=" + encodeURIComponent(params[k])).join("&");
    }
    const headers = Object.assign({ accept: "application/json, text/plain, */*" }, h);
    const opt = { method, headers, credentials: "include" };
    if (body) {
      headers["content-type"] = "application/json;charset=utf-8";
      opt.body = JSON.stringify(body);
    }
    const res = await fetch(url, opt);
    const text = await res.text();
    let j = null;
    try {
      j = JSON.parse(text);
    } catch (e) {
      throw new Error("HTTP " + res.status + " \u975E JSON \u54CD\u5E94: " + text.slice(0, 120));
    }
    if (j.code !== 0 && j.success !== true) {
      throw new Error("code=" + j.code + " " + (j.msg || "(\u65E0 msg)"));
    }
    return j.data;
  }
  async function fetchBoards() {
    const uid = userId();
    if (!uid) throw new Error("\u53D6\u4E0D\u5230 userId\uFF0C\u8BF7\u5148\u6253\u5F00\u81EA\u5DF1\u7684\u6536\u85CF\u9875");
    const d = await api("GET", P_BOARDS, { user_id: uid, num: CFG.BOARD_NUM, page: 1 });
    return (d && d.boards || []).map((b) => ({ id: b.id, name: b.name }));
  }
  function moveOne(noteId, boardId) {
    return api("POST", P_MOVE, null, { target_board_id: boardId, notes_id: noteId });
  }
  async function classifyOne(noteId, boardId, recollect) {
    if (!recollect) {
      await moveOne(noteId, boardId);
      return;
    }
    try {
      await api("POST", P_UNCOLLECT, null, { note_ids: noteId });
    } catch (e) {
      throw new Error("\u53D6\u6D88\u6536\u85CF\u5931\u8D25\uFF0C\u672A\u505A\u4EFB\u4F55\u6539\u52A8: " + e.message);
    }
    await sleep(300);
    let redo = false;
    let lastErr = "";
    for (let i = 0; i < 3 && !redo; i++) {
      try {
        await api("POST", P_COLLECT, null, { note_id: noteId });
        redo = true;
      } catch (e) {
        lastErr = e.message;
        await sleep(500);
      }
    }
    if (!redo) {
      throw new Error("\u5DF2\u53D6\u6D88\u6536\u85CF\uFF0C\u4F46\u91CD\u65B0\u6536\u85CF\u5931\u8D25\uFF0C\u8FD9\u7BC7\u73B0\u5728\u4E0D\u5728\u6536\u85CF\u91CC\uFF0C\u8BF7\u624B\u52A8\u6536\u85CF: " + lastErr);
    }
    await sleep(300);
    try {
      await moveOne(noteId, boardId);
    } catch (e) {
      throw new Error("\u5DF2\u91CD\u65B0\u6536\u85CF\uFF0C\u4F46\u79FB\u5165\u76EE\u6807\u4E13\u8F91\u5931\u8D25\uFF0C\u7B14\u8BB0\u73B0\u5728\u9ED8\u8BA4\u6536\u85CF\u5939\u91CC: " + e.message);
    }
  }
  var CARD_CSS = [
    ".xhs-pick{position:absolute;top:8px;right:8px;width:26px;height:26px;border-radius:50%;",
    "background:rgba(0,0,0,.42);border:1.5px solid rgba(255,255,255,.92);z-index:9;cursor:pointer;",
    "display:flex;align-items:center;justify-content:center;transition:background .15s,transform .15s;",
    "box-sizing:border-box;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px)}",
    ".xhs-pick:hover{transform:scale(1.1);background:rgba(0,0,0,.62)}",
    ".xhs-pick::after{content:'';width:10px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;",
    "transform:rotate(-45deg) scale(0);transition:transform .16s;margin-top:-3px}",
    ".xhs-pick.on{background:#ff2e4d;border-color:#ff2e4d}",
    ".xhs-pick.on::after{transform:rotate(-45deg) scale(1)}",
    ".xhs-note-done{opacity:.42}"
  ].join("");
  function injectCardCss() {
    if (document.getElementById("xhs-pick-css")) return;
    const st = document.createElement("style");
    st.id = "xhs-pick-css";
    st.textContent = CARD_CSS;
    document.head.appendChild(st);
  }
  function paint(id) {
    const card = state.cards.get(id);
    if (!card) return;
    const box = card.querySelector(":scope > .xhs-pick");
    if (box) box.classList.toggle("on", state.selected.has(id));
    card.classList.toggle("xhs-note-done", state.done.has(id));
  }
  function toggle(id) {
    if (state.selected.has(id)) state.selected.delete(id);
    else state.selected.add(id);
    paint(id);
    ui.renderCount();
  }
  function decorate(card) {
    const id = noteIdOf(card);
    if (!id) return;
    state.cards.set(id, card);
    if (card.querySelector(":scope > .xhs-pick")) {
      paint(id);
      return;
    }
    if (getComputedStyle(card).position === "static") card.style.position = "relative";
    const box = document.createElement("div");
    box.className = "xhs-pick";
    box.title = "\u52FE\u9009\u8FD9\u7BC7\u7B14\u8BB0";
    box.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggle(id);
    }, true);
    box.addEventListener("mousedown", (e) => e.stopPropagation(), true);
    card.appendChild(box);
    paint(id);
  }
  function scan() {
    if (favContext()) state.favSeen = true;
    if (!state.favSeen) return;
    const cards = document.querySelectorAll(CFG.CARD);
    for (let i = 0; i < cards.length; i++) decorate(cards[i]);
  }
  function favContext() {
    const sp = new URLSearchParams(location.search);
    if (sp.get("tab") === "fav") return true;
    const t = document.querySelector(".reds-tab-item.active.sub-tab-list");
    return !!(t && /收藏/.test(t.textContent));
  }
  var UI_CSS = [
    ":host{all:initial}*{box-sizing:border-box}",
    ".wrap{position:fixed;left:0;top:0;width:44px;height:44px;z-index:2147483000;",
    "font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif;",
    "font-size:13px;line-height:1.5;color:#222}",
    ".tab{position:absolute;left:0;top:0;width:44px;height:44px;border-radius:50%;border:0;cursor:grab;background:#ff2e4d;color:#fff;",
    "font-size:18px;box-shadow:0 4px 16px rgba(255,46,77,.4);display:none;align-items:center;justify-content:center;",
    "padding:0;touch-action:none}",
    ".tab:active{cursor:grabbing}",
    ".tab b{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#222;",
    "color:#fff;font-size:11px;line-height:18px;text-align:center;padding:0 4px;font-weight:600}",
    ".tab.show{display:flex}",
    ".panel{position:absolute;right:0;top:0;width:272px;background:#fff;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.16);",
    "border:1px solid rgba(0,0,0,.06);overflow:hidden;transition:opacity .18s,transform .18s}",
    ".panel.hide{display:none}",
    ".hd{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#ff2e4d;color:#fff;",
    "cursor:move;user-select:none;touch-action:none}",
    ".hd b{font-weight:600;font-size:13px}",
    ".hd .n{background:rgba(255,255,255,.28);border-radius:9px;padding:0 7px;font-size:12px;margin-left:auto;margin-right:8px}",
    ".x{cursor:pointer;border:0;background:transparent;color:#fff;font-size:15px;line-height:1;padding:3px 5px;border-radius:6px}",
    ".x:hover{background:rgba(255,255,255,.2)}",
    ".bd{padding:10px 12px 12px}",
    ".lb{color:#888;font-size:12px;margin:0 0 4px}",
    ".ck{display:flex;align-items:center;gap:6px;margin-top:9px;font-size:12px;color:#555;cursor:pointer;user-select:none}",
    ".ck input{width:14px;height:14px;margin:0;flex:none;accent-color:#ff2e4d;cursor:pointer}",
    "select{width:100%;padding:7px 8px;border:1px solid #e3e3e3;border-radius:8px;font-size:13px;",
    "background:#fafafa;outline:none;color:#222}",
    "select:focus{border-color:#ff2e4d}",
    ".row{display:flex;gap:8px;margin-top:8px}",
    ".row>*{flex:1}",
    "button.b{cursor:pointer;border:1px solid #e3e3e3;background:#fff;border-radius:8px;padding:7px 8px;",
    "font-size:12px;color:#333;font-family:inherit}",
    "button.b:hover{background:#f5f5f5}",
    "button.b:disabled{opacity:.45;cursor:not-allowed}",
    "button.p{border:0;background:#ff2e4d;color:#fff;font-weight:600;padding:9px 8px;font-size:13px}",
    "button.p:hover:enabled{background:#e8283f}",
    ".bar{height:4px;background:#f0f0f0;border-radius:2px;overflow:hidden;margin-top:10px;display:none}",
    ".bar.show{display:block}",
    ".bar i{display:block;height:100%;width:0;background:#ff2e4d;transition:width .2s}",
    ".lg{margin-top:10px;max-height:160px;overflow:auto;font-size:12px;color:#555;",
    "font-family:ui-monospace,Consolas,monospace;border-top:1px dashed #eee;padding-top:8px}",
    ".lg div{padding:1px 0;word-break:break-all}",
    ".lg .ok{color:#0a8f45}.lg .er{color:#d0021b}.lg .inf{color:#888}"
  ].join("");
  function buildUI() {
    injectCardCss();
    const host = document.createElement("div");
    host.id = "xhs-picker-host";
    const sr = host.attachShadow({ mode: "open" });
    const st = document.createElement("style");
    st.textContent = UI_CSS;
    sr.appendChild(st);
    const wrap = document.createElement("div");
    wrap.className = "wrap";
    wrap.innerHTML = '<button class="tab" title="\u6279\u91CF\u5F52\u7C7B">\u2605<b>0</b></button><div class="panel"><div class="hd"><b>\u6279\u91CF\u5F52\u7C7B</b><span class="n">0</span><button class="x" title="\u6536\u8D77">\u2015</button></div><div class="bd"><div class="lb">\u76EE\u6807\u4E13\u8F91</div><select class="board"><option value="">\u52A0\u8F7D\u4E2D\u2026</option></select><div class="row"><button class="b reload">\u5237\u65B0\u4E13\u8F91</button><button class="b test">\u81EA\u68C0</button></div><label class="ck" title="\u5148\u53D6\u6D88\u6536\u85CF\u518D\u91CD\u65B0\u6536\u85CF\uFF0C\u8BA9\u8FD9\u7BC7\u6392\u5230\u6536\u85CF\u5217\u8868\u6700\u524D\u9762\u3002\u6CE8\u610F\uFF1A\u591A\u4E00\u6B21\u8BF7\u6C42\uFF0C\u4E5F\u66F4\u6162"><input type="checkbox" class="rc"><span>\u5F52\u7C7B\u540E\u91CD\u65B0\u6536\u85CF\uFF08\u7F6E\u9876\uFF09</span></label><div class="row"><button class="b all">\u5168\u9009\u53EF\u89C1</button><button class="b clear">\u6E05\u7A7A</button></div><div class="row"><button class="b p go">\u5F00\u59CB\u5F52\u7C7B</button></div><div class="row"><button class="b stop" disabled>\u505C\u6B62</button></div><div class="bar"><i></i></div><div class="lg"></div></div></div>';
    sr.appendChild(wrap);
    const q = (s) => wrap.querySelector(s);
    const elPanel = q(".panel");
    const elTab = q(".tab");
    const elBadge = q(".tab b");
    const elSel = q("select.board");
    const elCount = q(".n");
    const elBar = q(".bar");
    const elBarI = q(".bar i");
    const elLog = q(".lg");
    const btnGo = q(".go");
    const btnStop = q(".stop");
    function log(msg, cls) {
      const d = document.createElement("div");
      if (cls) d.className = cls;
      d.textContent = msg;
      elLog.appendChild(d);
      elLog.scrollTop = elLog.scrollHeight;
      while (elLog.children.length > 200) elLog.removeChild(elLog.firstChild);
    }
    function renderCount() {
      elCount.textContent = state.selected.size;
      elBadge.textContent = state.selected.size;
    }
    function setProgress(done, total) {
      if (!total) {
        elBar.classList.remove("show");
        elBarI.style.width = "0";
        return;
      }
      elBar.classList.add("show");
      elBarI.style.width = Math.round(done / total * 100) + "%";
    }
    function renderBoards() {
      elSel.innerHTML = "";
      if (!state.boards.length) {
        const o = document.createElement("option");
        o.value = "";
        o.textContent = "(\u6CA1\u6709\u4E13\u8F91\uFF0C\u70B9\u81EA\u68C0)";
        elSel.appendChild(o);
        return;
      }
      state.boards.forEach((b) => {
        const op = document.createElement("option");
        op.value = b.id;
        op.textContent = b.name;
        elSel.appendChild(op);
      });
    }
    elSel.addEventListener("change", () => {
      try {
        localStorage.setItem("xhs-picker-board", elSel.value);
      } catch (e) {
      }
    });
    const elRc = q(".rc");
    try {
      state.recollect = localStorage.getItem("xhs-picker-recollect") === "1";
    } catch (e) {
    }
    elRc.checked = state.recollect;
    elRc.addEventListener("change", () => {
      state.recollect = elRc.checked;
      try {
        localStorage.setItem("xhs-picker-recollect", elRc.checked ? "1" : "0");
      } catch (e) {
      }
      log(state.recollect ? "\u5DF2\u5F00\u542F\u91CD\u65B0\u6536\u85CF\uFF1A\u5F52\u7C7B\u65F6\u4F1A\u5148\u53D6\u6D88\u518D\u6536\u85CF" : "\u5DF2\u5173\u95ED\u91CD\u65B0\u6536\u85CF\uFF1A\u53EA\u79FB\u52A8\u4E13\u8F91", "inf");
    });
    const PANEL_W = 272;
    const pos = { x: 0, y: 0 };
    function visibleBox() {
      const open = !elPanel.classList.contains("hide");
      return open ? { w: PANEL_W, h: elPanel.offsetHeight || 320, dx: 44 - PANEL_W } : { w: 44, h: 44, dx: 0 };
    }
    function setPos(x, y) {
      const b = visibleBox();
      x = Math.max(4 - b.dx, Math.min(x, innerWidth - 4 - b.w - b.dx));
      y = Math.max(4, Math.min(y, innerHeight - 4 - b.h));
      pos.x = x;
      pos.y = y;
      wrap.style.left = x + "px";
      wrap.style.top = y + "px";
    }
    function savePos() {
      try {
        localStorage.setItem("xhs-picker-pos", JSON.stringify(pos));
      } catch (e) {
      }
    }
    function collapse() {
      elPanel.classList.add("hide");
      elTab.classList.add("show");
      setPos(pos.x, pos.y);
    }
    function expand() {
      elPanel.classList.remove("hide");
      elTab.classList.remove("show");
      setPos(pos.x, pos.y);
    }
    function draggable(handle, onTap) {
      let sx = 0, sy = 0, ox = 0, oy = 0, active = false, moved = false;
      handle.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        if (e.target.closest && e.target.closest(".x")) return;
        active = true;
        moved = false;
        sx = e.clientX;
        sy = e.clientY;
        ox = pos.x;
        oy = pos.y;
        try {
          handle.setPointerCapture(e.pointerId);
        } catch (err) {
        }
        e.preventDefault();
      });
      handle.addEventListener("pointermove", (e) => {
        if (!active) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.abs(dx) + Math.abs(dy) < 4) return;
        moved = true;
        setPos(ox + dx, oy + dy);
      });
      const end = (e) => {
        if (!active) return;
        active = false;
        try {
          handle.releasePointerCapture(e.pointerId);
        } catch (err) {
        }
        if (moved) savePos();
        else if (onTap) onTap();
      };
      handle.addEventListener("pointerup", end);
      handle.addEventListener("pointercancel", end);
    }
    q(".x").addEventListener("click", collapse);
    async function loadBoards(silent) {
      if (!silent) elSel.innerHTML = '<option value="">\u8BFB\u53D6\u4E2D\u2026</option>';
      try {
        state.boards = await fetchBoards();
        renderBoards();
        const last = localStorage.getItem("xhs-picker-board");
        if (last && state.boards.some((b) => b.id === last)) elSel.value = last;
        if (!silent) log("\u4E13\u8F91 " + state.boards.length + " \u4E2A", "ok");
      } catch (e) {
        state.boards = [];
        renderBoards();
        log("\u8BFB\u4E13\u8F91\u5931\u8D25: " + e.message, "er");
      }
    }
    q(".reload").addEventListener("click", () => loadBoards(false));
    q(".test").addEventListener("click", async () => {
      log("--- \u81EA\u68C0 ---", "inf");
      const a1 = cookie("a1");
      log("a1: " + (a1 ? a1.slice(0, 6) + "\u2026 (len " + a1.length + ")" : "\u7F3A\u5931"), a1 ? "inf" : "er");
      const uid = userId();
      log("userId: " + (uid || "\u672A\u53D6\u5230"), uid ? "inf" : "er");
      if (!a1 || !uid) return;
      try {
        await loadBoards(true);
        log("\u63A5\u53E3\u53EF\u7528\uFF0C\u4E13\u8F91 " + state.boards.length + " \u4E2A", "ok");
      } catch (e) {
        log("\u63A5\u53E3\u5931\u8D25: " + e.message, "er");
      }
    });
    q(".all").addEventListener("click", () => {
      const cards = document.querySelectorAll(CFG.CARD);
      for (let i = 0; i < cards.length; i++) {
        const id = noteIdOf(cards[i]);
        if (id && !state.done.has(id)) state.selected.add(id);
        if (id) decorate(cards[i]);
      }
      renderCount();
    });
    q(".clear").addEventListener("click", () => {
      state.selected.clear();
      state.cards.forEach((c, id) => paint(id));
      renderCount();
    });
    q(".stop").addEventListener("click", () => {
      state.cancel = true;
      log("\u5DF2\u8BF7\u6C42\u505C\u6B62\u2026", "inf");
    });
    async function run(ids, label) {
      if (state.running) {
        log("\u6B63\u5728\u8DD1\uFF0C\u5148\u7B49\u7740", "inf");
        return;
      }
      const boardId = elSel.value;
      if (!boardId) {
        log("\u5148\u9009\u4E00\u4E2A\u76EE\u6807\u4E13\u8F91", "er");
        return;
      }
      if (!ids.length) {
        log("\u6CA1\u6709\u52FE\u9009\u4EFB\u4F55\u7B14\u8BB0", "er");
        return;
      }
      state.running = true;
      state.cancel = false;
      btnGo.disabled = true;
      btnStop.disabled = false;
      log("--- " + label + "\uFF1A" + ids.length + " \u7BC7 ---", "inf");
      if (state.recollect) log("\u6A21\u5F0F\uFF1A\u91CD\u65B0\u6536\u85CF\u5E76\u7F6E\u9876\uFF08\u6BCF\u7BC7 3 \u4E2A\u8BF7\u6C42\uFF0C\u4F1A\u6162\u4E00\u4E9B\uFF09", "inf");
      let ok = 0, fail = 0;
      for (let i = 0; i < ids.length; i++) {
        if (state.cancel) {
          log("\u5DF2\u505C\u6B62\uFF0C\u5269\u4F59 " + (ids.length - i) + " \u7BC7\u672A\u5904\u7406", "inf");
          break;
        }
        const nid = ids[i];
        try {
          await classifyOne(nid, boardId, state.recollect);
          ok++;
          state.selected.delete(nid);
          state.done.add(nid);
          paint(nid);
          renderCount();
          log(i + 1 + "/" + ids.length + " " + nid + (state.recollect ? " \u5DF2\u5F52\u7C7B\u5E76\u7F6E\u9876" : " \u5DF2\u5F52\u7C7B"), "ok");
        } catch (e) {
          fail++;
          log(i + 1 + "/" + ids.length + " " + nid + " \u5931\u8D25: " + e.message, "er");
        }
        setProgress(i + 1, ids.length);
        if (i < ids.length - 1) await sleep(CFG.DELAY);
      }
      log("\u5B8C\u6210\uFF1A\u6210\u529F " + ok + "\uFF0C\u5931\u8D25 " + fail, fail ? "er" : "ok");
      state.running = false;
      btnGo.disabled = false;
      btnStop.disabled = true;
      setTimeout(() => setProgress(0, 0), 1200);
    }
    btnGo.addEventListener("click", () => run(Array.from(state.selected), "\u5F00\u59CB\u5F52\u7C7B"));
    document.documentElement.appendChild(host);
    ui.log = log;
    ui.renderCount = renderCount;
    ui.expand = expand;
    ui.panelCollapsed = () => elPanel.classList.contains("hide");
    ui.loadBoards = loadBoards;
    renderCount();
    elTab.classList.add("show");
    let savedPos = null;
    try {
      savedPos = JSON.parse(localStorage.getItem("xhs-picker-pos") || "null");
    } catch (e) {
    }
    if (savedPos && typeof savedPos.x === "number" && typeof savedPos.y === "number") {
      setPos(savedPos.x, savedPos.y);
    } else {
      setPos(innerWidth - 62, 96);
    }
    draggable(elTab, expand);
    draggable(q(".hd"), null);
    window.addEventListener("resize", () => setPos(pos.x, pos.y));
    loadBoards(true);
  }
  var ui = {
    log: () => {
    },
    renderCount: () => {
    },
    expand: () => {
    },
    panelCollapsed: () => true,
    loadBoards: () => {
    }
  };
  function boot() {
    if (document.getElementById("xhs-picker-host")) return;
    buildUI();
    scan();
    const mo = new MutationObserver((muts) => {
      for (let i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes.length) {
          scan();
          return;
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(scan, 1500);
    let last = location.href;
    setInterval(() => {
      if (location.href !== last) {
        last = location.href;
        setTimeout(scan, 400);
      }
    }, 500);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
