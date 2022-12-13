'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function useLocalStorage(key, initialValue) {
  var _React$useState = React.useState(function () {
    try {
      var item = typeof window !== "undefined" && window.localStorage.getItem(key);
      return item ? item : initialValue;
    } catch (error) {
      return initialValue;
    }
  }),
      storedValue = _React$useState[0],
      setStoredValue = _React$useState[1];

  var setValue = function setValue(value) {
    try {
      var valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

var initialState = {
  items: [],
  isEmpty: true,
  totalItems: 0,
  totalUniqueItems: 0,
  //cartTotal: 0,
  metadata: {}
};
var WatchlistContext = /*#__PURE__*/React.createContext(initialState);
var createWatchlistIdentifier = function createWatchlistIdentifier(len) {
  if (len === void 0) {
    len = 12;
  }

  return [].concat(Array(len)).map(function () {
    return (~~(Math.random() * 36)).toString(36);
  }).join("");
};
var useWatchlist = function useWatchlist() {
  var context = React.useContext(WatchlistContext);
  if (!context) throw new Error("Expected to be wrapped in a WatchlistProvider");
  return context;
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ITEMS":
      return generateWatchlistState(state, action.payload);

    case "ADD_ITEM":
      {
        var items = [].concat(state.items, [action.payload]);
        return generateWatchlistState(state, items);
      }

    case "UPDATE_ITEM":
      {
        var _items = state.items.map(function (item) {
          if (item.id !== action.id) return item;
          return _extends({}, item, action.payload);
        });

        return generateWatchlistState(state, _items);
      }

    case "REMOVE_ITEM":
      {
        var _items2 = state.items.filter(function (i) {
          return i.id !== action.id;
        });

        return generateWatchlistState(state, _items2);
      }

    case "EMPTY_WATCHLIST":
      return initialState;

    case "CLEAR_WATCHLIST_META":
      return _extends({}, state, {
        metadata: {}
      });

    case "SET_WATCHLIST_META":
      return _extends({}, state, {
        metadata: _extends({}, action.payload)
      });

    case "UPDATE_WATCHLIST_META":
      return _extends({}, state, {
        metadata: _extends({}, state.metadata, action.payload)
      });

    default:
      throw new Error("No action specified");
  }
}

var generateWatchlistState = function generateWatchlistState(state, items) {
  if (state === void 0) {
    state = initialState;
  }

  var totalUniqueItems = calculateUniqueItems(items);
  var isEmpty = totalUniqueItems === 0;
  return _extends({}, initialState, state, {
    items: calculateItemTotals(items),
    totalItems: calculateTotalItems(items),
    totalUniqueItems: totalUniqueItems,
    //cartTotal: calculateTotal(items),
    isEmpty: isEmpty
  });
};

var calculateItemTotals = function calculateItemTotals(items) {
  return items.map(function (item) {
    return _extends({}, item, {
      itemTotal: item.price * item.quantity
    });
  });
}; //const calculateTotal = (items: Item[]) =>
//items.reduce((total, item) => total + item.quantity! * item.price, 0);


var calculateTotalItems = function calculateTotalItems(items) {
  return items.reduce(function (sum, item) {
    return sum + item.quantity;
  }, 0);
};

var calculateUniqueItems = function calculateUniqueItems(items) {
  return items.length;
};

var WatchlistProvider = function WatchlistProvider(_ref) {
  var children = _ref.children,
      watchlistId = _ref.id,
      _ref$defaultItems = _ref.defaultItems,
      defaultItems = _ref$defaultItems === void 0 ? [] : _ref$defaultItems,
      onSetItems = _ref.onSetItems,
      onItemAdd = _ref.onItemAdd,
      onItemUpdate = _ref.onItemUpdate,
      onItemRemove = _ref.onItemRemove,
      _ref$storage = _ref.storage,
      storage = _ref$storage === void 0 ? useLocalStorage : _ref$storage,
      metadata = _ref.metadata;
  var id = watchlistId ? watchlistId : createWatchlistIdentifier();

  var _storage = storage(watchlistId ? "react-use-watchlist-" + id : "react-use-watchlist", JSON.stringify(_extends({
    id: id
  }, initialState, {
    items: defaultItems,
    metadata: metadata
  }))),
      savedWatchlist = _storage[0],
      saveWatchlist = _storage[1];

  var _React$useReducer = React.useReducer(reducer, JSON.parse(savedWatchlist)),
      state = _React$useReducer[0],
      dispatch = _React$useReducer[1];

  React.useEffect(function () {
    saveWatchlist(JSON.stringify(state));
  }, [state, saveWatchlist]);

  var setItems = function setItems(items) {
    dispatch({
      type: "SET_ITEMS",
      payload: items.map(function (item) {
        return _extends({}, item, {
          quantity: item.quantity || 1
        });
      })
    });
    onSetItems && onSetItems(items);
  };

  var addItem = function addItem(item, quantity) {
    if (quantity === void 0) {
      quantity = 1;
    }

    if (!item.id) throw new Error("You must provide an `id` for items"); //if (quantity <= 0) return;

    var currentItem = state.items.find(function (i) {
      return i.id === item.id;
    }); //if (!currentItem && !item.hasOwnProperty("price"))
    //throw new Error("You must pass a `price` for new items");

    if (!currentItem) {
      var _payload = _extends({}, item, {
        quantity: quantity
      });

      dispatch({
        type: "ADD_ITEM",
        payload: _payload
      });
      onItemAdd && onItemAdd(_payload);
      return;
    }

    var payload = _extends({}, item, {
      quantity: currentItem.quantity + quantity
    });

    dispatch({
      type: "UPDATE_ITEM",
      id: item.id,
      payload: payload
    });
    onItemUpdate && onItemUpdate(payload);
  };

  var updateItem = function updateItem(id, payload) {
    if (!id || !payload) {
      return;
    }

    dispatch({
      type: "UPDATE_ITEM",
      id: id,
      payload: payload
    });
    onItemUpdate && onItemUpdate(payload);
  };

  var updateItemQuantity = function updateItemQuantity(id, quantity) {
    if (quantity <= 0) {
      onItemRemove && onItemRemove(id);
      dispatch({
        type: "REMOVE_ITEM",
        id: id
      });
      return;
    }

    var currentItem = state.items.find(function (item) {
      return item.id === id;
    });
    if (!currentItem) throw new Error("No such item to update");

    var payload = _extends({}, currentItem, {
      quantity: quantity
    });

    dispatch({
      type: "UPDATE_ITEM",
      id: id,
      payload: payload
    });
    onItemUpdate && onItemUpdate(payload);
  };

  var removeItem = function removeItem(id) {
    if (!id) return;
    dispatch({
      type: "REMOVE_ITEM",
      id: id
    });
    onItemRemove && onItemRemove(id);
  };

  var emptyWatchlist = function emptyWatchlist() {
    return dispatch({
      type: "EMPTY_WATCHLIST"
    });
  };

  var getItem = function getItem(id) {
    return state.items.find(function (i) {
      return i.id === id;
    });
  };

  var inWatchlist = function inWatchlist(id) {
    return state.items.some(function (i) {
      return i.id === id;
    });
  };

  var clearWatchlistMetadata = function clearWatchlistMetadata() {
    dispatch({
      type: "CLEAR_WATCHLIST_META"
    });
  };

  var setWatchlistMetadata = function setWatchlistMetadata(metadata) {
    if (!metadata) return;
    dispatch({
      type: "SET_WATCHLIST_META",
      payload: metadata
    });
  };

  var updateWatchlistMetadata = function updateWatchlistMetadata(metadata) {
    if (!metadata) return;
    dispatch({
      type: "UPDATE_WATCHLIST_META",
      payload: metadata
    });
  };

  return React.createElement(WatchlistContext.Provider, {
    value: _extends({}, state, {
      getItem: getItem,
      inWatchlist: inWatchlist,
      setItems: setItems,
      addItem: addItem,
      updateItem: updateItem,
      updateItemQuantity: updateItemQuantity,
      removeItem: removeItem,
      emptyWatchlist: emptyWatchlist,
      clearWatchlistMetadata: clearWatchlistMetadata,
      setWatchlistMetadata: setWatchlistMetadata,
      updateWatchlistMetadata: updateWatchlistMetadata
    })
  }, children);
};

exports.WatchlistProvider = WatchlistProvider;
exports.createWatchlistIdentifier = createWatchlistIdentifier;
exports.initialState = initialState;
exports.useWatchlist = useWatchlist;
//# sourceMappingURL=react-use-watchlist.cjs.development.js.map
