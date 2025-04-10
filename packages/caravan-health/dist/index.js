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
var src_exports = {};
__export(src_exports, {
  Network: () => import_bitcoin.Network,
  PrivacyMetrics: () => PrivacyMetrics,
  SpendType: () => SpendType,
  WalletMetrics: () => WalletMetrics,
  WasteMetrics: () => WasteMetrics
});
module.exports = __toCommonJS(src_exports);

// src/privacy.ts
var import_bitcoin2 = require("@caravan/bitcoin");

// src/types.ts
var import_bitcoin = require("@caravan/bitcoin");
var SpendType = /* @__PURE__ */ ((SpendType2) => {
  SpendType2["PerfectSpend"] = "PerfectSpend";
  SpendType2["SimpleSpend"] = "SimpleSpend";
  SpendType2["UTXOFragmentation"] = "UTXOFragmentation";
  SpendType2["Consolidation"] = "Consolidation";
  SpendType2["MixingOrCoinJoin"] = "MixingOrCoinJoin";
  return SpendType2;
})(SpendType || {});

// src/spendType.ts
function determineSpendType(inputs, outputs) {
  if (outputs == 1) {
    if (inputs == 1) {
      return "PerfectSpend" /* PerfectSpend */;
    } else {
      return "Consolidation" /* Consolidation */;
    }
  } else if (outputs == 2) {
    return "SimpleSpend" /* SimpleSpend */;
  } else {
    if (inputs < outputs) {
      return "UTXOFragmentation" /* UTXOFragmentation */;
    } else {
      return "MixingOrCoinJoin" /* MixingOrCoinJoin */;
    }
  }
}
function getSpendTypeScore(numberOfInputs, numberOfOutputs) {
  const spendType = determineSpendType(numberOfInputs, numberOfOutputs);
  switch (spendType) {
    case "PerfectSpend" /* PerfectSpend */:
      return 1 / 2;
    case "SimpleSpend" /* SimpleSpend */:
      return 4 / 9;
    case "UTXOFragmentation" /* UTXOFragmentation */:
      return 2 / 3 - 1 / numberOfOutputs;
    case "Consolidation" /* Consolidation */:
      return 1 / numberOfInputs;
    case "MixingOrCoinJoin" /* MixingOrCoinJoin */: {
      const x = Math.pow(numberOfOutputs, 2) / numberOfInputs;
      return 1 / 2 * x / (1 + x);
    }
    default:
      throw new Error("Invalid spend type");
  }
}

// src/wallet.ts
var WalletMetrics = class {
  addressUsageMap = /* @__PURE__ */ new Map();
  transactions = [];
  utxos = {};
  constructor(transactions, utxos) {
    if (transactions) {
      this.transactions = transactions;
      this.addressUsageMap = this.constructAddressUsageMap();
    }
    if (utxos) {
      this.utxos = utxos;
    }
  }
  /*
      Name : UTXO Mass Factor
  
      Calculation :
        The mass factor is calculated based on the number of UTXOs in the set.
  
      Expected Range : [0,1]
      - 0 for UTXO set length >= 50
      - 0.25 for UTXO set length >= 25 and <= 49
      - 0.5 for UTXO set length >= 15 and <= 24
      - 0.75 for UTXO set length >= 5 and <= 14
      - 1 for UTXO set length < 5
    */
  utxoMassFactor() {
    let utxoSetLength = 0;
    const utxos = this.utxos;
    for (const address in utxos) {
      const addressUtxos = utxos[address];
      utxoSetLength += addressUtxos.length;
    }
    let utxoMassFactor;
    if (utxoSetLength >= 50) {
      utxoMassFactor = 0;
    } else if (utxoSetLength >= 25 && utxoSetLength <= 49) {
      utxoMassFactor = 0.25;
    } else if (utxoSetLength >= 15 && utxoSetLength <= 24) {
      utxoMassFactor = 0.5;
    } else if (utxoSetLength >= 5 && utxoSetLength <= 14) {
      utxoMassFactor = 0.75;
    } else {
      utxoMassFactor = 1;
    }
    return utxoMassFactor;
  }
  /*
    Utility function that helps to obtain the fee rate of the transaction
  */
  getFeeRateForTransaction(transaction) {
    const fees = transaction.fee;
    const weight = transaction.weight;
    return fees / weight;
  }
  /*
    Utility function that helps to obtain the percentile of the fees paid by user in tx block
  */
  getFeeRatePercentileScore(timestamp, feeRate, feeRatePercentileHistory) {
    const percentile = this.getClosestPercentile(
      timestamp,
      feeRate,
      feeRatePercentileHistory
    );
    return 1 - percentile / 100;
  }
  /*
    Utility function that helps to obtain the closest percentile of the fees paid by user in tx block
  */
  getClosestPercentile(timestamp, feeRate, feeRatePercentileHistory) {
    let closestBlock = null;
    let closestDifference = Infinity;
    for (const block of feeRatePercentileHistory) {
      const difference = Math.abs(block.timestamp - timestamp);
      if (difference <= closestDifference) {
        closestDifference = difference;
        closestBlock = block;
      }
    }
    if (!closestBlock) {
      throw new Error("No fee rate data found");
    }
    switch (true) {
      case feeRate <= closestBlock.avgFee_0:
        return 0;
      case feeRate <= closestBlock.avgFee_10:
        return 10;
      case feeRate <= closestBlock.avgFee_25:
        return 25;
      case feeRate <= closestBlock.avgFee_50:
        return 50;
      case feeRate <= closestBlock.avgFee_75:
        return 75;
      case feeRate <= closestBlock.avgFee_90:
        return 90;
      case feeRate <= closestBlock.avgFee_100:
        return 100;
      default:
        throw new Error("Invalid fee rate");
    }
  }
  constructAddressUsageMap() {
    const addressUsageMap = /* @__PURE__ */ new Map();
    const transactions = this.transactions;
    for (const tx of transactions) {
      for (const output of tx.vout) {
        const address = output.scriptPubkeyAddress;
        if (addressUsageMap.has(address)) {
          addressUsageMap.set(address, addressUsageMap.get(address) + 1);
        } else {
          addressUsageMap.set(address, 1);
        }
      }
    }
    return addressUsageMap;
  }
  /* 
    Utility function to check if the given address was used already in past transactions
  */
  isReusedAddress(address) {
    return this.addressUsageMap.has(address) && this.addressUsageMap.get(address) > 1;
  }
};

// src/privacy.ts
var DENIABILITY_FACTOR = 1.5;
var PrivacyMetrics = class extends WalletMetrics {
  /*
      Name : Topology Score
  
      Definition :
        The score is calculated based on the number of inputs and outputs which 
        influence the topology type of the transaction.
  
      Calculation :
        We have 5 categories of transaction type each with their own impact on privacy score
        - Perfect Spend (1 input, 1 output)
        - Simple Spend (1 input, 2 outputs)
        - UTXO Fragmentation (1 input, more than 2 standard outputs)
        - Consolidation (more than 1 input, 1 output)
        - CoinJoin or Mixing (more than 1 input, more than 1 output)
    */
  getTopologyScore(transaction) {
    const numberOfInputs = transaction.vin.length;
    const numberOfOutputs = transaction.vout.length;
    const spendType = determineSpendType(
      numberOfInputs,
      numberOfOutputs
    );
    const score = getSpendTypeScore(numberOfInputs, numberOfOutputs);
    if (spendType === "Consolidation" /* Consolidation */) {
      return score;
    }
    for (const output of transaction.vout) {
      const address = output.scriptPubkeyAddress;
      const isResued = this.isReusedAddress(address);
      if (isResued === true) {
        return score;
      }
    }
    return score * DENIABILITY_FACTOR;
  }
  /*
      Name : Mean Transaction Topology Privacy Score (MTPS)
  
      Definition :
        The mean topology is evaluated for entire wallet history based on 
        the tx toplogy score for each transaction. It signifies how well the 
        transactions were performed to maintain privacy.
      
      Calculation :
        The mean topology score is calculated by evaluating the topology score for each transaction.
  
      Expected Range : [0, 0.75]
      -> Very Poor : [0, 0.15]
      -> Poor : (0.15, 0.3]
      -> Moderate : (0.3, 0.45]
      -> Good : (0.45, 0.6]
      -> Very Good : (0.6, 0.75)
    */
  getMeanTopologyScore() {
    let privacyScore = 0;
    const transactions = this.transactions;
    for (const tx of transactions) {
      const topologyScore = this.getTopologyScore(tx);
      privacyScore += topologyScore;
    }
    return privacyScore / transactions.length;
  }
  /*
      Name : Address Reuse Factor (ARF)
  
      Definition :
        The address reuse factor evaluates the amount being held by reused addresses with respect 
        to the total amount. It signifies the privacy health of the wallet based on address reuse.
  
      Calculation : 
        The factor is calculated by summing the amount held by reused addresses and dividing it 
        by the total amount.
  
      Expected Range : [0,1]
      -> Very Poor : (0.8, 1]
      -> Poor : [0.6, 0.8)
      -> Moderate : [0.4, 0.6)
      -> Good : [0.2, 0.4)
      -> Very Good : [0 ,0.2) 
    */
  addressReuseFactor() {
    let reusedAmount = 0;
    let totalAmount = 0;
    const utxos = this.utxos;
    for (const address in utxos) {
      const addressUtxos = utxos[address];
      for (const utxo of addressUtxos) {
        totalAmount += utxo.value;
        const isReused = this.isReusedAddress(address);
        if (isReused) {
          reusedAmount += utxo.value;
        }
      }
    }
    return reusedAmount / totalAmount;
  }
  /*
      Name : Address Type Factor (ATF)
  
      Definition :
        The address type factor evaluates the address type distribution of the wallet transactions. 
        It signifies the privacy health of the wallet based on the address types used.
  
      Calculation :
        It is calculated as 
          ATF= 1/(same+1)
        where "same" denotes the number of output address types matching the input address type. 
        A higher "same" value results in a lower ATF, indicating reduced privacy due to less variety in address types.
        If all are same or all are different address type then there will be no change in the privacy score.
  
      Expected Range : (0,1]
        -> Very Poor : (0, 0.1]
        -> Poor : [0.1, 0.3)
        -> Moderate : [0.3, 0.4)
        -> Good : [0.4, 0.5)
        -> Very Good : [0.5 ,1] 
  
    */
  addressTypeFactor(walletAddressType, network) {
    const addressCounts = {
      P2WSH: 0,
      P2SH: 0,
      P2PKH: 0,
      P2TR: 0,
      UNKNOWN: 0,
      "P2SH-P2WSH": 0
    };
    const transactions = this.transactions;
    transactions.forEach((tx) => {
      tx.vout.forEach((output) => {
        const addressType = (0, import_bitcoin2.getAddressType)(output.scriptPubkeyAddress, network);
        addressCounts[addressType]++;
      });
    });
    const totalAddresses = Object.values(addressCounts).reduce(
      (a, b) => a + b,
      0
    );
    const walletTypeCount = addressCounts[walletAddressType];
    if (walletTypeCount === 0 || totalAddresses === walletTypeCount) {
      return 1;
    }
    return 1 / (walletTypeCount + 1);
  }
  /* 
      Name : UTXO Spread Factor
  
      Definition :
        The spread factor using standard deviation helps in assessing the dispersion of UTXO values.
        In Bitcoin privacy, spreading UTXOs reduces traceability by making it harder for adversaries
        to link transactions and deduce the ownership and spending patterns of users.
  
      Calculation :
        The spread factor is calculated by evaluating the standard deviation of UTXO values.
        It is calculated as the standard deviation divided by the sum of the standard deviation with 1.
  
      Expected Range : [0,1)
      -> Very Poor : (0, 0.2]
      -> Poor : [0.2, 0.4)
      -> Moderate : [0.4, 0.6)
      -> Good : [0.6, 0.8)
      -> Very Good : [0.8 ,1] 
    */
  utxoSpreadFactor() {
    const amounts = [];
    const utxos = this.utxos;
    for (const address in utxos) {
      const addressUtxos = utxos[address];
      addressUtxos.forEach((utxo) => {
        amounts.push(utxo.value);
      });
    }
    const mean = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
    const variance = amounts.reduce((sum, amount) => sum + Math.pow(amount - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    return stdDev / (stdDev + 1);
  }
  /*
      Name : UTXO Value Dispersion Factor
  
      Definition :
        The UTXO value dispersion factor is a combination of UTXO Spread Factor and UTXO Mass Factor.
        It signifies the combined effect of how much variance there is in the UTXO Set values and 
        the total number of UTXOs there are.
  
      Calculation :
        The U.V.D.F is calculated as a combination of UTXO Spread Factor and UTXO Set Length Weight.
        It is calculated as (USF + UMF) * 0.15 - 0.15.
  
      Expected Range : [-0.15,0.15]
      -> Very Poor : [-0.15, -0.1]
      -> Poor : (-0.1, -0.075]
      -> Moderate : (-0.075, 0)
      -> Good : (0, 0.075]
      -> Very Good : (0.075, 0.15]
    */
  utxoValueDispersionFactor() {
    const UMF = this.utxoMassFactor();
    const USF = this.utxoSpreadFactor();
    return (USF + UMF) * 0.15 - 0.15;
  }
  /*
      Name : Weighted Privacy Score
  
      Definition :
        The weighted privacy score is a combination of all the factors calculated above.
        It signifies the overall privacy health of the wallet based on the address reuse, 
        address types and UTXO set fingerprints etc.
      
      Calculation :
        The weighted privacy score is calculated by 
          WPS = (MTPS * (1 - 0.5 * ARF) + 0.1 * (1 - ARF)) * (1 - ATF) + 0.1 * UVDF
  
  
    */
  getWalletPrivacyScore(walletAddressType, network) {
    const meanTopologyScore = this.getMeanTopologyScore();
    const ARF = this.addressReuseFactor();
    const ATF = this.addressTypeFactor(walletAddressType, network);
    const UVDF = this.utxoValueDispersionFactor();
    const WPS = (meanTopologyScore * (1 - 0.5 * ARF) + 0.1 * (1 - ARF)) * (1 - ATF) + 0.1 * UVDF;
    return WPS;
  }
};

// src/waste.ts
var import_bitcoin3 = require("@caravan/bitcoin");
var WasteMetrics = class extends WalletMetrics {
  /*
      Name : 
        Relative Fees Score (R.F.S)
  
      Definition : 
        Comparision of the fees paid by the wallet transactions in a block relative to 
        the fees paid by other transactions in the same block on the same network.
  
      Calculation : 
        We take the percentile value of the fees paid by the user in the block of the transaction. 
        And then we obtain the mean percentile score for all the transaction done in a wallet.
  
      Expected Range : [0, 1]
      -> Very Poor : [0, 0.2]
      -> Poor : (0.2, 0.4]
      -> Moderate : (0.4, 0.6]
      -> Good : (0.6, 0.8]
      -> Very Good : (0.8, 1]
    */
  relativeFeesScore(feeRatePercentileHistory) {
    let sumRFS = 0;
    let numberOfSendTx = 0;
    const transactions = this.transactions;
    for (const tx of transactions) {
      if (tx.isSend === true) {
        numberOfSendTx++;
        const feeRate = this.getFeeRateForTransaction(tx);
        const RFS = this.getFeeRatePercentileScore(
          tx.block_time,
          feeRate,
          feeRatePercentileHistory
        );
        sumRFS += RFS;
      }
    }
    return sumRFS / numberOfSendTx;
  }
  /*
      Name : 
        Fees To Amount Ratio (F.A.R)
  
      Definition : 
        Ratio of the fees paid by the wallet transactions to the amount spent in the transaction.
        
        In the future, we can make this more accurate by comparing fees to the fee market at the time the transaction was sent. This will indicate if transactions typically pay within or out of the range of the rest of the market. 
  
      Calculation : 
        We can compare this ratio against the fiat charges for cross-border transactions.
        Mastercard charges 0.6% cross-border fee for international transactions in US dollars, 
        but if the transaction is in any other currency the fee goes up to 1%. 
        Source : https://www.clearlypayments.com/blog/what-are-cross-border-fees-in-credit-card-payments/
  
      Expected Range : [0, 1]
      -> Very Poor : [1, 0.01] // More than 1% amount paid as fees. In ratio 1% is 0.01 and so on for other range
      -> Poor : (0.01, 0.0075]
      -> Moderate : (0.0075, 0.006]
      -> Good : (0.006, 0.001]
      -> Very Good : (0.001, 0)
    */
  feesToAmountRatio() {
    let sumFeesToAmountRatio = 0;
    let numberOfSendTx = 0;
    const transactions = this.transactions;
    transactions.forEach((tx) => {
      if (tx.isSend === true) {
        sumFeesToAmountRatio += tx.fee / tx.amount;
        numberOfSendTx++;
      }
    });
    return sumFeesToAmountRatio / numberOfSendTx;
  }
  /*
      Name : 
        Spend Waste Amount (S.W.A)
  
      Definition : 
        A quantity that indicates whether it is economical to spend a particular output now in a given transaction
        or wait to consolidate it later when fees could be low.
        
      Important Terms:
        - Weight:
            Transaction weight units
        - Fee Rate:
            The transaction's target fee rate (current fee-rate of the network)
        - Estimated Long Term Fee Rate:
            The long-term fee rate estimate which the wallet might need to pay 
            to redeem remaining UTXOs.
            Reference : https://bitcoincore.reviews/17331#l-164
            It is the upper bound for spending the UTXO in the future.
        - Change:
            The cost of creating and spending a change output. It includes the fees paid 
            on this transaction's change output plus the fees that will need to be paid 
            to spend it later.
        - Excess:
            The amount by which we exceed our selection target when creating a changeless transaction, 
            mutually exclusive with cost of change. It is extra fees paid if we don't make a change output 
            and instead add the difference to the fees.
        - Input Amount :
            Sum of amount for each coin in input of the transaction
        - Spend Amount :
            Exact amount wanted to be spent in the transaction.
  
      Calculation :
        spend waste amount = consolidation factor + cost of transaction
        spend waste amount = weight (fee rate - estimatedLongTermFeeRate) + change + excess
  
      Observation :
        Depending on the fee rate in the long term, the consolidation factor can either be positive or negative.		
  		    fee rate (current) < estimatedLongTermFeeRate (long-term fee rate)  –-> Consolidate now (-ve)
  		    fee rate (current) > estimatedLongTermFeeRate (long-term fee rate)  –-> Wait for later when fee rate go low (+ve) 
  
    */
  spendWasteAmount(weight, feeRate, inputAmountSum, spendAmount, estimatedLongTermFeeRate) {
    const costOfTx = Math.abs(spendAmount - inputAmountSum);
    return weight * (feeRate - estimatedLongTermFeeRate) + costOfTx;
  }
  /*
      Name : calculateDustLimits
      Definition : 
        Dust limits are the limits that help to determine the lower and upper limit of the UTXO 
        that can be spent economically.
        The lower limit is below which the UTXO will actually behave as a dust output and the 
        upper limit is above which the UTXO will be safe and economical to spend.
  
      Calculation :
        lowerLimit - Below which the UTXO will actually behave as a dust output.
        upperLimit - Above which the UTXO will be safe and economical to spend.
        config - It takes two parameters, requiredSignerCount and totalSignerCount
          Eg : For a 2-of-3 Multisig wallet the config will be 
          config : {requiredSignerCount: 2, totalSignerCount: 3}
        riskMultiplier - 
          The riskMultiplier is a factor that scales the lower limit of a UTXO to determine its 
          upper limit. Based on their risk tolerance and expected fee volatility, a higher 
          multiplier provides a greater buffer but may unnecessarily categorize some UTXOs as 
          safe that could otherwise be considered risky.  The default value is set to 2 as a 
          balanced approach. It doubles the lower limit, providing a reasonable buffer for most 
          common fee scenarios without being overly conservative.
  
  
        lowerLimit = input_size (vB) * feeRate (sats/vByte)
        upperLimit = lowerLimit * riskMultiplier
  
    */
  calculateDustLimits(feeRate, scriptType, config, riskMultiplier = 2) {
    if (riskMultiplier <= 1) {
      throw new Error("Risk Multiplier should be greater than 1");
    }
    let vsize;
    if (scriptType === "P2SH") {
      const signatureLength = 72 + 1;
      const keylength = 33 + 1;
      vsize = signatureLength * config.requiredSignerCount + keylength * config.totalSignerCount;
    } else if (scriptType === "P2WSH") {
      let total = 0;
      total += 1;
      total += 1;
      total += (0, import_bitcoin3.getWitnessSize)(
        config.requiredSignerCount,
        config.totalSignerCount
      );
      vsize = total;
    } else if (scriptType === "P2SH-P2WSH") {
      const signatureLength = 72;
      const keylength = 33;
      const witnessSize = signatureLength * config.requiredSignerCount + keylength * config.totalSignerCount;
      vsize = Math.ceil(0.25 * witnessSize);
    } else if (scriptType === "P2TR") {
      vsize = 57.5;
    } else if (scriptType === "P2PKH") {
      vsize = 131.5;
    } else {
      vsize = 546;
    }
    const lowerLimit = vsize * feeRate;
    const upperLimit = lowerLimit * riskMultiplier;
    return { lowerLimit, upperLimit };
  }
  /* 
      Name : 
        Weighted Waste Score (W.W.S)
  
      Definition : 
        A score that indicates the overall waste of the wallet based on the relative fees score, 
        fees to amount ratio and the UTXO mass factor.
  
      Calculation : 
        weighted waste score = 0.35 * RFS + 0.35 * FAR + 0.3 * UMF
  
      Expected Range : [0, 1]
      -> Very Poor : [0, 0.2]
      -> Poor : (0.2, 0.4]
      -> Moderate : (0.4, 0.6]
      -> Good : (0.6, 0.8]
      -> Very Good : (0.8, 1]
    */
  weightedWasteScore(feeRatePercentileHistory) {
    const RFS = this.relativeFeesScore(feeRatePercentileHistory);
    const FAR = this.feesToAmountRatio();
    const UMF = this.utxoMassFactor();
    return 0.35 * RFS + 0.35 * FAR + 0.3 * UMF;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Network,
  PrivacyMetrics,
  SpendType,
  WalletMetrics,
  WasteMetrics
});
