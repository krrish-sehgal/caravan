import { Network } from '@caravan/bitcoin';
import BigNumber from 'bignumber.js';
import { Network as Network$1 } from 'bitcoinjs-lib-v6';
import { PsbtV2 } from '@caravan/psbt';

/**
 * Abstract base class for Bitcoin transaction components (inputs and outputs).
 * Provides common functionality for inputs and outputs.
 */
declare abstract class BtcTxComponent {
    protected _amountSats: BigNumber;
    /**
     * @param amountSats - The amount in satoshis (as a string)
     */
    constructor(amountSats: Satoshis);
    /**
     * Get the amount in satoshis
     * @returns The amount in satoshis (as a string)
     */
    get amountSats(): Satoshis;
    /**
     * Set  amount in satoshis
     * @param amountSats - New amount in satoshis (as a string)
     */
    set amountSats(value: Satoshis);
    /**
     * Get the amount in BTC
     * @returns The amount in BTC (as a string)
     */
    get amountBTC(): BTC;
    hasAmount(): boolean;
    /**
     * Check if the component is valid
     * @returns True if valid, false otherwise
     */
    abstract isValid(): boolean;
}
/**
 * Represents a Bitcoin transaction input template for PSBT creation.
 * This class contains the minimal required fields and optional fields
 * necessary for creating a valid PSBT input.
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
 */
declare class BtcTxInputTemplate extends BtcTxComponent {
    private readonly _txid;
    private readonly _vout;
    private _nonWitnessUtxo?;
    private _witnessUtxo?;
    private _sequence?;
    /**
     * @param {Object} params - The parameters for creating a BtcTxInputTemplate
     * @param {string} params.txid - The transaction ID of the UTXO (reversed, big-endian)
     * @param {number} params.vout - The output index in the transaction
     * @param {Satoshis} params.amountSats - The amount in satoshis
     */
    constructor(params: {
        txid: string;
        vout: number;
        amountSats?: Satoshis;
    });
    /**
     * Creates a BtcTxInputTemplate from a UTXO object.
     */
    static fromUTXO(utxo: UTXO): BtcTxInputTemplate;
    /**
     * The transaction ID of the UTXO (reversed, big-endian).
     * Required for all PSBT inputs.
     */
    get txid(): string;
    /**
     * The output index in the transaction.
     * Required for all PSBT inputs.
     */
    get vout(): number;
    /** Get the sequence number */
    get sequence(): number | undefined;
    /**
     * Sets the sequence number for the input.
     * Optional, but useful for RBF signaling.
     * @param {number} sequence - The sequence number
     */
    setSequence(sequence: number): void;
    /**
     * Enables Replace-By-Fee (RBF) signaling for this input.
     * Sets the sequence number to 0xfffffffd .
     */
    enableRBF(): void;
    /**
     * Disables Replace-By-Fee (RBF) signaling for this input.
     * Sets the sequence number to 0xffffffff.
     */
    disableRBF(): void;
    /**
     * Checks if RBF is enabled for this input.
     * @returns {boolean} True if RBF is enabled, false otherwise.
     */
    isRBFEnabled(): boolean;
    /**
     * Gets the non-witness UTXO.
     */
    get nonWitnessUtxo(): Buffer | undefined;
    /**
     * Sets the non-witness UTXO.
     * Required for non-segwit inputs in PSBTs.
     * @param {Buffer} value - The full transaction containing the UTXO being spent
     */
    setNonWitnessUtxo(value: Buffer): void;
    /**
     * Gets the witness UTXO.
     */
    get witnessUtxo(): {
        script: Buffer;
        value: number;
    } | undefined;
    /**
     * Sets the witness UTXO.
     * Required for segwit inputs in PSBTs.
     * @param {Object} value - The witness UTXO
     * @param {Buffer} value.script - The scriptPubKey of the output
     * @param {number} value.value - The value of the output in satoshis
     */
    setWitnessUtxo(value: {
        script: Buffer;
        value: number;
    }): void;
    /**
     * Check if the input is valid
     * @returns True if the amount is positive and exists, and txid and vout are valid
     */
    isValid(): boolean;
    /**
     * Checks if the input has the required fields for PSBT creation.
     */
    hasRequiredFieldsforPSBT(): boolean;
    /**
     * Converts the input template to a UTXO object.
     */
    toUTXO(): UTXO;
}
/**
 * Represents a Bitcoin transaction output
 */
declare class BtcTxOutputTemplate extends BtcTxComponent {
    private readonly _address;
    private _malleable;
    /**
     * @param params - Output parameters
     * @param params.address - Recipient address
     * @param params.amountSats - Amount in satoshis  (as a string)
     * @param params.locked - Whether the output is locked (immutable), defaults to false
     * @throws Error if trying to create a locked output with zero amount
     */
    constructor(params: {
        address: string;
        amountSats?: Satoshis | undefined;
        locked?: boolean;
    });
    /** Get the recipient address */
    get address(): string;
    /** Check if the output is malleable (can be modified) */
    get isMalleable(): boolean;
    /**
     * Set a new amount for the output
     * @param amountSats - New amount in satoshis(as a string)
     * @throws Error if trying to modify a non-malleable output
     */
    setAmount(amountSats: Satoshis): void;
    /**
     * Add amount to the output
     * @param amountSats - Amount to add in satoshis (as a string)
     * @throws Error if trying to modify a non-malleable output
     */
    addAmount(amountSats: Satoshis): void;
    /**
     * Subtract amount from the output
     * @param amountSats - Amount to subtract in satoshis (as a string)
     * @throws Error if trying to modify a non-malleable output or if subtracting more than the current amount
     */
    subtractAmount(amountSats: Satoshis): void;
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
    lock(): void;
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
    isValid(): boolean;
}

/**
 * Represents an Unspent Transaction Output (UTXO) with essential information for PSBT creation.
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
 */
interface UTXO {
    /** The transaction ID of the UTXO in reversed hex format (big-endian). */
    txid: string;
    /** The output index of the UTXO in its parent transaction. */
    vout: number;
    /** The value of the UTXO in satoshis. */
    value: Satoshis;
    /**
     * The full previous transaction in hexadecimal format.
     * Required for non-segwit inputs in PSBTs.
     */
    prevTxHex?: string;
    /**
     * The witness UTXO information for segwit transactions.
     * Required for segwit inputs in PSBTs.
     */
    witnessUtxo?: {
        script: Buffer;
        value: number;
    };
}
/**
 * Configuration options for the TransactionAnalyzer.
 */
interface AnalyzerOptions {
    /**
     * The Bitcoin network to use (mainnet, testnet, or regtest).
     */
    network: Network;
    /**
     * The target fee rate in satoshis per vbyte that the user wants to achieve.
     * This is used to determine if fee bumping is necessary and to calculate
     * the new fee for RBF or CPFP.
     */
    targetFeeRate: number;
    /**
     * The absolute fee of the original transaction in satoshis.
     * This is used as the basis for fee calculations and comparisons.
     */
    absoluteFee: Satoshis;
    /**
     * An array of Unspent Transaction Outputs (UTXOs) that are available
     * for fee bumping. These are potential inputs that can be added to
     * a replacement transaction in RBF, or used to create a child transaction
     * in CPFP.
     */
    availableUtxos: UTXO[];
    /**
     * The index of the change output in the transaction, if known.
     * This helps identify which output is the change and can be
     * adjusted for fee bumping in RBF scenarios.
     */
    changeOutputIndex?: number;
    /**
     * The incremental relay fee-rate in satoshis per vbyte. This is the minimum
     * fee rate increase required for nodes to accept a replacement transaction.
     * It's used in RBF calculations to ensure the new transaction meets
     * network requirements.
     * Default value in Bitcoin Core is 1 sat/vbyte.
     * @see https://github.com/bitcoin/bitcoin/blob/master/src/policy/fees.h
     */
    incrementalRelayFeeRate?: FeeRateSatsPerVByte;
    /**
     * The number of signatures required in a multisig setup.
     * This is used to estimate transaction size more accurately
     * for multisig transactions.
     */
    requiredSigners: number;
    /**
     * The total number of signers in a multisig setup.
     * This is used along with requiredSigners to estimate
     * transaction size more accurately for multisig transactions.
     */
    totalSigners: number;
    /**
     * The type of Bitcoin address used (e.g., P2PKH, P2SH, P2WPKH, P2WSH).
     * This is used to determine the input size for different address types
     * when estimating transaction size.
     */
    addressType: ScriptType;
    /**
     * The hexadecimal representation of the raw transaction.
     * This is used for parsing the transaction details directly
     * from the hex .
     */
    txHex: string;
}
/**
 * Enum representing different fee bumping strategies.
 * These strategies are used to increase the fee of a transaction to improve its chances of confirmation.
 */
declare enum FeeBumpStrategy {
    /**
     * Replace-By-Fee (RBF) strategy.
     * This involves creating a new transaction that replaces the original one with a higher fee.
     * @see https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki
     */
    RBF = "RBF",
    /**
     * Child-Pays-for-Parent (CPFP) strategy.
     * This involves creating a new transaction that spends an output of the original transaction,
     * with a high enough fee to incentivize miners to confirm both transactions together.
     * @see https://bitcoinops.org/en/topics/cpfp/
     */
    CPFP = "CPFP",
    /**
     * No fee bumping strategy.
     * This indicates that fee bumping is not necessary or possible for the transaction.
     */
    NONE = "NONE"
}
/**
 * Represents an input in a Bitcoin transaction.
 * Transaction inputs are references to outputs of previous transactions that are being spent.
 */
interface TransactionInput {
    /**
     * The transaction ID of the previous transaction containing the output being spent.
     */
    txid: string;
    /**
     * The index of the output in the previous transaction that is being spent.
     */
    vout: number;
    /**
     * The sequence number of the input.
     * This is used for relative time locks and signaling RBF.
     * @see https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
     * @see https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki
     */
    sequence: number;
    /**
     * The scriptSig of the input in hexadecimal format.
     * For non-segwit inputs, this contains the unlocking script.
     */
    scriptSig: string;
    /**
     * The witness data for segwit inputs.
     * This is an array of hex strings, each representing a witness element.
     * @see https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki
     */
    witness: string[];
}
/**
 * Represents a fee rate in satoshis per virtual byte.
 * This is used for fee estimation and fee bumping calculations.
 * @see https://bitcoinops.org/en/topics/fee-estimation/
 */
type FeeRateSatsPerVByte = number;
/**
 * Represents an amount in satoshis.
 * Satoshis are the smallest unit of bitcoin (1 BTC = 100,000,000 satoshis).
 */
type Satoshis = string;
/**
 * Represents an amount in bitcoin.
 */
type BTC = string;
/**
 * Configuration options for creating a transaction template.
 * This is used to set up the initial state and parameters for a new transaction.
 */
interface TransactionTemplateOptions {
    /**
     * The target fee rate in satoshis per virtual byte.
     * This is used to calculate the appropriate fee for the transaction.
     */
    targetFeeRate: FeeRateSatsPerVByte;
    /**
     * The dust threshold in satoshis.
     * Outputs below this value are considered uneconomical to spend.
     * @see https://github.com/bitcoin/bitcoin/blob/master/src/policy/policy.cpp
     */
    dustThreshold?: Satoshis;
    /**
     * The Bitcoin network to use (mainnet, testnet, or regtest).
     */
    network: Network;
    /**
     * The type of script used for the transaction (e.g., "p2pkh", "p2sh", "p2wpkh", "p2wsh").
     * This affects how the transaction is constructed and signed.
     */
    scriptType: ScriptType;
    /**
     * Optional array of input templates to use in the transaction.
     */
    inputs?: BtcTxInputTemplate[];
    /**
     * Optional array of output templates to use in the transaction.
     */
    outputs?: BtcTxOutputTemplate[];
    /**
     * The number of signatures required in a multisig setup.
     * This is used for multisig transactions and affects the transaction size.
     */
    requiredSigners: number;
    /**
     * The total number of signers in a multisig setup.
     * This is used along with requiredSigners for multisig transactions.
     */
    totalSigners: number;
}
/**
 * Options for creating a cancel RBF transaction.
 */
interface CancelRbfOptions {
    /**
     * The hex-encoded original transaction to be replaced.
     */
    originalTx: string;
    /**
     * Array of available UTXOs, including the original transaction's inputs.
     */
    availableInputs: UTXO[];
    /**
     * The address where all funds will be sent in the cancellation transaction.
     */
    cancelAddress: string;
    /**
     * The Bitcoin network being used (e.g., mainnet, testnet).
     */
    network: Network;
    /**
     * The dust threshold in satoshis. Outputs below this value are considered "dust"
     * and may not be economically viable to spend.
     */
    dustThreshold: Satoshis;
    /**
     * The type of script used for the transaction (e.g., P2PKH, P2SH, P2WSH).
     */
    scriptType: ScriptType;
    /**
     * The number of required signers for the multisig setup.
     */
    requiredSigners: number;
    /**
     * The total number of signers in the multisig setup.
     */
    totalSigners: number;
    /**
     * The target fee rate in satoshis per virtual byte. This is used to calculate
     * the appropriate fee for the transaction.
     */
    targetFeeRate: FeeRateSatsPerVByte;
    /**
     * The absolute fee of the original transaction in satoshis.
     */
    absoluteFee: Satoshis;
    /**
     * Whether to attempt full RBF even if the transaction doesn't signal it.
     * @default false
     */
    fullRBF?: boolean;
    /**
     * If true, enforces stricter validation rules.
     *
     * When set to true, the following stricter rules (among others) are applied:
     * - Ensures the new fee is significantly higher than the original fee
     * - Strictly enforces output value rules (no increases except for fee)
     * - Requires change outputs to be above the dust threshold
     * - Strictly validates RBF signaling on input sequence numbers
     * @default false
     */
    strict?: boolean;
    /**
     * Whether to reuse all inputs from the original transaction in the replacement.
     *
     * For cancel transactions, this defaults to false as there's no risk of double-paying.
     * Setting this to true will include all original inputs, potentially increasing fees
     * but ensuring maximum conflict with the original transaction.
     *
     * @default false
     */
    reuseAllInputs?: boolean;
}
/**
 * Options for creating an accelerated RBF transaction.
 */
interface AcceleratedRbfOptions extends Omit<CancelRbfOptions, "cancelAddress"> {
    /**
     * The index of the change output in the original transaction.
     * Use this option to specify which output from the original transaction
     * should be treated as the change output and potentially modified.
     *
     * @remarks
     * - Provide either changeIndex or changeAddress, not both.
     * - If changeIndex is provided, the address of the output at this index
     *   in the original transaction will be used for the new change output.
     * - Must be a non-negative integer.
     */
    changeIndex?: number;
    /**
     * The address to use for the new change output, if different from the original.
     * Use this option to specify a new address for the change output.
     *
     * @remarks
     * - Provide either changeAddress or changeIndex, not both.
     * - If changeAddress is provided, this address will be used for the new change output,
     *   regardless of the original transaction's change output address.
     * - Must be a valid Bitcoin address for the specified network.
     */
    changeAddress?: string;
    /**
     * Whether to reuse all inputs from the original transaction in the replacement while accelerating the transaction.
     *
     * Setting this to false can potentially lead to a "replacement cycle attack"
     * where multiple versions of a transaction could be confirmed if they don't
     * conflict with each other. Only set this to false if you fully understand
     * the risks and have implemented appropriate safeguards.
     *
     * @see https://bitcoinops.org/en/newsletters/2023/10/25/#fn:rbf-warning
     * @default true
     */
    reuseAllInputs?: boolean;
}
/**
 * Options for creating a CPFP transaction.
 */
interface CPFPOptions {
    /**
     * The hex-encoded original (parent) transaction to be accelerated.
     */
    originalTx: string;
    /**
     * Array of available UTXOs, including the spendable output from the parent transaction.
     */
    availableInputs: UTXO[];
    /**
     * The index of the output in the parent transaction that will be spent in the child transaction.
     */
    spendableOutputIndex: number;
    /**
     * The address where any excess funds (change) will be sent in the child transaction.
     */
    changeAddress: string;
    /**
     * The Bitcoin network being used (e.g., mainnet, testnet).
     */
    network: Network;
    /**
     * The dust threshold in satoshis. Outputs below this value are considered "dust".
     */
    dustThreshold: Satoshis;
    /**
     * The type of script used for the transaction (e.g., P2PKH, P2SH, P2WSH).
     */
    scriptType: ScriptType;
    /**
     * The target fee rate in satoshis per virtual byte. This is used to calculate
     * the appropriate fee for the transaction.
     */
    targetFeeRate: FeeRateSatsPerVByte;
    /**
     * The absolute fee of the original transaction in satoshis.
     */
    absoluteFee: Satoshis;
    /**
     * The number of required signers for the multisig setup.
     */
    requiredSigners: number;
    /**
     * The total number of signers in the multisig setup.
     */
    totalSigners: number;
    /**
     * If true, enforces stricter validation rules.
     * When set to true, the following stricter rules (among others) are applied:
     * - Ensures the new fee is significantly higher than the original fee
     * - Requires change outputs to be above the dust threshold
     * @default false
     */
    strict?: boolean;
}
/**
 * Comprehensive object containing all supported Bitcoin script types.
 * This includes multisig address types from Caravan and additional types.
 *
 * @readonly
 * @enum {string}
 */
declare const SCRIPT_TYPES: {
    /** Pay to Public Key Hash */
    readonly P2PKH: "P2PKH";
    /** Pay to Witness Public Key Hash (Native SegWit) */
    readonly P2WPKH: "P2WPKH";
    /** Pay to Script Hash wrapping a Pay to Witness Public Key Hash (Nested SegWit) */
    readonly P2SH_P2WPKH: "P2SH_P2WPKH";
    /** Unknown or unsupported script type */
    readonly UNKNOWN: "UNKNOWN";
    /** Pay to Script Hash */
    readonly P2SH: string;
    /** Pay to Script Hash wrapping a Pay to Witness Script Hash */
    readonly P2SH_P2WSH: string;
    /** Pay to Witness Script Hash (Native SegWit for scripts) */
    readonly P2WSH: string;
};
/**
 * Union type representing all possible Bitcoin script types.
 * This type can be used for type checking and autocompletion in functions
 * that deal with different Bitcoin address formats.
 *
 * @type {typeof SCRIPT_TYPES[keyof typeof SCRIPT_TYPES]} ScriptType
 */
type ScriptType = (typeof SCRIPT_TYPES)[keyof typeof SCRIPT_TYPES];
/**
 * Represents the comprehensive analysis of a Bitcoin transaction.
 * This interface encapsulates various metrics and properties of a transaction,
 * including size, fees, RBF and CPFP capabilities, and recommended fee bump strategy.
 *
 * @interface TxAnalysis
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
 * @remarks
 * - The `vsize` and `weight` properties are important for fee calculation in segwit transactions.
 * - `isRBFSignaled` is true if at least one input has a sequence number < 0xfffffffe.
 * - `canRBF` considers both RBF signaling and the availability of inputs for replacement.
 * - `canCPFP` is true if there's at least one unspent output that can be used for a child transaction.
 * - The `recommendedStrategy` is based on the current transaction state and network conditions.
 * - `estimatedRBFFee` and `estimatedCPFPFee` are calculated based on current network fee rates and minimum required increases.
 *
 * @example
 * const txAnalyzer = new TransactionAnalyzer(options);
 * const analysis: TxAnalysis = txAnalyzer.analyze();
 * console.log(`Transaction ${analysis.txid} has a fee rate of ${analysis.feeRate} sat/vB`);
 * if (analysis.canRBF) {
 *   console.log(`RBF is possible with an estimated fee of ${analysis.estimatedRBFFee} satoshis`);
 * }
 */
interface TxAnalysis {
    txid: string;
    vsize: number;
    weight: number;
    fee: Satoshis;
    feeRate: FeeRateSatsPerVByte;
    inputs: BtcTxInputTemplate[];
    outputs: BtcTxOutputTemplate[];
    isRBFSignaled: boolean;
    canRBF: boolean;
    canCPFP: boolean;
    recommendedStrategy: FeeBumpStrategy;
    estimatedRBFFee: Satoshis;
    estimatedCPFPFee: Satoshis;
}

/**
 * Creates an output script for a given Bitcoin address.
 *
 * This function validates the provided address and creates an appropriate
 * output script based on the address type (P2PKH, P2SH, P2WPKH,P2TR or P2WSH).
 * It supports both mainnet and testnet addresses.
 *
 * @param {string} destinationAddress - The Bitcoin address to create an output script for.
 * @param {Network} network - The Bitcoin network (mainnet or testnet) the address belongs to.
 * @returns {Buffer} The output script as a Buffer.
 * @throws {Error} If the address is invalid or unsupported, or if the output script cannot be created.
 *
 * @example
 * const script = createOutputScript('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', Network.MAINNET);
 */
declare function createOutputScript(destinationAddress: string, network: Network): Buffer;
/**
 * Attempts to derive the address from an output script.
 * @param {Buffer} script - The output script
 * @param {Network} network - The Bitcoin network (e.g., mainnet, testnet) to use for address derivation.
 * @returns {string} The derived address or an error message if unable to derive
 * @protected
 */
declare function getOutputAddress(script: Buffer, network: Network): string;
/**
 * Estimates the virtual size (vsize) of a transaction.
 *
 * This function calculates the estimated vsize for different address types,
 * including P2SH, P2SH_P2WSH, P2WSH, and P2WPKH. The vsize is crucial for
 * fee estimation in Bitcoin transactions, especially for SegWit transactions
 * where the witness data is discounted.
 *
 * Calculation Method:
 * 1. For non-SegWit (P2SH): vsize = transaction size
 * 2. For SegWit (P2SH_P2WSH, P2WSH, P2WPKH):
 *    vsize = (transaction weight) / 4, rounded up
 *    where transaction weight = (base size * 3) + total size
 *
 * References:
 * - BIP141 (SegWit): https://github.com/bitcoin/bips/blob/master/bip-0141.mediawiki
 * - Bitcoin Core weight calculation: https://github.com/bitcoin/bitcoin/blob/master/src/consensus/validation.h
 *
 * @param config - Configuration object for the transaction
 * @param config.addressType - The type of address used (P2SH, P2SH_P2WSH, P2WSH, P2WPKH)
 * @param config.numInputs - Number of inputs in the transaction
 * @param config.numOutputs - Number of outputs in the transaction
 * @param config.m - Number of required signatures (for multisig)
 * @param config.n - Total number of possible signers (for multisig)
 *
 * @returns The estimated virtual size (vsize) of the transaction in vbytes
 *
 * @throws Will throw an error if the address type is unsupported
 */
declare function estimateTransactionVsize({ addressType, numInputs, numOutputs, m, n, }?: {
    addressType?: ScriptType;
    numInputs?: number;
    numOutputs?: number;
    m?: number;
    n?: number;
}): number;
/**
 * Initializes the parent PSBT from various input formats.
 *
 * This method supports initializing from a PsbtV2 object, a serialized PSBT string,
 * or a Buffer. It attempts to parse the input as a PsbtV2 and falls back to PsbtV0
 * if necessary, providing backwards compatibility.
 *
 * @private
 * @param {PsbtV2 | string | Buffer} psbt - The parent PSBT in various formats
 * @returns {PsbtV2} An initialized PsbtV2 object
 * @throws {Error} If the PSBT cannot be parsed or converted
 */
declare function initializePsbt(psbt: PsbtV2 | string | Buffer): PsbtV2;
/**
 * Calculates the total input value from the given PSBT.
 *
 * This function aggregates the total value of all inputs, considering both
 * witness and non-witness UTXOs. It uses helper functions to parse and sum up
 * the values of each input.
 *
 * @param psbt - The PsbtV2 instance representing the partially signed Bitcoin transaction.
 * @returns The total input value as a BigNumber.
 */
declare function calculateTotalInputValue(psbt: PsbtV2): BigNumber;
/**
 * Parses the value of a witness UTXO.
 *
 * Witness UTXOs are expected to have their value encoded in the first 8 bytes
 * of the hex string in little-endian byte order. This function extracts and
 * converts that value to a BigNumber.
 *
 * @param utxo - The hex string representing the witness UTXO.
 * @param index - The index of the UTXO in the PSBT input list.
 * @returns The parsed value as a BigNumber.
 */
declare function parseWitnessUtxoValue(utxo: string | null, index: number): BigNumber;
/**
 * Parses the value of a non-witness UTXO.
 *
 * @param rawTx - The raw transaction hex string.
 * @param outputIndex - The index of the output in the transaction.
 * @returns The parsed value as a BigNumber.
 * @throws Error if the transaction cannot be parsed or the output index is invalid.
 */
declare function parseNonWitnessUtxoValue(rawTx: string, outputIndex: number): BigNumber;
/**
 * Calculates the total output value from the given PSBT.
 *
 * This function sums the values of all outputs in the PSBT.
 *
 * @param psbt - The PsbtV2 instance representing the partially signed Bitcoin transaction.
 * @returns The total output value as a BigNumber.
 */
declare function calculateTotalOutputValue(psbt: PsbtV2): BigNumber;
/**
 * Maps a Caravan Network to its corresponding BitcoinJS Network.
 *
 * @param {CaravanNetwork} network - The Caravan Network to map.
 * @returns {BitcoinJSNetwork} The corresponding BitcoinJS Network.
 * @throws {Error} If an unsupported network is provided.
 */
declare function mapCaravanNetworkToBitcoinJS(network: Network): Network$1;
/**
 * Validates a non-witness UTXO (Unspent Transaction Output) for use in a PSBT.
 *
 * This function performs several checks on the provided UTXO to ensure it's valid:
 * 1. Verifies that the transaction can be parsed from the buffer.
 * 2. Checks if the specified output index (vout) is within the range of available outputs.
 * 3. Validates that the output value is a positive number.
 * 4. Ensures that the output script is a valid Buffer.
 *
 * Note: This function does not validate the txid, as the provided buffer represents
 * the previous transaction, not the transaction containing this input.
 *
 * @param {Buffer} utxoBuffer - The raw transaction buffer containing the UTXO.
 * @param {string} txid - The transaction ID of the input (not used in validation, but included for potential future use).
 * @param {number} vout - The index of the output in the transaction that we're spending.
 * @returns {boolean} True if the UTXO is valid, false otherwise.
 *
 * @throws {Error} Implicitly, if there's an issue parsing the transaction. The error is caught and logged, returning false.
 */
declare function validateNonWitnessUtxo(utxoBuffer: Buffer, txid: string, vout: number): boolean;
/**
 * Validates the sequence number of a transaction input.
 *
 * In Bitcoin transactions, the sequence number is used for various purposes including:
 * - Signaling Replace-By-Fee (RBF) when set to a value less than 0xffffffff - 1
 * - Enabling relative timelock when bit 31 is not set (value < 0x80000000)
 *
 * This function checks if the provided sequence number is a valid 32-bit unsigned integer.
 *
 * @param {number} sequence - The sequence number to validate.
 * @returns {boolean} True if the sequence number is valid, false otherwise.
 *
 * @example
 * console.log(validateSequence(0xffffffff)); // true
 * console.log(validateSequence(0xfffffffe)); // true (signals RBF)
 * console.log(validateSequence(0x80000000)); // true (disables relative timelock)
 * console.log(validateSequence(-1)); // false (negative)
 * console.log(validateSequence(0x100000000)); // false (exceeds 32-bit)
 * console.log(validateSequence(1.5)); // false (not an integer)
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki BIP 68 for relative lock-time
 * @see https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki BIP 125 for opt-in full Replace-by-Fee signaling
 */
declare function validateSequence(sequence: number): boolean;

/**
 * TransactionAnalyzer Class
 *
 * This class provides comprehensive analysis of Bitcoin transactions, including
 * fee estimation, RBF (Replace-By-Fee) and CPFP (Child-Pays-For-Parent) capabilities.
 * It's designed to help wallet developers make informed decisions about fee bumping
 * strategies for unconfirmed transactions.
 *
 * Key Features:
 * - Analyzes transaction inputs, outputs, fees, and size
 * - Determines RBF and CPFP eligibility
 * - Recommends optimal fee bumping strategy
 * - Estimates fees for RBF and CPFP operations
 * - Provides detailed transaction information for wallet integration
 *
 * Usage:
 * const analyzer = new TransactionAnalyzer({txHex,...other-options});
 * const analysis = analyzer.analyze();
 *
 * @class
 */
declare class TransactionAnalyzer {
    private readonly _rawTx;
    private readonly _network;
    private readonly _targetFeeRate;
    private readonly _absoluteFee;
    private readonly _availableUtxos;
    private readonly _changeOutputIndex;
    private readonly _incrementalRelayFeeRate;
    private readonly _requiredSigners;
    private readonly _totalSigners;
    private readonly _addressType;
    private _canRBF;
    private _canCPFP;
    private _assumeRBF;
    /**
     * Creates an instance of TransactionAnalyzer.
     * @param {AnalyzerOptions} options - Configuration options for the analyzer
     * @throws {Error} If the transaction is invalid or lacks inputs/outputs
     */
    constructor(options: AnalyzerOptions);
    /**
     * Gets the transaction ID (txid) of the analyzed transaction.
     * @returns {string} The transaction ID
     */
    get txid(): string;
    /**
     * Gets the virtual size (vsize) of the transaction in virtual bytes.
     * Note: This uses bitcoinjs-lib's implementation which applies Math.ceil()
     * for segwit transactions, potentially slightly overestimating the vsize.
     * This is generally acceptable, especially for fee bumping scenarios.
     * @returns {number} The virtual size of the transaction
     */
    get vsize(): number;
    /**
     * Gets the weight of the transaction in weight units.
     * @returns {number} The weight of the transaction
     */
    get weight(): number;
    /**
     * Gets the deserialized inputs of the transaction.
     * @returns {BtcTxInputTemplate[]} An array of transaction inputs
     */
    get inputs(): BtcTxInputTemplate[];
    /**
     * Gets the deserialized outputs of the transaction.
     * @returns {BtcTxOutputTemplate[]} An array of transaction outputs
     */
    get outputs(): BtcTxOutputTemplate[];
    /**
     * Calculates and returns the fee of the transaction in satoshis.
     * @returns {Satoshis} The transaction fee in satoshis
     */
    get fee(): Satoshis;
    /**
     * Calculates and returns the fee rate of the transaction in satoshis per vbyte.
     * @returns {FeeRateSatsPerVByte} The transaction fee rate in satoshis per vbyte
     */
    get feeRate(): FeeRateSatsPerVByte;
    /**
     * Gets whether RBF is assumed to be always possible, regardless of signaling.
     * @returns {boolean} True if RBF is assumed to be always possible, false otherwise
     */
    get assumeRBF(): boolean;
    /**
     * Sets whether to assume RBF is always possible, regardless of signaling.
     * @param {boolean} value - Whether to assume RBF is always possible
     */
    set assumeRBF(value: boolean);
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
    get canRBF(): boolean;
    /**
     * Check if Child-Pays-for-Parent (CPFP) is possible for the transaction.
     * @returns {boolean} True if CPFP is possible, false otherwise.
     */
    get canCPFP(): boolean;
    /**
     * Recommends the optimal fee bumping strategy based on the current transaction state.
     * @returns {FeeBumpStrategy} The recommended fee bumping strategy
     */
    get recommendedStrategy(): FeeBumpStrategy;
    /**
     * Gets the list of available UTXOs for potential use in fee bumping.
     * @returns {UTXO[]} An array of available UTXOs
     */
    get availableUTXOs(): UTXO[];
    /**
     * Gets the current target fee rate in satoshis per vbyte.
     * @returns {FeeRateSatsPerVByte } The target fee rate in satoshis per vbyte.
     */
    get targetFeeRate(): FeeRateSatsPerVByte;
    /**
     * Calculates and returns the fee rate required for a successful CPFP.
     * @returns {string} The CPFP fee rate in satoshis per vbyte
     */
    get cpfpFeeRate(): string;
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
    get minimumRBFFee(): Satoshis;
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
    get minimumCPFPFee(): Satoshis;
    /**
     * Estimates the virtual size of a potential CPFP child transaction.
     * @returns {number} The estimated vsize of the child transaction in vbytes
     */
    get estimatedCPFPChildSize(): number;
    /**
     * Calculates the total package size for a potential CPFP transaction.
     * This includes the size of the current (parent) transaction and the estimated size of the child transaction.
     * @returns {number} The total package size in vbytes
     */
    get CPFPPackageSize(): number;
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
    analyze(): TxAnalysis;
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
    getInputTemplates(): BtcTxInputTemplate[];
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
    getOutputTemplates(): BtcTxOutputTemplate[];
    /**
     * Retrieves the change output of the transaction, if it exists.
     * @returns {BtcTxComponent | null} The change output or null if no change output exists
     */
    getChangeOutput(): BtcTxComponent | null;
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
    protected deserializeInputs(): BtcTxInputTemplate[];
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
    protected deserializeOutputs(): BtcTxOutputTemplate[];
    /**
     * Checks if the transaction signals RBF (Replace-By-Fee).
     * @returns {boolean} True if the transaction signals RBF, false otherwise
     * @protected
     */
    protected isRBFSignaled(): boolean;
    /**
     * Determines if CPFP (Child-Pays-For-Parent) can be performed on this transaction.
     * @returns {boolean} True if CPFP can be performed, false otherwise
     * @protected
     */
    protected canPerformCPFP(): boolean;
    /**
     * Recommends the optimal fee bumping strategy based on the current transaction state.
     * @returns {FeeBumpStrategy} The recommended fee bumping strategy
     * @protected
     */
    protected recommendStrategy(): FeeBumpStrategy;
    private static validateOptions;
}

/**
 * Creates a cancel Replace-By-Fee (RBF) transaction.
 *
 * This function creates a new transaction that double-spends at least one input
 * from the original transaction, effectively cancelling it by sending all funds
 * to a new address minus the required fees.
 *
 * @param {CancelRbfOptions} options - Configuration options for creating the cancel RBF transaction.
 * @returns {string} The base64-encoded PSBT of the cancel RBF transaction.
 * @throws {Error} If RBF is not possible or if the transaction creation fails.
 *
 * @example
 * const cancelTx = createCancelRbfTransaction({
 *   originalTx: originalTxHex,
 *   availableInputs: availableUTXOs,
 *   cancelAddress: 'bc1q...', // cancel address
 *   network: Network.MAINNET,
 *   scriptType: 'P2WSH',
 *   requiredSigners: 2,
 *   totalSigners: 3,
 *   targetFeeRate: '10',
 *   absoluteFee: '1000',
 *   fullRBF: false,
 *   strict: true
 *   reuseAllInputs: false, // Default behavior, more efficient fee wise
 * });
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki BIP 125: Opt-in Full Replace-by-Fee Signaling
 * @see https://developer.bitcoin.org/devguide/transactions.html#locktime-and-sequence-number Bitcoin Core's guide on locktime and sequence numbers
 * @see https://bitcoinops.org/en/newsletters/2023/10/25/#fn:rbf-warning Bitcoin Optech on replacement cycle attacks
 */
declare const createCancelRbfTransaction: (options: CancelRbfOptions) => string;
/**
 * Creates an accelerated Replace-By-Fee (RBF) transaction.
 *
 * This function creates a new transaction that replaces the original one
 * with a higher fee, aiming to accelerate its confirmation. It preserves
 * the original outputs except for the change output, which is adjusted to
 * accommodate the higher fee.
 *
 * @param {AcceleratedRbfOptions} options - Configuration options for creating the accelerated RBF transaction.
 * @returns {string} The base64-encoded PSBT of the accelerated RBF transaction.
 * @throws {Error} If RBF is not possible or if the transaction creation fails.
 *
 * @example
 * const acceleratedTx = createAcceleratedRbfTransaction({
 *   originalTx: originalTxHex,
 *   availableInputs: availableUTXOs,
 *   network: Network.MAINNET,
 *   scriptType: 'P2WSH',
 *   requiredSigners: 2,
 *   totalSigners: 3,
 *   targetFeeRate: '20',
 *   absoluteFee: '1000',
 *   changeIndex: 1,
 *   changeAddress: 'bc1q...',
 *   fullRBF: false,
 *   strict: true
 *   reuseAllInputs: true, // Default behavior, safer option
 * });
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki BIP 125: Opt-in Full Replace-by-Fee Signaling
 * @see https://developer.bitcoin.org/devguide/transactions.html#locktime-and-sequence-number Bitcoin Core's guide on locktime and sequence numbers
 * @see https://bitcoinops.org/en/newsletters/2023/10/25/#fn:rbf-warning Bitcoin Optech on replacement cycle attacks
 */
declare const createAcceleratedRbfTransaction: (options: AcceleratedRbfOptions) => string;

/**
 * Represents a Bitcoin transaction template.
 * This class is used to construct and manipulate Bitcoin transactions.
 */
declare class BtcTransactionTemplate {
    private readonly _inputs;
    private readonly _outputs;
    private readonly _targetFeeRate;
    private readonly _dustThreshold;
    private readonly _network;
    private readonly _scriptType;
    private readonly _requiredSigners;
    private readonly _totalSigners;
    /**
     * Creates a new BtcTransactionTemplate instance.
     * @param options - Configuration options for the transaction template
     */
    constructor(options: TransactionTemplateOptions);
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
    static fromPsbt(rawPsbt: string, options: Omit<TransactionTemplateOptions, "inputs" | "outputs">): BtcTransactionTemplate;
    /**
     * Gets the inputs of the transaction.
     * @returns A read-only array of inputs
     */
    get inputs(): readonly BtcTxInputTemplate[];
    /**
     * Gets the outputs of the transaction.
     * @returns A read-only array of outputs
     */
    get outputs(): readonly BtcTxOutputTemplate[];
    /**
     * Gets the malleable outputs of the transaction.
     * Malleable outputs are all those that can have their amount changed, e.g. change outputs.
     * @returns An array of malleable outputs
     */
    get malleableOutputs(): BtcTxOutputTemplate[];
    /**
     * Calculates the target fees to pay based on the estimated size and target fee rate.
     * @returns {Satoshis} The target fees in satoshis (as a string)
     */
    get targetFeesToPay(): Satoshis;
    /**
     * Calculates the current fee of the transaction.
     * @returns {Satoshis} The current fee in satoshis (as a string)
     */
    get currentFee(): Satoshis;
    /**
     * Checks if the transaction needs a change output.
     * @returns {boolean} True if there's enough leftover funds for a change output above the dust threshold.
     */
    get needsChange(): boolean;
    /**
     * Checks if the current fees are sufficient to meet the target fee rate.
     * @returns True if the fees are paid, false otherwise
     */
    areFeesPaid(): boolean;
    /**
     * Checks if the current fee rate meets or exceeds the target fee rate.
     * @returns True if the fee rate is satisfied, false otherwise
     */
    get feeRateSatisfied(): boolean;
    /**
     * Determines if a change output is needed.
     * @returns True if a change output is needed, false otherwise
     */
    get needsChangeOutput(): boolean;
    /**
     * Calculates the total input amount.
     * @returns {Satoshis} The total input amount in satoshis (as a string)
     */
    get totalInputAmount(): Satoshis;
    /**
     * Calculates the total change amount. (Total Inputs Amount - Total Non-change (non-malleable) Outputs Amount )
     * @returns {Satoshis} The total change amount in satoshis (as a string)
     */
    get changeAmount(): Satoshis;
    /**
     * Calculates the total output amount.
     * @returns {Satoshis} The total output amount in satoshis (as a string)
     */
    get totalOutputAmount(): Satoshis;
    /**
     * Estimates the virtual size of the transaction.
     * @returns The estimated virtual size in vbytes
     */
    get estimatedVsize(): number;
    /**
     * Calculates the estimated fee rate of the transaction.
     * @returns {string} The estimated fee rate in satoshis per vbyte
     */
    get estimatedFeeRate(): string;
    /**
     * Adds an input to the transaction.
     * @param input - The input to add
     */
    addInput(input: BtcTxInputTemplate): void;
    /**
     * Adds an output to the transaction.
     * @param output - The output to add
     */
    addOutput(output: BtcTxOutputTemplate): void;
    /**
     * Removes an output from the transaction.
     * @param index - The index of the output to remove
     */
    removeOutput(index: number): void;
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
    adjustChangeOutput(): Satoshis | null;
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
    validate(): boolean;
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
    toPsbt(validated?: boolean): string;
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
    private validateInputs;
    /**
     * Calculates the total input amount.
     * @returns {BigNumber} The total input amount in satoshis
     * @private
     */
    private calculateTotalInputAmount;
    /**
     * Calculates the total output amount.
     * @returns {BigNumber} The total output amount in satoshis
     * @private
     */
    private calculateTotalOutputAmount;
    /**
     * Calculates the total change amount.
     * @returns {BigNumber} The total change amount in satoshis
     * @private
     */
    private calculateChangeAmount;
    /**
     * Calculates the estimated virtual size of the transaction.
     * @returns {number} The estimated virtual size in vbytes
     * @private
     */
    private calculateEstimatedVsize;
    /**
     * Calculates the current fee of the transaction.
     * @returns {BigNumber} The current fee in satoshis (as a BN)
     * @private
     */
    private calculateCurrentFee;
    /**
     * Calculates the target fees to pay based on the estimated size and target fee rate.
     * @returns {Satoshis} The target fees in satoshis (as a BN)
     * @private
     */
    private targetFees;
    /**
     * Processes the inputs from a PSBT and creates BtcTxInputTemplate instances.
     *
     * @param psbt - The initialized PSBT
     * @returns An array of BtcTxInputTemplate instances
     * @throws Error if required input information is missing
     */
    private static processInputs;
    /**
     * Sets the UTXO information for a given input.
     *
     * @param input - The BtcTxInputTemplate to update
     * @param psbt - The PSBT containing the input information
     * @param index - The index of the input in the PSBT
     * @throws Error if UTXO information is missing
     */
    private static setInputUtxo;
    /**
     * Processes the outputs from a PSBT and creates BtcTxOutputTemplate instances.
     *
     * @param psbt - The initialized PSBT
     * @param network - The Bitcoin network
     * @returns An array of BtcTxOutputTemplate instances
     * @throws Error if required output information is missing
     */
    private static processOutputs;
    /**
     * Adds a single input to the provided PSBT based on the given input template (used in BtcTransactionTemplate)
     * @param {PsbtV2} psbt - The PsbtV2 object.
     * @param input - The input template to be processed and added.
     * @throws {Error} - Throws an error if script extraction or PSBT input addition fails.
     */
    private addInputToPsbt;
    /**
     * Adds an output to the PSBT(used in BtcTransactionTemplate)
     *
     * @param {PsbtV2} psbt - The PsbtV2 object.
     * @param {BtcTxOutputTemplate} output - The output template to be processed and added.
     * @throws {Error} - Throws an error if output script creation fails.
     */
    private addOutputToPsbt;
}

/**
 * Creates a Child-Pays-for-Parent (CPFP) transaction to accelerate the confirmation
 * of an unconfirmed parent transaction.
 *
 * This function implements a simplified version of the CPFP strategy used in Bitcoin Core.
 * It creates a new transaction (child) that spends an output from the original unconfirmed
 * transaction (parent), including a higher fee to incentivize miners to confirm both
 * transactions together.
 *
 * The CPFP calculation process:
 * 1. Analyze the parent transaction to determine its fee, size, and available outputs.
 * 2. Create a child transaction template with the target fee rate for the combined package.
 * 3. Add the spendable output from the parent as an input to the child transaction.
 * 4. Iteratively add additional inputs to the child transaction until the combined
 *    fee rate of the parent and child meets or exceeds the target fee rate.
 * 5. Calculate and set the change output amount for the child transaction.
 * 6. Validate the child transaction and ensure the combined fee rate is sufficient.
 *
 * The combined fee rate is calculated as:
 * (parentFee + childFee) / (parentVsize + childVsize)
 *
 * @param {CPFPOptions} options - Configuration options for creating the CPFP transaction.
 * @returns {string} The base64-encoded PSBT of the CPFP (child) transaction.
 * @throws {Error} If CPFP is not possible, if the transaction creation fails, or if
 *                 the combined fee rate doesn't meet the target (in strict mode).
 *
 * @example
 * const cpfpTx = createCPFPTransaction({
 *   originalTx: originalTxHex,
 *   availableInputs: availableUTXOs,
 *   spendableOutputIndex: 1,
 *   changeAddress: 'bc1q...',
 *   network: Network.MAINNET,
 *   dustThreshold: '546',
 *   scriptType: 'P2WSH',
 *   targetFeeRate: '15',
 *   absoluteFee: '1000',
 *   requiredSigners: 2,
 *   totalSigners: 3,
 *   strict: true
 * });
 *
 * @see https://bitcoinops.org/en/topics/cpfp/ Bitcoin Optech on Child Pays for Parent
 * @see https://github.com/bitcoin/bitcoin/pull/7600 Bitcoin Core CPFP implementation
 */
declare const createCPFPTransaction: (options: CPFPOptions) => string;
/**
 * Determines if the combined fee rate of a parent and child transaction meets or exceeds
 * the target fee rate for a Child-Pays-for-Parent (CPFP) transaction.
 *
 * This function calculates the combined fee rate of a parent transaction and its child
 * (CPFP) transaction, then compares it to the target fee rate. It's used to ensure that
 * the CPFP transaction provides sufficient fee incentive for miners to include both
 * transactions in a block.
 *
 * The combined fee rate is calculated as:
 * (parentFee + childFee) / (parentVsize + childVsize)
 *
 * @param {TransactionAnalyzer} txAnalyzer - The analyzer containing parent transaction information and CPFP fee rate.
 * @param {BtcTransactionTemplate} childTxTemplate - The child transaction template.
 * @returns {boolean} True if the combined fee rate meets or exceeds the target fee rate, false otherwise.
 *
 * @example
 * const txAnalyzer = new TransactionAnalyzer({...});
 * const childTxTemplate = new BtcTransactionTemplate({...});
 * const isSatisfied = isCPFPFeeSatisfied(txAnalyzer, childTxTemplate);
 * console.log(isSatisfied); // true or false
 *
 * @throws {Error} If any of the input parameters are negative.
 */
declare function isCPFPFeeSatisfied(txAnalyzer: TransactionAnalyzer, childTxTemplate: BtcTransactionTemplate): boolean;
/**
 * Validates that the combined fee rate of a parent and child transaction
 * meets or exceeds the target fee rate for a Child-Pays-for-Parent (CPFP) transaction.
 *
 * This function calculates the combined fee rate of the parent transaction (from the analyzer)
 * and its child transaction, then compares it to the target CPFP fee rate. It ensures
 * that the CPFP transaction provides sufficient fee incentive for miners to include both
 * transactions in a block.
 *
 * @param {TransactionAnalyzer} txAnalyzer - The analyzer containing parent transaction information and CPFP fee rate.
 * @param {BtcTransactionTemplate} childTxTemplate - The child transaction template.
 * @param {boolean} strict - If true, throws an error when the fee rate is not satisfied. If false, only logs a warning.
 * @returns {void}
 *
 * @throws {Error} If the combined fee rate is below the target fee rate in strict mode.
 */
declare function validateCPFPPackage(txAnalyzer: TransactionAnalyzer, childTxTemplate: BtcTransactionTemplate, strict: boolean): void;

/**
 * The dust threshold in satoshis. Outputs below this value are considered "dust"
 * and generally not relayed by the network.
 *
 * This value is derived from the Bitcoin Core implementation, where it's
 * calculated as 3 * 182 satoshis for a standard P2PKH output, assuming
 * a minimum relay fee of 1000 satoshis/kB.
 *
 * @see https://github.com/bitcoin/bitcoin/blob/master/src/policy/policy.cpp
 */
declare const DEFAULT_DUST_THRESHOLD_IN_SATS = "546";
/**
 * The sequence number used to signal Replace-by-Fee (RBF) for a transaction input.
 *
 * As per BIP125, a transaction signals RBF if at least one of its inputs has
 * a sequence number less than (0xffffffff - 1). This constant uses
 * (0xffffffff - 2) to clearly signal RBF while leaving room for other
 * potential sequence number use cases.
 *
 * @see https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki
 */
declare const RBF_SEQUENCE: number;
/**
 * Constants for Bitcoin transaction fee safeguards
 *
 * These constants are used to prevent accidental or malicious creation of
 * transactions with excessively high fees. They serve as upper bounds for
 * fee rates and absolute fees in the context of RBF and CPFP operations.
 */
/**
 * Maximum allowable fee rate in satoshis per virtual byte (sat/vB).
 *
 * @constant
 * @type {string}
 * @default "1000"
 *
 * This constant represents an absurdly high fee rate of 1000 sat/vB.
 * It's used as a safety check to prevent transactions with unreasonably
 * high fee rates, which could result in significant financial loss.
 *
 * Context:
 * - Normal fee rates typically range from 1-100 sat/vB, depending on network congestion.
 * - A fee rate of 1000 sat/vB is considered extremely high and likely unintentional.
 * - This safeguard helps protect users from inputting errors or potential fee-sniping attacks.
 *
 * Usage:
 * - In fee estimation functions for RBF and CPFP.
 * - As a validation check before broadcasting transactions.
 */
declare const ABSURDLY_HIGH_FEE_RATE = "1000";
/**
 * Maximum allowable absolute fee in satoshis.
 *
 * @constant
 * @type {string}
 * @default "2500000"
 *
 * This constant represents an absurdly high absolute fee of 2,500,000 satoshis (0.025 BTC).
 * It serves as a cap on the total transaction fee, regardless of the transaction's size.
 *
 * Context:
 * - 1,000,000 satoshis = 0.025 BTC, which is a significant amount for a transaction fee.
 * - This limit helps prevent accidental loss of large amounts of Bitcoin due to fee miscalculations.
 * - It's particularly important for larger transactions where a high fee rate could lead to substantial fees.
 *
 * Usage:
 * - In fee calculation functions for both regular transactions and fee-bumping operations (RBF, CPFP).
 * - As a final safety check before transaction signing and broadcasting.
 */
declare const ABSURDLY_HIGH_ABS_FEE = "2500000";

export { ABSURDLY_HIGH_ABS_FEE, ABSURDLY_HIGH_FEE_RATE, AcceleratedRbfOptions, AnalyzerOptions, BTC, BtcTransactionTemplate, BtcTxComponent, BtcTxInputTemplate, BtcTxOutputTemplate, CPFPOptions, CancelRbfOptions, DEFAULT_DUST_THRESHOLD_IN_SATS, FeeBumpStrategy, FeeRateSatsPerVByte, RBF_SEQUENCE, SCRIPT_TYPES, Satoshis, ScriptType, TransactionAnalyzer, TransactionInput, TransactionTemplateOptions, TxAnalysis, UTXO, calculateTotalInputValue, calculateTotalOutputValue, createAcceleratedRbfTransaction, createCPFPTransaction, createCancelRbfTransaction, createOutputScript, estimateTransactionVsize, getOutputAddress, initializePsbt, isCPFPFeeSatisfied, mapCaravanNetworkToBitcoinJS, parseNonWitnessUtxoValue, parseWitnessUtxoValue, validateCPFPPackage, validateNonWitnessUtxo, validateSequence };
