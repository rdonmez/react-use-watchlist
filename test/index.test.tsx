import {
  WatchlistProvider,
  createWatchlistIdentifier,
  initialState,
  useWatchlist,
} from "../src";
import React, { FC, HTMLAttributes, ReactChild } from "react";
import { act, renderHook } from "@testing-library/react-hooks";

export interface Props extends HTMLAttributes<HTMLDivElement> {
  children?: ReactChild;
}

afterEach(() => window.localStorage.clear());

describe("createWatchlistIdentifier", () => {
  test("returns a 12 character string by default", () => {
    const id = createWatchlistIdentifier();

    expect(id).toHaveLength(12);
  });

  test("returns a custom length string", () => {
    const id = createWatchlistIdentifier(20);

    expect(id).toHaveLength(20);
  });

  test("created id is unique", () => {
    const id = createWatchlistIdentifier();
    const id2 = createWatchlistIdentifier();

    expect(id).not.toEqual(id2);
  });
});

describe("WatchlistProvider", () => {
  test("uses ID for Watchlist if provided", () => {
    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider id="test">{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    expect(result.current.id).toBeDefined();
    expect(result.current.id).toEqual("test");
  });

  test("creates an ID for Watchlist if non provided", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    expect(result.current.id).toBeDefined();
    expect(result.current.id).toHaveLength(12);
  });

  test("initial Watchlist meta state is set", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    expect(result.current.items).toEqual(initialState.items);
    expect(result.current.totalItems).toEqual(initialState.totalItems);
    expect(result.current.totalUniqueItems).toEqual(
      initialState.totalUniqueItems
    );
    expect(result.current.isEmpty).toBe(initialState.isEmpty);
    //expect(result.current.watchlistTotal).toEqual(initialState.WatchlistTotal);
  });

  test("sets Watchlist metadata", () => {
    const metadata = {
      coupon: "abc123",
      notes: "Leave on door step",
    };

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider metadata={metadata}>{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    expect(result.current.metadata).toEqual(metadata);
  });
});

describe("addItem", () => {
  test("adds item to the Watchlist", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    const item = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
  });

  test("increments existing item quantity in the Watchlist", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    const item = { id: "test", price: 1000 };
    const item2 = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));
    act(() => result.current.addItem(item2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalUniqueItems).toBe(1);
  });

  test("updates Watchlist meta state", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    const item = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
    //expect(result.current.WatchlistTotal).toBe(1000);
    expect(result.current.isEmpty).toBe(false);
  });

  test("allows free item", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    const item = { id: "test", price: 0 };

    act(() => result.current.addItem(item));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalUniqueItems).toBe(1);
    //expect(result.current.WatchlistTotal).toBe(0);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemAdd when Watchlist empty", () => {
    let called = false;

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider onItemAdd={() => (called = true)}>{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    const item = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));

    expect(called).toBe(true);
  });

  test("triggers onItemUpdate when Watchlist has existing item", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={[item]} onItemUpdate={() => (called = true)}>
        {children}
      </WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.updateItem(item.id, { price: item.price }));

    expect(called).toBe(true);
  });

  test("add item with price", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    const item = { id: "test", price: 1000 };

    act(() => result.current.addItem(item));

    //expect(result.current.WatchlistTotal).toBe(1000);
  });
});

describe("updateItem", () => {
  test("updates Watchlist meta state", () => {
    const items = [{ id: "test", price: 1000 }];
    const [item] = items;

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={items}>{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() =>
      result.current.updateItem(item.id, {
        quantity: 2,
      })
    );

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemUpdate when updating existing item", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={[item]} onItemUpdate={() => (called = true)}>
        {children}
      </WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.addItem(item));

    expect(called).toBe(true);
  });
});

describe("updateItemQuantity", () => {
  test("updates Watchlist meta state", () => {
    const items = [{ id: "test", price: 1000 }];
    const [item] = items;

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={items}>{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.updateItemQuantity(item.id, 3));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalUniqueItems).toBe(1);
    expect(result.current.isEmpty).toBe(false);
  });

  test("triggers onItemUpdate when setting quantity above 0", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={[item]} onItemUpdate={() => (called = true)}>
        {children}
      </WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.updateItemQuantity(item.id, 2));

    expect(result.current.items).toHaveLength(1);
    expect(called).toBe(true);
  });

  test("triggers onItemRemove when setting quantity to 0", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={[item]} onItemRemove={() => (called = true)}>
        {children}
      </WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.updateItemQuantity(item.id, 0));

    expect(result.current.items).toHaveLength(0);
    expect(called).toBe(true);
  });

  test("recalculates itemTotal when incrementing item quantity", () => {
    const item = { id: "test", price: 1000 };

    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    act(() => result.current.addItem(item));
    act(() => result.current.updateItemQuantity(item.id, 2));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({ itemTotal: 2000, quantity: 2 })
    );
  });

  test("recalculates itemTotal when decrementing item quantity", () => {
    const item = { id: "test", price: 1000, quantity: 2 };

    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    act(() => result.current.addItem(item));
    act(() => result.current.updateItemQuantity(item.id, 1));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({ itemTotal: 1000, quantity: 1 })
    );
  });
});

describe("removeItem", () => {
  test("updates Watchlist meta state", () => {
    const items = [{ id: "test", price: 1000 }];
    const [item] = items;

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={items}>{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.removeItem(item.id));

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalUniqueItems).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });

  test("triggers onItemRemove when removing item", () => {
    let called = false;

    const item = { id: "test", price: 1000 };

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={[item]} onItemRemove={() => (called = true)}>
        {children}
      </WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.updateItemQuantity(item.id, 0));

    expect(called).toBe(true);
  });
});

describe("emptyWatchlist", () => {
  test("updates Watchlist meta state", () => {
    const items = [{ id: "test", price: 1000 }];

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={items}>{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.emptyWatchlist());

    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalUniqueItems).toBe(0);
    expect(result.current.isEmpty).toBe(true);
  });
});

describe("updateWatchlistMetadata", () => {
  test("clears Watchlist metadata", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    const metadata = {
      coupon: "abc123",
      notes: "Leave on door step",
    };

    act(() => result.current.updateWatchlistMetadata(metadata));

    expect(result.current.metadata).toEqual(metadata);

    act(() => result.current.clearWatchlistMetadata());

    expect(result.current.metadata).toEqual({});
  });

  test("sets Watchlist metadata", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    const metadata = {
      coupon: "abc123",
      notes: "Leave on door step",
    };

    act(() => result.current.updateWatchlistMetadata(metadata));

    expect(result.current.metadata).toEqual(metadata);

    const replaceMetadata = {
      delivery: "same-day",
    };

    act(() => result.current.setWatchlistMetadata(replaceMetadata));

    expect(result.current.metadata).toEqual(replaceMetadata);
  });

  test("updates Watchlist metadata", () => {
    const { result } = renderHook(() => useWatchlist(), {
      wrapper: WatchlistProvider,
    });

    const metadata = {
      coupon: "abc123",
      notes: "Leave on door step",
    };

    act(() => result.current.updateWatchlistMetadata(metadata));

    expect(result.current.metadata).toEqual(metadata);
  });

  test("merge new metadata with existing", () => {
    const initialMetadata = {
      coupon: "abc123",
    };

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider metadata={initialMetadata}>{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    const metadata = {
      notes: "Leave on door step",
    };

    act(() => result.current.updateWatchlistMetadata(metadata));

    expect(result.current.metadata).toEqual({
      ...initialMetadata,
      ...metadata,
    });
  });
});
describe("setItems", () => {
  test("set Watchlist items state", () => {
    const items = [
      { id: "test", price: 1000 },
      { id: "test2", price: 2000 },
    ];

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={[]}>{children}</WatchlistProvider>
    );
    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.setItems(items));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalUniqueItems).toBe(2);
    expect(result.current.isEmpty).toBe(false);
    expect(result.current.items).toContainEqual(
      expect.objectContaining({ id: "test2", price: 2000, quantity: 1 })
    );
  });
  test("add custom quantities with setItems", () => {
    const items = [
      { id: "test", price: 1000, quantity: 2 },
      { id: "test2", price: 2000, quantity: 1 },
    ];
    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={[]}>{children}</WatchlistProvider>
    );
    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    act(() => result.current.setItems(items));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalUniqueItems).toBe(2);
  });
  test("current items is replaced when setItems has been called with a new set of items", () => {
    const itemToBeReplaced = { id: "test", price: 1000 };
    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider defaultItems={[itemToBeReplaced]}>{children}</WatchlistProvider>
    );
    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });
    const items = [
      { id: "test2", price: 2000 },
      { id: "test3", price: 3000 },
    ];
    act(() => result.current.setItems(items));
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items).not.toContainEqual(
      expect.objectContaining(itemToBeReplaced)
    );
  });
  test("trigger onSetItems when setItems is called", () => {
    let called = false;

    const wrapper: FC<Props> = ({ children }) => (
      <WatchlistProvider onSetItems={() => (called = true)}>{children}</WatchlistProvider>
    );

    const { result } = renderHook(() => useWatchlist(), {
      wrapper,
    });

    const items = [{ id: "test", price: 1000 }];

    act(() => result.current.setItems(items));

    expect(called).toBe(true);
  });
});
