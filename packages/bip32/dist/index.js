// src/paths.ts
import {
  bip32PathToSequence,
  bip32SequenceToPath,
  validateBIP32Path
} from "@caravan/bitcoin";

// src/utils.ts
import { Buffer } from "buffer";
import crypto from "crypto";
var DEFAULT_MAX = 2 ** 31 - 1;
var secureRandomInt = (min = 0, max = DEFAULT_MAX) => {
  if (typeof min !== "number" || typeof max !== "number") {
    throw new TypeError("Arguments must be numbers");
  }
  if (min > max) {
    throw new RangeError("Min should not be greater than max");
  }
  let getCrypto;
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    getCrypto = crypto.getRandomValues;
  } else if (typeof crypto.randomFillSync !== "undefined") {
    getCrypto = crypto.randomFillSync;
  } else {
    throw new Error("Crypto not available in this environment");
  }
  const buffer = Buffer.alloc(4);
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
  if (validateBIP32Path(combined)) {
    throw new Error(
      `Invalid bip32 path: ${combined}: ${firstPath} ${secondPath}`
    );
  }
  return combined;
};
var getRelativeBip32Sequence = (parentPath, childPath) => {
  const parentSequence = bip32PathToSequence(parentPath);
  const childSequence = bip32PathToSequence(childPath);
  const difference = childSequence.length - parentSequence.length;
  if (difference < 0) {
    throw new Error(
      `Child key shorter than parent: Parent: ${parentPath}, Child: ${childPath}`
    );
  }
  return childSequence.slice(-difference);
};
var getUnmaskedPath = (derivation, globalXpub) => {
  const globalSequence = bip32PathToSequence(globalXpub.bip32Path);
  const lastElements = getRelativeBip32Sequence(
    globalXpub.bip32Path,
    derivation.path
  );
  return bip32SequenceToPath(globalSequence.concat(lastElements));
};

// src/keys.ts
import {
  ExtendedPublicKey,
  Network,
  bip32SequenceToPath as bip32SequenceToPath2,
  deriveChildExtendedPublicKey,
  deriveChildPublicKey,
  getNetworkFromPrefix
} from "@caravan/bitcoin";
var isValidChildPubKey = (derivation, globalXpub, network = Network.MAINNET) => {
  const lastElements = getRelativeBip32Sequence(
    globalXpub.bip32Path,
    derivation.path
  );
  const relativePath = bip32SequenceToPath2(lastElements);
  const childPubkey = deriveChildPublicKey(
    globalXpub.xpub,
    relativePath,
    network
  );
  return childPubkey === derivation.pubkey.toString("hex");
};
var setXpubNetwork = (xpub, network) => {
  if (!network)
    return xpub;
  const xpubObj = ExtendedPublicKey.fromBase58(xpub);
  xpubObj.setNetwork(network);
  return xpubObj.toBase58();
};
var getMaskedKeyOrigin = (xpub) => {
  const { parentFingerprint, depth } = ExtendedPublicKey.fromBase58(xpub);
  if (!parentFingerprint || !depth)
    throw new Error("Parent fingerprint or depth not found from xpub");
  return {
    xpub,
    bip32Path: `m${"/0".repeat(depth)}`,
    rootFingerprint: parentFingerprint.toString(16)
    // Convert parentFingerprint to hexadecimal string
  };
};
var getRandomChildXpub = (sourceOrigin, depth = 4, network = Network.MAINNET) => {
  const randomPath = secureSecretPath(depth);
  const childXpub = deriveChildExtendedPublicKey(
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
  const xpub = ExtendedPublicKey.fromBase58(rawXpub);
  if (!xpub.depth)
    throw new Error("Depth not found from xpub");
  const secretPath = secureSecretPath(4);
  const network = getNetworkFromPrefix(rawXpub.slice(0, 4));
  const newKey = deriveChildExtendedPublicKey(rawXpub, secretPath, network);
  return {
    xpub: newKey,
    bip32Path: `*/${secretPath.split("/").slice(1).join("/")}`,
    rootFingerprint: xpub?.parentFingerprint?.toString(16) || ""
  };
};
export {
  combineBip32Paths,
  getBlindedXpub,
  getMaskedKeyOrigin,
  getRandomChildXpub,
  getUnmaskedPath,
  isValidChildPubKey,
  secureSecretPath,
  setXpubNetwork
};
