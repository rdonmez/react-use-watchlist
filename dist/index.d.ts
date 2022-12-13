import * as React from "react";
export interface Item {
    id: string;
    price: number;
    quantity?: number;
    itemTotal?: number;
    [key: string]: any;
}
interface InitialState {
    id: string;
    items: Item[];
    isEmpty: boolean;
    totalItems: number;
    totalUniqueItems: number;
    metadata?: Metadata;
}
export interface Metadata {
    [key: string]: any;
}
interface WatchlistProviderState extends InitialState {
    addItem: (item: Item, quantity?: number) => void;
    removeItem: (id: Item["id"]) => void;
    updateItem: (id: Item["id"], payload: object) => void;
    setItems: (items: Item[]) => void;
    updateItemQuantity: (id: Item["id"], quantity: number) => void;
    emptyWatchlist: () => void;
    getItem: (id: Item["id"]) => any | undefined;
    inWatchlist: (id: Item["id"]) => boolean;
    clearWatchlistMetadata: () => void;
    setWatchlistMetadata: (metadata: Metadata) => void;
    updateWatchlistMetadata: (metadata: Metadata) => void;
}
export declare type Actions = {
    type: "SET_ITEMS";
    payload: Item[];
} | {
    type: "ADD_ITEM";
    payload: Item;
} | {
    type: "REMOVE_ITEM";
    id: Item["id"];
} | {
    type: "UPDATE_ITEM";
    id: Item["id"];
    payload: object;
} | {
    type: "EMPTY_WATCHLIST";
} | {
    type: "CLEAR_WATCHLIST_META";
} | {
    type: "SET_WATCHLIST_META";
    payload: Metadata;
} | {
    type: "UPDATE_WATCHLIST_META";
    payload: Metadata;
};
export declare const initialState: any;
export declare const createWatchlistIdentifier: (len?: number) => string;
export declare const useWatchlist: () => WatchlistProviderState;
export declare const WatchlistProvider: React.FC<{
    children?: React.ReactNode;
    id?: string;
    defaultItems?: Item[];
    onSetItems?: (items: Item[]) => void;
    onItemAdd?: (payload: Item) => void;
    onItemUpdate?: (payload: object) => void;
    onItemRemove?: (id: Item["id"]) => void;
    storage?: (key: string, initialValue: string) => [string, (value: Function | string) => void];
    metadata?: Metadata;
}>;
export {};
