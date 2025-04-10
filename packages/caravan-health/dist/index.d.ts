import { UTXO, Transaction, FeeRatePercentile } from '@caravan/clients';
export { FeeRatePercentile, Transaction, UTXO } from '@caravan/clients';
import { MultisigAddressType, Network } from '@caravan/bitcoin';
export { MultisigAddressType, Network } from '@caravan/bitcoin';

interface AddressUtxos {
    [address: string]: UTXO[];
}
declare enum SpendType {
    PerfectSpend = "PerfectSpend",
    SimpleSpend = "SimpleSpend",
    UTXOFragmentation = "UTXOFragmentation",
    Consolidation = "Consolidation",
    MixingOrCoinJoin = "MixingOrCoinJoin"
}

declare class WalletMetrics {
    addressUsageMap: Map<string, number>;
    transactions: Transaction[];
    utxos: AddressUtxos;
    constructor(transactions?: Transaction[], utxos?: AddressUtxos);
    utxoMassFactor(): number;
    getFeeRateForTransaction(transaction: Transaction): number;
    getFeeRatePercentileScore(timestamp: number, feeRate: number, feeRatePercentileHistory: FeeRatePercentile[]): number;
    getClosestPercentile(timestamp: number, feeRate: number, feeRatePercentileHistory: FeeRatePercentile[]): number;
    constructAddressUsageMap(): Map<string, number>;
    isReusedAddress(address: string): boolean;
}

declare class PrivacyMetrics extends WalletMetrics {
    getTopologyScore(transaction: Transaction): number;
    getMeanTopologyScore(): number;
    addressReuseFactor(): number;
    addressTypeFactor(walletAddressType: MultisigAddressType, network: Network): number;
    utxoSpreadFactor(): number;
    utxoValueDispersionFactor(): number;
    getWalletPrivacyScore(walletAddressType: MultisigAddressType, network: Network): number;
}

declare class WasteMetrics extends WalletMetrics {
    relativeFeesScore(feeRatePercentileHistory: FeeRatePercentile[]): number;
    feesToAmountRatio(): number;
    spendWasteAmount(weight: number, // Estimated weight of the transaction
    feeRate: number, // Current fee rate for the transaction
    inputAmountSum: number, // Sum of amount for each coin in input of the transaction
    spendAmount: number, // Exact amount wanted to be spent in the transaction
    estimatedLongTermFeeRate: number): number;
    calculateDustLimits(feeRate: number, scriptType: MultisigAddressType, config: {
        requiredSignerCount: number;
        totalSignerCount: number;
    }, riskMultiplier?: number): {
        lowerLimit: number;
        upperLimit: number;
    };
    weightedWasteScore(feeRatePercentileHistory: FeeRatePercentile[]): number;
}

export { AddressUtxos, PrivacyMetrics, SpendType, WalletMetrics, WasteMetrics };
