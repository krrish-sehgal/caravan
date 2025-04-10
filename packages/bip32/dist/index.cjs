"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  combineBip32Paths: () => combineBip32Paths,
  getBlindedXpub: () => getBlindedXpub,
  getMaskedKeyOrigin: () => getMaskedKeyOrigin,
  getRandomChildXpub: () => getRandomChildXpub,
  getUnmaskedPath: () => getUnmaskedPath,
  isValidChildPubKey: () => isValidChildPubKey,
  secureSecretPath: () => secureSecretPath,
  setXpubNetwork: () => setXpubNetwork
});
module.exports = __toCommonJS(src_exports);

// src/paths.ts
var import_bitcoin = require("@caravan/bitcoin");

// src/utils.ts
var import_buffer2 = require("buffer");
var import_crypto = __toESM(require("crypto"), 1);
var DEFAULT_MAX = 2 ** 31 - 1;
var secureRandomInt = (min = 0, max = DEFAULT_MAX) => {
  if (typeof min !== "number" || typeof max !== "number") {
    throw new TypeError("Arguments must be numbers");
  }
  if (min > max) {
    throw new RangeError("Min should not be greater than max");
  }
  let getCrypto;
  if (typeof import_crypto.default !== "undefined" && import_crypto.default.getRandomValues) {
    getCrypto = import_crypto.default.getRandomValues;
  } else if (typeof import_crypto.default.randomFillSync !== "undefined") {
    getCrypto = import_crypto.default.randomFillSync;
  } else {
    throw new Error("Crypto not available in this environment");
  }
  const buffer = import_buffer2.Buffer.alloc(4);
  getCrypto(buffer);
  const randomValue = buffer.readUInt32BE(0);
  return min + randomValue % (max - min + 1);
};

// src/paths.ts
var secureSecretPath = (depth = 4) => {
  if (!Number.isInteger(depth)) {
    throw new Error(`depth must be an int: ${depth}`);
  }
  if (depth >= 32) {
    throw new Error(
      `BIP32 requires depth < 256, but this function will not allow you to go anywhere near this high: ${depth}`
    );
  }
  if (depth < 1) {
    throw new Error(`Depth must be > 0: ${depth}`);
  }
  const toReturn = ["m"];
  for (let i = 0; i < depth; i++) {
    const randInt = secureRandomInt();
    toReturn.push(randInt.toString());
  }
  return toReturn.join("/");
};
var combineBip32Paths = (firstPath, secondPath) => {
  let modifiedFirstPath = firstPath.toLowerCase().trim().replace("//", "/");
  if (modifiedFirstPath.endsWith("/")) {
    modifiedFirstPath = modifiedFirstPath.slice(0, -1);
  }
  let modifiedSecondPath = secondPath.toLowerCase().trim().replace("//", "/");
  if (modifiedSecondPath.endsWith("/")) {
    modifiedSecondPath = modifiedSecondPath.slice(0, -1);
  }
  if (modifiedFirstPath === "m") {
    return modifiedSecondPath;
  }
  if (modifiedSecondPath === "m") {
    return modifiedFirstPath;
  }
  modifiedSecondPath = modifiedSecondPath.slice(2);
  const combined = `${modifiedFirstPath}/${modifiedSecondPath}`;
  if ((0, import_bitcoin.validateBIP32Path)(combined)) {
    throw new Error(
      `Invalid bip32 path: ${combined}: ${firstPath} ${secondPath}`
    );
  }
  return combined;
};
var getRelativeBip32Sequence = (parentPath, childPath) => {
  const parentSequence = (0, import_bitcoin.bip32PathToSequence)(parentPath);
  const childSequence = (0, import_bitcoin.bip32PathToSequence)(childPath);
  const difference = childSequence.length - parentSequence.length;
  if (difference < 0) {
    throw new Error(
      `Child key shorter than parent: Parent: ${parentPath}, Child: ${childPath}`
    );
  }
  return childSequence.slice(-difference);
};
var getUnmaskedPath = (derivation, globalXpub) => {
  const globalSequence = (0, import_bitcoin.bip32PathToSequence)(globalXpub.bip32Path);
  const lastElements = getRelativeBip32Sequence(
    globalXpub.bip32Path,
    derivation.path
  );
  return (0, import_bitcoin.bip32SequenceToPath)(globalSequence.concat(lastElements));
};

// src/keys.ts
var import_bitcoin2 = require("@caravan/bitcoin");
var isValidChildPubKey = (derivation, globalXpub, network = import_bitcoin2.Network.MAINNET) => {
  const lastElements = getRelativeBip32Sequence(
    globalXpub.bip32Path,
    derivation.path
  );
  const relativePath = (0, import_bitcoin2.bip32SequenceToPath)(lastElements);
  const childPubkey = (0, import_bitcoin2.deriveChildPublicKey)(
    globalXpub.xpub,
    relativePath,
    network
  );
  return childPubkey === derivation.pubkey.toString("hex");
};
var setXpubNetwork = (xpub, network) => {
  if (!network)
    return xpub;
  const xpubObj = import_bitcoin2.ExtendedPublicKey.fromBase58(xpub);
  xpubObj.setNetwork(network);
  return xpubObj.toBase58();
};
var getMaskedKeyOrigin = (xpub) => {
  const { parentFingerprint, depth } = import_bitcoin2.ExtendedPublicKey.fromBase58(xpub);
  if (!parentFingerprint || !depth)
    throw new Error("Parent fingerprint or depth not found from xpub");
  return {
    xpub,
    bip32Path: `m${"/0".repeat(depth)}`,
    rootFingerprint: parentFingerprint.toString(16)
    // Convert parentFingerprint to hexadecimal string
  };
};
var getRandomChildXpub = (sourceOrigin, depth = 4, network = import_bitcoin2.Network.MAINNET) => {
  const randomPath = secureSecretPath(depth);
  const childXpub = (0, import_bitcoin2.deriveChildExtendedPublicKey)(
    setXpubNetwork(sourceOrigin.xpub, network),
    randomPath,
    network
  );
  const childPath = combineBip32Paths(sourceOrigin.bip32Path, randomPath);
  return {
    xpub: childXpub,
    bip32Path: childPath,
    rootFingerprint: sourceOrigin.rootFingerprint
  };
};
var getBlindedXpub = (rawXpub) => {
  const xpub = import_bitcoin2.ExtendedPublicKey.fromBase58(rawXpub);
  if (!xpub.depth)
    throw new Error("Depth not found from xpub");
  const secretPath = secureSecretPath(4);
  const network = (0, import_bitcoin2.getNetworkFromPrefix)(rawXpub.slice(0, 4));
  const newKey = (0, import_bitcoin2.deriveChildExtendedPublicKey)(rawXpub, secretPath, network);
  return {
    xpub: newKey,
    bip32Path: `*/${secretPath.split("/").slice(1).join("/")}`,
    rootFingerprint: xpub?.parentFingerprint?.toString(16) || ""
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  combineBip32Paths,
  getBlindedXpub,
  getMaskedKeyOrigin,
  getRandomChildXpub,
  getUnmaskedPath,
  isValidChildPubKey,
  secureSecretPath,
  setXpubNetwork
});
