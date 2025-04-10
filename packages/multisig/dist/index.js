"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  braidDetailsToWalletConfig: () => braidDetailsToWalletConfig
});
module.exports = __toCommonJS(index_exports);

// src/utils.ts
var braidDetailsToWalletConfig = (braidDetails) => {
  return {
    network: braidDetails.network,
    extendedPublicKeys: braidDetails.extendedPublicKeys.map((key) => ({
      xpub: key.base58String,
      bip32Path: key.path,
      xfp: key.rootFingerprint
    })),
    quorum: {
      requiredSigners: braidDetails.requiredSigners,
      totalSigners: braidDetails.extendedPublicKeys.length
    },
    name: `${braidDetails.requiredSigners}-of-${braidDetails.extendedPublicKeys.length} ${braidDetails.addressType} ${braidDetails.network} wallet`,
    addressType: braidDetails.addressType
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  braidDetailsToWalletConfig
});
