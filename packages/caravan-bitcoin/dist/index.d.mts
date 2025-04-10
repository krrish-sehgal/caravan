import * as bitcoinjs_lib_v5 from 'bitcoinjs-lib-v5';
import { networks, payments, Psbt, Transaction } from 'bitcoinjs-lib-v5';
import { Struct, BufferWriter, BufferReader } from 'bufio';
import BigNumber from 'bignumber.js';
import * as bip174 from 'bip174';

/**
 * This module exports network constants and provide some utility
 * functions for displaying the network name and passing the network
 * value to bitcoinjs.
 */
declare enum Network {
    MAINNET = "mainnet",
    TESTNET = "testnet",
    REGTEST = "regtest",
    SIGNET = "signet"
}
/**
 * Returns bitcoinjs-lib network object corresponding to the given
 * network.
 *
 * This function is for internal use by this library.
 */
declare function networkData(network: Network): networks.Network;
/**
 * Returns human-readable network label for the specified network.
 */
declare function networkLabel(network: Network): "Mainnet" | "Testnet";
/**
 * given a prefix determine the network it indicates
 */
declare function getNetworkFromPrefix(prefix: string): Network.MAINNET | Network.TESTNET;

/**
 * This module provides functions for validating & deriving public
 * keys and extended public keys.
 *
 * @module keys
 */

declare const EXTENDED_PUBLIC_KEY_VERSIONS: {
    readonly xpub: "0488b21e";
    readonly ypub: "049d7cb2";
    readonly zpub: "04b24746";
    readonly Ypub: "0295b43f";
    readonly Zpub: "02aa7ed3";
    readonly tpub: "043587cf";
    readonly upub: "044a5262";
    readonly vpub: "045f1cf6";
    readonly Upub: "024289ef";
    readonly Vpub: "02575483";
};
/**
 * Validate whether or not a string is a valid extended public key prefix
 * @param {string} prefix string to be tested
 * @returns {null} returns null if valid
 * @throws Error with message indicating the invalid prefix.
 */
declare function validatePrefix(prefix: KeyPrefix): never | null;
/**
 * checks length, is string, and valid hex
 * @param {string} rootFingerprint - fingerprint to validate
 * @return {void}
 */
declare function validateRootFingerprint(rootFingerprint: string): void;
/**
 * Struct object for encoding and decoding extended public keys.
 * base58 encoded serialization of the following information:
 * [ version ][ depth ][ parent fingerprint ][ key index ][ chain code ][ pubkey ]
 * @param {string} options.bip32Path e.g. m/45'/0'/0
 * @param {string} options.pubkey pubkey found at bip32Path
 * @param {string} options.chaincode chaincode corresponding to pubkey and path
 * @param {string} options.parentFingerprint - fingerprint of parent public key
 * @param {string} [options.network = mainnet] - mainnet or testnet
 * @param {string} [options.rootFingerprint] - the root fingerprint of the device, e.g. 'ca2ab33f'
 * @example
 * import { ExtendedPublicKey } from "@caravan/bitcoin"
 * const xpub = ExtendedPublicKey.fromBase58("xpub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab")
 * console.log(xpub.encode()) // returns raw Buffer of xpub encoded as per BIP32
 * console.log(xpub.toBase58()) // returns base58 check encoded xpub
 */
declare class ExtendedPublicKey extends Struct {
    path?: string;
    sequence?: number[];
    index?: number;
    depth?: number;
    chaincode?: string;
    pubkey?: string;
    parentFingerprint?: number;
    network?: BitcoinNetwork;
    version?: KeyVersion;
    rootFingerprint?: string;
    base58String?: string;
    constructor(options: Partial<ExtendedPublicKey>);
    /**
     * A Buffer Writer used to encode an xpub. This is called
     * by the `encode` and `toBase58` methods
     * @param {BufferWriter} bw bufio.BufferWriter
     * @returns {void} doesn't have a return, only updates given buffer writer
     */
    write(bw: BufferWriter): void;
    /**
     * Given a network string, will update the network and matching
     * version magic bytes used for generating xpub
     * @param {string} network - one of "mainnet" or "testnet"
     * @returns {void}
     */
    setNetwork(network: BitcoinNetwork): void;
    /**
     * @param {string} bip32Path set this xpub's path
     * @returns {void}
     */
    setBip32Path(bip32Path: string): void;
    /**
     * @param {string} rootFingerprint fingerprint of pubkey at m/
     * @returns {void}
     */
    setRootFingerprint(rootFingerprint: string): void;
    encode(extra?: any): Buffer;
    /**
     * Return the base58 encoded xpub, adding the
     * @returns {string} base58check encoded xpub, prefixed by network
     */
    toBase58(): string;
    /**
     * Return a new Extended Public Key class given
     * an xpub string
     * @param {string} data base58 check encoded xpub
     * @returns {ExtendedPublicKey} new ExtendedPublicKey instance
     */
    static fromBase58(data: string): ExtendedPublicKey;
    /**
     * Sometimes we hop back and forth between a "Rich ExtendedPublicKey"
     * (a Struct with a couple extra parameters set) and the minimal
     * Struct - let's keep the actual string of the Struct around
     * for easy usage in other functions
     * @returns {void}
     */
    addBase58String(): void;
    /**
     * Used by the decoder to convert a raw xpub Buffer into
     * an ExtendedPublicKey class
     * @param {BufferReader} br - A bufio.BufferReader
     * @returns {ExtendedPublicKey} new instance of Extended Public Key
     */
    read(br: BufferReader): ExtendedPublicKey;
    static decode(data: Buffer, extra?: any): ExtendedPublicKey;
}
/**
 * Convert an extended public key between formats
 * @param {string} extendedPublicKey - the extended public key to convert
 * @param {string} targetPrefix - the target format to convert to
 * @example
 * import {convertExtendedPublicKey} from "@caravan/bitcoin";
 * const tpub = convertExtendedPublicKey("xpub6CCH...", "tpub");
 * console.log(tpub.extendedPublicKey, tpub.message)
 * // tpubDCZv...
 * @returns {(string|Record<string, unknown>)} converted extended public key or error object
 * with the failed key and error message
 */
declare function convertExtendedPublicKey(extendedPublicKey: string, targetPrefix: KeyPrefix): string | Record<string, unknown>;
/**
 * Check to see if an extended public key is of the correct prefix for the network
 * this can be used in conjunction with convertExtendedPublicKey to attempt to automatically convert
 * @param {string} extendedPublicKey - the extended public key to check
 * @param {string} network - the bitcoin network
 * @example
 * import {validateExtendedPublicKeyForNetwork} from "@caravan/bitcoin";
 * console.log(validateExtendedPublicKeyForNetwork('xpub...', MAINNET)) // empty
 * console.log(validateExtendedPublicKeyForNetwork('tpub...', MAINNET)) // "Extended public key must begin with ...."
 * @returns {string} a validation message or empty if valid
 */
declare function validateExtendedPublicKeyForNetwork(extendedPublicKey: string, network: string): string;
/**
 * Validate the given extended public key.
 *
 * - Must start with the appropriate (network-dependent) prefix.
 * - Must be a valid BIP32 extended public key
 *
 * @param {string} xpubString - base58 encoded extended public key (`xpub...`)
 * @param {module:networks.Networks} network  - bitcoin network
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateExtendedPublicKey} from "@caravan/bitcoin";
 * console.log(validateExtendedPublicKey("", MAINNET)); // "Extended public key cannot be blank."
 * console.log(validateExtendedPublicKey("foo", MAINNET)); // "Extended public key must begin with ..."
 * console.log(validateExtendedPublicKey("xpub123", MAINNET)); // "Extended public key is too short."
 * console.log(validateExtendedPublicKey("tpub123...", MAINNET)); // "Extended public key must begin with ...."
 * console.log(validateExtendedPublicKey("xpub123%%!~~...", MAINNET)); // "Invalid extended public key"
 * console.log(validateExtendedPublicKey("xpub123...", MAINNET)); // ""
 */
declare function validateExtendedPublicKey(xpubString: string | null | undefined, network: BitcoinNetwork): string;
/**
 * Validate the given public key.
 *
 * - Must be valid hex.
 * - Must be a valid BIP32 public key.
 *
 * @param {string} pubkeyHex - (compressed) public key in hex
 * @param {string} [addressType] - one of P2SH, P2SH-P2WSH, P2WSH
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validatePublicKey} from "@caravan/bitcoin";
 * console.log(validatePublicKey("")); // "Public key cannot be blank."
 * console.log(validatePublicKey("zzzz")); // "Invalid hex..."
 * console.log(validatePublicKey("deadbeef")); // "Invalid public key."
 * console.log(validatePublicKey("03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee")); // ""
 * console.log(validatePublicKey("04a17f3ad2ecde2fff2abd1b9ca77f35d5449a3b50a8b2dc9a0b5432d6596afd01ee884006f7e7191f430c7881626b95ae1bcacf9b54d7073519673edaea71ee53")); // ""
 * console.log(validatePublicKey("04a17f3ad2ecde2fff2abd1b9ca77f35d5449a3b50a8b2dc9a0b5432d6596afd01ee884006f7e7191f430c7881626b95ae1bcacf9b54d7073519673edaea71ee53", "P2SH")); // ""
 * console.log(validatePublicKey("04a17f3ad2ecde2fff2abd1b9ca77f35d5449a3b50a8b2dc9a0b5432d6596afd01ee884006f7e7191f430c7881626b95ae1bcacf9b54d7073519673edaea71ee53", "P2WSH")); // "P2WSH does not support uncompressed public keys."
 */
declare function validatePublicKey(pubkeyHex: string | null | undefined, addressType?: string): string;
/**
 * Compresses the given public key.
 *
 * @param {string} publicKey - (uncompressed) public key in hex
 * @returns {string} compressed public key in hex
 * @example
 * import {compressPublicKey} from "@caravan/bitcoin";
 * console.log(compressPublicKey("04b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee6e43c09d025c2ad322382347ec0f69b4e78d8e23c8ff9aa0dd0cb93665ae83d5"));
 * // "03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee"
 */
declare function compressPublicKey(publicKey: string): string;
/**
 * Return the public key at the given BIP32 path below the given
 * extended public key.
 *
 * @param {string} extendedPublicKey - base58 encoded extended public key (`xpub...`)
 * @param {string} bip32Path - BIP32 derivation path string (with or without initial `m/`)
 * @param {module:networks.Networks} network - bitcoin network
 * @returns {string} (compressed) child public key in hex
 * @example
 * import {deriveChildPublicKey, MAINNET} from "@caravan/bitcoin";
 * const xpub = "xpub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
 * console.log(deriveChildPublicKey(xpub, "m/0/0", MAINNET));
 * // "021a0b6eb37bd9d2767a364601e41635a11c1dbbbb601efab8406281e210336ace"
 * console.log(deriveChildPublicKey(xpub, "0/0", MAINNET)); // w/o leading `m/`
 * // "021a0b6eb37bd9d2767a364601e41635a11c1dbbbb601efab8406281e210336ace"
 *
 */
declare function deriveChildPublicKey(extendedPublicKey: string, bip32Path: string, network: BitcoinNetwork): string;
/**
 * Return the extended public key at the given BIP32 path below the
 * given extended public key.
 *
 * @param {string} extendedPublicKey - base58 encoded extended public key (`xpub...`)
 * @param {string} bip32Path - BIP32 derivation path string (with or without initial `m/`)
 * @param {module:networks.Networks} network - bitcoin network
 * @returns {string} child extended public key in base58
 * @example
 * import {deriveChildExtendedPublicKey, MAINNET} from "@caravan/bitcoin";
 * const xpub = "xpub6CCHViYn5VzKSmKD9cK9LBDPz9wBLV7owXJcNDioETNvhqhVtj3ABnVUERN9aV1RGTX9YpyPHnC4Ekzjnr7TZthsJRBiXA4QCeXNHEwxLab";
 * console.log(deriveChildExtendedPublicKey(xpub, "m/0/0", MAINNET));
 * // "xpub6GYTTMaaN8bSEhicdKq7ji9H7B2SL4un33obThv9aekop4J7L7B3snYMnJUuwXJiUmsbSVSyZydbqLC97JMWnj3R4MHz6JNunMJhjEBKovS"
 * console.log(deriveChildExtendedPublicKey(xpub, "0/0", MAINNET)); // without initial `m/`
 * // "xpub6GYTTMaaN8bSEhicdKq7ji9H7B2SL4un33obThv9aekop4J7L7B3snYMnJUuwXJiUmsbSVSyZydbqLC97JMWnj3R4MHz6JNunMJhjEBKovS"

 */
declare function deriveChildExtendedPublicKey(extendedPublicKey: string, bip32Path: string, network: BitcoinNetwork): string;
/**
 * Check if a given pubkey is compressed or not by checking its length
 * and the possible prefixes
 * @param {string | Buffer} _pubkey pubkey to check
 * @returns {boolean} true if compressed, otherwise false
 * @example
 * import {isKeyCompressed} from "@caravan/bitcoin"
 * const uncompressed = "0487cb4929c287665fbda011b1afbebb0e691a5ee11ee9a561fcd6adba266afe03f7c55f784242305cfd8252076d038b0f3c92836754308d06b097d11e37bc0907"
 * const compressed = "0387cb4929c287665fbda011b1afbebb0e691a5ee11ee9a561fcd6adba266afe03"
 * console.log(isKeyCompressed(uncompressed)) // false
 * console.log(isKeyCompressed(compressed)) // true
 */
declare function isKeyCompressed(_pubkey: string | Buffer): boolean;
/**
 * Get fingerprint for a given pubkey. This is useful for generating xpubs
 * which need the fingerprint of the parent pubkey. If not a compressed key
 * then this function will attempt to compress it.
 * @param {string} _pubkey - pubkey to derive fingerprint from
 * @returns {number} fingerprint
 * @example
 * import {getFingerprintFromPublicKey} from "@caravan/bitcoin"
 * const pubkey = "03b32dc780fba98db25b4b72cf2b69da228f5e10ca6aa8f46eabe7f9fe22c994ee"
 * console.log(getFingerprintFromPublicKey(pubkey)) // 724365675
 *
 * const uncompressedPubkey = "04dccdc7fc599ed379c415fc2bb398b1217f0142af23692359057094ce306cd3930e6634c71788b9ed283219ca2fea102aaf137cd74e025cce97b94478a02029cf"
 * console.log(getFingerprintFromPublicKey(uncompressedPubkey)) // 247110101
 */
declare function getFingerprintFromPublicKey(_pubkey: string): number;
/**
 * Take a fingerprint and return a zero-padded, hex-formatted string
 * that is exactly eight characters long.
 *
 * @param {number} xfp the fingerprint
 * @returns {string} zero-padded, fixed-length hex xfp
 *
 * @example
 * import {fingerprintToFixedLengthHex} from "@caravan/bitcoin"
 * const pubkeyFingerprint = 724365675
 * console.log(fingerprintToFixedLengthHex(pubkeyFingerprint)) // 2b2cf16b
 *
 * const uncompressedPubkeyFingerprint = 247110101
 * console.log(fingerprintToFixedLengthHex(uncompressedPubkeyFingerprint)) // 0eba99d5
 */
declare function fingerprintToFixedLengthHex(xfp: number): string;
/**
 * Returns the root fingerprint of the extendedPublicKey
 */
declare function extendedPublicKeyRootFingerprint(extendedPublicKey: Struct): string | null;
/**
 * Derive base58 encoded xpub given known information about
 * BIP32 Wallet Node.
 */
declare function deriveExtendedPublicKey(bip32Path: string, pubkey: string, chaincode: string, parentFingerprint: number, network?: BitcoinNetwork): string;
declare function getMaskedDerivation({ xpub, bip32Path }: {
    xpub: string;
    bip32Path: string;
}, toMask?: string): string;

type KeyPrefix = keyof typeof EXTENDED_PUBLIC_KEY_VERSIONS;
type KeyVersion = typeof EXTENDED_PUBLIC_KEY_VERSIONS[KeyPrefix];

type MultisigAddressType = "P2SH" | "P2WSH" | "P2SH-P2WSH" | "P2TR" | "P2PKH" | "UNKNOWN";

type NETWORKS_KEYS = keyof typeof Network;
type BitcoinNetwork = (typeof Network)[NETWORKS_KEYS];

declare enum FeeValidationError {
    FEE_CANNOT_BE_NEGATIVE = 0,
    FEE_RATE_CANNOT_BE_NEGATIVE = 1,
    FEE_TOO_HIGH = 2,
    FEE_RATE_TOO_HIGH = 3,
    INPUT_AMOUNT_MUST_BE_POSITIVE = 4,
    INVALID_FEE = 5,
    INVALID_FEE_RATE = 6,
    INVALID_INPUT_AMOUNT = 7
}

/**
 * This module provides validation messages related to addresses.
 */

/**
 * Validate a given bitcoin address.
 *
 * Address must be a valid address on the given bitcoin network.
 */
declare function validateAddress(address: string, network: Network): "" | "Address cannot be blank." | "Address must start with one of 'bcrt1', 'm', 'n', or '2' followed by letters or digits." | "Address must start with one of 'tb1', 'm', 'n', or '2' followed by letters or digits." | "Address must start with either of 'bc1', '1' or '3' followed by letters or digits." | "Address is invalid.";
declare function getAddressType(address: string, network: Network): MultisigAddressType;

/**
 * This module provides functions for creating URLs for Blockstream's
 * [block explorer]{@link https://mempool.space}.
 *
 * This module does NOT provide implementations of HTTP requests which
 * fetch data from these URLs.
 */

/**
 * Returns the block explorer URL for the given path and network.
 */
declare function blockExplorerURL(path: string, network: Network): string;
/**
 * Returns the block explorer API URL for the given path and network.
 */
declare function blockExplorerAPIURL(path: string, network: Network): string;
/**
 * Return the block explorer URL for the given transaction ID and network.
 */
declare function blockExplorerTransactionURL(txid: string, network: Network): string;
/**
 * Return the block explorer URL for the given address and network.
 */
declare function blockExplorerAddressURL(address: string, network: Network): string;

/**
 * This module provides functions for braids, which is how we define
 * a group of xpubs with some additional multisig information to define
 * a multisig setup. Sometimes, the word `wallet` is used here, but we
 * view the traditional use of the word 'wallet' as a collection of Braids.
 */

/**
 * Struct object for encoding and decoding braids.
 */
declare class Braid extends Struct {
    addressType: any;
    network: any;
    extendedPublicKeys: any;
    requiredSigners: any;
    index: any;
    sequence: any;
    constructor(options?: any);
    toJSON(): string;
    static fromData(data: any): Braid;
    static fromJSON(string: any): Braid;
}
declare function braidConfig(braid: any): string;
/**
 * Returns the braid's network
 */
declare function braidNetwork(braid: any): any;
/**
 * Returns the braid's addressType
 */
declare function braidAddressType(braid: any): any;
/**
 * Returns the braid's extendedPublicKeys
 */
declare function braidExtendedPublicKeys(braid: any): any;
/**
 * Returns the braid's requiredSigners
 */
declare function braidRequiredSigners(braid: any): any;
/**
 * Returns the braid's index
 */
declare function braidIndex(braid: any): any;
/**
 * Validate that a requested path is derivable from a particular braid
 * e.g. it's both a valid bip32path *and* its first index is the same as the index
 */
declare function validateBip32PathForBraid(braid: any, path: any): void;
/**
 * Returns the braid's pubkeys at particular path (respects the index)
 */
declare function generatePublicKeysAtPath(braid: any, path: any): string[];
/**
 * Returns the braid's pubkeys at particular index under the index
 */
declare function generatePublicKeysAtIndex(braid: any, index: any): string[];
/**
 * Returns the braid's bip32PathDerivation (array of bip32 infos)
 * @param {Braid} braid the braid to interrogate
 * @param {string} path what suffix to generate bip32PathDerivation at
 * @returns {Object[]} array of getBip32Derivation objects
 */
declare function generateBip32DerivationByPath(braid: any, path: any): unknown[];
/**
 * Returns the braid's bip32PathDerivation at a particular index (array of bip32 info)
 */
declare function generateBip32DerivationByIndex(braid: any, index: any): unknown[];
/**
 * Returns a braid-aware Multisig object at particular path (respects index)
 */
declare function deriveMultisigByPath(braid: any, path: any): any;
/**
 * Returns a braid-aware Multisig object at particular index
 */
declare function deriveMultisigByIndex(braid: any, index: any): any;
/**
 * Generate a braid from its parts
 */
declare function generateBraid(network: any, addressType: any, extendedPublicKeys: any, requiredSigners: any, index: any): Braid;

/**
 * This module provides functions for calculating & validating
 * transaction fees.
 */

/**
 * Provide a readable message from a FeeValidationError for user display.
 */
declare function getFeeErrorMessage(error: FeeValidationError | null): string;
/**
 * Validate the given transaction fee and input sats. Returns a fee
 * validation error type if invalid. Returns null if valid.
 */
declare function checkFeeError(feeSats: any, inputsTotalSats: any): FeeValidationError.FEE_CANNOT_BE_NEGATIVE | FeeValidationError.FEE_TOO_HIGH | FeeValidationError.INPUT_AMOUNT_MUST_BE_POSITIVE | FeeValidationError.INVALID_FEE | FeeValidationError.INVALID_INPUT_AMOUNT | null;
/**
 * Validate the given transaction fee rate (sats/vByte). Returns a fee
 * validation error type if invalid. Returns null if valid.
 */
declare function checkFeeRateError(feeRateSatsPerVbyte: any): FeeValidationError.FEE_RATE_CANNOT_BE_NEGATIVE | FeeValidationError.FEE_RATE_TOO_HIGH | FeeValidationError.INVALID_FEE_RATE | null;
/**
 * Validate the given transaction fee rate (in Satoshis/vbyte). Returns an
 * error message if invalid. Returns empty string if valid.
 *
 * - Must be parseable as a number.
 *
 * - Cannot be negative (zero is OK).
 *
 * - Cannot be greater than the limit set by
 *   `MAX_FEE_RATE_SATS_PER_VBYTE`.
 */
declare function validateFeeRate(feeRateSatsPerVbyte: any): string;
/**
 * Validate the given transaction fee (in Satoshis).
 *
 * - Must be a parseable as a number.
 *
 * - Cannot be negative (zero is OK).
 *
 * - Cannot exceed the total input amount.
 *
 * - Cannot be higher than the limit set by `MAX_FEE_SATS`.
 */
declare function validateFee(feeSats: any, inputsTotalSats: any): string;
/**
 * Estimate transaction fee rate based on actual fee and address type, number of inputs and number of outputs.
 */
declare function estimateMultisigTransactionFeeRate(config: any): string | null;
/**
 * Estimate transaction fee based on fee rate, address type, number of inputs and outputs.
 */
declare function estimateMultisigTransactionFee(config: any): string | null;

/**
 * This module provides useful test fixtures.
 *
 * Most test fixtures are derived from the same BIP39 seed phrase
 * (which is also included as a fixture).
 *
 * Test transactions are multisig which allows them to have one of the
 * keys be the open source (private) key above and another be private
 * (private key).  This doubly-private key is held by Unchained
 * Capital.
 *
 * Multisig addresses built from both keys have the advantage that
 * they are open enough to test most aspects of transaction authoring
 * & signing while remaining impossible to spend from without having
 * the private (private) key.  This enables robust public tests of
 * multisig addresses in testnet and mainnet.
 *
 * All the fixtures in this module are accessible through the
 * `TEST_FIXTURES` constant.
 *
 * @module fixtures
 */

declare const ROOT_FINGERPRINT = "f57ec65d";
/**
 * A set of test fixtures mostly built from the same [BIP39 seed phrase]{@link https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki}.
 *
 * Initializing your keystore with this seed phrase will allow you to replicate many of the unit (and integration)
 * tests in this library on your hardware/software.  This is also useful for functional testing.
 *
 * Includes the following properties:
 * - `keys` - given the multisig nature of these fixtures, they involve keys from multiple sources
 * -   `open_source` - open source fixtures
 * -     `bip39Phrase` -- the BIP39 seed phrase used for all other fixtures
 * -     `nodes` -- an object mapping BIP32 paths to the corresponding [HD node]{@link module:fixtures.HDNode} derived from the BIP39 seed phrase above.
 * -   `unchained` - unchained fixtures
 * -     `nodes` -- an object mapping BIP32 paths to the corresponding [HD node]{@link module:fixtures.HDNode} derived from unchained seed phrase (not shared).
 * - `multisigs` -- an array of [multisig addresses]{@link module:fixtures.MultisigAddress} derived from the HD nodes above.
 * - `braids` -- an array of [braids]{@link module.braid.Braid} derived from the open_source + unchained HD nodes above.
 * - `transactions` -- an array of [transactions]{@link module:fixtures.MultisigTransaction} from the multisig address above.
 *
 * @example
 * import {TEST_FIXTURES} from "@caravan/bitcoin";
 * console.log(TEST_FIXTURES.keys.open_source.bip39Phrase);
 * // merge alley lucky axis penalty manage latin gasp virus captain wheel deal chase fragile chapter boss zero dirt stadium tooth physical valve kid plunge
 *
 */
declare const TEST_FIXTURES: {
    keys: {
        open_source: {
            bip39Phrase: string[];
            nodes: {};
        };
        unchained: {
            nodes: {};
        };
    };
    braids: {
        network: Network;
        addressType: string;
        extendedPublicKeys: {
            base58String: string;
            chaincode: string;
            depth: number;
            index: number;
            parentFingerprint: number;
            path: string;
            pubkey: string;
            rootFingerprint: string;
            version: string;
        }[];
        stringExtendedPublicKeys: string[];
        requiredSigners: number;
        index: string;
        pubKeySets: {
            index: {
                0: string[];
                1: string[];
                48349: string[];
            };
            path: {
                "0/0": string[];
            };
        };
        bip32Derivations: {
            index: {
                0: {
                    masterFingerprint: Buffer;
                    path: string;
                    pubkey: Buffer;
                }[];
                1: {
                    masterFingerprint: Buffer;
                    path: string;
                    pubkey: Buffer;
                }[];
                48349: {
                    masterFingerprint: Buffer;
                    path: string;
                    pubkey: Buffer;
                }[];
            };
            path: {
                "0/0": {
                    masterFingerprint: Buffer;
                    path: string;
                    pubkey: Buffer;
                }[];
            };
        };
    }[];
    multisigs: ({
        description: string;
        utxos: any[];
        transaction: {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        };
        multisig: {};
        braidAwareMultisig: {};
        multisigScript: any;
        multisigScriptOps: string | undefined;
        multisigScriptHex: string | undefined;
        network: Network;
        type: string;
        bip32Path: string;
        policyHmac: string;
        publicKey: string;
        publicKeys: string[];
        changePublicKeys: string[];
        redeemScriptOps: string;
        redeemScriptHex: string;
        scriptOps: string;
        scriptHex: string;
        address: string;
        bip32Derivation: {
            masterFingerprint: Buffer;
            path: string;
            pubkey: Buffer;
        }[];
        changeBip32Derivation: {
            masterFingerprint: Buffer;
            path: string;
            pubkey: Buffer;
        }[];
        braidDetails: {
            network: Network;
            addressType: string;
            extendedPublicKeys: {
                base58String: string;
                chaincode: string;
                depth: number;
                index: number;
                parentFingerprint: number;
                path: string;
                pubkey: string;
                rootFingerprint: string;
                version: string;
            }[];
            requiredSigners: number;
            index: string;
        };
        changeBraidDetails: {
            network: Network;
            addressType: string;
            extendedPublicKeys: {
                base58String: string;
                chaincode: string;
                depth: number;
                index: number;
                parentFingerprint: number;
                path: string;
                pubkey: string;
                rootFingerprint: string;
                version: string;
            }[];
            requiredSigners: number;
            index: string;
        };
        psbtNoChange: string;
        psbt: string;
        psbtWithGlobalXpub: string;
        psbtPartiallySigned: string;
        psbtOrderedPartiallySigned: string;
        witnessScriptOps?: undefined;
        witnessScriptHex?: undefined;
    } | {
        description: string;
        utxos: any[];
        transaction: {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        };
        multisig: {};
        braidAwareMultisig: {};
        multisigScript: any;
        multisigScriptOps: string | undefined;
        multisigScriptHex: string | undefined;
        network: Network;
        type: string;
        bip32Path: string;
        policyHmac: string;
        publicKey: string;
        publicKeys: string[];
        witnessScriptOps: string;
        witnessScriptHex: string;
        redeemScriptOps: string;
        redeemScriptHex: string;
        scriptOps: string;
        scriptHex: string;
        address: string;
        braidDetails: {
            network: Network;
            addressType: string;
            extendedPublicKeys: {
                base58String: string;
                chaincode: string;
                depth: number;
                index: number;
                parentFingerprint: number;
                path: string;
                pubkey: string;
                rootFingerprint: string;
                version: string;
            }[];
            requiredSigners: number;
            index: string;
        };
        psbtNoChange: string;
        psbt: string;
        psbtWithGlobalXpub: string;
        psbtPartiallySigned: string;
        changePublicKeys?: undefined;
        bip32Derivation?: undefined;
        changeBip32Derivation?: undefined;
        changeBraidDetails?: undefined;
        psbtOrderedPartiallySigned?: undefined;
    } | {
        description: string;
        utxos: any[];
        transaction: {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        };
        multisig: {};
        braidAwareMultisig: {};
        multisigScript: any;
        multisigScriptOps: string | undefined;
        multisigScriptHex: string | undefined;
        network: Network;
        type: string;
        bip32Path: string;
        policyHmac: string;
        publicKey: string;
        publicKeys: string[];
        witnessScriptOps: string;
        witnessScriptHex: string;
        scriptOps: string;
        scriptHex: string;
        address: string;
        braidDetails: {
            network: Network;
            addressType: string;
            extendedPublicKeys: {
                base58String: string;
                chaincode: string;
                depth: number;
                index: number;
                parentFingerprint: number;
                path: string;
                pubkey: string;
                rootFingerprint: string;
                version: string;
            }[];
            requiredSigners: number;
            index: string;
        };
        psbtNoChange: string;
        psbt: string;
        psbtWithGlobalXpub: string;
        psbtPartiallySigned: string;
        changePublicKeys?: undefined;
        redeemScriptOps?: undefined;
        redeemScriptHex?: undefined;
        bip32Derivation?: undefined;
        changeBip32Derivation?: undefined;
        changeBraidDetails?: undefined;
        psbtOrderedPartiallySigned?: undefined;
    } | {
        description: string;
        utxos: any[];
        transaction: {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        } | {
            outputs: any[];
            hex: string;
            signature: string[];
            byteCeilingSignature: string[];
        };
        multisig: {};
        braidAwareMultisig: {};
        multisigScript: any;
        multisigScriptOps: string | undefined;
        multisigScriptHex: string | undefined;
        network: Network;
        type: string;
        bip32Path: string;
        policyHmac: string;
        publicKey: string;
        publicKeys: string[];
        redeemScriptOps: string;
        redeemScriptHex: string;
        scriptOps: string;
        scriptHex: string;
        address: string;
        braidDetails: {
            network: Network;
            addressType: string;
            extendedPublicKeys: {
                base58String: string;
                chaincode: string;
                depth: number;
                index: number;
                parentFingerprint: number;
                path: string;
                pubkey: string;
                rootFingerprint: string;
                version: string;
            }[];
            requiredSigners: number;
            index: string;
        };
        psbtNoChange: string;
        psbt: string;
        psbtWithGlobalXpub: string;
        psbtPartiallySigned: string;
        changePublicKeys?: undefined;
        bip32Derivation?: undefined;
        changeBip32Derivation?: undefined;
        changeBraidDetails?: undefined;
        psbtOrderedPartiallySigned?: undefined;
        witnessScriptOps?: undefined;
        witnessScriptHex?: undefined;
    })[];
    transactions: any[];
};

/**
 * This module provides functions for sorting & validating multisig
 * transaction inputs.
 */
/**
 * Represents a transaction input.
 *
 * The [`Multisig`]{@link module:multisig.MULTISIG} object represents
 * the address the corresponding UTXO belongs to.
 */
/**
 * Sorts the given inputs according to the [BIP69 standard]{@link https://github.com/bitcoin/bips/blob/master/bip-0069.mediawiki#transaction-inputs}: ascending lexicographic order.
 */
declare function sortInputs(inputs: any): any;
/**
 * Validates the given transaction inputs.
 *
 * Returns an error message if there are no inputs.  Passes each output to [`validateMultisigInput`]{@link module:transactions.validateOutput}.
 */
declare function validateMultisigInputs(inputs: any, braidRequired?: boolean): string;
/**
 * Validates the given transaction input.
 *
 * - Validates the presence and value of the transaction ID (`txid`) property.
 *
 * - Validates the presence and value of the transaction index (`index`) property.
 *
 * - Validates the presence of the `multisig` property.
 */
declare function validateMultisigInput(input: any): string;
/**
 * Validates the given transaction ID.
 */
declare function validateTransactionID(txid?: any): string;
/**
 * Validates the given transaction index.
 */
declare function validateTransactionIndex(indexString?: any): "" | "Index cannot be blank." | "Index is invalid" | "Index cannot be negative.";

/**
 * This module provides an API around the multisig capabilities of the
 * bitcoinjs-lib library.  The API is functional but requires you
 * creating and passing around a [`Multisig`]{@link module:multisig.MULTISIG} object.
 *
 * This `Multisig` object represents the combination of:
 *
 * 1) a sequence of N public keys
 * 2) the number of required signers (M)
 * 3) the address type  (P2SH, P2SH-P2WSH, P2WSH)
 * 4) the bitcoin network
 *
 * This corresponds to a unique bitcoin multisig address.  Note that
 * since (3) & (4) can change without changing (1) & (2), different
 * `Multisig` objects (and their corresponding bitcoin addresses) can
 * have different representations but the same security rules as to
 * who can sign.
 *
 * You can create `Multisig` objects yourself using the following
 * functions:
 *
 * - `generateMultisigFromPublicKeys` which takes public keys as input
 * - `generateMultisigFromHex` which takes a redeem/witness script as input
 *
 * Once you have a `Multisig` object you can pass it around in your
 * code and then ask questions about it using the other functions
 * defined in this module.
 *
 * You can manipulate `Multisig` objects directly but it's better to
 * use the functions from API provided by this module.
 */

/**
 * Describes the return type of several functions in the
 * `payments` module of bitcoinjs-lib.
 *
 * The following functions in this module will return objects of this
 * type:
 *
 * - `generateMultisigFromPublicKeys` which takes public keys as input
 * - `generateMultisigFromHex` which takes a redeem/witness script as input
 *
 * The remaining functions accept these objects as arguments.
 */
/**
 * Enumeration of possible multisig address types ([P2SH]{@link module:p2sh.P2SH}|[P2SH_P2WSH]{@link module:p2sh_p2wsh.P2SH_P2WSH}|[P2WSH]{@link module:p2wsh.P2WSH}).
 */
declare const MULTISIG_ADDRESS_TYPES: {
    P2SH: string;
    P2SH_P2WSH: string;
    P2WSH: string;
};
/**
 * Return an M-of-N [`Multisig`]{@link module:multisig.MULTISIG}
 * object by specifying the total number of signers (M) and the public
 * keys (N total).
 */
declare function generateMultisigFromPublicKeys(network: any, addressType: any, requiredSigners: any, ...publicKeys: any[]): payments.Payment | null;
/**
 * Return an M-of-N [`Multisig`]{@link module.multisig:Multisig}
 * object by passing a script in hex.
 *
 * If the `addressType` is `P2SH` then the script hex being passed is
 * the redeem script.  If the `addressType` is P2SH-wrapped SegWit
 * (`P2SH_P2WSH`) or native SegWit (`P2WSH`) then the script hex being
 * passed is the witness script.
 *
 * In practice, the same script hex can be thought of as any of
 * several address types, depending on context.
 */
declare function generateMultisigFromHex(network: any, addressType: any, multisigScriptHex: any): payments.Payment | null;
/**
 * Return an M-of-N [`Multisig`]{@link module.multisig:Multisig}
 * object by passing in a raw P2MS multisig object (from bitcoinjs-lib).
 *
 * This function is only used internally, do not call it directly.
 */
declare function generateMultisigFromRaw(addressType: any, multisig: any): payments.Payment | null;
/**
 * Return the [address type]{@link module:multisig.MULTISIG_ADDRESS_TYPES} of the given `Multisig` object.
 */
declare function multisigAddressType(multisig: any): "P2SH" | "P2SH-P2WSH" | "P2WSH";
/**
 * Return the number of required signers of the given `Multisig`
 * object.
 */
declare function multisigRequiredSigners(multisig: any): any;
/**
 * Return the number of total signers (public keys) of the given
 * `Multisig` object.
 */
declare function multisigTotalSigners(multisig: any): any;
/**
 * Return the multisig script for the given `Multisig` object.
 *
 * If the address type of the given multisig object is P2SH, the
 * redeem script will be returned.  Otherwise, the witness script will
 * be returned.
 */
declare function multisigScript(multisig: any): any;
/**
 * Return the redeem script for the given `Multisig` object.
 *
 * If the address type of the given multisig object is P2WSH, this
 * will return null.
 */
declare function multisigRedeemScript(multisig: any): any;
/**
 * Return the witness script for the given `Multisig` object.
 *
 * If the address type of the given multisig object is P2SH, this will
 * return null.
 */
declare function multisigWitnessScript(multisig: any): any;
/**
 * Return the (compressed) public keys in hex for the given `Multisig`
 * object.
 *
 * The public keys are in the order used in the corresponding
 * redeem/witness script.
 */
declare function multisigPublicKeys(multisig: any): any;
/**
 * Return the address for a given `Multisig` object.
 */
declare function multisigAddress(multisig: any): any;
/**
 * Return the braid details (if known) for a given `Multisig` object.
 */
declare function multisigBraidDetails(multisig: any): any;

/**
 * This module provides functions for validating transaction
 * output and amounts.
 */

/**
 * Represents an output in a transaction.
 */
/**
 * Validates the given transaction outputs.
 *
 * Returns an error message if there are no outputs.  Passes each output to [`validateOutput`]{@link module:transactions.validateOutput}.
 */
declare function validateOutputs(network: any, outputs: any, inputsTotalSats?: any): string;
/**
 * Validate the given transaction output.
 *
 * - Validates the presence and value of `address`.
 *
 * - Validates the presence and value of `amountSats`.  If `inputsTotalSats`
 *   is also passed, this will be taken into account when validating the
 *   amount.
 */
declare function validateOutput(network: any, output: any, inputsTotalSats?: any): string;
/**
 * Validate the given output amount (in Satoshis).
 *
 * - Must be a parseable as a number.
 *
 * - Cannot be negative (zero is OK).
 *
 * - Cannot be smaller than the limit set by `DUST_LIMIT_SATS`.
 *
 * - Cannot exceed the total input amount (this check is only run if
 *   `inputsTotalSats` is passed.
 *
 *   TODO: minSats accepting a BigNumber is only to maintain some backward
 *   compatibility. Ideally, the arg would not expose this lib's dependencies to
 *   the caller. It should be made to only accept number or string.
 */
declare function validateOutputAmount(amountSats: any, maxSats?: number | string, minSats?: number | string | BigNumber): "" | "Total input amount must be positive." | "Invalid total input amount." | "Invalid output amount." | "Output amount must be positive." | "Output amount is too small." | "Output amount is too large.";

/**
 * This module provides functions and constants for the P2SH address type.
 */
/**
 * Address type constant for "pay-to-script-hash" (P2SH) addresses.
 */
declare const P2SH = "P2SH";
/**
 * Estimate the transaction virtual size (vsize) when spending inputs
 * from the same multisig P2SH address.
 */
declare function estimateMultisigP2SHTransactionVSize(config: any): number;

/**
 * This module provides functions and constants for the P2SH-wrapped
 * P2WSH address type, sometimes written P2SH-P2WSH.
 */
/**
 * Address type constant for "pay-to-script-hash" wrapped
 * "pay-to-witness-script-hash" (P2SH-P2WSH) addresses.
 */
declare const P2SH_P2WSH = "P2SH-P2WSH";
/**
 * Estimate the transaction virtual size (vsize) when spending inputs
 * from the same multisig P2SH-P2WSH address.
 */
declare function estimateMultisigP2SH_P2WSHTransactionVSize(config: any): number;

/**
 * This module provides functions and constants for the P2WSH address type.
 */
/**
 * Address type constant for "pay-to-witness-script-hash" or (P2WSH)
 * addresses.
 */
declare const P2WSH = "P2WSH";
/**
 * calculates size of redeem script given n pubkeys.
 * Calculation looks like:
 * OP_M (1 byte) + size of each pubkey in redeem script (OP_DATA= 1 byte * N) +
 * pubkey size (33 bytes * N) + OP_N (1 byte) + OP_CHECKMULTISIG (1 byte)
 *  => 1 + (1 * N) + (33 * N) + 1 + 1
 */
declare function getRedeemScriptSize(n: any): any;
/**
 * Calculates the value of a multisig witness given m-of-n values
 * Calculation is of the following form:
 * witness_items count (varint 1+) + null_data (1 byte) + size of each signature (1 byte * OP_M) + signatures (73 * M) +
 * redeem script length (1 byte) + redeem script size (4 + 34 * N bytes)
 */
declare function getWitnessSize(m: any, n: any): any;
/**
 * Calculates the size of the fields in a transaction which DO NOT
 * get counted towards witness discount.
 * Calculated as: version bytes (4) + locktime bytes (4) + input_len (1+) + txins (41+) + output_len (1+) + outputs (9+)
 */
declare function calculateBase(inputsCount: any, outputsCount: any): number;
declare function calculateTotalWitnessSize({ numInputs, m, n }: {
    numInputs: any;
    m: any;
    n: any;
}): number;
/**
 * Estimate the transaction virtual size (vsize) when spending inputs
 * from the same multisig P2WSH address.
 */
declare function estimateMultisigP2WSHTransactionVSize(config: any): number;

/**
 * This module contains various utility functions for converting and
 * validating BIP32 derivation paths.
 *
 * @module paths
 */

/**
 * Return the hardened version of the given BIP32 index.
 *
 * Hardening is equivalent to adding 2^31.
 *
 * @param {string|number} index - BIP32 index
 * @returns {number} the hardened index
 * @example
 * import {hardenedBIP32Index} from "@caravan/bitcoin";
 * console.log(hardenedBIP32Index(44); // 2147483692
 */
declare function hardenedBIP32Index(index: any): number;
/**
 * Convert BIP32 derivation path to an array of integer values
 * representing the corresponding derivation indices.
 *
 * Hardened path segments will have the [hardening offset]{@link module:paths.HARDENING_OFFSET} added to the index.
 *
 * @param {string} pathString - BIP32 derivation path string
 * @returns {number[]} the derivation indices
 * @example
 * import {bip32PathToSequence} from "@caravan/bitcoin";
 * console.log(bip32PathToSequence("m/45'/1/99")); // [2147483693, 1, 99]
 */
declare function bip32PathToSequence(pathString: any): number[];
/**
 * Convert a sequence of derivation indices into the corresponding
 * BIP32 derivation path.
 *
 * Indices above the [hardening offset]{@link * module:paths.HARDENING_OFFSET} will be represented wiith hardened * path segments (using a trailing single-quote).
 *
 * @param {number[]} sequence - the derivation indices
 * @returns {string} BIP32 derivation path
 * @example
 * import {bip32SequenceToPath} from "@caravan/bitcoin";
 * console.log(bip32SequenceToPath([2147483693, 1, 99])); // m/45'/1/99
 */
declare function bip32SequenceToPath(sequence: any): string;
/**
 * Validate a given BIP32 derivation path string.
 *
 * - Path segments are validated numerically as well as statically
 *   (the value of 2^33 is an invalid path segment).
 *
 * - The `mode` option can be pass to validate fully `hardened` or
 *   `unhardened` paths.
 *
 * @param {string} pathString - BIP32 derivation path string
 * @param {Object} [options] - additional options
 * @param {string} [options.mode] - "hardened" or "unhardened"
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateBIP32Path} from "@caravan/bitcoin";
 * console.log(validateBIP32Path("")); // "BIP32 path cannot be blank."
 * console.log(validateBIP32Path("foo")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("//45")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("/45/")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("/45''")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path('/45"')); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("/-45")); // "BIP32 path is invalid."
 * console.log(validateBIP32Path("/8589934592")); // "BIP32 index is too high."
 * console.log(validateBIP32Path("/45")); // ""
 * console.log(validateBIP32Path("/45/0'")); // ""
 * console.log(validateBIP32Path("/45/0'", {mode: "hardened")); // "BIP32 path must be fully-hardened."
 * console.log(validateBIP32Path("/45'/0'", {mode: "hardened")); // ""
 * console.log(validateBIP32Path("/0'/0", {mode: "unhardened")); // "BIP32 path cannot include hardened segments."
 * console.log(validateBIP32Path("/0/0", {mode: "unhardened")); // ""
 */
declare function validateBIP32Path(pathString: any, options?: any): "" | "BIP32 path cannot be blank." | "BIP32 path is invalid." | "BIP32 path must be fully-hardened." | "BIP32 path cannot include hardened segments." | "BIP32 index cannot be blank." | "BIP32 index is invalid." | "Invalid BIP32 index." | "BIP32 index is too high." | "BIP32 index must be hardened." | "BIP32 index cannot be hardened.";
/**
 * Validate a given BIP32 index string.
 *
 * - Path segments are validated numerically as well as statically
 *   (the value of 2^33 is an invalid path segment).
 *
 * - By default, 0-4294967295 and 0'-2147483647' are valid.
 *
 * - The `mode` option can be pass to validate index is hardened
 *   `unhardened` paths.
 *
 * - `hardened` paths include 0'-2147483647' and 2147483648-4294967295
 *
 * - `unharded` paths include 0-2147483647
 *
 * @param {string} indexString - BIP32 index string
 * @param {Object} [options] - additional options
 * @param {string} [options.mode] - "hardened" or "unhardened"
 * @returns {string} empty if valid or corresponding validation message if not
 * @example
 * import {validateBIP32Path} from "@caravan/bitcoin";
 * console.log(validateBIP32Path("")); // "BIP32 index cannot be blank."
 * console.log(validateBIP32Path("foo")); // "BIP32 index is invalid."
 * console.log(validateBIP32Path("//45")); // "BIP32 index is invalid."
 * console.log(validateBIP32Path("/45/")); // "BIP32 index is invalid."
 * console.log(validateBIP32Index("4294967296")); // "BIP32 index is too high."
 * console.log(validateBIP32Index("2147483648'")); // "BIP32 index is too high."
 * console.log(validateBIP32Index("45", { mode: "hardened" })); // "BIP32 index must be hardened."
 * console.log(validateBIP32Index("45'", { mode: "unhardened" })); // "BIP32 index cannot be hardened."
 * console.log(validateBIP32Index("2147483648", {mode: "unhardened"})); // "BIP32 index cannot be hardened."
 * console.log(validateBIP32Index("45")); // ""
 * console.log(validateBIP32Index("45'")); // ""
 * console.log(validateBIP32Index("0")); // ""
 * console.log(validateBIP32Index("0'")); // ""
 * console.log(validateBIP32Index("4294967295")); // ""
 * console.log(validateBIP32Index("2147483647")); // ""
 * console.log(validateBIP32Index("2147483647'")); // ""
 */
declare function validateBIP32Index(indexString: any, options?: any): "" | "BIP32 index cannot be blank." | "BIP32 index is invalid." | "Invalid BIP32 index." | "BIP32 index is too high." | "BIP32 index must be hardened." | "BIP32 index cannot be hardened.";
/**
 * Return the default BIP32 root derivation path for the given
 * `addressType` and `network`.
 *
 * - Mainnet:
 *   - P2SH: m/45'/0'/0'
 *   - P2SH-P2WSH: m/48'/0'/0'/1'
 *   - P2WSH: m/48'/0'/0'/2'
 * - Testnet:
 *   - P2SH: m/45'/1'/0'
 *   - P2SH-P2WSH: m/48'/1'/0'/1'
 *   - P2WSH: m/48'/1'/0'/2'
 *
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - address type
 * @param {module:networks.NETWORKS} network - bitcoin network
 * @returns {string} derivation path
 * @example
 * import {multisigBIP32Root} from "@caravan/bitcoin";
 * console.log(multisigBIP32Root(P2SH, MAINNET)); // m/45'/0'/0'
 * console.log(multisigBIP32Root(P2SH_P2WSH, TESTNET); // m/48'/1'/0'/1'
 */
declare function multisigBIP32Root(addressType: any, network: Network): string | null;
/**
 * Returns a BIP32 path at the given `relativePath` under the default
 * BIP32 root path for the given `addressType` and `network`.
 *
 * @param {module:multisig.MULTISIG_ADDRESS_TYPES} addressType - type from which to calculate BIP32 root path
 * @param {module:networks.NETWORKS} network - bitcoin network from which to calculate BIP32 root path
 * @param {number|string} relativePath - the relative BIP32 path (no leading `/`)
 * @returns {string} child BIP32 path
 * @example
 * import {multisigBIP32Path} from "@caravan/bitcoin";
 * console.log(multisigBIP32Path(P2SH, MAINNET, 0); // m/45'/0'/0'/0
 * console.log(multisigBIP32Path(P2SH_P2WSH, TESTNET, "3'/4"); // m/48'/1'/0'/1'/3'/4"
 */
declare function multisigBIP32Path(addressType: any, network: Network, relativePath?: string): string | null;
/**
 * Get the path of the parent of the given path
 * @param {string} bip32Path e.g. "m/45'/0'/0'/0"
 * @returns {string} parent path
 * @example
 * import {getParentBIP32Path} from "@caravan/bitcoin";
 * console.log(getParentBIP32Path("m/45'/0'/0'/0"); // m/45'/0'/0'
 */
declare function getParentBIP32Path(bip32Path: any): any;
/**
 * Get the path of under the parentBIP32Path of the given path
 * @param {string} parentBIP32Path e.g. "m/45'/0'/0'"
 * @param {string} childBIP32Path e.g. "m/45'/0'/0'/0/1/2"
 * @returns {string} relative path below path
 * @example
 * import {getRelativeBIP32Path} from "@caravan/bitcoin";
 * console.log(getRelativeBIP32Path("m/45'/0'/0'", "m/45'/0'/0'/0/1/2"); // 0/1/2
 */
declare function getRelativeBIP32Path(parentBIP32Path: any, childBIP32Path: any): any;

/**
 * This module provides functions for interacting with PSBTs, see BIP174
 * https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
 */
/**
 * Represents a transaction PSBT input.
 *
 * The [`Multisig`]{@link module:multisig.MULTISIG} object represents
 * the address the corresponding UTXO belongs to.
 */
/**
 * Represents an output in a PSBT transaction.
 */
declare const PSBT_MAGIC_HEX = "70736274ff";
declare const PSBT_MAGIC_B64 = "cHNidP8";
declare const PSBT_MAGIC_BYTES: Buffer;
/**
 * Given a string, try to create a Psbt object based on MAGIC (hex or Base64)
 */
declare function autoLoadPSBT(psbtFromFile: any, options?: any): Psbt | null;
/**
 * Take a MultisigTransactionInput and turn it into a MultisigTransactionPSBTInput
 */
declare function psbtInputFormatter(input: any): any;
/**
 * Take a MultisigTransactionOutput and turn it into a MultisigTransactionPSBTOutput
 */
declare function psbtOutputFormatter(output: any): any;
/**
 * Translates a PSBT into inputs/outputs consumable by supported non-PSBT devices in the
 * `@caravan/wallets` library.
 *
 * FIXME - Have only confirmed this is working for P2SH addresses on Ledger on regtest
 */
declare function translatePSBT(network: any, addressType: any, psbt: any, signingKeyDetails: any): {
    unchainedInputs: any;
    unchainedOutputs: any;
    bip32Derivations: any;
} | null;
/**
 * Given an unsigned PSBT, an array of signing public key(s) (one per input),
 * an array of signature(s) (one per input) in the same order as the pubkey(s),
 * adds partial signature object(s) to each input and returns the PSBT with
 * partial signature(s) included.
 *
 * FIXME - maybe we add functionality of sending in a single pubkey as well,
 *         which would assume all of the signature(s) are for that pubkey.
 */
declare function addSignaturesToPSBT(network: any, psbt: any, pubkeys: any, signatures: any): string | null;
/**
 * Extracts the signature(s) from a PSBT.
 * NOTE: there should be one signature per input, per signer.
 *
 * ADDITIONAL NOTE: because of the restrictions we place on braids to march their
 * multisig addresses (slices) forward at the *same* index across each chain of the
 * braid, we do not run into a possible collision with this data structure.
 * BUT - to have this method accommodate the *most* general form of signature parsing,
 * it would be wise to wrap this one level deeper like:
 *
 *                     address: [pubkey : [signature(s)]]
 *
 * that way if your braid only advanced one chain's (member's) index so that a pubkey
 * could be used in more than one address, everything would still function properly.
 */
declare function parseSignaturesFromPSBT(psbtFromFile: any): {} | null;
/**
 * Extracts signatures in order of inputs and returns as array (or array of arrays if multiple signature sets)
 */
declare function parseSignatureArrayFromPSBT(psbtFromFile: any): string[] | string[][] | null;

/**
 * The PsbtV2 class is intended to represent an easily modifiable and
 * serializable psbt of version 2 conforming to BIP0174. Getters exist for all
 * BIP-defined keytypes. Very few setters and modifier methods exist. As they
 * are added, they should enforce implied and documented rules and limitations.
 *
 * Defining BIPs:
 * https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki
 * https://github.com/bitcoin/bips/blob/master/bip-0370.mediawiki
 */
type Key = string;
type Value = Buffer;
type NonUniqueKeyTypeValue = {
    key: string;
    value: string | null;
};
declare enum PsbtGlobalTxModifiableBits {
    INPUTS = "INPUTS",// 0b00000001
    OUTPUTS = "OUTPUTS",// 0b00000010
    SIGHASH_SINGLE = "SIGHASH_SINGLE"
}
declare abstract class PsbtV2Maps {
    protected globalMap: Map<Key, Value>;
    protected inputMaps: Map<Key, Value>[];
    protected outputMaps: Map<Key, Value>[];
    constructor(psbt?: Buffer | string);
    serialize(format?: "base64" | "hex"): string;
    copy(to: PsbtV2): void;
    private copyMaps;
    private copyMap;
}
declare class PsbtV2 extends PsbtV2Maps {
    constructor(psbt?: Buffer | string);
    /**
     * Globals Getters/Setters
     */
    get PSBT_GLOBAL_XPUB(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
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
    get PSBT_GLOBAL_PROPRIETARY(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    /**
     * Input Getters/Setters
     */
    get PSBT_IN_NON_WITNESS_UTXO(): (string | null)[];
    get PSBT_IN_WITNESS_UTXO(): (string | null)[];
    get PSBT_IN_PARTIAL_SIG(): NonUniqueKeyTypeValue[][];
    get PSBT_IN_SIGHASH_TYPE(): (number | null)[];
    get PSBT_IN_REDEEM_SCRIPT(): (string | null)[];
    get PSBT_IN_WITNESS_SCRIPT(): (string | null)[];
    get PSBT_IN_BIP32_DERIVATION(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_IN_FINAL_SCRIPTSIG(): (string | null)[];
    get PSBT_IN_FINAL_SCRIPTWITNESS(): (string | null)[];
    get PSBT_IN_POR_COMMITMENT(): (string | null)[];
    get PSBT_IN_RIPEMD160(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_IN_SHA256(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_IN_HASH160(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_IN_HASH256(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_IN_PREVIOUS_TXID(): string[];
    get PSBT_IN_OUTPUT_INDEX(): number[];
    get PSBT_IN_SEQUENCE(): (number | null)[];
    get PSBT_IN_REQUIRED_TIME_LOCKTIME(): (number | null)[];
    get PSBT_IN_REQUIRED_HEIGHT_LOCKTIME(): (number | null)[];
    get PSBT_IN_TAP_KEY_SIG(): (string | null)[];
    get PSBT_IN_TAP_SCRIPT_SIG(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_IN_TAP_LEAF_SCRIPT(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
    get PSBT_IN_TAP_BIP32_DERIVATION(): NonUniqueKeyTypeValue[] | NonUniqueKeyTypeValue[][];
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
     * Other Getters/Setters
     */
    get nLockTime(): number | null;
    /**
     * Creator/Constructor Methods
     */
    private create;
    private validate;
    dangerouslySetGlobalTxVersion1(): void;
    addGlobalXpub(xpub: Buffer, fingerprint: Buffer, path: string): void;
    addInput({ previousTxId, outputIndex, sequence, nonWitnessUtxo, witnessUtxo, redeemScript, witnessScript, bip32Derivation, }: {
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
    deleteInput(index: number): void;
    deleteOutput(index: number): void;
    private isModifiable;
    addPartialSig(inputIndex: number, pubkey: Buffer, sig: Buffer): void;
    removePartialSig(inputIndex: number, pubkey?: Buffer): void;
    private handleSighashType;
    static FromV0(psbt: string | Buffer, allowTxnVersion1?: boolean): PsbtV2;
}
/**
 * Attempts to extract the version number as uint32LE from raw psbt regardless
 * of psbt validity.
 * @param {string | Buffer} psbt - hex, base64 or buffer of psbt
 * @returns {number} version number
 */
declare function getPsbtVersionNumber(psbt: string | Buffer): number;

/**
 * This module provides functions for converting generic bitcoin
 * scripts to hex or opcodes.
 */
/**
 * Extracts the ASM (opcode) representation of a script from a
 * `Multisig` object.
 */
declare function scriptToOps(multisig: any): string;
/**
 * Extracts the hex representation of a script from a `Multisig`
 * object.
 */
declare function scriptToHex(multisigScript: any): any;

/**
 * This module provides functions for validating and handling
 * multisig transaction signatures.
 */
/**
 * Validate a multisig signature for given input and public key.
 * NOTICE: DEPRECATED in favor of @caravan/psbt validateMultisigSignaturePsbt
 * as it uses the newer version of bitcoinjs-lib to support taproot outputs
 * and is generally more PSBT friendly.
 */
declare function validateMultisigSignature(network: any, inputs: any, outputs: any, inputIndex: any, inputSignature: any): any;
/**
 * This function takes a DER encoded signature and returns it without the SIGHASH_BYTE
 */
declare function signatureNoSighashType(signature: any): any;
/**
 * Create a signature buffer that can be passed to ECPair.verify
 */
declare function multisigSignatureBuffer(signature: any): Buffer;
declare const isValidSignature: (pubkey: Buffer, msghash: Buffer, signature: Buffer) => boolean;

/**
 * Create an unsigned bitcoin transaction based on the network, inputs
 * and outputs.
 *
 * Returns a [`Transaction`]{@link https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/types/transaction.d.ts|Transaction} object from bitcoinjs-lib.
 */
declare function unsignedMultisigTransaction(network: any, inputs: any, outputs: any): Transaction;
/**
 * Create an unsigned bitcoin transaction based on the network, inputs
 * and outputs stored as a PSBT object
 *
 * Returns a [`PSBT`]{@link https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/types/psbt.d.ts|PSBT} object from bitcoinjs-lib.
 */
declare function unsignedMultisigPSBT(network: any, inputs: any, outputs: any, includeGlobalXpubs?: boolean): {
    txn: string;
    data: bip174.Psbt;
    inputCount: number;
    version: number;
    locktime: number;
    txInputs: bitcoinjs_lib_v5.PsbtTxInput[];
    txOutputs: bitcoinjs_lib_v5.PsbtTxOutput[];
};
/**
 * Returns an unsigned Transaction object from bitcoinjs-lib that is not
 * generated via the TransactionBuilder (deprecating soon)
 *
 * FIXME: try squat out old implementation with the new PSBT one and see if
 *   everything works (the tx is the same)
 */
declare function unsignedTransactionObjectFromPSBT(psbt: any): Transaction;
/**
 * Create a fully signed multisig transaction based on the unsigned
 * transaction, inputs, and their signatures.
 */
declare function signedMultisigTransaction(network: any, inputs: any[], outputs: any[], transactionSignatures?: string[][]): Transaction;

/**
 * This module provides conversion and validation functions for units
 * (Satoshis, BTC) and hex strings.
 */

/**
 * Converts a byte array to its hex representation.
 */
declare function toHexString(byteArray: number[] | Buffer): string;
/**
 * Validate whether the given string is base64.
 *
 * - Valid base64 consists of whole groups of 4 characters containing `a-z`, `A-Z`, 0-9,
 *   `+`, or `/`. The end of the string may be padded with `==` or `=` to
 *   complete the four character group.
 */
declare function validBase64(inputString: string): boolean;
/**
 * Validate whether the given string is hex.
 *
 * - Valid hex consists of an even number of characters 'a-f`, `A-F`,
 *   or `0-9`.  This is case-insensitive.
 *
 * - The presence of the common prefix `0x` will make the input be
 *   considered invalid (because of the` `x`).
 */
declare function validateHex(inputString: string): "" | "Invalid hex: odd-length string." | "Invalid hex: only characters a-f, A-F and 0-9 allowed.";
/**
 * Convert a value in Satoshis to BTC.
 *
 * - Accepts both positive and negative input values.
 * - Rounds down (towards zero) input value to the nearest Satoshi.
 */
declare function satoshisToBitcoins(satoshis: string | number): string;
/**
 * Convert a value in BTC to Satoshis.
 *
 * - Accepts both positive and negative input values.
 * - Rounds down output value to the nearest Satoshi.
 */
declare function bitcoinsToSatoshis(btc: string | number): string;
declare const ZERO: BigNumber;
/**
 * Given a buffer as a digest, pass through sha256 and ripemd160
 * hash functions. Returns the result
 */
declare function hash160(buf: Buffer): Buffer;

export { BitcoinNetwork, Braid, EXTENDED_PUBLIC_KEY_VERSIONS, ExtendedPublicKey, FeeValidationError, KeyPrefix, KeyVersion, MULTISIG_ADDRESS_TYPES, MultisigAddressType, Network, P2SH, P2SH_P2WSH, P2WSH, PSBT_MAGIC_B64, PSBT_MAGIC_BYTES, PSBT_MAGIC_HEX, PsbtV2, PsbtV2Maps, ROOT_FINGERPRINT, TEST_FIXTURES, ZERO, addSignaturesToPSBT, autoLoadPSBT, bip32PathToSequence, bip32SequenceToPath, bitcoinsToSatoshis, blockExplorerAPIURL, blockExplorerAddressURL, blockExplorerTransactionURL, blockExplorerURL, braidAddressType, braidConfig, braidExtendedPublicKeys, braidIndex, braidNetwork, braidRequiredSigners, calculateBase, calculateTotalWitnessSize, checkFeeError, checkFeeRateError, compressPublicKey, convertExtendedPublicKey, deriveChildExtendedPublicKey, deriveChildPublicKey, deriveExtendedPublicKey, deriveMultisigByIndex, deriveMultisigByPath, estimateMultisigP2SHTransactionVSize, estimateMultisigP2SH_P2WSHTransactionVSize, estimateMultisigP2WSHTransactionVSize, estimateMultisigTransactionFee, estimateMultisigTransactionFeeRate, extendedPublicKeyRootFingerprint, fingerprintToFixedLengthHex, generateBip32DerivationByIndex, generateBip32DerivationByPath, generateBraid, generateMultisigFromHex, generateMultisigFromPublicKeys, generateMultisigFromRaw, generatePublicKeysAtIndex, generatePublicKeysAtPath, getAddressType, getFeeErrorMessage, getFingerprintFromPublicKey, getMaskedDerivation, getNetworkFromPrefix, getParentBIP32Path, getPsbtVersionNumber, getRedeemScriptSize, getRelativeBIP32Path, getWitnessSize, hardenedBIP32Index, hash160, isKeyCompressed, isValidSignature, multisigAddress, multisigAddressType, multisigBIP32Path, multisigBIP32Root, multisigBraidDetails, multisigPublicKeys, multisigRedeemScript, multisigRequiredSigners, multisigScript, multisigSignatureBuffer, multisigTotalSigners, multisigWitnessScript, networkData, networkLabel, parseSignatureArrayFromPSBT, parseSignaturesFromPSBT, psbtInputFormatter, psbtOutputFormatter, satoshisToBitcoins, scriptToHex, scriptToOps, signatureNoSighashType, signedMultisigTransaction, sortInputs, toHexString, translatePSBT, unsignedMultisigPSBT, unsignedMultisigTransaction, unsignedTransactionObjectFromPSBT, validBase64, validateAddress, validateBIP32Index, validateBIP32Path, validateBip32PathForBraid, validateExtendedPublicKey, validateExtendedPublicKeyForNetwork, validateFee, validateFeeRate, validateHex, validateMultisigInput, validateMultisigInputs, validateMultisigSignature, validateOutput, validateOutputAmount, validateOutputs, validatePrefix, validatePublicKey, validateRootFingerprint, validateTransactionID, validateTransactionIndex };
