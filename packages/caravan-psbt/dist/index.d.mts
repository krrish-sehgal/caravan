import { Network } from '@caravan/bitcoin';
import { Psbt } from 'bitcoinjs-lib-v6';
import { MultisigWalletConfig } from '@caravan/multisig';

/**
 * Hex encoded string containing `<keytype><keydata>`. A string is needed for
 * Map.get() since it matches by identity. Most commonly, a `Key` only contains a
 * keytype byte, however, some with keydata can allow for multiple unique keys
 * of the same type.
 */
type Key = string;
/**
 * Values can be of various different types or formats. Here we leave them as
 * Buffers so that getters can decide how they should be formatted.
 */
type Value = Buffer;
type NonUniqueKeyTypeValue = {
    key: string;
    value: string | null;
};
/**
 * Provided to friendly-format the `PSBT_GLOBAL_TX_MODIFIABLE` bitmask from
 * `PsbtV2.PSBT_GLOBAL_TX_MODIFIABLE` which returns
 * `PsbtGlobalTxModifiableBits[]`.
 */
declare enum PsbtGlobalTxModifiableBits {
    INPUTS = "INPUTS",// 0b00000001
    OUTPUTS = "OUTPUTS",// 0b00000010
    SIGHASH_SINGLE = "SIGHASH_SINGLE"
}
declare enum SighashType {
    SIGHASH_ALL = 1,
    SIGHASH_NONE = 2,
    SIGHASH_SINGLE = 3,
    SIGHASH_ANYONECANPAY = 128
}
type InputOutputIndexType = number;
type MapSelectorType = "global" | ["inputs", InputOutputIndexType] | ["outputs", InputOutputIndexType];

/**
 * Attempts to extract the version number as uint32LE from raw psbt regardless
 * of psbt validity.
 */
declare function getPsbtVersionNumber(psbt: string | Buffer): number;

/**
 * This abstract class is provided for utility to allow for mapping, map
 * copying, and serialization operations for psbts. This does almost no
 * validation, so do not rely on it for ensuring a valid psbt.
 */
declare abstract class PsbtV2Maps {
    protected globalMap: Map<Key, Value>;
    protected inputMaps: Map<Key, Value>[];
    protected outputMaps: Map<Key, Value>[];
    constructor(psbt?: Buffer | string);
    /**
     * Return the current state of the psbt as a string in the specified format.
     */
    serialize(format?: "base64" | "hex"): string;
    /**
     * Copies the maps in this PsbtV2Maps object to another PsbtV2Maps object.
     *
     * NOTE: This copy method is made available to achieve parity with the PSBT
     * api required by `ledger-bitcoin` for creating merklized PSBTs. HOWEVER, it
     * is not recommended to use this when avoidable as copying maps bypasses the
     * validation defined in the constructor, so it could create a psbtv2 in an
     * invalid psbt state. PsbtV2.serialize is preferable whenever possible.
     */
    copy(to: PsbtV2Maps): void;
    private copyMaps;
    private copyMap;
}

/**
 * The PsbtV2 class is intended to represent an easily modifiable and
 * serializable psbt of version 2 conforming to BIP0174. Getters exist for all
 * BIP-defined keytypes. Very few setters and modifier methods exist. As they
 * are added, they should enforce implied and documented rules and limitations.
 *
 * allowTxnVersion1: A Note
 * A psbtv2 must have its transaction version GTE 2 to be bip370 compliant. If
 * this class is instantiated with allowTxnVersion1 set to `true`, then a psbtv2
 * which has had its txn version forceably set to 1 (for example with
 * PsbtV2.dangerouslySetGlobalTxVersion1) can be instantiated. This has,
 * possibly dangerous implications concerning how the locktime might be
 * interpreted.
 *
 * Defining BIPs: https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
 * https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki
 */
declare class PsbtV2 extends PsbtV2Maps {
    constructor(psbt?: Buffer | string, allowTxnVersion1?: boolean);
    /**
     * Globals Getters/Setters
     */
    get PSBT_GLOBAL_XPUB(): NonUniqueKeyTypeValue[];
    get PSBT_GLOBAL_TX_VERSION(): number;
    set PSBT_GLOBAL_TX_VERSION(version: number);
    get PSBT_GLOBAL_FALLBACK_LOCKTIME(): number | null;
    set PSBT_GLOBAL_FALLBACK_LOCKTIME(locktime: number | null);
    get PSBT_GLOBAL_INPUT_COUNT(): number;
    set PSBT_GLOBAL_INPUT_COUNT(count: number);
    get PSBT_GLOBAL_OUTPUT_COUNT(): number;
    set PSBT_GLOBAL_OUTPUT_COUNT(count: number);
    get PSBT_GLOBAL_TX_MODIFIABLE(): PsbtGlobalTxModifiableBits[];
    set PSBT_GLOBAL_TX_MODIFIABLE(modifiable: PsbtGlobalTxModifiableBits[]);
    get PSBT_GLOBAL_VERSION(): number;
    set PSBT_GLOBAL_VERSION(version: number);
    get PSBT_GLOBAL_PROPRIETARY(): NonUniqueKeyTypeValue[];
    /**
     * Input Getters/Setters
     */
    get PSBT_IN_NON_WITNESS_UTXO(): (string | null)[];
    get PSBT_IN_WITNESS_UTXO(): (string | null)[];
    get PSBT_IN_PARTIAL_SIG(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_SIGHASH_TYPE(): (number | null)[];
    get PSBT_IN_REDEEM_SCRIPT(): (string | null)[];
    get PSBT_IN_WITNESS_SCRIPT(): (string | null)[];
    get PSBT_IN_BIP32_DERIVATION(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_FINAL_SCRIPTSIG(): (string | null)[];
    get PSBT_IN_FINAL_SCRIPTWITNESS(): (string | null)[];
    get PSBT_IN_POR_COMMITMENT(): (string | null)[];
    get PSBT_IN_RIPEMD160(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_SHA256(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_HASH160(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_HASH256(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_PREVIOUS_TXID(): string[];
    get PSBT_IN_OUTPUT_INDEX(): number[];
    get PSBT_IN_SEQUENCE(): (number | null)[];
    get PSBT_IN_REQUIRED_TIME_LOCKTIME(): (number | null)[];
    get PSBT_IN_REQUIRED_HEIGHT_LOCKTIME(): (number | null)[];
    get PSBT_IN_TAP_KEY_SIG(): (string | null)[];
    get PSBT_IN_TAP_SCRIPT_SIG(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_TAP_LEAF_SCRIPT(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_TAP_BIP32_DERIVATION(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_TAP_INTERNAL_KEY(): (string | null)[];
    get PSBT_IN_TAP_MERKLE_ROOT(): (string | null)[];
    get PSBT_IN_PROPRIETARY(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    /**
     * Output Getters/Setters
     */
    get PSBT_OUT_REDEEM_SCRIPT(): (string | null)[];
    get PSBT_OUT_WITNESS_SCRIPT(): (string | null)[];
    get PSBT_OUT_BIP32_DERIVATION(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_OUT_AMOUNT(): bigint[];
    get PSBT_OUT_SCRIPT(): string[];
    get PSBT_OUT_TAP_INTERNAL_KEY(): (string | null)[];
    get PSBT_OUT_TAP_TREE(): (string | null)[];
    get PSBT_OUT_TAP_BIP32_DERIVATION(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_OUT_PROPRIETARY(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    /**
     * Operator Role Validation Getters
     */
    /**
     * Returns true if the PsbtV2 is ready for an operator taking the Constructor
     * role.
     *
     * This check assumes that the Creator used this class's constructor method to
     * initialize the PsbtV2 without passing a psbt (constructor  defaults were
     * set).
     */
    get isReadyForConstructor(): boolean;
    /**
     * Returns true if the PsbtV2 is ready for an operator taking the Updater
     * role.
     *
     * Before signatures are added, but after an input is added, a PsbtV2 is
     * likely to be ready for Constructor, ready for Updater, and ready for Signer
     * simultaneously.
     *
     * According to BIP370, the Updater can modify the sequence number, but it is
     * unclear if the Updater retains permissions provided in psbtv0 (BIP174). It
     * is likely not the case that the Updater has the same permissions as
     * previously because it seems to now be the realm of the Constructor to add
     * inputs and outputs.
     */
    get isReadyForUpdater(): boolean;
    /**
     * Returns true if the PsbtV2 is ready for an operator taking the Signer role.
     */
    get isReadyForSigner(): boolean;
    /**
     * Returns true if the PsbtV2 is ready for an operator taking the Combiner
     * role.
     */
    get isReadyForCombiner(): boolean;
    /**
     * Unimplemented. Returns false.
     */
    get isReadyForInputFinalizer(): boolean;
    /**
     * Returns true if the PsbtV2 is ready for an operator taking the Transaction
     * Extractor role.
     *
     * If all the inputs have been finalized, then the psbt is ready for the
     * Transaction Extractor. According to BIP 174, it's the responsibility of the
     * Input Finalizer to add scriptSigs or scriptWitnesses and then remove other
     * details besides the UTXO. This getter checks that the Input Finalizer has
     * finished its job.
     */
    get isReadyForTransactionExtractor(): boolean;
    /**
     * Other Getters/Setters
     */
    /**
     * Returns the `nLockTime` field for the psbt as if it were a bitcoin
     * transaction.
     */
    get nLockTime(): number | null;
    /**
     * Creator/Constructor Methods
     */
    /**
     * Ensures that global fields have initial values required by a PsbtV2
     * Creator. It is called by the constructor if constructed without a psbt.
     */
    private create;
    /**
     * Checks initial construction of any valid PsbtV2. It is called when a psbt
     * is passed to the constructor or when a new psbt is being created. If
     * constructed with a psbt, this method acts outside of the Creator role to
     * validate the current state of the psbt.
     */
    private validate;
    /**
     * Sets the sequence number for a specific input in the transaction.
     *
     * This private helper method is crucial for implementing RBF and other
     * sequence-based transaction features. It writes the provided sequence
     * number as a 32-bit little-endian unsigned integer and stores it in the
     * appropriate input's map using the PSBT_IN_SEQUENCE key.
     *
     * The sequence number has multiple uses in Bitcoin transactions:
     * 1. Signaling RBF (values < 0xfffffffe)
     * 2. Enabling nLockTime (values < 0xffffffff)
     * 3. Relative timelock with BIP68 (if bit 31 is not set)
     *
     * According to BIP125 (Opt-in Full Replace-by-Fee Signaling):
     *
     * - For a transaction to be considered opt-in RBF, it must have at least
     *   one input with a sequence number < 0xfffffffe.
     * - The recommended sequence for RBF is 0xffffffff-2 (0xfffffffd).
     *
     * Sequence number meanings:
     * - = 0xffffffff: Then the transaction is final no matter the nLockTime.
     * - < 0xfffffffe: Transaction signals for RBF.
     * - < 0xefffffff : Then the transaction signals BIP68 relative locktime.
     *
     * For using nLocktime along with Opt-in RBF, the sequence value
     * should be between 0xf0000000 and 0xfffffffd.
     *
     * Care should be taken when setting sequence numbers to ensure the desired
     * transaction properties are correctly signaled. Improper use can lead to
     * unexpected transaction behavior or rejection by the network.
     *
     * References:
     * - BIP125: Opt-in Full Replace-by-Fee Signaling
     *   https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki
     * - BIP68: Relative lock-time using consensus-enforced sequence numbers
     *   https://github.com/bitcoin/bips/blob/master/bip-0068.mediawiki
     */
    setInputSequence(inputIndex: number, sequence: number): void;
    /**
     * Checks if the transaction signals Replace-by-Fee (RBF).
     *
     * This method determines whether the transaction is eligible for RBF by
     * examining the sequence numbers of all inputs. As per BIP125, a transaction
     * is considered to have opted in to RBF if it contains at least one input
     * with a sequence number less than (0xffffffff - 1).
     *
     * Return value:
     * - true: If any input has a sequence number < 0xfffffffe, indicating RBF.
     * - false: If all inputs have sequence numbers >= 0xfffffffe, indicating no RBF.
     *
     * This method is useful for wallets, block explorers, or any service that
     * needs to determine if a transaction can potentially be replaced before
     * confirmation.
     *
     * References:
     * - BIP125: Opt-in Full Replace-by-Fee Signaling
     *   https://github.com/bitcoin/bips/blob/master/bip-0125.mediawiki
     */
    get isRBFSignaled(): boolean;
    /**
     * This method is provided for compatibility issues and probably shouldn't be
     * used since a PsbtV2 with PSBT_GLOBAL_TX_VERSION = 1 is BIP0370
     * non-compliant. No guarantees can be made here that a serialized PsbtV2
     * which used this method will be compatible with outside consumers.
     *
     * One may wish to instance this class from a partially signed PSBTv0 with a
     * txn version 1 by using the static PsbtV2.FromV0. This method provides a way
     * to override validation logic for the txn version and roles lifecycle
     * defined for PsbtV2.
     */
    dangerouslySetGlobalTxVersion1(): void;
    addGlobalXpub(xpub: Buffer, fingerprint: Buffer, path: string): void;
    addInput({ previousTxId, outputIndex, sequence, nonWitnessUtxo, witnessUtxo, redeemScript, witnessScript, bip32Derivation, sighashType, }: {
        previousTxId: Buffer | string;
        outputIndex: number;
        sequence?: number;
        nonWitnessUtxo?: Buffer;
        witnessUtxo?: {
            amount: number;
            script: Buffer;
        };
        redeemScript?: Buffer;
        witnessScript?: Buffer;
        bip32Derivation?: {
            pubkey: Buffer;
            masterFingerprint: Buffer;
            path: string;
        }[];
        sighashType?: SighashType;
    }): void;
    addOutput({ amount, script, redeemScript, witnessScript, bip32Derivation, }: {
        amount: number;
        script: Buffer;
        redeemScript?: Buffer;
        witnessScript?: Buffer;
        bip32Derivation?: {
            pubkey: Buffer;
            masterFingerprint: Buffer;
            path: string;
        }[];
    }): void;
    /**
     * Updater/Signer Methods
     */
    /**
     * Removes an input-map from inputMaps.
     */
    deleteInput(index: number): void;
    /**
     * Removes an output-map from outputMaps.
     */
    deleteOutput(index: number): void;
    /**
     * Checks that all provided flags are present in PSBT_GLOBAL_TX_MODIFIABLE.
     */
    private isModifiable;
    /**
     * Adds a signature for an input. Validates that the input is mapped and does
     * not already have a signature for the pubkey. Also validates for sighash.
     * Other validation is incomplete. Also validates for required args in case
     * typescript is not being used to call the method.
     *
     * The Signer, when it creates a signature, must add the partial sig keypair
     * to the psbt for the input which it is signing. In the case that a
     * particular signer does not, this method can be used to add a signature to
     * the psbt. This method assumes the Signer did the validation outlined in
     * BIP0174 before creating a signature.
     * https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki#signer
     */
    addPartialSig(inputIndex: number, pubkey: Buffer, sig: Buffer): void;
    /**
     * Removes all sigs for an input unless a pubkey is specified. Validates that
     * the input exists. When providing a pubkey, this validates that a sig for
     * the pubkey exists.
     */
    removePartialSig(inputIndex: number, pubkey?: Buffer): void;
    /**
     * Sets values on the proprietary keytype for a global, input, or output map.
     * BIP 174 allows for proprietary values to be set on all maps with the
     * keytype `0xFC`. This method sets byte data to key values defined by the
     * args.
     *
     * Args:
     * - `mapSelector` selects which map to set the proprietary value. If this
     *   value is not `"global"`, then a tuple must be provided with `"inputs"` or
     *   `"outputs"` as the first element and the index `number` on the second
     *   element representing which input or output map to set the value to. An
     *   example looks like `["inputs", 0]`. If the map name doesn't match, the
     *   values will be set to the global map. If the index is missing on
     *   `"inputs"` or `"outputs"`, then it will throw.
     * - `identifier` should be the bytes identifier for the set of proprietary
     *   keytypes.
     * - `subkeyType` accepts bytes proprietary keytype.
     * - `subkeyData` accepts bytes proprietary keydata.
     * - `valueData` accepts bytes which will be written as the proprietary value.
     *
     * From the provided args, a key with the following format will be generated:
     * `0xFC<compact uint identifier length><bytes identifier><bytes
     * subtype><bytes subkeydata>`
     */
    setProprietaryValue(mapSelector: MapSelectorType, identifier: Buffer, subkeyType: Buffer, subkeyData: Buffer, valueData: Buffer): void;
    /**
     * Ensures the PSBT is in the proper state when adding a partial sig keypair.
     * https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki#signer
     */
    private handleSighashType;
    /**
     * Attempts to return a PsbtV2 by converting from a PsbtV0 string or Buffer.
     *
     * This method first starts with a fresh PsbtV2 having just been created. It
     * then takes the PsbtV2 through its operator saga and through the Input
     * Finalizer role. In this sense, validation for each operator role will be
     * performed as the Psbt saga is replayed.
     */
    static FromV0(psbt: string | Buffer, allowTxnVersion1?: boolean): PsbtV2;
    /**
     * Outputs a serialized PSBTv0 from a best-attempt conversion of the fields in
     * this PSBTv2. Accepts optional desired format as a string (default base64).
     */
    toV0(format?: "base64" | "hex"): string;
}

interface PsbtInput {
    hash: string | Buffer;
    index: number;
    transactionHex: string;
    redeemScript?: Buffer;
    witnessScript?: Buffer;
    bip32Derivation?: {
        masterFingerprint: Buffer;
        path: string;
        pubkey: Buffer;
    }[];
    spendingWallet: MultisigWalletConfig;
}
interface PsbtOutput {
    address: string;
    value: number;
    bip32Derivation?: {
        masterFingerprint: Buffer;
        path: string;
        pubkey: Buffer;
    }[];
    redeemScript?: Buffer;
    witnessScript?: Buffer;
}
/**
 * This function seeks to be an updated version of the legacy `unsignedMultisigPSBT` function
 * from @caravan/bitcoin.
 * It takes the network and a set of inputs and outputs which it creates a PSBT from.
 * This combines several operator roles of the PSBT saga into one function, getting a PSBT
 * ready to be signed. It optionally can also add the global xpubs to the PSBT.
 */
declare const getUnsignedMultisigPsbtV0: ({ network, inputs, outputs, includeGlobalXpubs, }: {
    network: Network;
    inputs: PsbtInput[];
    outputs: PsbtOutput[];
    includeGlobalXpubs?: boolean | undefined;
}) => Psbt;
declare const addGlobalXpubs: (psbt: Psbt, inputs: PsbtInput[], network: Network) => void;
/**
 * Validate the signature on a psbt for a given input. Returns false if no
 * valid signature is found otherwise returns the public key that was signed for.
 *
 * This is a port of the validateMultisigSignature function from @caravan/bitcoin
 * to support a newer API and be more PSBT-native.
 */
declare const validateMultisigPsbtSignature: (raw: string | Buffer, inputIndex: number, inputSignature: Buffer, inputAmount?: string) => boolean | string;
/***
 * These should be deprecated eventually once we have better typescript support
 * and a more api for handling PSBT saga.
 * They are ports over from the legacy psbt code in caravan/bitcoin
 */
/**
 * Translates a PSBT into inputs/outputs consumable by supported non-PSBT devices in the
 * `@caravan/wallets` library.
 *
 * FIXME - Have only confirmed this is working for P2SH addresses on Ledger on regtest
 */
declare function translatePSBT(network: any, addressType: any, psbt: string, signingKeyDetails: any): {
    unchainedInputs: any;
    unchainedOutputs: any;
    bip32Derivations: any;
} | null;

/**
 * @file This file primarily contains utility functions migrated from the
 * legacy psbt module in @caravan/bitcoin. With the new @caravan/psbt
 * module, the goal is to make a more modular and legible API. But in order
 * to make migrations easier from the old API, we need to provide conversion functions
 * for converting the deeply nested objects in the legacy API.
 */

interface LegacyMultisig {
    /**
     * JSON stringified object with the following properties:
     * braidDetails: {
     *   network: Network;
     *   addressType: number;
     *   extendedPublicKeys: string[];
     *   requiredSigners: number;
     *   index: string;
     * };
     */
    braidDetails: string;
    bip32Derivation?: {
        masterFingerprint: string;
        path: string;
        pubkey: Buffer;
    }[];
    redeem?: {
        output: Buffer;
    };
    witness?: {
        output: Buffer;
    };
}
interface LegacyInput {
    txid: string;
    index: number;
    transactionHex: string;
    amountSats: number | string;
    multisig: LegacyMultisig;
}
interface LegacyOutput {
    address: string;
    amountSats: number | string;
    bip32Derivation?: {
        masterFingerprint: string;
        path: string;
        pubkey: Buffer;
    }[];
    witnessScript?: Buffer;
    redeemScript?: Buffer;
    multisig?: LegacyMultisig;
}
declare const convertLegacyInput: (input: LegacyInput) => PsbtInput;
declare const convertLegacyOutput: (output: LegacyOutput) => PsbtOutput;
/**
 * Given a string, try to create a Psbt object based on MAGIC (hex or Base64)
 */
declare function autoLoadPSBT(psbtFromFile: any, options?: any): Psbt | null;

declare const PSBT_MAGIC_HEX = "70736274ff";
declare const PSBT_MAGIC_B64 = "cHNidP8";
declare const PSBT_MAGIC_BYTES: Buffer;

export { LegacyInput, LegacyMultisig, LegacyOutput, PSBT_MAGIC_B64, PSBT_MAGIC_BYTES, PSBT_MAGIC_HEX, PsbtInput, PsbtOutput, PsbtV2, addGlobalXpubs, autoLoadPSBT, convertLegacyInput, convertLegacyOutput, getPsbtVersionNumber, getUnsignedMultisigPsbtV0, translatePSBT, validateMultisigPsbtSignature };
