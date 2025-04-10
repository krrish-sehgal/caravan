import { Bip32Derivation } from 'bip174/src/lib/interfaces';
import { Network } from '@caravan/bitcoin';

interface KeyOrigin {
    xpub: string;
    bip32Path: string;
    rootFingerprint: string;
}

/**
 * @description Returns a random BIP32 path of a given depth. The
 * randomness is generated using the Node.js crypto module.
 * Can be used for blinding an xpub.
 * Based on buidl's equivalent function:
 * https://github.com/buidl-bitcoin/buidl-python/blob/main/buidl/blinding.py
 *
 * Approx entropy by depth:
 *       1: 31
 *       2: 62
 *       3: 93
 *       4: 124
 *       5: 155
 *       6: 186
 *       7: 217
 *       8: 248
 *       9: 279
 * @param depth
 * @returns {string} - BIP32 path as string
 */
declare const secureSecretPath: (depth?: number) => string;
/**
 * Given two BIP32 paths, combine them into a single path.
 * Useful for creating blinded xpubs when you have the source
 * path and want to append the randomly generated one
 * @param firstPath
 * @param secondPath
 * @returns {string} new combined bip32 path
 */
declare const combineBip32Paths: (firstPath: string, secondPath: string) => string;
/**
 * Given a derivation and a global xpub, return the unmasked path
 * that can be used to derive the child pubkey from the global xpub.
 * This is useful when you have a child xpub (e.g. a blinded xpub) derived
 * from a masked xpub and you need to generate the full, unmasked path.
 * @param derivation {Bip32Derivation}
 * @param globalXpub {KeyOrigin}
 * @returns {string} - unmasked path
 */
declare const getUnmaskedPath: (derivation: Bip32Derivation, globalXpub: KeyOrigin) => string;

/**
 * When you have a global xpub from a PSBT, it's useful to make
 * sure that a child pubkey can be derived from that psbt. Sometimes
 * the pubkey derivation comes from a masked and/or blinded xpub.
 * So we need to combine the child derivation with the global
 * and confirm that the pubkey can be derived from that source
 * @param derivation {Bip32Derivation} - derivation to validate.
 * This type is from the bitcoinjs-lib bip174 package
 * @param globalXpub {KeyOrigin} - global xpub from the psbt
 * @param network {Network}
 * @returns {boolean} whether the child pubkey can be derived from the global xpub
 */
declare const isValidChildPubKey: (derivation: Bip32Derivation, globalXpub: KeyOrigin, network?: Network) => boolean;
/**
 *
 * @param xpub {string}
 * @param network [Network]
 * @returns {string} - updated xpub with given network
 */
declare const setXpubNetwork: (xpub: string, network?: Network) => string;
/**
 * @description Derive a masked key origin from an xpub. Useful for generating
 * descriptors and wallet configurations for keys that don't need to have their
 * key origin info revealed.
 * Bip32 path will use all 0s for the depth of the given xpub and the
 * root fingerprint will be set to the parent fingerprint of the xpub
 * @param xpub {string} - xpub to mask
 * @returns
 */
declare const getMaskedKeyOrigin: (xpub: string) => KeyOrigin;
/**
 * Given a source xpub, derive a child xpub at a random path using secureSecretPath
 * defaults to depth 4. Useful for creating blinded xpubs or generating random child
 * xpubs (e.g. strands)
 * @param sourceOrigin {KeyOrigin}
 * @param network [Network] - if not provided will just default to the source xpub's network
 * @returns {KeyOrigin} - Child xpub and path
 */
declare const getRandomChildXpub: (sourceOrigin: KeyOrigin, depth?: number, network?: Network) => KeyOrigin;
/**
 * @description Given a source xpub, derive a blinded xpub at a random path.
 * Will target 128 bits of entropy for the path with a depth of 4.
 * @param rawXpub {string} - xpub to blind
 * @returns
 */
declare const getBlindedXpub: (rawXpub: string) => KeyOrigin;

export { KeyOrigin, combineBip32Paths, getBlindedXpub, getMaskedKeyOrigin, getRandomChildXpub, getUnmaskedPath, isValidChildPubKey, secureSecretPath, setXpubNetwork };
