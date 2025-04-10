import { Network } from '@caravan/bitcoin';

interface UTXO {
    txid: string;
    vout: number;
    value: number;
    status: {
        confirmed: boolean;
        block_time: number;
    };
}
interface Transaction {
    txid: string;
    vin: Input[];
    vout: Output[];
    size: number;
    weight: number;
    fee: number;
    isSend: boolean;
    amount: number;
    block_time: number;
}
interface Input {
    prevTxId: string;
    vout: number;
    sequence: number;
}
interface Output {
    scriptPubkeyHex: string;
    scriptPubkeyAddress: string;
    value: number;
}
interface FeeRatePercentile {
    avgHeight: number;
    timestamp: number;
    avgFee_0: number;
    avgFee_10: number;
    avgFee_25: number;
    avgFee_50: number;
    avgFee_75: number;
    avgFee_90: number;
    avgFee_100: number;
}
interface TransactionDetails {
    txid: string;
    version: number;
    locktime: number;
    vin: Array<{
        txid: string;
        vout: number;
        sequence: number;
    }>;
    vout: Array<{
        value: number;
        scriptPubkey: string;
        scriptPubkeyAddress?: string;
    }>;
    size: number;
    vsize?: number;
    weight: number;
    fee: number;
    status: {
        confirmed: boolean;
        blockHeight?: number;
        blockHash?: string;
        blockTime?: number;
    };
    isReceived?: boolean;
}
/**
 * Interface for RPC response structure
 */
interface RPCResponse<T = unknown> {
    result: T;
    error?: {
        code: number;
        message: string;
    };
    id: number;
}

declare function bitcoindImportDescriptors({ url, auth, walletName, receive, change, rescan, }: {
    url: string;
    auth: {
        username: string;
        password: string;
    };
    walletName?: string;
    receive: string;
    change: string;
    rescan: boolean;
}): Promise<RPCResponse<unknown>>;

declare enum ClientType {
    PRIVATE = "private",
    BLOCKSTREAM = "blockstream",
    MEMPOOL = "mempool"
}
declare class ClientBase {
    private readonly throttled;
    readonly host: string;
    constructor(throttled: boolean, host: string);
    private throttle;
    private Request;
    Get(path: string): Promise<any>;
    Post(path: string, data?: any): Promise<any>;
}
interface BitcoindClientConfig {
    url: string;
    username: string;
    password: string;
    walletName?: string;
}
interface BitcoindParams {
    url: string;
    auth: {
        username: string;
        password: string;
    };
    walletName?: string;
}
interface BlockchainClientParams {
    type: ClientType;
    network?: Network;
    throttled?: boolean;
    client?: BitcoindClientConfig;
}
declare class BlockchainClient extends ClientBase {
    readonly type: ClientType;
    readonly network?: Network;
    readonly bitcoindParams: BitcoindParams;
    constructor({ type, network, throttled, client, }: BlockchainClientParams);
    getAddressUtxos(address: string): Promise<any>;
    getAddressTransactions(address: string): Promise<Transaction[]>;
    broadcastTransaction(rawTx: string): Promise<any>;
    formatUtxo(utxo: UTXO): Promise<any>;
    fetchAddressUtxos(address: string): Promise<any>;
    getAddressStatus(address: string): Promise<any>;
    getFeeEstimate(blocks?: number): Promise<any>;
    getBlockFeeRatePercentileHistory(): Promise<FeeRatePercentile[]>;
    getTransactionHex(txid: string): Promise<any>;
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
    getWalletTransaction(txid: string): Promise<TransactionDetails>;
    getTransaction(txid: string, forceRawTx?: boolean): Promise<TransactionDetails>;
    importDescriptors({ receive, change, rescan, }: {
        receive: string;
        change: string;
        rescan: boolean;
    }): Promise<object>;
    getWalletInfo(): Promise<RPCResponse<unknown>>;
}

export { BlockchainClient, ClientType, type FeeRatePercentile, type Transaction, type UTXO, bitcoindImportDescriptors };
