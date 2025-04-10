import * as _caravan_bitcoin from '@caravan/bitcoin';
import { MultisigAddressType, BitcoinNetwork } from '@caravan/bitcoin';

interface DeviceError extends Error {
    message: string;
}
interface WalletConfigKeyDerivation {
    xfp: string;
    bip32Path: string;
    xpub: string;
}
type PolicyHmac = string;
type RootFingerprint = string;
interface LedgerPolicyHmacs {
    xfp: string;
    policyHmac: PolicyHmac;
}
interface MultisigWalletConfig {
    name?: string;
    uuid?: string;
    quorum: {
        requiredSigners: number;
        totalSigners?: number;
    };
    addressType: MultisigAddressType;
    extendedPublicKeys: WalletConfigKeyDerivation[];
    network: BitcoinNetwork;
    ledgerPolicyHmacs?: LedgerPolicyHmacs[];
}
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
/**
 * A "Braid" is one of the two sources of derivation information for a
 * multisig wallet (there will be a receive braid and a change braid).
 * BraidDetails provide the data necessary to generate these addresses.
 * This is manifestation in particular however is a somewhat legacy construction
 * as some other objects in the caravan ecosystem would
 * serialize braid details such as these in nested data structures (see LegacyMultisig).
 *
 */
interface BraidDetails {
    network: BitcoinNetwork;
    addressType: MultisigAddressType;
    extendedPublicKeys: {
        path: string;
        index: number;
        depth: number;
        chaincode: string;
        pubkey: string;
        parentFingerprint: number;
        version: string;
        rootFingerprint: string;
        base58String: string;
    }[];
    requiredSigners: number;
    index: number;
}

declare const braidDetailsToWalletConfig: (braidDetails: BraidDetails) => {
    network: _caravan_bitcoin.Network;
    extendedPublicKeys: {
        xpub: string;
        bip32Path: string;
        xfp: string;
    }[];
    quorum: {
        requiredSigners: number;
        totalSigners: number;
    };
    name: string;
    addressType: _caravan_bitcoin.MultisigAddressType;
};

export { type BraidDetails, type DeviceError, type LedgerPolicyHmacs, type LegacyInput, type LegacyMultisig, type LegacyOutput, type MultisigWalletConfig, type PolicyHmac, type RootFingerprint, type WalletConfigKeyDerivation, braidDetailsToWalletConfig };
