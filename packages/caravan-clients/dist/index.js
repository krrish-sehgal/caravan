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
var index_exports = {};
__export(index_exports, {
  BlockchainClient: () => BlockchainClient,
  ClientType: () => ClientType,
  bitcoindImportDescriptors: () => bitcoindImportDescriptors
});
module.exports = __toCommonJS(index_exports);

// src/wallet.ts
var import_bitcoin2 = require("@caravan/bitcoin");

// src/bitcoind.ts
var import_axios = __toESM(require("axios"));
var import_bignumber = __toESM(require("bignumber.js"));
var import_bitcoin = require("@caravan/bitcoin");
async function callBitcoind(url, auth, method, params = []) {
  if (!params) params = [];
  const rpcRequest = {
    jsonrpc: "2.0",
    id: 0,
    // We use a static ID since we're not batching requests
    method: `${method}`,
    params
  };
  try {
    const response = await (0, import_axios.default)(url, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      auth,
      data: rpcRequest
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred during RPC call");
  }
}
function isWalletAddressNotFoundError(e) {
  return e.response && e.response.data && e.response.data.error && e.response.data.error.code === -4;
}
function bitcoindParams(client) {
  const { url, username, password, walletName } = client;
  return {
    url,
    auth: { username, password },
    walletName
  };
}
async function bitcoindEstimateSmartFee({
  url,
  auth,
  numBlocks = 2
  // Default to targeting inclusion within 2 blocks
}) {
  const resp = await callBitcoind(
    url,
    auth,
    "estimatesmartfee",
    [numBlocks]
  );
  const feeRate = resp.result.feerate;
  return Math.ceil(feeRate * 1e5);
}
async function bitcoindSendRawTransaction({
  url,
  auth,
  hex
}) {
  try {
    const resp = await callBitcoind(url, auth, "sendrawtransaction", [
      hex
    ]);
    return resp.result;
  } catch (e) {
    console.log("send tx error", e);
    throw e.response && e.response.data.error.message || e;
  }
}
async function bitcoindRawTxData({
  url,
  auth,
  txid
}) {
  try {
    const response = await callBitcoind(url, auth, "getrawtransaction", [
      txid,
      true
    ]);
    return response.result;
  } catch (error) {
    throw new Error(
      `Failed to get raw transaction data :  ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// src/wallet.ts
var import_bignumber2 = __toESM(require("bignumber.js"));
var BitcoindWalletClientError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "BitcoindWalletClientError";
  }
};
function callBitcoindWallet({
  baseUrl,
  walletName,
  auth,
  method,
  params
}) {
  const url = new URL(baseUrl);
  if (walletName)
    url.pathname = url.pathname.replace(/\/$/, "") + `/wallet/${walletName}`;
  return callBitcoind(url.toString(), auth, method, params);
}
function bitcoindWalletInfo({
  url,
  auth,
  walletName
}) {
  return callBitcoindWallet({
    baseUrl: url,
    walletName,
    auth,
    method: "getwalletinfo"
  });
}
function bitcoindImportDescriptors({
  url,
  auth,
  walletName,
  receive,
  change,
  rescan
}) {
  const descriptors = [
    {
      desc: receive,
      internal: false
    },
    {
      desc: change,
      internal: true
    }
  ].map((d) => {
    return {
      ...d,
      range: [0, 1005],
      timestamp: rescan ? 0 : "now",
      watchonly: true,
      active: true
    };
  });
  return callBitcoindWallet({
    baseUrl: url,
    walletName,
    auth,
    method: "importdescriptors",
    params: [descriptors]
  });
}
async function bitcoindGetAddressStatus({
  url,
  auth,
  walletName,
  address
}) {
  try {
    const resp = await callBitcoindWallet({
      baseUrl: url,
      walletName,
      auth,
      method: "getreceivedbyaddress",
      params: [address]
    });
    if (typeof resp?.result === "undefined") {
      throw new BitcoindWalletClientError(
        `Error: invalid response from ${url}`
      );
    }
    return {
      used: resp?.result > 0
    };
  } catch (e) {
    const error = e;
    if (isWalletAddressNotFoundError(error))
      console.warn(
        `Address ${address} not found in bitcoind's wallet. Query failed.`
      );
    else console.error(error.message);
    return e;
  }
}
async function bitcoindListUnspent({
  url,
  auth,
  walletName,
  address,
  addresses
}) {
  try {
    const addressParam = addresses || [address];
    const resp = await callBitcoindWallet({
      baseUrl: url,
      auth,
      walletName,
      method: "listunspent",
      params: { minconf: 0, maxconf: 9999999, addresses: addressParam }
    });
    const promises = [];
    resp.result.forEach((utxo) => {
      promises.push(
        callBitcoindWallet({
          baseUrl: url,
          walletName,
          auth,
          method: "gettransaction",
          params: { txid: utxo.txid }
        })
      );
    });
    const previousTransactions = await Promise.all(promises);
    return resp.result.map((utxo, mapindex) => {
      const amount = new import_bignumber2.default(utxo.amount);
      return {
        confirmed: (utxo.confirmations || 0) > 0,
        txid: utxo.txid,
        index: utxo.vout,
        amount: amount.toFixed(8),
        amountSats: (0, import_bitcoin2.bitcoinsToSatoshis)(amount.toString()),
        transactionHex: previousTransactions[mapindex].result.hex,
        time: previousTransactions[mapindex].result.blocktime
      };
    });
  } catch (e) {
    console.error("There was a problem:", e.message);
    throw e;
  }
}
async function bitcoindGetWalletTransaction({
  url,
  auth,
  walletName,
  txid,
  includeWatchonly = true,
  verbose = true
}) {
  try {
    const response = await callBitcoindWallet({
      baseUrl: url,
      walletName,
      auth,
      method: "gettransaction",
      params: [txid, includeWatchonly, verbose]
    });
    if (typeof response?.result === "undefined") {
      throw new BitcoindWalletClientError(
        `Error: invalid response from ${url} for transaction ${txid}`
      );
    }
    return response.result;
  } catch (e) {
    console.error("Error getting wallet transaction:", e.message);
    throw e;
  }
}

// src/client.ts
var import_axios2 = __toESM(require("axios"));
var import_bitcoin3 = require("@caravan/bitcoin");
var import_bignumber3 = __toESM(require("bignumber.js"));
var BlockchainClientError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "BlockchainClientError";
  }
};
var ClientType = /* @__PURE__ */ ((ClientType2) => {
  ClientType2["PRIVATE"] = "private";
  ClientType2["BLOCKSTREAM"] = "blockstream";
  ClientType2["MEMPOOL"] = "mempool";
  return ClientType2;
})(ClientType || {});
var delay = () => {
  return new Promise((resolve) => setTimeout(resolve, 500));
};
function transformWalletTransactionToRawTransactionData(walletTx) {
  if (!walletTx.decoded) {
    throw new Error(
      "Transaction decoded data is missing. Make sure verbose=true was passed to gettransaction."
    );
  }
  const feeSats = Math.abs(walletTx.fee || 0) * 1e8;
  const category = walletTx.details && walletTx.details.length > 0 ? walletTx.details[0]["category"] : "unknown";
  return {
    txid: walletTx.txid,
    version: walletTx.decoded.version,
    locktime: walletTx.decoded.locktime,
    size: walletTx.decoded.size,
    vsize: walletTx.decoded.vsize,
    weight: walletTx.decoded.weight,
    category,
    fee: feeSats,
    // Convert from BTC to satoshis
    vin: walletTx.decoded.vin.map((input) => ({
      txid: input.txid,
      vout: input.vout,
      sequence: input.sequence
    })),
    vout: walletTx.decoded.vout.map((output) => ({
      value: output.value,
      scriptpubkey: output.scriptPubKey.hex,
      scriptpubkey_address: output.scriptPubKey.address
    })),
    confirmations: walletTx.confirmations,
    blockhash: walletTx.blockhash,
    blocktime: walletTx.blocktime,
    status: {
      confirmed: (walletTx.confirmations || 0) > 0,
      block_height: walletTx.blockheight,
      block_hash: walletTx.blockhash,
      block_time: walletTx.blocktime
    },
    hex: walletTx.hex
  };
}
function normalizeTransactionData(txData, clientType) {
  const isReceived = txData.category === "receive" || false;
  return {
    txid: txData.txid,
    version: txData.version,
    locktime: txData.locktime,
    vin: txData.vin.map((input) => ({
      txid: input.txid,
      vout: input.vout,
      sequence: input.sequence
    })),
    vout: txData.vout.map((output) => ({
      value: clientType === "private" /* PRIVATE */ ? output.value : (0, import_bitcoin3.satoshisToBitcoins)(output.value),
      scriptPubkey: output.scriptpubkey,
      scriptPubkeyAddress: output.scriptpubkey_address
    })),
    size: txData.size,
    // add the vsize property to the returned object if txData.vsize is defined
    ...txData.vsize !== void 0 && { vsize: txData.vsize },
    // add the category property to the returned object if txData.category is defined ( For Private clients)
    ...isReceived !== void 0 && { isReceived },
    weight: txData.weight,
    fee: clientType === "private" /* PRIVATE */ ? txData.fee || 0 : txData.fee,
    status: {
      confirmed: txData.status?.confirmed ?? txData.confirmations > 0,
      blockHeight: txData.status?.block_height ?? void 0,
      blockHash: txData.status?.block_hash ?? txData.blockhash,
      blockTime: txData.status?.block_time ?? txData.blocktime
    }
  };
}
var ClientBase = class {
  throttled;
  host;
  constructor(throttled, host) {
    this.throttled = throttled;
    this.host = host;
  }
  async throttle() {
    if (this.throttled) {
      await delay();
    }
  }
  async Request(method, path, data) {
    await this.throttle();
    try {
      const response = await import_axios2.default.request({
        method,
        url: this.host + path,
        data,
        withCredentials: false,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      return response.data;
    } catch (e) {
      throw e.response && e.response.data || e;
    }
  }
  async Get(path) {
    return this.Request("GET", path);
  }
  async Post(path, data) {
    return this.Request("POST", path, data);
  }
};
var BlockchainClient = class extends ClientBase {
  type;
  network;
  bitcoindParams;
  constructor({
    type,
    network,
    throttled = false,
    client = {
      url: "",
      username: "",
      password: "",
      walletName: ""
    }
  }) {
    if (type !== "private" /* PRIVATE */ && network !== import_bitcoin3.Network.MAINNET && network !== import_bitcoin3.Network.TESTNET && network !== import_bitcoin3.Network.SIGNET) {
      throw new Error("Invalid network");
    }
    if (type !== "mempool" /* MEMPOOL */ && network === import_bitcoin3.Network.SIGNET) {
      throw new Error("Invalid network");
    }
    let host = "";
    if (type === "blockstream" /* BLOCKSTREAM */) {
      host = "https://blockstream.info";
    } else if (type === "mempool" /* MEMPOOL */) {
      host = "https://unchained.mempool.space";
    }
    if (type !== "private" /* PRIVATE */ && network !== import_bitcoin3.Network.MAINNET) {
      host += `/${network}`;
    }
    if (type !== "private" /* PRIVATE */) {
      host += "/api";
    }
    super(throttled, host);
    this.network = network;
    this.type = type;
    this.bitcoindParams = bitcoindParams(client);
  }
  async getAddressUtxos(address) {
    try {
      if (this.type === "private" /* PRIVATE */) {
        return bitcoindListUnspent({
          address,
          ...this.bitcoindParams
        });
      }
      return await this.Get(`/address/${address}/utxo`);
    } catch (error) {
      throw new Error(
        `Failed to get UTXOs for address ${address}: ${error.message}`
      );
    }
  }
  async getAddressTransactions(address) {
    try {
      if (this.type === "private" /* PRIVATE */) {
        const data2 = await callBitcoind(
          this.bitcoindParams.url,
          this.bitcoindParams.auth,
          "listtransactions",
          [this.bitcoindParams.walletName]
        );
        const txs2 = [];
        for (const tx of data2.result) {
          if (tx.address === address) {
            const rawTxData = await bitcoindRawTxData({
              url: this.bitcoindParams.url,
              auth: this.bitcoindParams.auth,
              txid: tx.txid
            });
            const transaction = {
              txid: tx.txid,
              vin: [],
              vout: [],
              size: rawTxData.size,
              weight: rawTxData.weight,
              fee: tx.fee,
              isSend: tx.category === "send" ? true : false,
              amount: tx.amount,
              block_time: tx.blocktime
            };
            for (const input of rawTxData.vin) {
              transaction.vin.push({
                prevTxId: input.txid,
                vout: input.vout,
                sequence: input.sequence
              });
            }
            for (const output of rawTxData.vout) {
              transaction.vout.push({
                scriptPubkeyHex: output.scriptPubKey.hex,
                scriptPubkeyAddress: output.scriptPubKey.address,
                value: output.value
              });
            }
            txs2.push(transaction);
          }
        }
        return txs2;
      }
      const data = await this.Get(`/address/${address}/txs`);
      const txs = [];
      for (const tx of data.txs) {
        const transaction = {
          txid: tx.txid,
          vin: [],
          vout: [],
          size: tx.size,
          weight: tx.weight,
          fee: tx.fee,
          isSend: false,
          amount: 0,
          block_time: tx.status.block_time
        };
        for (const input of tx.vin) {
          if (input.prevout.scriptpubkey_address === address) {
            transaction.isSend = true;
          }
          transaction.vin.push({
            prevTxId: input.txid,
            vout: input.vout,
            sequence: input.sequence
          });
        }
        let total_amount = 0;
        for (const output of tx.vout) {
          total_amount += output.value;
          transaction.vout.push({
            scriptPubkeyHex: output.scriptpubkey,
            scriptPubkeyAddress: output.scriptpubkey_address,
            value: output.value
          });
        }
        transaction.amount = total_amount;
        txs.push(transaction);
      }
      return txs;
    } catch (error) {
      throw new Error(
        `Failed to get transactions for address ${address}: ${error.message}`
      );
    }
  }
  async broadcastTransaction(rawTx) {
    try {
      if (this.type === "private" /* PRIVATE */) {
        return bitcoindSendRawTransaction({
          hex: rawTx,
          ...this.bitcoindParams
        });
      }
      return await this.Post(`/tx`, rawTx);
    } catch (error) {
      throw new Error(`Failed to broadcast transaction: ${error.message}`);
    }
  }
  async formatUtxo(utxo) {
    const transactionHex = await this.getTransactionHex(utxo.txid);
    const amount = new import_bignumber3.default(utxo.value);
    return {
      confirmed: utxo.status.confirmed,
      txid: utxo.txid,
      index: utxo.vout,
      amount: (0, import_bitcoin3.satoshisToBitcoins)(utxo.value),
      amountSats: amount,
      transactionHex,
      time: utxo.status.block_time
    };
  }
  async fetchAddressUtxos(address) {
    let unsortedUTXOs;
    let updates = {
      utxos: [],
      balanceSats: (0, import_bignumber3.default)(0),
      addressKnown: true,
      fetchedUTXOs: false,
      fetchUTXOsError: ""
    };
    try {
      if (this.type === "private" /* PRIVATE */) {
        unsortedUTXOs = await bitcoindListUnspent({
          ...this.bitcoindParams,
          address
        });
      } else {
        const utxos2 = await this.Get(`/address/${address}/utxo`);
        unsortedUTXOs = await Promise.all(
          utxos2.map(async (utxo) => await this.formatUtxo(utxo))
        );
      }
    } catch (error) {
      if (this.type === "private" && isWalletAddressNotFoundError(error)) {
        updates = {
          utxos: [],
          balanceSats: (0, import_bignumber3.default)(0),
          addressKnown: false,
          fetchedUTXOs: true,
          fetchUTXOsError: ""
        };
      } else {
        updates = { ...updates, fetchUTXOsError: error.toString() };
      }
    }
    if (!unsortedUTXOs) return updates;
    const utxos = (0, import_bitcoin3.sortInputs)(unsortedUTXOs);
    const balanceSats = utxos.map((utxo) => utxo.amountSats).reduce(
      (accumulator, currentValue) => accumulator.plus(currentValue),
      new import_bignumber3.default(0)
    );
    return {
      ...updates,
      balanceSats,
      utxos,
      fetchedUTXOs: true,
      fetchUTXOsError: ""
    };
  }
  async getAddressStatus(address) {
    try {
      if (this.type === "private" /* PRIVATE */) {
        return await bitcoindGetAddressStatus({
          address,
          ...this.bitcoindParams
        });
      }
      const addressData = await this.Get(`/address/${address}`);
      return {
        used: addressData.chain_stats.funded_txo_count > 0 || addressData.mempool_stats.funded_txo_count > 0
      };
    } catch (error) {
      throw new Error(
        `Failed to get status for address ${address}: ${error.message}`
      );
    }
  }
  async getFeeEstimate(blocks = 3) {
    let fees;
    try {
      switch (this.type) {
        case "private" /* PRIVATE */:
          return bitcoindEstimateSmartFee({
            numBlocks: +blocks,
            ...this.bitcoindParams
          });
        case "blockstream" /* BLOCKSTREAM */:
          fees = await this.Get(`/fee-estimates`);
          return fees[blocks];
        case "mempool" /* MEMPOOL */:
          fees = await this.Get("/v1/fees/recommended");
          if (blocks === 1) {
            return fees.fastestFee;
          } else if (blocks <= 3) {
            return fees.halfHourFee;
          } else if (blocks <= 6) {
            return fees.hourFee;
          } else {
            return fees.economyFee;
          }
        default:
          throw new Error("Invalid client type");
      }
    } catch (error) {
      throw new Error(`Failed to get fee estimate: ${error.message}`);
    }
  }
  async getBlockFeeRatePercentileHistory() {
    try {
      if (this.type === "private" /* PRIVATE */ || this.type === "blockstream" /* BLOCKSTREAM */) {
        throw new Error(
          "Not supported for private clients and blockstream. Currently only supported for mempool"
        );
      }
      const data = await this.Get(`/v1/mining/blocks/fee-rates/all`);
      const feeRatePercentileBlocks = [];
      for (const block of data) {
        const feeRatePercentile = {
          avgHeight: block?.avgHeight,
          timestamp: block?.timestamp,
          avgFee_0: block?.avgFee_0,
          avgFee_10: block?.avgFee_10,
          avgFee_25: block?.avgFee_25,
          avgFee_50: block?.avgFee_50,
          avgFee_75: block?.avgFee_75,
          avgFee_90: block?.avgFee_90,
          avgFee_100: block?.avgFee_100
        };
        feeRatePercentileBlocks.push(feeRatePercentile);
      }
      return feeRatePercentileBlocks;
    } catch (error) {
      throw new Error(
        `Failed to get feerate percentile block: ${error.message}`
      );
    }
  }
  async getTransactionHex(txid) {
    try {
      if (this.type === "private" /* PRIVATE */) {
        return await callBitcoind(
          this.bitcoindParams.url,
          this.bitcoindParams.auth,
          "gettransaction",
          [txid]
        );
      }
      return await this.Get(`/tx/${txid}/hex`);
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }
  /**
   * Gets detailed information about a wallet transaction including fee information
   *
   * This method is specifically for transactions that are tracked by the wallet,
   * and provides fee information that isn't available in the general getTransaction
   * method. This is especially useful for private nodes where fee information is
   * critical for UI display.
   *
   * @see https://developer.bitcoin.org/reference/rpc/gettransaction.html
   *
   * @param txid - Transaction ID to retrieve
   * @returns Normalized transaction details with fee information
   */
  async getWalletTransaction(txid) {
    if (this.type !== "private" /* PRIVATE */) {
      throw new BlockchainClientError(
        "Wallet transactions are only available for private Bitcoin nodes"
      );
    }
    if (!this.bitcoindParams.walletName) {
      throw new BlockchainClientError(
        "Wallet name is required for wallet transaction lookups"
      );
    }
    try {
      const walletTxData = await bitcoindGetWalletTransaction({
        url: this.bitcoindParams.url,
        auth: this.bitcoindParams.auth,
        walletName: this.bitcoindParams.walletName,
        txid
      });
      const normalizedTxData = transformWalletTransactionToRawTransactionData(walletTxData);
      return normalizeTransactionData(normalizedTxData, this.type);
    } catch (error) {
      throw new Error(`Failed to get wallet transaction: ${error.message}`);
    }
  }
  async getTransaction(txid, forceRawTx = false) {
    try {
      let txData;
      if (this.type === "private" /* PRIVATE */) {
        if (!forceRawTx && this.bitcoindParams.walletName) {
          try {
            return await this.getWalletTransaction(txid);
          } catch (walletError) {
            console.warn(
              `Wallet transaction lookup failed, falling back to raw transaction: ${walletError.message}`
            );
          }
        }
        const response = await bitcoindRawTxData({
          url: this.bitcoindParams.url,
          auth: this.bitcoindParams.auth,
          txid
        });
        txData = response;
      } else if (this.type === "blockstream" /* BLOCKSTREAM */ || this.type === "mempool" /* MEMPOOL */) {
        txData = await this.Get(`/tx/${txid}`);
      } else {
        throw new Error("Invalid client type");
      }
      return normalizeTransactionData(txData, this.type);
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }
  async importDescriptors({
    receive,
    change,
    rescan
  }) {
    if (this.type !== "private" /* PRIVATE */) {
      throw new BlockchainClientError(
        "Only private clients support descriptor importing"
      );
    }
    return await bitcoindImportDescriptors({
      receive,
      change,
      rescan,
      ...this.bitcoindParams
    });
  }
  async getWalletInfo() {
    if (this.type !== "private" /* PRIVATE */) {
      throw new BlockchainClientError(
        "Only private clients support wallet info"
      );
    }
    return await bitcoindWalletInfo({ ...this.bitcoindParams });
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BlockchainClient,
  ClientType,
  bitcoindImportDescriptors
});
