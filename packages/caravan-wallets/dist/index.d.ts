import Bowser from 'bowser';
import * as bitbox_api from 'bitbox-api';
import { PairedBitBox, BtcScriptConfig } from 'bitbox-api';
import * as _caravan_bitcoin from '@caravan/bitcoin';
import { MultisigAddressType, BitcoinNetwork, Network } from '@caravan/bitcoin';
import { WalletPolicy } from 'ledger-bitcoin';
import { MultisigWalletConfig as MultisigWalletConfig$1, BraidDetails, LegacyInput, LegacyOutput } from '@caravan/multisig';
import * as _trezor_connect_lib_types_api_signMessage from '@trezor/connect/lib/types/api/signMessage';
import * as _trezor_connect_lib_types_api_getAddress from '@trezor/connect/lib/types/api/getAddress';
import * as _trezor_connect_lib_types_api_signTransaction from '@trezor/connect/lib/types/api/signTransaction';
import * as _trezor_connect_lib_types_api_getPublicKey from '@trezor/connect/lib/types/api/getPublicKey';

/**
 * This module provides base classes for modeling interactions with
 * keystores.
 *
 * It also defines several constants used throughout the API for
 * categorizing messages.
 *
 * Integrations with new wallets should begin by creating a base class
 * for that wallet by subclassing either `DirectKeystoreInteraction`
 * or `IndirectKeystoreInteraction`.
 */

/**
 * Constant representing a keystore which is unsupported due to the
 * kind of interaction or combination of paramters provided.
 */
declare const UNSUPPORTED = "unsupported";
/**
 * Constant representing a keystore pending activation by the user.
 */
declare const PENDING = "pending";
/**
 * Constant representing a keystore in active use.
 */
declare const ACTIVE = "active";
/**
 * Constant for messages at the "info" level.
 */
declare const INFO = "info";
/**
 * Constant for messages at the "warning" level.
 */
declare const WARNING = "warning";
/**
 * Constant for messages at the "error" level.
 */
declare const ERROR = "error";
/**
 * Enumeration of possible keystore states ([PENDING]{@link module:interaction.PENDING}|[ACTIVE]{@link module:interaction.ACTIVE}|[UNSUPPORTED]{@link module:interaction.UNSUPPORTED}).
 *
 */
declare const STATES: string[];
/**
 * Enumeration of possible message levels ([INFO]{@link module:interaction.INFO}|[WARNING]{@link module:interaction.WARNING}|[ERROR]{@link module:interaction.ERROR}).
 */
declare const LEVELS: string[];
/**
 * Represents a message returned by an interaction.
 *
 * Message objects may have additional properties.
 */
type Message = {
    state?: typeof STATES extends readonly (infer ElementType)[] ? ElementType : never;
    level?: string;
    code?: string;
    text?: string;
    version?: string;
    action?: string;
    image?: MessageImage;
    messages?: Message[];
    preProcessingTime?: number;
    postProcessingTime?: number;
};
/**
 * Represents an image in a message returned by an interaction.
 */
type MessageImage = {
    label: string;
    mimeType: string;
    data: string;
};
type MessageMethodArgs = {
    state?: Message["state"];
    level?: Message["level"];
    code?: Message["code"] | RegExp;
    text?: Message["text"] | RegExp;
    version?: Message["version"] | RegExp;
};
type FormatType = "buffer" | "hex";
type FormatReturnType<T extends FormatType> = T extends "buffer" ? Buffer : string;
/**
 * Abstract base class for all keystore interactions.
 *
 * Concrete subclasses will want to subclass either
 * `DirectKeystoreInteraction` or `IndirectKeystoreInteraction`.
 *
 * Defines an API for subclasses to leverage and extend.
 *
 * - Subclasses should not have any internal state.  External tools
 *   (UI frameworks such as React) will maintain state and pass it
 *   into the interaction in order to display properly.
 *
 * - Subclasses may override the default constructor in order to allow
 *   users to pass in parameters.
 *
 * - Subclasses should override the `messages` method to customize
 *   what messages are surfaced in applications at what state of the
 *   user interface.
 *
 * - Subclasses should not try to catch all errors, instead letting
 *   them bubble up the stack.  This allows UI developers to deal with
 *   them as appropriate.
 *
 * @example
 * import {KeystoreInteraction, PENDING, ACTIVE, INFO} from "@caravan/wallets";
 * class DoNothingInteraction extends KeystoreInteraction {
 *
 *   constructor({param}) {
 *     super();
 *     this.param = param;
 *   }
 *
 *   messages() {
 *     const messages = super.messages()
 *     messages.push({state: PENDING, level: INFO, text: `Interaction pending: ${this.param}` code: "pending"});
 *     messages.push({state: ACTIVE, level: INFO, text: `Interaction active: ${this.param}` code: "active"});
 *     return messages;
 *   }
 *
 * }
 *
 * // usage
 * const interaction = new DoNothingInteraction({param: "foo"});
 * console.log(interaction.messageTextFor({state: ACTIVE})); // "Interaction active: foo"
 * console.log(interaction.messageTextFor({state: PENDING})); // "Interaction pending: foo"
 *
 */
declare class KeystoreInteraction {
    environment: Bowser.Parser.Parser;
    /**
     * Base constructor.
     *
     * Subclasses will often override this constructor to accept options.
     *
     * Just make sure to call `super()` if you do that!
     */
    constructor();
    /**
     * Subclasses can override this method to indicate they are not
     * supported.
     *
     * This method has access to whatever options may have been passed
     * in by the constructor as well as the ability to interact with
     * `this.environment` to determine whether the functionality is
     * supported.  See the Bowser documentation for more details:
     * https://github.com/lancedikson/bowser
     *
     * @example
     * isSupported() {
     *   return this.environment.satisfies({
     *     * declare browsers per OS
     *     windows: {
     *       "internet explorer": ">10",
     *     },
     *     macos: {
     *       safari: ">10.1"
     *     },
     *
     *     * per platform (mobile, desktop or tablet)
     *     mobile: {
     *       safari: '>=9',
     *       'android browser': '>3.10'
     *     },
     *
     *     * or in general
     *     chrome: "~20.1.1432",
     *     firefox: ">31",
     *     opera: ">=22",
     *
     *     * also supports equality operator
     *     chrome: "=20.1.1432", * will match particular build only
     *
     *     * and loose-equality operator
     *     chrome: "~20",        * will match any 20.* sub-version
     *     chrome: "~20.1"       * will match any 20.1.* sub-version (20.1.19 as well as 20.1.12.42-alpha.1)
     *   });
     * }
     */
    isSupported(): boolean;
    /**
     * Return messages array for this interaction.
     *
     * The messages array is a (possibly empty) array of `Message` objects.
     *
     * Subclasses should override this method and add messages as
     * needed.  Make sure to call `super.messages()` to return an empty
     * messages array for you to begin populating.
     */
    messages(): Message[];
    /**
     * Return messages filtered by the given options.
     *
     * Multiple options can be given at once to filter along multiple
     * dimensions.
     *
     * @example
     * import {PENDING, ACTIVE} from "@caravan/bitcoin";
     * // Create any interaction instance
     * interaction.messages().forEach(msg => console.log(msg));
     *   { code: "device.connect", state: "pending", level: "info", text: "Please plug in your device."}
     *   { code: "device.active", state: "active", level: "info", text: "Communicating with your device..."}
     *   { code: "device.active.warning", state: "active", level: "warning", text: "Your device will warn you about...", version: "2.x"}
     * interaction.messagesFor({state: PENDING}).forEach(msg => console.log(msg));
     *   { code: "device.connect", state: "pending", level: "info", text: "Please plug in your device."}
     * interaction.messagesFor({code: ACTIVE}).forEach(msg => console.log(msg));
     *   { code: "device.active", state: "active", level: "info", text: "Communicating with your device..."}
     *   { code: "device.active.warning", state: "active", level: "warning", text: "Your device will warn you about...", version: "2.x"}
     * interaction.messagesFor({version: /^2/}).forEach(msg => console.log(msg));
     *   { code: "device.active", state: "active", level: "warning", text: "Your device will warn you about...", version: "2.x"}
     */
    messagesFor({ state, level, code, text, version }: MessageMethodArgs): Message[];
    /**
     * Return whether there are any messages matching the given options.
     */
    hasMessagesFor({ state, level, code, text, version }: MessageMethodArgs): boolean;
    /**
     * Return the first message matching the given options (or `null` if none is found).
     */
    messageFor({ state, level, code, text, version }: MessageMethodArgs): Message | null;
    /**
     * Retrieve the text of the first message matching the given options
     * (or `null` if none is found).
     */
    messageTextFor({ state, level, code, text, version }: MessageMethodArgs): string | null;
}
/**
 * Class used for describing an unsupported interaction.
 *
 * - Always returns `false` when the `isSupported` method is called.
 *
 * - Has a keystore state `unsupported` message at the `error` level.
 *
 * - Throws errors when attempting to call API methods such as `run`,
 *   `request`, and `parse`.
 *
 * @example
 * import {UnsupportedInteraction} from "@caravan/wallets";
 * const interaction = new UnsupportedInteraction({text: "failure text", code: "fail"});
 * console.log(interaction.isSupported()); // false
 *
 */
declare class UnsupportedInteraction extends KeystoreInteraction {
    text: string;
    code: string;
    /**
     * Accepts parameters to describe what is unsupported and why.
     *
     * The `text` should be human-readable.  The `code` is for machines.
     */
    constructor({ text, code }: {
        text: string;
        code: string;
    });
    /**
     * By design, this method always returns false.
     */
    isSupported(): boolean;
    /**
     * Returns a single `error` level message at the `unsupported`
     * state.
     */
    messages(): Message[];
    /**
     * Throws an error.
     *
     */
    run(): Promise<any>;
    /**
     * Throws an error.
     *
     */
    request(): void;
    /**
     * Throws an error.
     *
     */
    parse(): void;
}
/**
 * Base class for direct keystore interactions.
 *
 * Subclasses *must* implement a `run` method which communicates
 * directly with the keystore.  This method must be asynchronous
 * (return a `Promise`) to accommodate delays with network, devices,
 * &c.
 *
 * @example
 * import {DirectKeystoreInteraction} from "@caravan/wallets";
 * class SimpleDirectInteraction extends DirectKeystoreInteraction {   *
 *
 *   constructor({param}) {
 *     super();
 *     this.param = param;
 *   }
 *
 *   async run() {
 *     // Or do something complicated...
 *     return this.param;
 *   }
 * }
 *
 * const interaction = new SimpleDirectInteraction({param: "foo"});
 *
 * const result = await interaction.run();
 * console.log(result);
 * // "foo"
 *
 */
declare class DirectKeystoreInteraction extends KeystoreInteraction {
    direct: boolean;
    /**
     * Sets the `this.direct` property to `true`.  This property can be
     * utilized when introspecting on interaction classes..
     *
     * @constructor
     */
    constructor();
    /**
     * Initiate the intended interaction and return a result.
     *
     * Subclasses *must* override this function.  This function must
     * always return a promise as it is designed to be called within an
     * `await` block.
     */
    run(): Promise<void | boolean>;
    /**
     * Throws an error.
     */
    request(): void;
    /**
     * Throws an error.
     */
    parse(): void;
    signatureFormatter<T extends FormatType = "hex">(inputSignature: string, format?: T): FormatReturnType<T>;
    parseSignature<T extends FormatType = "hex">(transactionSignature: string[], format?: T): FormatReturnType<T>[];
}
/**
 * Base class for indirect keystore interactions.
 *
 * Subclasses *must* implement two methods: `request` and `parse`.
 * Application code will pass the result of calling `request` to some
 * external process (HTTP request, QR code, &c.) and pass the response
 * to `parse` which should return a result.
 *
 * @example
 * import {IndirectKeystoreInteraction} from "@caravan/wallets";
 * class SimpleIndirectInteraction extends IndirectKeystoreInteraction {   *
 *
 *   constructor({param}) {
 *     super();
 *     this.param = param;
 *   }
 *
 *   request() {
 *     // Construct the data to be passed to the keystore...
 *     return this.param;
 *   }
 *
 *   parse(response) {
 *     // Parse data returned from the keystore...
 *     return response;
 *   }
 *
 * }
 *
 * const interaction = new SimpleIndirectInteraction({param: "foo"});
 *
 * const request = interaction.request();
 * const response = "bar"; // Or do something complicated with `request`
 * const result = interaction.parse(response);
 * console.log(result);
 * // "bar"
 *
 */
declare class IndirectKeystoreInteraction extends KeystoreInteraction {
    indirect: boolean;
    workflow: string[];
    /**
     * Sets the `this.indirect` property to `true`.  This property can
     * be utilized when introspecting on interaction classes.
     *
     * The `this.workflow` property is an array containing one or both
     * of the strings `request` and/or `parse`.  Their presence and
     * order indicates to calling applications whether they are
     * necessary and in which order they should be run.
     */
    constructor();
    /**
     * Provide the request.
     *
     * Subclasses *may* override this function.  It can return any kind
     * of object.  Strings, data for QR codes, HTTP requests, command
     * lines, functions, &c. are all allowed.  Whatever is appropriate
     * for the interaction.
     *
     */
    request(): void;
    /**
     * Parse the response into a result.
     *
     * Subclasses *must* override this function.  It must accept an
     * appropriate kind of `response` object and return the final result
     * of this interaction.
     *
     */
    parse(response: Record<string, unknown> | string): void;
    /**
     * Throws an error.
     */
    run(): Promise<void>;
}

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
interface Summary {
    success: boolean;
    current: number;
    length: number;
}

/**
 * Constant defining BitBox interactions.
 */
declare const BITBOX = "bitbox";
type TShowPairingCode = (pairingCode: string) => (() => void) | null;
/**
 * Base class for interactions with BitBox hardware wallets.
 *
 * Subclasses must implement their own `run()` method.  They may use
 * the `withDevice` method to connect to the BitBox API.
 *
 * @example
 * import {BitBoxInteraction} from "@caravan/wallets";
 * // Simple subclass
 *
 * class SimpleBitBoxInteraction extends BitBoxInteraction {
 *
 *   constructor({param}) {
 *     super({});
 *     this.param =  param;
 *   }
 *
 *   async run() {
 *     return await this.withDevice(async (pairedBitBox) => {
 *       return pairedBitBox.doSomething(this.param); // Not a real BitBox API call
 *     });
 *   }
 *
 * }
 *
 * // usage
 * const interaction = new SimpleBitBoxInteraction({param: "foo"});
 * const result = await interaction.run();
 * console.log(result); // whatever value `app.doSomething(...)` returns
 *
 * The `showPairingCode` callback can be supplied to display and hide the BitBox pairing code.
 * If not provided, the default is to open a browser popup showing the pairing code.
 */
declare class BitBoxInteraction extends DirectKeystoreInteraction {
    appVersion?: string;
    appName?: string;
    showPairingCode?: TShowPairingCode;
    constructor({ showPairingCode }: {
        showPairingCode?: TShowPairingCode;
    });
    /**
     * Adds `pending` messages at the `info` level about ensuring the
     * device is plugged in (`device.connect`) and unlocked
     * (`device.unlock`).  Adds an `active` message at the `info` level
     * when communicating with the device (`device.active`).
     */
    messages(): Message[];
    showPairingCodePopup(pairingCode: string): (() => void) | null;
    withDevice<T>(f: (device: PairedBitBox) => Promise<T>): Promise<T>;
    maybeRegisterMultisig(pairedBitBox: PairedBitBox, walletConfig: MultisigWalletConfig): Promise<{
        scriptConfig: BtcScriptConfig;
        keypathAccount: string;
    }>;
    run(): Promise<any>;
}
/**
 * Returns metadata about the BitBox device.
 *
 * @example
 * import {BitBoxGetMetadata} from "@caravan/wallets";
 * const interaction = new BitBoxGetMetadata();
 * const result = await interaction.run();
 * console.log(result);
 * {
 *   spec: "bitbox02-btconly 9.18.0",
 *   version: {
 *     major: "9",
 *     minor: "18",
 *     patch: "0",
 *     string: "9.18.0"",
 *   },

 *   model: "bitbox02-btconly",
 * }
 *
 */
declare class BitBoxGetMetadata extends BitBoxInteraction {
    constructor({ showPairingCode }: {
        showPairingCode?: TShowPairingCode;
    });
    run(): Promise<{
        spec: string;
        version: {
            major: string;
            minor: string;
            patch: string;
            string: string;
        };
        model: bitbox_api.Product;
    }>;
}
/**
 * Class for public key interaction at a given BIP32 path.
 */
declare class BitBoxExportPublicKey extends BitBoxInteraction {
    network: BitcoinNetwork;
    bip32Path: string;
    includeXFP: boolean;
    /**
     * @param {string} bip32Path path
     * @param {boolean} includeXFP - return xpub with root fingerprint concatenated
     */
    constructor({ showPairingCode, network, bip32Path, includeXFP }: {
        showPairingCode?: TShowPairingCode;
        network: BitcoinNetwork;
        bip32Path: string;
        includeXFP: boolean;
    });
    messages(): Message[];
    /**
     * Retrieve the compressed public key for a given BIP32 path
     */
    run(): Promise<string | {
        publicKey: string | undefined;
        rootFingerprint: string;
    } | undefined>;
}
/**
 * Class for wallet extended public key (xpub) interaction at a given BIP32 path.
 */
declare class BitBoxExportExtendedPublicKey extends BitBoxInteraction {
    bip32Path: string;
    network: BitcoinNetwork;
    includeXFP: boolean;
    /**
     * @param {string} bip32Path path
     * @param {string} network bitcoin network
     * @param {boolean} includeXFP - return xpub with root fingerprint concatenated
     */
    constructor({ showPairingCode, bip32Path, network, includeXFP }: {
        showPairingCode?: TShowPairingCode;
        network: BitcoinNetwork;
        bip32Path: string;
        includeXFP: boolean;
    });
    messages(): Message[];
    /**
     * Retrieve extended public key (xpub) from BitBox device for a given BIP32 path
     * @example
     * import {BitBoxExportExtendedPublicKey} from "@caravan/wallets";
     * const interaction = new BitBoxExportExtendedPublicKey({network, bip32Path});
     * const xpub = await interaction.run();
     * console.log(xpub);
     */
    run(): Promise<string | {
        xpub: string;
        rootFingerprint: string;
    }>;
}
declare class BitBoxRegisterWalletPolicy extends BitBoxInteraction {
    walletConfig: MultisigWalletConfig;
    constructor({ showPairingCode, walletConfig }: {
        showPairingCode?: TShowPairingCode;
        walletConfig: MultisigWalletConfig;
    });
    messages(): Message[];
    run(): Promise<void>;
}
declare class BitBoxConfirmMultisigAddress extends BitBoxInteraction {
    network: BitcoinNetwork;
    bip32Path: string;
    walletConfig: MultisigWalletConfig;
    constructor({ showPairingCode, network, bip32Path, walletConfig }: {
        showPairingCode?: TShowPairingCode;
        network: BitcoinNetwork;
        bip32Path: string;
        walletConfig: MultisigWalletConfig;
    });
    /**
     * Adds messages about BIP32 path warnings.
     */
    messages(): Message[];
    run(): Promise<{
        address: string;
        serializedPath: string;
    }>;
}
declare class BitBoxSignMultisigTransaction extends BitBoxInteraction {
    private walletConfig;
    private returnSignatureArray;
    private unsignedPsbt;
    constructor({ showPairingCode, walletConfig, psbt, returnSignatureArray, }: {
        showPairingCode?: TShowPairingCode;
        walletConfig: MultisigWalletConfig;
        psbt: any;
        returnSignatureArray: boolean;
    });
    run(): Promise<string | string[]>;
}

declare const COLDCARD = "coldcard";
declare const COLDCARD_BASE_BIP32_PATHS: {
    "m/45'": string;
    "m/48'/0'/0'/1'": string;
    "m/48'/0'/0'/2'": string;
    "m/48'/1'/0'/1'": string;
    "m/48'/1'/0'/2'": string;
};
declare const COLDCARD_WALLET_CONFIG_VERSION = "1.0.0";
/**
 * Base class for interactions with Coldcard
 */
declare class ColdcardInteraction extends IndirectKeystoreInteraction {
}
/**
 * Base class for JSON Multisig file-based interactions with Coldcard
 * This class handles the file that comes from the `Export XPUB` menu item.
 */
declare class ColdcardMultisigSettingsFileParser extends ColdcardInteraction {
    network: BitcoinNetwork;
    bip32Path: string;
    bip32ValidationErrorMessage: {
        text?: string;
        code?: string;
    };
    bip32ValidationError: string;
    constructor({ network, bip32Path, }: {
        network: BitcoinNetwork;
        bip32Path: string;
    });
    isSupported(): boolean;
    messages(): Message[];
    chrootForBIP32Path(bip32Path: any): string | null;
    /**
     * This validates three things for an incoming Coldcard bip32Path
     *
     * 1. Is the bip32path valid syntactically?
     * 2. Does the bip32path start with one of the known Coldcard chroots?
     * 3. Are there any hardened indices in the relative path below the chroot?
     */
    validateColdcardBip32Path(bip32Path: string): string;
    /**
     * Parse the Coldcard JSON file and do some basic error checking
     * add a field for rootFingerprint (it can sometimes be calculated
     * if not explicitly included)
     *
     */
    parse(file: Record<string, unknown> | string): any;
    /**
     * This method will take the result from the Coldcard JSON and:
     *
     * 1. determine which t/U/V/x/Y/Zpub to use
     * 2. derive deeper if necessary (and able) using functionality
     *    from @caravan/bitcoin
     *
     */
    deriveDeeperXpubIfNecessary(result: Record<string, unknown> | string): any;
}
/**
 * Reads a public key and (optionally) derives deeper from data in an
 * exported JSON file uploaded from the Coldcard.
 *
 * @example
 * const interaction = new ColdcardExportPublicKey();
 * const reader = new FileReader(); // application dependent
 * const jsonFile = reader.readAsText('ccxp-0F056943.json'); // application dependent
 * const {publicKey, rootFingerprint, bip32Path} = interaction.parse(jsonFile);
 * console.log(publicKey);
 * // "026942..."
 * console.log(rootFingerprint);
 * // "0f056943"
 * console.log(bip32Path);
 * // "m/45'/0/0"
 */
declare class ColdcardExportPublicKey extends ColdcardMultisigSettingsFileParser {
    constructor({ network, bip32Path }: {
        network: any;
        bip32Path: any;
    });
    messages(): Message[];
    parse(xpubJSONFile: any): {
        publicKey: string | undefined;
        rootFingerprint: any;
        bip32Path: string;
    };
}
/**
 * Reads an extended public key and (optionally) derives deeper from data in an
 * exported JSON file uploaded from the Coldcard.
 *
 * @example
 * const interaction = new ColdcardExportExtendedPublicKey({network: Network.MAINNET, bip32Path: 'm/45'/0/0'});
 * const reader = new FileReader(); // application dependent
 * const jsonFile = reader.readAsText('ccxp-0F056943.json'); // application dependent
 * const {xpub, rootFingerprint, bip32Path} = interaction.parse(jsonFile);
 * console.log(xpub);
 * // "xpub..."
 * console.log(rootFingerprint);
 * // "0f056943"
 * console.log(bip32Path);
 * // "m/45'/0/0"
 */
declare class ColdcardExportExtendedPublicKey extends ColdcardMultisigSettingsFileParser {
    constructor({ network, bip32Path }: {
        network: any;
        bip32Path: any;
    });
    messages(): Message[];
    parse(xpubJSONFile: any): {
        xpub: any;
        rootFingerprint: any;
        bip32Path: string;
    };
}
/**
 * Returns signature request data via a PSBT for a Coldcard to sign and
 * accepts a PSBT for parsing signatures from a Coldcard device
 *
 * @example
 * const interaction = new ColdcardSignMultisigTransaction({network, inputs, outputs, bip32paths, psbt});
 * console.log(interaction.request());
 * // "cHNidP8BA..."
 *
 * // Parse signatures from a signed PSBT
 * const signatures = interaction.parse(psbt);
 * console.log(signatures);
 * // {'029e866...': ['3045...01', ...]}
 *
 */
declare class ColdcardSignMultisigTransaction extends ColdcardInteraction {
    network: string;
    psbt: any;
    inputs: any[];
    outputs: any[];
    bip32Paths: string[];
    constructor({ network, inputs, outputs, bip32Paths, psbt }: {
        network: any;
        inputs: any;
        outputs: any;
        bip32Paths: any;
        psbt: any;
    });
    messages(): Message[];
    /**
     * Request for the PSBT data that needs to be signed.
     *
     * NOTE: the application may be expecting the PSBT in some format
     * other than the direct Object.
     *
     * E.g. PSBT in Base64 is interaction().request().toBase64()
     */
    request(): any;
    /**
     * This calls a function in @caravan/bitcoin which parses
     * PSBT files for sigantures and then returns an object with the format
     * {
     *   pubkey1 : [sig1, sig2, ...],
     *   pubkey2 : [sig1, sig2, ...]
     * }
     * This format may change in the future or there may be additional options for return type.
     */
    parse(psbtObject: any): {};
}
/**
 * Returns a valid multisig wallet config text file to send over to a Coldcard
 *
 * NOTE: technically only the root xfp of the signing device is required to be
 * correct, but we recommend only setting up the multisig wallet on the Coldcard
 * with complete xfp information. Here we actually turn this recommendation into a
 * requirement so as to minimize the number of wallet-config installations.
 *
 * This will likely move to its own generic class soon, and we'll only leave
 * the specifics of `adapt()` behind.
 *
 * This is an example Coldcard config file from
 * https://coldcardwallet.com/docs/multisig
 *
 * # Coldcard Multisig setup file (exported from 4369050F)
 * #
 * Name: MeMyself
 * Policy: 2 of 4
 * Derivation: m/45'
 * Format: P2WSH
 *
 * D0CFA66B: tpubD9429UXFGCTKJ9NdiNK4rC5...DdP9
 * 8E697B74: tpubD97nVL37v5tWyMf9ofh5rzn...XgSc
 * BE26B07B: tpubD9ArfXowvGHnuECKdGXVKDM...FxPa
 * 4369050F: tpubD8NXmKsmWp3a3DXhbihAYbY...9C8n
 *
 */
declare class ColdcardMultisigWalletConfig {
    jsonConfig: any;
    name: string;
    requiredSigners: number;
    totalSigners: number;
    addressType: MultisigAddressType;
    extendedPublicKeys: WalletConfigKeyDerivation[];
    constructor({ jsonConfig }: {
        jsonConfig: any;
    });
    /**
     * Output to be written to a text file and uploaded to Coldcard.
     */
    adapt(): string;
}

declare const CUSTOM = "custom";
/**
 * Base class for interactions with Custom "devices"
 */
declare class CustomInteraction extends IndirectKeystoreInteraction {
}
/**
 * Base class for text-based (or clipboard pasted) ExtendedPublicKey
 * This class handles parsing/validating the xpub and relevant
 * derivation properties. If no root fingerprint is provided, one will
 * be deterministically assigned.
 *
 * @example
 * const interaction = new CustomExportExtendedPublicKey({network: Network.MAINNET, bip32Path: "m/45'/0'/0'"});
 * const {xpub, rootFingerprint, bip32Path} = interaction.parse({xpub: xpub..., rootFingerprint: 0f056943});
 * console.log(xpub);
 * // "xpub..."
 * console.log(rootFingerprint);
 * // "0f056943"
 * console.log(bip32Path);
 * // "m/45'/0'/0'"
 * ** OR **
 * * const {xpub, rootFingerprint, bip32Path} = interaction.parse({xpub: xpub...});
 * console.log(xpub);
 * // "xpub..."
 * console.log(rootFingerprint);
 * // "096aed5e"
 * console.log(bip32Path);
 * // "m/45'/0'/0'"
 */
declare class CustomExportExtendedPublicKey extends CustomInteraction {
    network: BitcoinNetwork;
    bip32Path: string;
    validationErrorMessages: any[];
    constructor({ network, bip32Path }: {
        network: any;
        bip32Path: any;
    });
    isSupported(): boolean;
    messages(): Message[];
    /**
     * Parse the provided JSON and do some basic error checking
     */
    parse(data: any): {
        xpub: any;
        rootFingerprint: any;
        bip32Path: string;
    };
}
/**
 * Returns signature request data via a PSBT for a Custom "device" to sign and
 * accepts a PSBT for parsing signatures from a Custom "device"
 *
 * @example
 * const interaction = new CustomSignMultisigTransaction({network, inputs, outputs, bip32paths, psbt});
 * console.log(interaction.request());
 * // "cHNidP8BA..."
 *
 * // Parse signatures from a signed PSBT
 * const signatures = interaction.parse(psbt);
 * console.log(signatures);
 * // {'029e866...': ['3045...01', ...]}
 *
 */
declare class CustomSignMultisigTransaction extends CustomInteraction {
    network: BitcoinNetwork;
    inputs: any;
    outputs: any;
    bip32Paths: any;
    psbt: any;
    constructor({ network, inputs, outputs, bip32Paths, psbt }: {
        network: any;
        inputs: any;
        outputs: any;
        bip32Paths: any;
        psbt: any;
    });
    messages(): Message[];
    /**
     * Request for the PSBT data that needs to be signed.
     *
     * NOTE: the application may be expecting the PSBT in some format
     * other than the direct Object.
     *
     * E.g. PSBT in Base64 is interaction().request().toBase64()
     */
    request(): any;
    /**
     * This calls a function in @caravan/bitcoin which parses
     * PSBT files for sigantures and then returns an object with the format
     * {
     *   pubkey1 : [sig1, sig2, ...],
     *   pubkey2 : [sig1, sig2, ...]
     * }
     * This format may change in the future or there may be additional options for return type.
     */
    parse(psbtObject: any): {};
}

declare const HERMIT = "hermit";
/**
 * Base class for interactions with Hermit.
 */
declare class HermitInteraction extends IndirectKeystoreInteraction {
    messages(): Message[];
}
declare class HermitExportExtendedPublicKey extends HermitInteraction {
    bip32Path: string;
    constructor({ bip32Path }: {
        bip32Path: any;
    });
    messages(): Message[];
    parse(descriptorHex: any): {
        rootFingerprint: string;
        bip32Path: string;
        xpub: string;
    };
}
/**
 * Displays a signature request for Hermit's `sign` command and reads
 * the resulting signature.
 *
 * This interaction class works in tandem with the `BCURDecoder`
 * class.  The `BCURDecoder` parses data from Hermit, this class
 * interprets it.
 *
 * @example
 * const interaction = new HermitSignMultisigTransaction({psbt});
 * const urParts = interaction.request();
 * console.log(urParts);
 * // [ "ur:...", "ur:...", ... ]
 *
 * // Some application function which knows how to display an animated
 * // QR code sequence.
 * displayQRCodeSequence(urParts);
 *
 * // Hermit returns a PSBT encoded as hex through BC-UR.  Some
 * // application function needs to work with the BCURDecoder class to
 * // parse this data.
 * const signedPSBTHex = readQRCodeSequence();
 *
 * // The interaction parses the data from Hermit.
 * const signedPSBTBase64 = interaction.parse(signedPSBTHex);
 * console.log(signedPSBTBase64);
 * // "cHNidP8B..."
 *
 */
declare class HermitSignMultisigTransaction extends HermitInteraction {
    psbt: string;
    returnSignatureArray: boolean;
    constructor({ psbt, returnSignatureArray }: {
        psbt: any;
        returnSignatureArray?: boolean | undefined;
    });
    messages(): Message[];
    request(): string[];
    parse(signedPSBTHex: any): unknown;
}

declare class KeyOrigin {
    readonly xfp: string;
    readonly bip32Path: string;
    readonly xpub: string;
    constructor({ xfp, bip32Path, xpub, network }: {
        xfp: any;
        bip32Path: any;
        xpub: any;
        network: any;
    });
    /**
     * Returns a key origin information in descriptor format
     * @returns {string} policy template string
     */
    toString(): string;
}
type MultisigScriptType = "sh" | "wsh" | "tr";
/**
 * Takes a wallet config and translates it into a wallet policy template string
 * @param {MultisigWalletConfig} walletConfig - multisig wallet configuration object
 * @returns {string} valid policy template string
 */
declare const getPolicyTemplateFromWalletConfig: (walletConfig: MultisigWalletConfig$1) => string;
declare const getKeyOriginsFromWalletConfig: (walletConfig: MultisigWalletConfig$1) => KeyOrigin[];
declare class MultisigWalletPolicy {
    readonly name: string;
    private template;
    private keyOrigins;
    constructor({ name, template, keyOrigins, }: {
        name: string;
        template: string;
        keyOrigins: KeyOrigin[];
    });
    toJSON(): string;
    toLedgerPolicy(): WalletPolicy;
    get keys(): string[];
    static FromWalletConfig(config: MultisigWalletConfig$1): MultisigWalletPolicy;
}
declare const validateMultisigPolicyScriptType: (template: any) => void;
declare const validateMultisigPolicyKeys: (template: any) => void;
declare const getTotalSignerCountFromTemplate: (template: any) => any;
declare const validateMultisigPolicyTemplate: (template: any) => void;
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

/**
 * Constant defining Ledger interactions.
 */
declare const LEDGER = "ledger";
declare const LEDGER_V2 = "ledger_v2";

/**
 * Constant representing the action of pushing the left button on a
 * Ledger device.
 */
declare const LEDGER_LEFT_BUTTON = "ledger_left_button";
/**
 * Constant representing the action of pushing the right button on a
 * Ledger device.
 */
declare const LEDGER_RIGHT_BUTTON = "ledger_right_button";
/**
 * Constant representing the action of pushing both buttons on a
 * Ledger device.
 */
declare const LEDGER_BOTH_BUTTONS = "ledger_both_buttons";
interface AppAndVersion {
    name: string;
    version: string;
    flags: number | Buffer;
}
/**
 * Base class for interactions with Ledger hardware wallets.
 *
 * Subclasses must implement their own `run()` method.  They may use
 * the `withTransport` and `withApp` methods to connect to the Ledger
 * API's transport or app layers, respectively.
 *
 * Errors are not caught, so users of this class (and its subclasses)
 * should use `try...catch` as always.
 *
 * @example
 * import {LedgerInteraction} from "@caravan/wallets";
 * // Simple subclass
 *
 * class SimpleLedgerInteraction extends LedgerInteraction {
 *
 *   constructor({param}) {
 *     super({});
 *     this.param =  param;
 *   }
 *
 *   async run() {
 *     return await this.withApp(async (app, transport) => {
 *       return app.doSomething(this.param); // Not a real Ledger API call
 *     });
 *   }
 *
 * }
 *
 * // usage
 * const interaction = new SimpleLedgerInteraction({param: "foo"});
 * const result = await interaction.run();
 * console.log(result); // whatever value `app.doSomething(...)` returns
 *
 */
declare class LedgerInteraction extends DirectKeystoreInteraction {
    appVersion?: string;
    appName?: string;
    /**
     * Adds `pending` messages at the `info` level about ensuring the
     * device is plugged in (`device.connect`) and unlocked
     * (`device.unlock`).  Adds an `active` message at the `info` level
     * when communicating with the device (`device.active`).
     */
    messages(): Message[];
    /**
     * Can be called by a subclass during its `run()` method.
     *
     * Creates a transport layer connection and passes control to the
     * `callback` function, with the transport API as the first argument
     * to the function.
     *
     * See the [Ledger API]{@link https://github.com/LedgerHQ/ledgerjs} for general information or a [specific transport API]{@link https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-transport-u2f} for examples of API calls.
     *
     * @example
     * async run() {
     *   return await this.withTransport(async (transport) => {
     *     return transport.doSomething(); // Not a real Ledger transport API call
     *   });
     * }
     */
    withTransport(callback: (transport: any) => any): Promise<any>;
    setAppVersion(): Promise<string>;
    isLegacyApp(): Promise<boolean>;
    /**
     * Can be called by a subclass during its `run()` method.
     *
     * Creates a transport layer connection, initializes a bitcoin app
     * object, and passes control to the `callback` function, with the
     * app API as the first argument to the function and the transport
     * API as the second.
     *
     * See the [Ledger API]{@link https://github.com/LedgerHQ/ledgerjs} for general information or the [bitcoin app API]{@link https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-app-btc} for examples of API calls.
     *
     * @example
     * async run() {
     *   return await this.withApp(async (app, transport) => {
     *     return app.doSomething(); // Not a real Ledger bitcoin app API call
     *   });
     * }
     */
    withApp(callback: (app: any, transport: any) => any): Promise<any>;
    /**
     * Close the Transport to free the interface (E.g. could be used in another tab
     * now that the interaction is over)
     *
     * The way the pubkey/xpub/fingerprints are grabbed makes this a little tricky.
     * Instead of re-writing how that works, let's just add a way to explicitly
     * close the transport.
     */
    closeTransport(): Promise<any>;
}
/**
 * Base class for interactions which must occur when the Ledger device
 * is not in any app but in the dashboard.
 */
declare class LedgerDashboardInteraction extends LedgerInteraction {
    /**
     * Adds `pending` and `active` messages at the `info` level urging
     * the user to be in the Ledger dashboard, not the bitcoin app
     * (`ledger.app.dashboard`).
     */
    messages(): Message[];
}
/**
 * Base class for interactions which must occur when the Ledger device
 * is open to the bitcoin app.
 */
declare abstract class LedgerBitcoinInteraction extends LedgerInteraction {
    /**
     * Whether or not the interaction is supported in legacy versions
     * of the Ledger App (<=v2.0.6)
     */
    abstract isLegacySupported: boolean;
    /**
     * Whether or not the interaction is supported in non-legacy versions
     * of the Ledger App (>=v2.1.0)
     */
    abstract isV2Supported: boolean;
    /**
     * Adds `pending` and `active` messages at the `info` level urging
     * the user to be in the bitcoin app (`ledger.app.bitcoin`).
     */
    messages(): Message[];
    /**
     * Inheriting classes should set properties `this.isLegacySupported`
     * and `this.isV2Supported` to indicate whether a given interaction
     * has support for a given interaction. This method can then be called
     * to check the version of the app being called and return whether or
     * not the interaction is supported based on that version
     */
    isAppSupported(): Promise<boolean>;
    /**
     * Inheriting classes should call the super.run()
     * as well as set the properties of support before calling their run
     * in order to check support before calling the actual interaction run
     *
     * The return type has to remain any to get inheritance typing to work.
     */
    run(): Promise<any>;
}
/**
 * Returns metadata about Ledger device.
 *
 * Includes model name, firmware & MCU versions.
 *
 * @example
 * import {LedgerGetMetadata} from "@caravan/wallets";
 * const interaction = new LedgerGetMetadata();
 * const result = await interaction.run();
 * console.log(result);
 * {
 *   spec: "Nano S v1.4.2 (MCU v1.7)",
 *   model: "Nano S",
 *   version: {
 *     major: "1",
 *     minor: "4",
 *     patch: "2",
 *     string: "1.4.2",
 *   },
 *   mcuVersion: {
 *     major: "1",
 *     minor: "7",
 *     string: "1.7",
 *   }
 * }
 *
 */
declare class LedgerGetMetadata extends LedgerDashboardInteraction {
    run(): Promise<any>;
    /**
     * Parses the binary data returned from the Ledger API call into a
     * metadata object.
     *
     */
    parseMetadata(response: any[]): {
        spec: string;
        model: string;
        version: {
            major: string;
            minor: string;
            patch: string;
            string: string;
        };
        mcuVersion: {
            major: string;
            minor: string;
            string: string;
        };
    };
}
interface LedgerDeviceError {
    text: string;
    code: string;
}
/**
 * Base class for interactions exporting information about an HD node
 * at a given BIP32 path.
 *
 * You may want to use `LedgerExportPublicKey` or
 * `LedgerExportExtendedPublicKey` directly.
 *
 * @example
 * import {MAINNET} from "@caravan/bitcoin";
 * import {LedgerExportHDNode} from "@caravan/wallets";
 * const interaction = new LedgerExportHDNode({network: MAINNET, bip32Path: "m/48'/0'/0'/2'/0"});
 * const node = await interaction.run();
 * console.log(node);
 */
declare abstract class LedgerExportHDNode extends LedgerBitcoinInteraction {
    bip32Path: string;
    bip32ValidationErrorMessage?: LedgerDeviceError;
    abstract isV2Supported: boolean;
    abstract isLegacySupported: boolean;
    /**
     * Requires a valid BIP32 path to the node to export.
     *
     * @param {object} options - options argument
     * @param {string} bip32Path - the BIP32 path for the HD node
     */
    constructor({ bip32Path }: {
        bip32Path: any;
    });
    /**
     * Adds messages related to the warnings Ledger devices produce on various BIP32 paths.
     */
    messages(): Message[];
    /**
     * Returns whether or not the Ledger device will display a warning
     * to the user about an unusual BIP32 path.
     *
     * A "usual" BIP32 path is exactly 5 segments long.  The segments
     * have the following constraints:
     *
     * - Segment 1: Must be equal to `44'`
     * - Segment 2: Can have any value
     * - Segment 3: Must be between `0'` and `100'`
     * - Segment 4: Must be equal to `0`
     * - Segment 5: Must be between `0 and 50000`
     *
     * Any other kind of path is considered unusual and will trigger the
     * warning.
     */
    hasBIP32PathWarning(): boolean;
    /**
     * Get fingerprint from parent pubkey. This is useful for generating xpubs
     * which need the fingerprint of the parent pubkey
     *
     * Optionally get root fingerprint for device. This is useful for keychecks and necessary
     * for PSBTs
     */
    getFingerprint(root?: boolean): Promise<number | string>;
    getXfp(): Promise<any>;
    getParentPublicKey(): Promise<any>;
    getMultisigRootPublicKey(): Promise<any>;
    /**
     * See {@link https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-app-btc#getwalletpublickey}.
     */
    run(): Promise<any>;
}
/**
 * Returns the public key at a given BIP32 path.
 *
 * @example
 * import {LedgerExportPublicKey} from "@caravan/wallets";
 * const interaction = new LedgerExportPublicKey({bip32Path: "m/48'/0'/0'/2'/0"});
 * const publicKey = await interaction.run();
 * console.log(publicKey);
 * // "03..."
 */
declare class LedgerExportPublicKey extends LedgerExportHDNode {
    includeXFP: boolean;
    readonly isLegacySupported = true;
    readonly isV2Supported = false;
    /**
     * @param {string} bip32Path - the BIP32 path for the HD node
     * @param {boolean} includeXFP - return xpub with root fingerprint concatenated
     */
    constructor({ bip32Path, includeXFP }: {
        bip32Path: any;
        includeXFP?: boolean | undefined;
    });
    getV2PublicKey(): Promise<any>;
    /**
     * Parses out and compresses the public key from the response of
     * `LedgerExportHDNode`.
     */
    run(): Promise<any>;
    /**
     * Compress the given public key.
     */
    parsePublicKey(publicKey?: string): string;
}
/**
 * Class for wallet extended public key (xpub) interaction at a given BIP32 path.
 */
declare class LedgerExportExtendedPublicKey extends LedgerExportHDNode {
    network: BitcoinNetwork;
    includeXFP: boolean;
    readonly isLegacySupported = true;
    readonly isV2Supported = true;
    /**
     * @param {string} bip32Path path
     * @param {string} network bitcoin network
     * @param {boolean} includeXFP - return xpub with root fingerprint concatenated
     */
    constructor({ bip32Path, network, includeXFP }: {
        bip32Path: any;
        network: any;
        includeXFP: any;
    });
    messages(): Message[];
    /**
     * Retrieve extended public key (xpub) from Ledger device for a given BIP32 path
     * @example
     * import {LedgerExportExtendedPublicKey} from "@caravan/wallets";
     * const interaction = new LedgerExportExtendedPublicKey({network, bip32Path});
     * const xpub = await interaction.run();
     * console.log(xpub);
     */
    run(): Promise<string | {
        xpub: any;
        rootFingerprint: any;
    }>;
}
interface LedgerSignMultisigTransactionArguments {
    network: BitcoinNetwork;
    inputs?: LegacyInput[];
    outputs?: object[];
    bip32Paths?: string[];
    psbt?: string;
    keyDetails?: {
        xfp: string;
        path: string;
    };
    returnSignatureArray?: boolean;
    pubkeys?: Buffer[];
    v2Options?: LedgerV2SignTxConstructorArguments;
}
/**
 * Returns a signature for a bitcoin transaction with inputs from one
 * or many multisig addresses.
 *
 * - `inputs` is an array of `UTXO` objects from `@caravan/bitcoin`
 * - `outputs` is an array of `TransactionOutput` objects from `@caravan/bitcoin`
 * - `bip32Paths` is an array of (`string`) BIP32 paths, one for each input, identifying the path on this device to sign that input with
 *
 * @example
 * import {
 *   generateMultisigFromHex, TESTNET, P2SH,
 * } from "@caravan/bitcoin";
 * import {LedgerSignMultisigTransaction} from "@caravan/wallets";
 * const redeemScript = "5...ae";
 * const inputs = [
 *   {
 *     txid: "8d276c76b3550b145e44d35c5833bae175e0351b4a5c57dc1740387e78f57b11",
 *     index: 1,
 *     multisig: generateMultisigFromHex(TESTNET, P2SH, redeemScript),
 *     amountSats: '1234000'
 *   },
 *   // other inputs...
 * ];
 * const outputs = [
 *   {
 *     amountSats: '1299659',
 *     address: "2NGHod7V2TAAXC1iUdNmc6R8UUd4TVTuBmp"
 *   },
 *   // other outputs...
 * ];
 * const interaction = new LedgerSignMultisigTransaction({
 *   network: TESTNET,
 *   inputs,
 *   outputs,
 *   bip32Paths: ["m/45'/0'/0'/0", // add more, 1 per input],
 * });
 * const signature = await interaction.run();
 * console.log(signatures);
 * // ["ababab...", // 1 per input]
 */
declare class LedgerSignMultisigTransaction extends LedgerBitcoinInteraction {
    network: BitcoinNetwork;
    inputs: LegacyInput[];
    outputs: object[];
    bip32Paths: string[];
    psbt?: string;
    keyDetails?: {
        xfp: string;
        path: string;
    };
    returnSignatureArray?: boolean;
    pubkeys?: Buffer[];
    v2Options?: LedgerV2SignTxConstructorArguments;
    readonly isLegacySupported = true;
    readonly isV2Supported = false;
    constructor({ network, inputs, outputs, bip32Paths, psbt, keyDetails, returnSignatureArray, v2Options, }: LedgerSignMultisigTransactionArguments);
    /**
     * Adds messages describing the signing flow.
     */
    messages(): Message[];
    preProcessingTime(): number;
    postProcessingTime(): number;
    /**
     * See {@link https://github.com/LedgerHQ/ledgerjs/tree/master/packages/hw-app-btc#signp2shtransaction}.
     *
     * Input signatures produced will always have a trailing `...01`
     * {@link https://bitcoin.org/en/glossary/sighash-all SIGHASH_ALL}
     * byte.
     */
    run(): Promise<any>;
    ledgerInputs(): any[][];
    ledgerKeysets(): string[];
    ledgerOutputScriptHex(): any;
    ledgerBIP32Path(bip32Path: string): string;
    anySegwitInputs(): boolean;
}
/**
 * Returns a signature for a given message by a single public key.
 */
declare class LedgerSignMessage extends LedgerBitcoinInteraction {
    bip32Path: string;
    message: string;
    bip32ValidationErrorMessage?: LedgerDeviceError;
    readonly isLegacySupported = true;
    readonly isV2Supported = false;
    constructor({ bip32Path, message }: {
        bip32Path: string;
        message: string;
    });
    /**
     * Adds messages describing the signing flow.
     */
    messages(): Message[];
    /**
     * See {@link https://github.com/LedgerHQ/ledger-live/tree/develop/libs/ledgerjs/packages/hw-app-btc#signmessagenew}.
     */
    run(): Promise<any>;
}
interface RegistrationConstructorArguments extends MultisigWalletConfig {
    policyHmac?: string;
}
/**
 * A base class for any interactions that need to interact with a registered wallet
 * by providing a base constructor that will generate the key origins and the policy
 * from a given braid as well as methods for registering and returning a policy hmac
 */
declare abstract class LedgerBitcoinV2WithRegistrationInteraction extends LedgerBitcoinInteraction {
    walletPolicy: MultisigWalletPolicy;
    private policyHmac?;
    policyId?: Buffer;
    readonly network: BitcoinNetwork;
    readonly isLegacySupported = false;
    readonly isV2Supported = true;
    constructor({ policyHmac, ...walletConfig }: RegistrationConstructorArguments);
    messages(): Message[];
    get POLICY_HMAC(): string;
    set POLICY_HMAC(policyHmac: string);
    getXfp(): Promise<string>;
    registerWallet(verify?: boolean): Promise<Buffer>;
}
interface LedgerRegisterWalletPolicyArguments extends RegistrationConstructorArguments {
    verify?: boolean;
}
declare class LedgerRegisterWalletPolicy extends LedgerBitcoinV2WithRegistrationInteraction {
    readonly verify: boolean;
    constructor({ verify, policyHmac, ...walletConfig }: LedgerRegisterWalletPolicyArguments);
    messages(): Message[];
    run(): Promise<string>;
}
interface ConfirmAddressConstructorArguments extends RegistrationConstructorArguments {
    expected?: string;
    display?: boolean;
    bip32Path: string;
}
/**
 * Interaction for confirming an address on a ledger device. Requires a registered
 * wallet to complete successfully. Only supported on Ledger v2.1.0 or above.
 */
declare class LedgerConfirmMultisigAddress extends LedgerBitcoinV2WithRegistrationInteraction {
    braidIndex: 0 | 1;
    addressIndex: number;
    readonly expected?: string;
    readonly display = true;
    constructor({ policyHmac, display, expected, bip32Path, ...walletConfig }: ConfirmAddressConstructorArguments);
    /**
     * Adds messages about BIP32 path warnings.
     */
    messages(): Message[];
    getAddress(): Promise<string>;
    run(): Promise<string>;
}
interface LedgerV2SignTxConstructorArguments extends RegistrationConstructorArguments {
    psbt: string | Buffer;
    progressCallback?: () => void;
    returnSignatureArray?: boolean;
}
type InputIndex = number;
type PubKey = Buffer;
type SignatureBuffer = Buffer;
type LedgerSignature = {
    pubkey: PubKey;
    signature: SignatureBuffer;
};
type LedgerSignatures = [InputIndex, LedgerSignature];
declare class LedgerV2SignMultisigTransaction extends LedgerBitcoinV2WithRegistrationInteraction {
    private psbt;
    private returnSignatureArray;
    private signatures;
    progressCallback?: () => void;
    private unsignedPsbt;
    constructor({ psbt, progressCallback, policyHmac, returnSignatureArray, ...walletConfig }: LedgerV2SignTxConstructorArguments);
    signPsbt(): Promise<LedgerSignatures[]>;
    get SIGNATURES(): string[];
    get SIGNED_PSTBT(): string | null;
    run(): Promise<string | string[] | null>;
}

/**
 * Constant defining Trezor interactions.
 */
declare const TREZOR = "trezor";
/**
 * Constant representing the action of pushing the left button on a
 * Trezor device.
 */
declare const TREZOR_LEFT_BUTTON = "trezor_left_button";
/**
 * Constant representing the action of pushing the right button on a
 * Trezor device.
 */
declare const TREZOR_RIGHT_BUTTON = "trezor_right_button";
/**
 * Constant representing the action of pushing both buttons on a
 * Trezor device.
 */
declare const TREZOR_BOTH_BUTTONS = "trezor_both_buttons";
/**
 * Constant representing the action of pushing and holding the Confirm
 * button on a Trezor model T device.
 */
declare const TREZOR_PUSH_AND_HOLD_BUTTON = "trezor_push_and_hold_button";
/**
 * Base class for interactions with Trezor hardware wallets.
 *
 * Assumes we are using TrezorConnect to talk to the device.
 *
 * Subclasses *must* implement a method `this.connectParams` which
 * returns a 2-element array.  The first element of this array should
 * be a `TrezorConnect` method to use (e.g. -
 * `TrezorConnect.getAddress`).  The second element of this array
 * should be the parameters to pass to the given `TrezorConnect`
 * method.
 *
 * Errors thrown when calling TrezorConnect are not caught, so users
 * of this class (and its subclasses) should use `try...catch` as
 * always.
 *
 * Unsuccessful responses (the request succeeded but the Trezor device
 * returned an error message) are intercepted and thrown as errors.
 * This allows upstream `try...catch` blocks to intercept errors &
 * failures uniformly.
 *
 * Subclasses *may* implement the `parse(payload)` method which
 * accepts the response payload object and returns the relevant data.
 *
 * Subclasses will also want to implement a `messages()` method to
 * manipulate the messages returned to the user for each interaction.
 *
 * @example
 * import {TrezorInteraction} from "@caravan/wallets";
 * // Simple subclass
 *
 * class SimpleTrezorInteraction extends TrezorInteraction {
 *
 *   constructor({network, param}) {
 *     super({network});
 *     this.param =  param;
 *   }
 *
 *   connectParams() {
 *     return [
 *       TrezorConnect.doSomething, // Not a real TrezorConnect function...
 *       {
 *         // Many Trezor methods require the `coin` parameter.  The
 *         // value of `this.trezorCoin` is set appropriately based on the
 *         // `network` provided in the constructor.
 *         coin: this.trezorCoin,
 *
 *         // Pass whatever arguments are required
 *         // by the TrezorConnect function being called.
 *         param: this.param,
 *         // ...
 *       }
 *     ];
 *   }
 *
 *   parsePayload(payload) {
 *     return payload.someValue;
 *   }
 *
 * }
 * // usage
 * import {Network} from "@caravan/bitcoin";
 * const interaction = new SimpleTrezorInteraction({network: Network.MAINNET, param: "foo"});
 * const result = await interaction.run();
 * console.log(result); // someValue from payload
 */
declare class TrezorInteraction extends DirectKeystoreInteraction {
    network: Network | null;
    trezorCoin: string;
    constructor({ network }: {
        network: Network | null;
    });
    /**
     * Default messages are added asking the user to plug in their
     * Trezor device (`device.connect`) and about the TrezorConnect
     * popups (`trezor.connect.generic`).
     *
     * Subclasses should override this method and add their own messages
     * (don't forget to call `super()`).
     */
    messages(): Message[];
    /**
     * Awaits the call of `this.method`, passing in the output of
     * `this.params()`.
     *
     * If the call returns but is unsuccessful (`result.success`) is
     * false, will throw the returned error message.  If some other
     * error is thrown, it will not be caught.
     *
     * Otherwise it returns the result of passing `result.payload` to
     * `this.parsePayload`.
     */
    run(): Promise<any>;
    /**
     * Override this method in a subclass to return a 2-element array.
     *
     * The first element should be a functin to call, typically a
     * `TrezorConnect` method, e.g. `TrezorConnect.getAddress`.
     *
     * The second element should be the parameters to pass to this
     * function.
     *
     * By default, the function passed just throws an error.
     */
    connectParams(): {}[];
    /**
     * Override this method in a subclass to parse the payload of a
     * successful response from the device.
     *
     * By default, the entire payload is returned.
     */
    parsePayload(payload: any): any;
}
/**
 * Returns metadata about Trezor device.
 *
 * Includes model name, device label, firmware version, &
 * PIN/passphrase enablement.
 *
 * @example
 * import {TrezorGetMetadata} from "@caravan/wallets";
 * const interaction = new TrezorGetMetadata();
 * const result = await interaction.run();
 * console.log(result);
 * {
 *   spec: "Model 1 v1.8.3 w/PIN",
 *   model: "Model 1",
 *   version: {
 *     major: 1,
 *     minor: 8,
 *     patch: 3,
 *     string: "1.8.3",
 *   },
 *   label: "My Trezor",
 *   pin: true,
 *   passphrase: false,
 * }
 */
declare class TrezorGetMetadata extends TrezorInteraction {
    /**
     * This class doesn't actually require a `network`.
     */
    constructor();
    /**
     * It is underdocumented, but TrezorConnect does support the
     * `getFeatures` API call.
     *
     * See {@link https://github.com/trezor/connect/blob/v8/src/js/core/methods/GetFeatures.js}.
     */
    connectParams(): {}[];
    /**
     * Parses Trezor device featuress into an appropriate metadata
     * shape.
     */
    parsePayload(payload: any): {
        spec: string;
        model: string;
        version: {
            major: any;
            minor: any;
            patch: any;
            string: string;
        };
        label: any;
        pin: any;
        passphrase: any;
    };
}
/**
 * Base class for interactions exporting information about an HD node
 * at a given BIP32 path.
 *
 * You may want to use `TrezorExportPublicKey` or
 * `TrezorExportExtendedPublicKey` directly.
 *
 * @example
 * import {Network} from "@caravan/bitcoin";
 * import {TrezorExportHDNode} from "@caravan/wallets";
 * const interaction = new TrezorExportHDNode({network: Network.MAINNET, bip32Path: "m/48'/0'/0'/2'/0"});
 * const node = await interaction.run();
 * console.log(node); // {publicKey: "", xpub: "", ...}
 *
 */
declare class TrezorExportHDNode extends TrezorInteraction {
    bip32Path: string;
    includeXFP: boolean;
    bip32ValidationErrorMessage: {
        text?: string;
        code?: string;
    };
    constructor({ network, bip32Path, includeXFP }: {
        network: any;
        bip32Path: any;
        includeXFP?: boolean | undefined;
    });
    /**
     * Adds messages related to warnings Trezor devices make depending
     * on the BIP32 path passed.
     */
    messages(): Message[];
    extractDetailsFromPayload({ payload, pubkey }: {
        payload: any;
        pubkey: any;
    }): {
        rootFingerprint: string;
        keyMaterial: string;
    };
    /**
     * See {@link https://github.com/trezor/connect/blob/v8/docs/methods/getPublicKey.md}.
     */
    connectParams(): (typeof _trezor_connect_lib_types_api_getPublicKey.getPublicKey | {
        bundle: {
            path: string;
        }[];
        coin: string;
        crossChain: boolean;
    })[] | (typeof _trezor_connect_lib_types_api_getPublicKey.getPublicKey | {
        path: string;
        coin: string;
        crossChain: boolean;
    })[];
}
/**
 * Returns the public key at a given BIP32 path.
 *
 * @example
 * import {Network} from "@caravan/bitcoin";
 * import {TrezorExportPublicKey} from "@caravan/wallets";
 * const interaction = new TrezorExportPublicKey({network: Network.MAINNET, bip32Path: "m/48'/0'/0'/2'/0"});
 * const publicKey = await interaction.run();
 * console.log(publicKey);
 * // "03..."
 */
declare class TrezorExportPublicKey extends TrezorExportHDNode {
    constructor({ network, bip32Path, includeXFP }: {
        network: any;
        bip32Path: any;
        includeXFP?: boolean | undefined;
    });
    /**
     * Parses the public key from the HD node response.
     *
     */
    parsePayload(payload: any): any;
}
/**
 * Returns the extended public key at a given BIP32 path.
 *
 * @example
 * import {Network} from "@caravan/bitcoin";
 * import {TrezorExportExtendedPublicKey} from "@caravan/wallets";
 * const interaction = new TrezorExportExtendedPublicKey({network: Network.MAINNET, bip32Path: "m/48'/0'/0'"});
 * const xpub = await interaction.run();
 * console.log(xpub);
 * // "xpub..."
 */
declare class TrezorExportExtendedPublicKey extends TrezorExportHDNode {
    constructor({ network, bip32Path, includeXFP }: {
        network: any;
        bip32Path: any;
        includeXFP?: boolean | undefined;
    });
    /**
     * Parses the extended public key from the HD node response.
     *
     * If asking for XFP, return object with xpub and the root fingerprint.
     */
    parsePayload(payload: any): any;
}
/**
 * Returns a signature for a bitcoin transaction with inputs from one
 * or many multisig addresses.
 *
 * - `inputs` is an array of `UTXO` objects from `@caravan/bitcoin`
 * - `outputs` is an array of `TransactionOutput` objects from `@caravan/bitcoin`
 * - `bip32Paths` is an array of (`string`) BIP32 paths, one for each input, identifying the path on this device to sign that input with
 *
 * @example
 * import {
 *   generateMultisigFromHex, TESTNET, P2SH,
 * } from "@caravan/bitcoin";
 * import {TrezorSignMultisigTransaction} from "@caravan/wallets";
 * const redeemScript = "5...ae";
 * const inputs = [
 *   {
 *     txid: "8d276c76b3550b145e44d35c5833bae175e0351b4a5c57dc1740387e78f57b11",
 *     index: 1,
 *     multisig: generateMultisigFromHex(TESTNET, P2SH, redeemScript),
 *     amountSats: '1234000'
 *   },
 *   // other inputs...
 * ];
 * const outputs = [
 *   {
 *     amountSats: '1299659',
 *     address: "2NGHod7V2TAAXC1iUdNmc6R8UUd4TVTuBmp"
 *   },
 *   // other outputs...
 * ];
 * const interaction = new TrezorSignMultisigTransaction({
 *   network: TESTNET,
 *   inputs,
 *   outputs,
 *   bip32Paths: ["m/45'/0'/0'/0", // add more, 1 per input],
 * });
 * const signature = await interaction.run();
 * console.log(signatures);
 * // ["ababab...", // 1 per input]
 */
declare class TrezorSignMultisigTransaction extends TrezorInteraction {
    inputs: any[];
    outputs: any[];
    bip32Paths: string[];
    psbt?: string;
    returnSignatureArray?: boolean;
    pubkeys?: any;
    constructor({ network, inputs, outputs, bip32Paths, psbt, keyDetails, returnSignatureArray, addressType, }: {
        network: any;
        inputs: any;
        outputs: any;
        bip32Paths: any;
        psbt: any;
        keyDetails: any;
        returnSignatureArray: any;
        addressType: any;
    });
    /**
     * Adds messages describing the signing flow.
     */
    messages(): Message[];
    /**
     * See {@link https://github.com/trezor/connect/blob/v8/docs/methods/signTransaction.md}.
     */
    connectParams(): (typeof _trezor_connect_lib_types_api_signTransaction.signTransaction | {
        inputs: any[];
        outputs: {
            amount: string;
            address: any;
            script_type: string;
        }[];
        coin: string;
    })[];
    /**
     * Parses the signature(s) out of the response payload.
     *
     * Ensures each input's signature hasa a trailing `...01` {@link https://bitcoin.org/en/glossary/sighash-all SIGHASH_ALL} byte.
     */
    parsePayload(payload: any): string | string[] | null;
}
declare class TrezorConfirmMultisigAddress extends TrezorInteraction {
    bip32Path: string;
    multisig: any;
    publicKey: string;
    constructor({ network, bip32Path, multisig, publicKey }: {
        network: any;
        bip32Path: any;
        multisig: any;
        publicKey: any;
    });
    /**
     * Adds messages about BIP32 path warnings.
     */
    messages(): Message[];
    /**
     * See {@link https://github.com/trezor/connect/blob/v8/docs/methods/getAddress.md}.
     */
    connectParams(): (typeof _trezor_connect_lib_types_api_getAddress.getAddress | {
        bundle: ({
            path: string;
            showOnTrezor: boolean;
            coin: string;
            crossChain: boolean;
            address?: undefined;
            multisig?: undefined;
            scriptType?: undefined;
        } | {
            path: string;
            address: any;
            showOnTrezor: boolean;
            coin: string;
            crossChain: boolean;
            multisig: {
                m: any;
                pubkeys: any;
            };
            scriptType: string;
        })[];
    })[] | (typeof _trezor_connect_lib_types_api_getAddress.getAddress | {
        path: string;
        address: any;
        showOnTrezor: boolean;
        coin: string;
        crossChain: boolean;
        multisig: {
            m: any;
            pubkeys: any;
        };
        scriptType: string;
    })[];
    parsePayload(payload: any): any;
}
/**
 * Returns a signature for a message given a bip32 path.
 */
declare class TrezorSignMessage extends TrezorInteraction {
    bip32Path: string;
    message: string;
    bip32ValidationErrorMessage: any;
    constructor({ network, bip32Path, message }: {
        network?: string | undefined;
        bip32Path?: string | undefined;
        message?: string | undefined;
    });
    /**
     * Adds messages describing the signing flow.
     */
    messages(): Message[];
    /**
     * See {@link https://github.com/trezor/connect/blob/v8/docs/methods/signMessage.md}.
     */
    connectParams(): (typeof _trezor_connect_lib_types_api_signMessage.signMessage | {
        path: string;
        message: string;
    })[];
}
/**
 * Returns the Trezor API version of the given network.
 */
declare function trezorCoin(network: Network | null): "Bitcoin" | "Regtest" | "Testnet";

declare function smartDecodeUR(workloads: any): {
    success: boolean;
    current: any;
    length: number;
    workloads: any;
    result: string;
};

/**
 * Provides classes for encoding & decoding data using the Blockchain
 * Commons UR (BC-UR) format.
 *
 * The following API classes are implemented:
 *
 * * BCUREncoder
 * * BCURDecoder
 */

/**
 * Encoder class for BC UR data.
 *
 * Encodes a hex string as a sequence of UR parts.  Each UR is a string.
 *
 * Designed for use by a calling application which will typically take
 * the resulting strings and display them as a sequence of animated QR
 * codes.
 *
 * @example
 * import {BCUREncoder} from "@caravan/wallets";
 * const hexString = "deadbeef";
 * const encoder = BCUREncoder(hexString);
 * console.log(encoder.parts())
 * // [ "ur:...", "ur:...", ... ]
 *
 *
 */
declare class BCUREncoder {
    hexString: string;
    fragmentCapacity: number;
    /**
     * Create a new encoder.
     */
    constructor(hexString: string, fragmentCapacity?: number);
    /**
     * Return all UR parts.
     */
    parts(): string[];
}
/**
 * Decoder class for BC UR data.
 *
 * Decodes a hex string from a collection of UR parts.
 *
 * Designed for use by a calling application which is typically
 * in a loop parsing an animated sequence of QR codes.
 *
 * @example
 * import {BCURDecoder} from "@caravan/wallets";
 * const decoder = new BCURDecoder();
 *
 * // Read data until the decoder is complete...
 * while (!decoder.isComplete()) {
 *
 *   // Progress can be fed back to the calling application for visualization in its UI
 *   console.log(decoder.progress());  // {totalParts: 10, partsReceived; 3}
 *
 *   // Application-defined function to obtain a single UR part string.
 *   const part = scanQRCode();
 *   decoder.receivePart(part);
 * }
 *
 * // Check for an error
 * if (decoder.isSuccess()) {
 *
 *   // Data can be passed back to the calling application
 *   console.log(decoder.data()); // "deadbeef"
 *
 * } else {
 *
 *   // Errors can be passed back to the calling application
 *   console.log(decoder.errorMessage());
 * }
 *
 *
 */
declare class BCURDecoder {
    error: any;
    summary: ReturnType<typeof smartDecodeUR>;
    constructor();
    /**
     * Reset this decoder.
     *
     * Clears any error message and received parts and returns counts to zero.
     */
    reset(): void;
    /**
     * Receive a new UR part.
     *
     * It's OK to call this method multiple times for the same UR part.
     */
    receivePart(part: string): void;
    /**
     * Returns the current progress of this decoder.
     *
     * @example
     * import {BCURDecoder} from "@caravan/wallets";
     * const decoder = BCURDecoder();
     * console.log(decoder.progress())
     * // { totalParts: 0, partsReceived: 0 }
     *
     * decoder.receivePart(part);
     * ...
     * decoder.receivePart(part);
     * ...
     * decoder.receivePart(part);
     * ...
     * console.log(decoder.progress())
     * // { totalParts: 10, partsReceived: 3 }
     *
     */
    progress(): {
        totalParts: number;
        partsReceived: any;
    };
    /**
     * Is this decoder complete?
     *
     * Will return `true` if there was an error.
     */
    isComplete(): boolean;
    /**
     * Was this decoder successful?
     *
     * Will return `false` if completed because of an error.
     */
    isSuccess(): boolean;
    /**
     * Returns the decoded data as a hex string.
     */
    data(): string | null;
    /**
     * Returns the error message.
     */
    errorMessage(): string | null;
}

/**
 * Current @caravan/wallets version.
 */
declare const VERSION: string;
declare const MULTISIG_ROOT = "m/45'";
/**
 * Keystores which support direct interactions.
 */
declare const DIRECT_KEYSTORES: {
    readonly BITBOX: "bitbox";
    readonly TREZOR: "trezor";
    readonly LEDGER: "ledger";
    readonly LEDGER_V2: "ledger_v2";
};
/**
 * Keystores which support indirect interactions.
 */
declare const INDIRECT_KEYSTORES: {
    readonly HERMIT: "hermit";
    readonly COLDCARD: "coldcard";
    readonly CUSTOM: "custom";
};
/**
 * Supported keystores.
 */
declare const KEYSTORES: {
    readonly HERMIT: "hermit";
    readonly COLDCARD: "coldcard";
    readonly CUSTOM: "custom";
    readonly BITBOX: "bitbox";
    readonly TREZOR: "trezor";
    readonly LEDGER: "ledger";
    readonly LEDGER_V2: "ledger_v2";
};
type KEYSTORE_KEYS = keyof typeof KEYSTORES;
type KEYSTORE_TYPES = (typeof KEYSTORES)[KEYSTORE_KEYS];
/**
 * Return an interaction class for obtaining metadata from the given
 * `keystore`.
 *
 * **Supported keystores:** BitBox, Trezor, Ledger
 *
 * @example
 * import {GetMetadata, TREZOR} from "@caravan/wallets";
 * // Works similarly for Ledger.
 * const interaction = GetMetadata({keystore: TREZOR});
 * const metadata = await interaction.run();
 */
declare function GetMetadata({ keystore }: {
    keystore: KEYSTORE_TYPES;
}): BitBoxGetMetadata | LedgerGetMetadata | TrezorGetMetadata | UnsupportedInteraction;
/**
 * Return an interaction class for exporting a public key from the
 * given `keystore` for the given `bip32Path` and `network`.
 *
 * **Supported keystores:** Trezor, Ledger, Hermit
 *
 * @example
 * import {MAINNET} from "@caravan/bitcoin";
 * import {ExportPublicKey, TREZOR, HERMIT} from "@caravan/wallets";
 * // Works similarly for Ledger
 * const interaction = ExportPublicKey({keystore: TREZOR, network: MAINNET, bip32Path: "m/45'/0'/0'/0/0"});
 * const publicKey = await interaction.run();
 */
declare function ExportPublicKey({ keystore, network, bip32Path, includeXFP, }: {
    keystore: KEYSTORE_TYPES;
    network: Network;
    bip32Path: string;
    includeXFP: boolean;
}): UnsupportedInteraction | BitBoxExportPublicKey | ColdcardExportPublicKey | LedgerExportPublicKey | TrezorExportPublicKey;
/**
 * Return an interaction class for signing a message by the given `keystore`
 * for the given `bip32Path`.
 *
 * **Supported keystores:** Ledger, Trezor
 */
declare function SignMessage({ keystore, bip32Path, message, }: {
    keystore: KEYSTORE_TYPES;
    bip32Path: string;
    message: string;
}): UnsupportedInteraction | LedgerSignMessage | TrezorSignMessage;
/**
 * Return an interaction class for exporting an extended public key
 * from the given `keystore` for the given `bip32Path` and `network`.
 *
 * **Supported keystores:** Trezor, Hermit, Ledger
 *
 * @example
 * import {MAINNET} from "@caravan/bitcoin";
 * import {ExportExtendedPublicKey, TREZOR, HERMIT} from "@caravan/wallets";
 * // Works similarly for Ledger
 * const interaction = ExportExtendedPublicKey({keystore: TREZOR, network: MAINNET, bip32Path: "m/45'/0'/0'/0/0"});
 * const xpub = await interaction.run();
 */
declare function ExportExtendedPublicKey({ keystore, network, bip32Path, includeXFP, }: {
    keystore: KEYSTORE_TYPES;
    network: Network;
    bip32Path: string;
    includeXFP: boolean;
}): UnsupportedInteraction | BitBoxExportExtendedPublicKey | ColdcardExportExtendedPublicKey | CustomExportExtendedPublicKey | HermitExportExtendedPublicKey | LedgerExportExtendedPublicKey | TrezorExportExtendedPublicKey;
/**
 * Return an interaction class for signing a multisig transaction with
 * the given `keystore`.
 *
 * The inputs are objects which have `txid`, `index`, and a `multisig`
 * object, the last which is a `Multisig` object from
 * `@caravan/bitcoin`.
 *
 * The outputs are objects which have `address` and `amountSats` (an
 * integer).
 *
 * `bip32Paths` is an array of BIP32 paths for the public keys on this
 * device, one for each input.
 *
 * **Supported keystores:** Trezor, Ledger, Hermit
 *
 * @example
 * import {
 *   generateMultisigFromHex, TESTNET, P2SH,
 * } from "@caravan/bitcoin";
 * import {SignMultisigTransaction, TREZOR} from "@caravan/wallets";
 * const redeemScript = "5...ae";
 * const inputs = [
 *   {
 *     txid: "8d276c76b3550b145e44d35c5833bae175e0351b4a5c57dc1740387e78f57b11",
 *     index: 1,
 *     multisig: generateMultisigFromHex(TESTNET, P2SH, redeemScript),
 *     amountSats: '1234000'
 *   },
 *   // other inputs...
 * ];
 * const outputs = [
 *   {
 *     amountSats: '1299659',
 *     address: "2NGHod7V2TAAXC1iUdNmc6R8UUd4TVTuBmp"
 *   },
 *   // other outputs...
 * ];
 * const interaction = SignMultisigTransaction({
 *   keystore: TREZOR, // works the same for Ledger
 *   network: TESTNET,
 *   inputs,
 *   outputs,
 *   bip32Paths: ["m/45'/0'/0'/0", // add more, 1 per input],
 * });
 * const signature = await interaction.run();
 * console.log(signatures);
 * // ["ababab...", // 1 per input]
 *
 */
interface SignMultisigTransactionArgs {
    keystore: KEYSTORE_TYPES;
    network: Network;
    inputs?: LegacyInput[];
    outputs?: LegacyOutput[];
    bip32Paths?: string[];
    psbt: string;
    keyDetails: {
        xfp: string;
        path: string;
    };
    returnSignatureArray?: boolean;
    walletConfig: MultisigWalletConfig$1;
    policyHmac?: string;
    progressCallback?: () => void;
}
declare function SignMultisigTransaction({ keystore, network, inputs, outputs, bip32Paths, psbt, keyDetails, returnSignatureArray, walletConfig, policyHmac, progressCallback, }: SignMultisigTransactionArgs): UnsupportedInteraction | BitBoxSignMultisigTransaction | ColdcardSignMultisigTransaction | CustomSignMultisigTransaction | HermitSignMultisigTransaction | LedgerSignMultisigTransaction | LedgerV2SignMultisigTransaction | TrezorSignMultisigTransaction;
/**
 * Return an interaction class for confirming a multisig address with
 * the given `keystore`.
 *
 * The `multisig` parameter is a `Multisig` object from
 * `@caravan/bitcoin`.
 *
 * `bip32Path` is the BIP32 path for the publiic key in the address on
 * this device.
 *
 * `publicKey` optional, is the public key expected to be at `bip32Path`.
 *
 * **Supported keystores:** Trezor, Ledger
 *
 * @example
 * import {
 *   generateMultisigFromHex, TESTNET, P2SH,
 * } from "@caravan/bitcoin";
 * import {
 *   ConfirmMultisigAddress,
 *   multisigPublicKeys,
 *   trezorPublicKey,
 *   TREZOR} from "@caravan/wallets";
 * const redeemScript = "5...ae";
 * const multisig = generateMultisigFromHex(TESTNET, P2SH, redeemScript);
 * const interaction = ConfirmMultisigAddress({
 *   keystore: TREZOR,
 *   network: TESTNET,
 *   multisig,
 *   bip32Path: "m/45'/1'/0'/0/0",
 * });
 * await interaction.run();
 *
 * With publicKey:
 * const redeemScript = "5...ae";
 * const multisig = generateMultisigFromHex(TESTNET, P2SH, redeemScript);
 * const publicKey = trezorPublicKey(multisigPublicKeys(this.multisig)[2])
 * const interaction = ConfirmMultisigAddress({
 *   keystore: TREZOR,
 *   publicKey,
 *   network: TESTNET,
 *   multisig,
 *   bip32Path: "m/45'/1'/0'/0/0",
 * });
 * await interaction.run();
 *
 *
 */
declare function ConfirmMultisigAddress({ keystore, network, bip32Path, multisig, publicKey, name, policyHmac, walletConfig, }: {
    keystore: KEYSTORE_TYPES;
    network: Network;
    bip32Path: string;
    multisig: Record<string, any>;
    publicKey?: string;
    name?: string;
    policyHmac?: string;
    walletConfig?: MultisigWalletConfig$1;
}): UnsupportedInteraction | BitBoxConfirmMultisigAddress | TrezorConfirmMultisigAddress | LedgerConfirmMultisigAddress;
/**
 * Return a class for registering a wallet policy.
 * **Supported keystores:** BitBox, Ledger
 */
declare function RegisterWalletPolicy({ keystore, policyHmac, verify, ...walletConfig }: {
    keystore: KEYSTORE_TYPES;
    policyHmac?: string;
    verify: boolean;
} & MultisigWalletConfig$1): UnsupportedInteraction | BitBoxRegisterWalletPolicy | LedgerRegisterWalletPolicy;
/**
 * Return a class for creating a multisig config file for a
 * given keystore or coordinator.
 */
declare function ConfigAdapter({ KEYSTORE, jsonConfig, policyHmac, }: {
    KEYSTORE: KEYSTORE_TYPES;
    jsonConfig: string | MultisigWalletConfig$1;
    policyHmac?: string;
}): UnsupportedInteraction | BitBoxRegisterWalletPolicy | LedgerRegisterWalletPolicy | ColdcardMultisigWalletConfig;

export { ACTIVE, AppAndVersion, BCURDecoder, BCUREncoder, BITBOX, BitBoxConfirmMultisigAddress, BitBoxExportExtendedPublicKey, BitBoxExportPublicKey, BitBoxGetMetadata, BitBoxInteraction, BitBoxRegisterWalletPolicy, BitBoxSignMultisigTransaction, COLDCARD, COLDCARD_BASE_BIP32_PATHS, COLDCARD_WALLET_CONFIG_VERSION, CUSTOM, ColdcardExportExtendedPublicKey, ColdcardExportPublicKey, ColdcardInteraction, ColdcardMultisigWalletConfig, ColdcardSignMultisigTransaction, ConfigAdapter, ConfirmMultisigAddress, CustomExportExtendedPublicKey, CustomInteraction, CustomSignMultisigTransaction, DIRECT_KEYSTORES, DeviceError, DirectKeystoreInteraction, ERROR, ExportExtendedPublicKey, ExportPublicKey, GetMetadata, HERMIT, HermitExportExtendedPublicKey, HermitInteraction, HermitSignMultisigTransaction, INDIRECT_KEYSTORES, INFO, IndirectKeystoreInteraction, KEYSTORES, KEYSTORE_TYPES, KeyOrigin, KeystoreInteraction, LEDGER, LEDGER_BOTH_BUTTONS, LEDGER_LEFT_BUTTON, LEDGER_RIGHT_BUTTON, LEDGER_V2, LEVELS, LedgerBitcoinInteraction, LedgerBitcoinV2WithRegistrationInteraction, LedgerConfirmMultisigAddress, LedgerDashboardInteraction, LedgerDeviceError, LedgerExportExtendedPublicKey, LedgerExportPublicKey, LedgerGetMetadata, LedgerInteraction, LedgerPolicyHmacs, LedgerRegisterWalletPolicy, LedgerSignMessage, LedgerSignMultisigTransaction, LedgerSignatures, LedgerV2SignMultisigTransaction, MULTISIG_ROOT, Message, MultisigScriptType, MultisigWalletConfig, MultisigWalletPolicy, PENDING, PolicyHmac, RegisterWalletPolicy, RootFingerprint, STATES, SignMessage, SignMultisigTransaction, SignMultisigTransactionArgs, Summary, TREZOR, TREZOR_BOTH_BUTTONS, TREZOR_LEFT_BUTTON, TREZOR_PUSH_AND_HOLD_BUTTON, TREZOR_RIGHT_BUTTON, TShowPairingCode, TrezorConfirmMultisigAddress, TrezorExportExtendedPublicKey, TrezorExportHDNode, TrezorExportPublicKey, TrezorGetMetadata, TrezorInteraction, TrezorSignMessage, TrezorSignMultisigTransaction, UNSUPPORTED, UnsupportedInteraction, VERSION, WARNING, WalletConfigKeyDerivation, braidDetailsToWalletConfig, getKeyOriginsFromWalletConfig, getPolicyTemplateFromWalletConfig, getTotalSignerCountFromTemplate, trezorCoin, validateMultisigPolicyKeys, validateMultisigPolicyScriptType, validateMultisigPolicyTemplate };
