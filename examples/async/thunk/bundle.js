(function () {
'use strict';

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Built-in value references. */
var getPrototype = overArg(Object.getPrototypeOf, Object);

/**
 * Checks if `value` is a host object in IE < 9.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
 */
function isHostObject(value) {
  // Many host objects are `Object` objects that can coerce to strings
  // despite having improperly defined `toString` methods.
  var result = false;
  if (value != null && typeof value.toString != 'function') {
    try {
      result = !!(value + '');
    } catch (e) {}
  }
  return result;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** `Object#toString` result references. */
var objectTag = '[object Object]';

/** Used for built-in method references. */
var funcProto = Function.prototype;
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = funcToString.call(Object);

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!isObjectLike(value) ||
      objectToString.call(value) != objectTag || isHostObject(value)) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return (typeof Ctor == 'function' &&
    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
}

function symbolObservablePonyfill(root) {
	var result;
	var Symbol = root.Symbol;

	if (typeof Symbol === 'function') {
		if (Symbol.observable) {
			result = Symbol.observable;
		} else {
			result = Symbol('observable');
			Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
}

/* global window */
var root = undefined;
if (typeof global !== 'undefined') {
	root = global;
} else if (typeof window !== 'undefined') {
	root = window;
}

var result = symbolObservablePonyfill(root);

/**
 * These are private action types reserved by Redux.
 * For any unknown actions, you must return the current state.
 * If the current state is undefined, you must return the initial state.
 * Do not reference these action types directly in your code.
 */
var ActionTypes = {
  INIT: '@@redux/INIT'
};

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 *
 * @param {Function} enhancer The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
function createStore(reducer, preloadedState, enhancer) {
  var _ref2;

  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.');
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.');
  }

  var currentReducer = reducer;
  var currentState = preloadedState;
  var currentListeners = [];
  var nextListeners = currentListeners;
  var isDispatching = false;

  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState;
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    var isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      var index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
    }

    if (typeof action.type === 'undefined') {
      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
    }

    if (isDispatching) {
      throw new Error('Reducers may not dispatch actions.');
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    var listeners = currentListeners = nextListeners;
    for (var i = 0; i < listeners.length; i++) {
      listeners[i]();
    }

    return action;
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.');
    }

    currentReducer = nextReducer;
    dispatch({ type: ActionTypes.INIT });
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/zenparsing/es-observable
   */
  function observable() {
    var _ref;

    var outerSubscribe = subscribe;
    return _ref = {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe: function subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.');
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState());
          }
        }

        observeState();
        var unsubscribe = outerSubscribe(observeState);
        return { unsubscribe: unsubscribe };
      }
    }, _ref[result] = function () {
      return this;
    }, _ref;
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  dispatch({ type: ActionTypes.INIT });

  return _ref2 = {
    dispatch: dispatch,
    subscribe: subscribe,
    getState: getState,
    replaceReducer: replaceReducer
  }, _ref2[result] = observable, _ref2;
}

/**
 * Prints a warning in the console if it exists.
 *
 * @param {String} message The warning message.
 * @returns {void}
 */
function warning(message) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

function getUndefinedStateErrorMessage(key, action) {
  var actionType = action && action.type;
  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';

  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
}

function assertReducerSanity(reducers) {
  Object.keys(reducers).forEach(function (key) {
    var reducer = reducers[key];
    var initialState = reducer(undefined, { type: ActionTypes.INIT });

    if (typeof initialState === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
    }

    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
    if (typeof reducer(undefined, { type: type }) === 'undefined') {
      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
    }
  });
}

/**
 * Turns an object whose values are different reducer functions, into a single
 * reducer function. It will call every child reducer, and gather their results
 * into a single state object, whose keys correspond to the keys of the passed
 * reducer functions.
 *
 * @param {Object} reducers An object whose values correspond to different
 * reducer functions that need to be combined into one. One handy way to obtain
 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
 * undefined for any action. Instead, they should return their initial state
 * if the state passed to them was undefined, and the current state for any
 * unrecognized action.
 *
 * @returns {Function} A reducer function that invokes every reducer inside the
 * passed object, and builds a state object with the same shape.
 */
function combineReducers(reducers) {
  var reducerKeys = Object.keys(reducers);
  var finalReducers = {};
  for (var i = 0; i < reducerKeys.length; i++) {
    var key = reducerKeys[i];

    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key];
    }
  }
  var finalReducerKeys = Object.keys(finalReducers);

  var sanityError;
  try {
    assertReducerSanity(finalReducers);
  } catch (e) {
    sanityError = e;
  }

  return function combination() {
    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var action = arguments[1];

    if (sanityError) {
      throw sanityError;
    }

    var hasChanged = false;
    var nextState = {};
    for (var i = 0; i < finalReducerKeys.length; i++) {
      var key = finalReducerKeys[i];
      var reducer = finalReducers[key];
      var previousStateForKey = state[key];
      var nextStateForKey = reducer(previousStateForKey, action);
      if (typeof nextStateForKey === 'undefined') {
        var errorMessage = getUndefinedStateErrorMessage(key, action);
        throw new Error(errorMessage);
      }
      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}

/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (...args) => f(g(h(...args))).
 */

function compose() {
  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
    funcs[_key] = arguments[_key];
  }

  if (funcs.length === 0) {
    return function (arg) {
      return arg;
    };
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  var last = funcs[funcs.length - 1];
  var rest = funcs.slice(0, -1);
  return function () {
    return rest.reduceRight(function (composed, f) {
      return f(composed);
    }, last.apply(undefined, arguments));
  };
}

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
function applyMiddleware() {
  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
    middlewares[_key] = arguments[_key];
  }

  return function (createStore) {
    return function (reducer, preloadedState, enhancer) {
      var store = createStore(reducer, preloadedState, enhancer);
      var _dispatch = store.dispatch;
      var chain = [];

      var middlewareAPI = {
        getState: store.getState,
        dispatch: function dispatch(action) {
          return _dispatch(action);
        }
      };
      chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI);
      });
      _dispatch = compose.apply(undefined, chain)(store.dispatch);

      return _extends({}, store, {
        dispatch: _dispatch
      });
    };
  };
}

/*
* This is a dummy function to check if the function name has been altered by minification.
* If the function has been minified and NODE_ENV !== 'production', warn the user.
*/
function isCrushed() {}

if ("production" !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
  warning('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
}

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var repeat = function repeat(str, times) {
  return new Array(times + 1).join(str);
};
var pad = function pad(num, maxLength) {
  return repeat("0", maxLength - num.toString().length) + num;
};
var formatTime = function formatTime(time) {
  return "@ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
};

// Use the new performance api to get better precision if available
var timer = typeof performance !== "undefined" && typeof performance.now === "function" ? performance : Date;

/**
 * parse the level option of createLogger
 *
 * @property {string | function | object} level - console[level]
 * @property {object} action
 * @property {array} payload
 * @property {string} type
 */

function getLogLevel(level, action, payload, type) {
  switch (typeof level === "undefined" ? "undefined" : _typeof(level)) {
    case "object":
      return typeof level[type] === "function" ? level[type].apply(level, _toConsumableArray(payload)) : level[type];
    case "function":
      return level(action);
    default:
      return level;
  }
}

/**
 * Creates logger with followed options
 *
 * @namespace
 * @property {object} options - options for logger
 * @property {string | function | object} options.level - console[level]
 * @property {boolean} options.duration - print duration of each action?
 * @property {boolean} options.timestamp - print timestamp with each action?
 * @property {object} options.colors - custom colors
 * @property {object} options.logger - implementation of the `console` API
 * @property {boolean} options.logErrors - should errors in action execution be caught, logged, and re-thrown?
 * @property {boolean} options.collapsed - is group collapsed?
 * @property {boolean} options.predicate - condition which resolves logger behavior
 * @property {function} options.stateTransformer - transform state before print
 * @property {function} options.actionTransformer - transform action before print
 * @property {function} options.errorTransformer - transform error before print
 */

function createLogger() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var _options$level = options.level;
  var level = _options$level === undefined ? "log" : _options$level;
  var _options$logger = options.logger;
  var logger = _options$logger === undefined ? console : _options$logger;
  var _options$logErrors = options.logErrors;
  var logErrors = _options$logErrors === undefined ? true : _options$logErrors;
  var collapsed = options.collapsed;
  var predicate = options.predicate;
  var _options$duration = options.duration;
  var duration = _options$duration === undefined ? false : _options$duration;
  var _options$timestamp = options.timestamp;
  var timestamp = _options$timestamp === undefined ? true : _options$timestamp;
  var transformer = options.transformer;
  var _options$stateTransfo = options.stateTransformer;
  var // deprecated
  stateTransformer = _options$stateTransfo === undefined ? function (state) {
    return state;
  } : _options$stateTransfo;
  var _options$actionTransf = options.actionTransformer;
  var actionTransformer = _options$actionTransf === undefined ? function (actn) {
    return actn;
  } : _options$actionTransf;
  var _options$errorTransfo = options.errorTransformer;
  var errorTransformer = _options$errorTransfo === undefined ? function (error) {
    return error;
  } : _options$errorTransfo;
  var _options$colors = options.colors;
  var colors = _options$colors === undefined ? {
    title: function title() {
      return "#000000";
    },
    prevState: function prevState() {
      return "#9E9E9E";
    },
    action: function action() {
      return "#03A9F4";
    },
    nextState: function nextState() {
      return "#4CAF50";
    },
    error: function error() {
      return "#F20404";
    }
  } : _options$colors;

  // exit if console undefined

  if (typeof logger === "undefined") {
    return function () {
      return function (next) {
        return function (action) {
          return next(action);
        };
      };
    };
  }

  if (transformer) {
    console.error("Option 'transformer' is deprecated, use stateTransformer instead");
  }

  var logBuffer = [];
  function printBuffer() {
    logBuffer.forEach(function (logEntry, key) {
      var started = logEntry.started;
      var startedTime = logEntry.startedTime;
      var action = logEntry.action;
      var prevState = logEntry.prevState;
      var error = logEntry.error;
      var took = logEntry.took;
      var nextState = logEntry.nextState;

      var nextEntry = logBuffer[key + 1];
      if (nextEntry) {
        nextState = nextEntry.prevState;
        took = nextEntry.started - started;
      }
      // message
      var formattedAction = actionTransformer(action);
      var isCollapsed = typeof collapsed === "function" ? collapsed(function () {
        return nextState;
      }, action) : collapsed;

      var formattedTime = formatTime(startedTime);
      var titleCSS = colors.title ? "color: " + colors.title(formattedAction) + ";" : null;
      var title = "action " + (timestamp ? formattedTime : "") + " " + formattedAction.type + " " + (duration ? "(in " + took.toFixed(2) + " ms)" : "");

      // render
      try {
        if (isCollapsed) {
          if (colors.title) logger.groupCollapsed("%c " + title, titleCSS);else logger.groupCollapsed(title);
        } else {
          if (colors.title) logger.group("%c " + title, titleCSS);else logger.group(title);
        }
      } catch (e) {
        logger.log(title);
      }

      var prevStateLevel = getLogLevel(level, formattedAction, [prevState], "prevState");
      var actionLevel = getLogLevel(level, formattedAction, [formattedAction], "action");
      var errorLevel = getLogLevel(level, formattedAction, [error, prevState], "error");
      var nextStateLevel = getLogLevel(level, formattedAction, [nextState], "nextState");

      if (prevStateLevel) {
        if (colors.prevState) logger[prevStateLevel]("%c prev state", "color: " + colors.prevState(prevState) + "; font-weight: bold", prevState);else logger[prevStateLevel]("prev state", prevState);
      }

      if (actionLevel) {
        if (colors.action) logger[actionLevel]("%c action", "color: " + colors.action(formattedAction) + "; font-weight: bold", formattedAction);else logger[actionLevel]("action", formattedAction);
      }

      if (error && errorLevel) {
        if (colors.error) logger[errorLevel]("%c error", "color: " + colors.error(error, prevState) + "; font-weight: bold", error);else logger[errorLevel]("error", error);
      }

      if (nextStateLevel) {
        if (colors.nextState) logger[nextStateLevel]("%c next state", "color: " + colors.nextState(nextState) + "; font-weight: bold", nextState);else logger[nextStateLevel]("next state", nextState);
      }

      try {
        logger.groupEnd();
      } catch (e) {
        logger.log("—— log end ——");
      }
    });
    logBuffer.length = 0;
  }

  return function (_ref) {
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        // exit early if predicate function returns false
        if (typeof predicate === "function" && !predicate(getState, action)) {
          return next(action);
        }

        var logEntry = {};
        logBuffer.push(logEntry);

        logEntry.started = timer.now();
        logEntry.startedTime = new Date();
        logEntry.prevState = stateTransformer(getState());
        logEntry.action = action;

        var returnedValue = undefined;
        if (logErrors) {
          try {
            returnedValue = next(action);
          } catch (e) {
            logEntry.error = errorTransformer(e);
          }
        } else {
          returnedValue = next(action);
        }

        logEntry.took = timer.now() - logEntry.started;
        logEntry.nextState = stateTransformer(getState());

        printBuffer();

        if (logEntry.error) throw logEntry.error;
        return returnedValue;
      };
    };
  };
}

var index = createLogger;

function createThunkMiddleware(extraArgument) {
  return function (_ref) {
    var dispatch = _ref.dispatch;
    var getState = _ref.getState;
    return function (next) {
      return function (action) {
        if (typeof action === 'function') {
          return action(dispatch, getState, extraArgument);
        }

        return next(action);
      };
    };
  };
}

var thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

function unwrapExports (x) {
	return x && x.__esModule ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var isPromise_1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.default = isPromise;
function isPromise(value) {
  if (value !== null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
    return value && typeof value.then === 'function';
  }

  return false;
}
});

var index$1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = promiseMiddleware;

var _isPromise = isPromise_1;

var _isPromise2 = _interopRequireDefault(_isPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultTypes = ['PENDING', 'FULFILLED', 'REJECTED'];

/**
 * @function promiseMiddleware
 * @description
 * @returns {function} thunk
 */
function promiseMiddleware() {
  var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var promiseTypeSuffixes = config.promiseTypeSuffixes || defaultTypes;

  return function (ref) {
    var dispatch = ref.dispatch;


    return function (next) {
      return function (action) {
        if (action.payload) {
          if (!(0, _isPromise2.default)(action.payload) && !(0, _isPromise2.default)(action.payload.promise)) {
            return next(action);
          }
        } else {
          return next(action);
        }

        // Deconstruct the properties of the original action object to constants
        var type = action.type;
        var payload = action.payload;
        var meta = action.meta;

        // Assign values for promise type suffixes

        var _promiseTypeSuffixes = _slicedToArray(promiseTypeSuffixes, 3);

        var PENDING = _promiseTypeSuffixes[0];
        var FULFILLED = _promiseTypeSuffixes[1];
        var REJECTED = _promiseTypeSuffixes[2];

        /**
         * @function getAction
         * @description Utility function for creating a rejected or fulfilled
         * flux standard action object.
         * @param {boolean} Is the action rejected?
         * @returns {object} action
         */

        var getAction = function getAction(newPayload, isRejected) {
          return _extends({
            type: type + '_' + (isRejected ? REJECTED : FULFILLED)
          }, newPayload ? {
            payload: newPayload
          } : {}, !!meta ? { meta: meta } : {}, isRejected ? {
            error: true
          } : {});
        };

        /**
         * Assign values for promise and data variables. In the case the payload
         * is an object with a `promise` and `data` property, the values of those
         * properties will be used. In the case the payload is a promise, the
         * value of the payload will be used and data will be null.
         */
        var promise = void 0;
        var data = void 0;

        if (!(0, _isPromise2.default)(action.payload) && _typeof(action.payload) === 'object') {
          promise = payload.promise;
          data = payload.data;
        } else {
          promise = payload;
          data = null;
        }

        /**
         * First, dispatch the pending action. This flux standard action object
         * describes the pending state of a promise and will include any data
         * (for optimistic updates) and/or meta from the original action.
         */
        next(_extends({
          type: type + '_' + PENDING
        }, !!data ? { payload: data } : {}, !!meta ? { meta: meta } : {}));

        /*
         * @function handleReject
         * @description Dispatch the rejected action and return
         * an error object. The error object is the original error
         * that was thrown. The user of the library is responsible for
         * best practices in ensure that they are throwing an Error object.
         * @params reason The reason the promise was rejected
         * @returns {object}
         */
        var handleReject = function handleReject(reason) {
          var rejectedAction = getAction(reason, true);
          dispatch(rejectedAction);
          throw reason;
        };

        /*
         * @function handleFulfill
         * @description Dispatch the fulfilled action and
         * return the success object. The success object should
         * contain the value and the dispatched action.
         * @param value The value the promise was resloved with
         * @returns {object}
         */
        var handleFulfill = function handleFulfill() {
          var value = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

          var resolvedAction = getAction(value, false);
          dispatch(resolvedAction);

          return { value: value, action: resolvedAction };
        };

        /**
         * Second, dispatch a rejected or fulfilled action. This flux standard
         * action object will describe the resolved state of the promise. In
         * the case of a rejected promise, it will include an `error` property.
         *
         * In order to allow proper chaining of actions using `then`, a new
         * promise is constructed and returned. This promise will resolve
         * with two properties: (1) the value (if fulfilled) or reason
         * (if rejected) and (2) the flux standard action.
         *
         * Rejected object:
         * {
         *   reason: ...
         *   action: {
         *     error: true,
         *     type: 'ACTION_REJECTED',
         *     payload: ...
         *   }
         * }
         *
         * Fulfilled object:
         * {
         *   value: ...
         *   action: {
         *     type: 'ACTION_FULFILLED',
         *     payload: ...
         *   }
         * }
         */
        return promise.then(handleFulfill, handleReject);
      };
    };
  };
}
});

var promise = unwrapExports(index$1);

// REDUCERS <==========================================
var initialState = {
  fetching: false,
  fetched: false,
  error: null,
  usersList: []
};
var userReducer = function userReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? initialState : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case 'FETCH_USERS_PENDING':
      return Object.assign({}, state, { fetching: true });
    case 'FETCH_USERS_REJECTED':
      return Object.assign({}, state, {
        fetching: false,
        error: action.payload
      });
    case 'FETCH_USERS_FULFILLED':
      return Object.assign({}, state, {
        fetching: false,
        fetched: true,
        usersList: action.payload
      });
    default:
      return state;
  }
};

var postsReducer = function postsReducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  var action = arguments[1];

  return state;
};

var rootReducer = combineReducers({
  users: userReducer,
  posts: postsReducer
});
// ====================================================

// MIDDLEWARE <==========================================

var middleware = applyMiddleware(promise(), thunk, index());

// ====================================================

// STORE INIT <==========================================
var store = createStore(rootReducer, middleware);
// ====================================================

// MANUAL
// store.dispatch((dispatch) => {
//   dispatch({ type: 'FETCH_USERS_PENDING'})
//
//   fetch('http://jsonplaceholder.typicode.com/users')
//     .then((response) => response.json())
//     .then((response) => {
//       dispatch({ type: 'FETCH_USERS_FULFILLED', payload: response })
//     })
//     .catch((error) => {
//       dispatch({type: 'FETCH_USERS_REJECTED', payload: error})
//     })
//
// })

// WITH REDUX-PROMISE-MIDDLEWARE
store.dispatch({
  type: 'FETCH_USERS',
  payload: fetch('http://jsonplaceholder.typicode.com/users').then(function (response) {
    return response.json();
  })
});

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvX292ZXJBcmcuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLWVzL19nZXRQcm90b3R5cGUuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLWVzL19pc0hvc3RPYmplY3QuanMiLCJub2RlX21vZHVsZXMvbG9kYXNoLWVzL2lzT2JqZWN0TGlrZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gtZXMvaXNQbGFpbk9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9zeW1ib2wtb2JzZXJ2YWJsZS9lcy9wb255ZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9zeW1ib2wtb2JzZXJ2YWJsZS9lcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9lcy9jcmVhdGVTdG9yZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9lcy91dGlscy93YXJuaW5nLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2VzL2NvbWJpbmVSZWR1Y2Vycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9lcy9jb21wb3NlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2VzL2FwcGx5TWlkZGxld2FyZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9lcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC1sb2dnZXIvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4LXRodW5rL2VzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4LXByb21pc2UtbWlkZGxld2FyZS9kaXN0L2lzUHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC1wcm9taXNlLW1pZGRsZXdhcmUvZGlzdC9pbmRleC5qcyIsIm1haW4uanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVzIGEgdW5hcnkgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGBmdW5jYCB3aXRoIGl0cyBhcmd1bWVudCB0cmFuc2Zvcm1lZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyBUaGUgZnVuY3Rpb24gdG8gd3JhcC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IHRyYW5zZm9ybSBUaGUgYXJndW1lbnQgdHJhbnNmb3JtLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBSZXR1cm5zIHRoZSBuZXcgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG92ZXJBcmcoZnVuYywgdHJhbnNmb3JtKSB7XG4gIHJldHVybiBmdW5jdGlvbihhcmcpIHtcbiAgICByZXR1cm4gZnVuYyh0cmFuc2Zvcm0oYXJnKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IG92ZXJBcmc7XG4iLCJpbXBvcnQgb3ZlckFyZyBmcm9tICcuL19vdmVyQXJnLmpzJztcblxuLyoqIEJ1aWx0LWluIHZhbHVlIHJlZmVyZW5jZXMuICovXG52YXIgZ2V0UHJvdG90eXBlID0gb3ZlckFyZyhPYmplY3QuZ2V0UHJvdG90eXBlT2YsIE9iamVjdCk7XG5cbmV4cG9ydCBkZWZhdWx0IGdldFByb3RvdHlwZTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGlzSG9zdE9iamVjdDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc09iamVjdExpa2U7XG4iLCJpbXBvcnQgZ2V0UHJvdG90eXBlIGZyb20gJy4vX2dldFByb3RvdHlwZS5qcyc7XG5pbXBvcnQgaXNIb3N0T2JqZWN0IGZyb20gJy4vX2lzSG9zdE9iamVjdC5qcyc7XG5pbXBvcnQgaXNPYmplY3RMaWtlIGZyb20gJy4vaXNPYmplY3RMaWtlLmpzJztcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgZnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlLFxuICAgIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IGZ1bmNQcm90by50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi83LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHxcbiAgICAgIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpICE9IG9iamVjdFRhZyB8fCBpc0hvc3RPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmcpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBpc1BsYWluT2JqZWN0O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3ltYm9sT2JzZXJ2YWJsZVBvbnlmaWxsKHJvb3QpIHtcblx0dmFyIHJlc3VsdDtcblx0dmFyIFN5bWJvbCA9IHJvb3QuU3ltYm9sO1xuXG5cdGlmICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0aWYgKFN5bWJvbC5vYnNlcnZhYmxlKSB7XG5cdFx0XHRyZXN1bHQgPSBTeW1ib2wub2JzZXJ2YWJsZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVzdWx0ID0gU3ltYm9sKCdvYnNlcnZhYmxlJyk7XG5cdFx0XHRTeW1ib2wub2JzZXJ2YWJsZSA9IHJlc3VsdDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmVzdWx0ID0gJ0BAb2JzZXJ2YWJsZSc7XG5cdH1cblxuXHRyZXR1cm4gcmVzdWx0O1xufTtcbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cbmltcG9ydCBwb255ZmlsbCBmcm9tICcuL3BvbnlmaWxsJztcblxudmFyIHJvb3QgPSB0aGlzO1xuaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7XG5cdHJvb3QgPSBnbG9iYWw7XG59IGVsc2UgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG5cdHJvb3QgPSB3aW5kb3c7XG59XG5cbnZhciByZXN1bHQgPSBwb255ZmlsbChyb290KTtcbmV4cG9ydCBkZWZhdWx0IHJlc3VsdDtcbiIsImltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2xvZGFzaC1lcy9pc1BsYWluT2JqZWN0JztcbmltcG9ydCAkJG9ic2VydmFibGUgZnJvbSAnc3ltYm9sLW9ic2VydmFibGUnO1xuXG4vKipcbiAqIFRoZXNlIGFyZSBwcml2YXRlIGFjdGlvbiB0eXBlcyByZXNlcnZlZCBieSBSZWR1eC5cbiAqIEZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB5b3UgbXVzdCByZXR1cm4gdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBJZiB0aGUgY3VycmVudCBzdGF0ZSBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAqIERvIG5vdCByZWZlcmVuY2UgdGhlc2UgYWN0aW9uIHR5cGVzIGRpcmVjdGx5IGluIHlvdXIgY29kZS5cbiAqL1xuZXhwb3J0IHZhciBBY3Rpb25UeXBlcyA9IHtcbiAgSU5JVDogJ0BAcmVkdXgvSU5JVCdcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIFJlZHV4IHN0b3JlIHRoYXQgaG9sZHMgdGhlIHN0YXRlIHRyZWUuXG4gKiBUaGUgb25seSB3YXkgdG8gY2hhbmdlIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBpcyB0byBjYWxsIGBkaXNwYXRjaCgpYCBvbiBpdC5cbiAqXG4gKiBUaGVyZSBzaG91bGQgb25seSBiZSBhIHNpbmdsZSBzdG9yZSBpbiB5b3VyIGFwcC4gVG8gc3BlY2lmeSBob3cgZGlmZmVyZW50XG4gKiBwYXJ0cyBvZiB0aGUgc3RhdGUgdHJlZSByZXNwb25kIHRvIGFjdGlvbnMsIHlvdSBtYXkgY29tYmluZSBzZXZlcmFsIHJlZHVjZXJzXG4gKiBpbnRvIGEgc2luZ2xlIHJlZHVjZXIgZnVuY3Rpb24gYnkgdXNpbmcgYGNvbWJpbmVSZWR1Y2Vyc2AuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVkdWNlciBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgbmV4dCBzdGF0ZSB0cmVlLCBnaXZlblxuICogdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGFjdGlvbiB0byBoYW5kbGUuXG4gKlxuICogQHBhcmFtIHthbnl9IFtwcmVsb2FkZWRTdGF0ZV0gVGhlIGluaXRpYWwgc3RhdGUuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBoeWRyYXRlIHRoZSBzdGF0ZSBmcm9tIHRoZSBzZXJ2ZXIgaW4gdW5pdmVyc2FsIGFwcHMsIG9yIHRvIHJlc3RvcmUgYVxuICogcHJldmlvdXNseSBzZXJpYWxpemVkIHVzZXIgc2Vzc2lvbi5cbiAqIElmIHlvdSB1c2UgYGNvbWJpbmVSZWR1Y2Vyc2AgdG8gcHJvZHVjZSB0aGUgcm9vdCByZWR1Y2VyIGZ1bmN0aW9uLCB0aGlzIG11c3QgYmVcbiAqIGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlIGFzIGBjb21iaW5lUmVkdWNlcnNgIGtleXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZW5oYW5jZXIgVGhlIHN0b3JlIGVuaGFuY2VyLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gZW5oYW5jZSB0aGUgc3RvcmUgd2l0aCB0aGlyZC1wYXJ0eSBjYXBhYmlsaXRpZXMgc3VjaCBhcyBtaWRkbGV3YXJlLFxuICogdGltZSB0cmF2ZWwsIHBlcnNpc3RlbmNlLCBldGMuIFRoZSBvbmx5IHN0b3JlIGVuaGFuY2VyIHRoYXQgc2hpcHMgd2l0aCBSZWR1eFxuICogaXMgYGFwcGx5TWlkZGxld2FyZSgpYC5cbiAqXG4gKiBAcmV0dXJucyB7U3RvcmV9IEEgUmVkdXggc3RvcmUgdGhhdCBsZXRzIHlvdSByZWFkIHRoZSBzdGF0ZSwgZGlzcGF0Y2ggYWN0aW9uc1xuICogYW5kIHN1YnNjcmliZSB0byBjaGFuZ2VzLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjcmVhdGVTdG9yZShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgdmFyIF9yZWYyO1xuXG4gIGlmICh0eXBlb2YgcHJlbG9hZGVkU3RhdGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVuaGFuY2VyID09PSAndW5kZWZpbmVkJykge1xuICAgIGVuaGFuY2VyID0gcHJlbG9hZGVkU3RhdGU7XG4gICAgcHJlbG9hZGVkU3RhdGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIGVuaGFuY2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVuaGFuY2VyKGNyZWF0ZVN0b3JlKShyZWR1Y2VyLCBwcmVsb2FkZWRTdGF0ZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSByZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgY3VycmVudFJlZHVjZXIgPSByZWR1Y2VyO1xuICB2YXIgY3VycmVudFN0YXRlID0gcHJlbG9hZGVkU3RhdGU7XG4gIHZhciBjdXJyZW50TGlzdGVuZXJzID0gW107XG4gIHZhciBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycztcbiAgdmFyIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCkge1xuICAgIGlmIChuZXh0TGlzdGVuZXJzID09PSBjdXJyZW50TGlzdGVuZXJzKSB7XG4gICAgICBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycy5zbGljZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgc3RhdGUgdHJlZSBtYW5hZ2VkIGJ5IHRoZSBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybnMge2FueX0gVGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgY2hhbmdlIGxpc3RlbmVyLiBJdCB3aWxsIGJlIGNhbGxlZCBhbnkgdGltZSBhbiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCxcbiAgICogYW5kIHNvbWUgcGFydCBvZiB0aGUgc3RhdGUgdHJlZSBtYXkgcG90ZW50aWFsbHkgaGF2ZSBjaGFuZ2VkLiBZb3UgbWF5IHRoZW5cbiAgICogY2FsbCBgZ2V0U3RhdGUoKWAgdG8gcmVhZCB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqXG4gICAqIFlvdSBtYXkgY2FsbCBgZGlzcGF0Y2goKWAgZnJvbSBhIGNoYW5nZSBsaXN0ZW5lciwgd2l0aCB0aGUgZm9sbG93aW5nXG4gICAqIGNhdmVhdHM6XG4gICAqXG4gICAqIDEuIFRoZSBzdWJzY3JpcHRpb25zIGFyZSBzbmFwc2hvdHRlZCBqdXN0IGJlZm9yZSBldmVyeSBgZGlzcGF0Y2goKWAgY2FsbC5cbiAgICogSWYgeW91IHN1YnNjcmliZSBvciB1bnN1YnNjcmliZSB3aGlsZSB0aGUgbGlzdGVuZXJzIGFyZSBiZWluZyBpbnZva2VkLCB0aGlzXG4gICAqIHdpbGwgbm90IGhhdmUgYW55IGVmZmVjdCBvbiB0aGUgYGRpc3BhdGNoKClgIHRoYXQgaXMgY3VycmVudGx5IGluIHByb2dyZXNzLlxuICAgKiBIb3dldmVyLCB0aGUgbmV4dCBgZGlzcGF0Y2goKWAgY2FsbCwgd2hldGhlciBuZXN0ZWQgb3Igbm90LCB3aWxsIHVzZSBhIG1vcmVcbiAgICogcmVjZW50IHNuYXBzaG90IG9mIHRoZSBzdWJzY3JpcHRpb24gbGlzdC5cbiAgICpcbiAgICogMi4gVGhlIGxpc3RlbmVyIHNob3VsZCBub3QgZXhwZWN0IHRvIHNlZSBhbGwgc3RhdGUgY2hhbmdlcywgYXMgdGhlIHN0YXRlXG4gICAqIG1pZ2h0IGhhdmUgYmVlbiB1cGRhdGVkIG11bHRpcGxlIHRpbWVzIGR1cmluZyBhIG5lc3RlZCBgZGlzcGF0Y2goKWAgYmVmb3JlXG4gICAqIHRoZSBsaXN0ZW5lciBpcyBjYWxsZWQuIEl0IGlzLCBob3dldmVyLCBndWFyYW50ZWVkIHRoYXQgYWxsIHN1YnNjcmliZXJzXG4gICAqIHJlZ2lzdGVyZWQgYmVmb3JlIHRoZSBgZGlzcGF0Y2goKWAgc3RhcnRlZCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBsYXRlc3RcbiAgICogc3RhdGUgYnkgdGhlIHRpbWUgaXQgZXhpdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIEEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCBvbiBldmVyeSBkaXNwYXRjaC5cbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGlzIGNoYW5nZSBsaXN0ZW5lci5cbiAgICovXG4gIGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgbGlzdGVuZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICB2YXIgaXNTdWJzY3JpYmVkID0gdHJ1ZTtcblxuICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICBuZXh0TGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgaWYgKCFpc1N1YnNjcmliZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZTtcblxuICAgICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgICAgdmFyIGluZGV4ID0gbmV4dExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIG5leHRMaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYW4gYWN0aW9uLiBJdCBpcyB0aGUgb25seSB3YXkgdG8gdHJpZ2dlciBhIHN0YXRlIGNoYW5nZS5cbiAgICpcbiAgICogVGhlIGByZWR1Y2VyYCBmdW5jdGlvbiwgdXNlZCB0byBjcmVhdGUgdGhlIHN0b3JlLCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZVxuICAgKiBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBnaXZlbiBgYWN0aW9uYC4gSXRzIHJldHVybiB2YWx1ZSB3aWxsXG4gICAqIGJlIGNvbnNpZGVyZWQgdGhlICoqbmV4dCoqIHN0YXRlIG9mIHRoZSB0cmVlLCBhbmQgdGhlIGNoYW5nZSBsaXN0ZW5lcnNcbiAgICogd2lsbCBiZSBub3RpZmllZC5cbiAgICpcbiAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb25seSBzdXBwb3J0cyBwbGFpbiBvYmplY3QgYWN0aW9ucy4gSWYgeW91IHdhbnQgdG9cbiAgICogZGlzcGF0Y2ggYSBQcm9taXNlLCBhbiBPYnNlcnZhYmxlLCBhIHRodW5rLCBvciBzb21ldGhpbmcgZWxzZSwgeW91IG5lZWQgdG9cbiAgICogd3JhcCB5b3VyIHN0b3JlIGNyZWF0aW5nIGZ1bmN0aW9uIGludG8gdGhlIGNvcnJlc3BvbmRpbmcgbWlkZGxld2FyZS4gRm9yXG4gICAqIGV4YW1wbGUsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGByZWR1eC10aHVua2AgcGFja2FnZS4gRXZlbiB0aGVcbiAgICogbWlkZGxld2FyZSB3aWxsIGV2ZW50dWFsbHkgZGlzcGF0Y2ggcGxhaW4gb2JqZWN0IGFjdGlvbnMgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gQSBwbGFpbiBvYmplY3QgcmVwcmVzZW50aW5nIOKAnHdoYXQgY2hhbmdlZOKAnS4gSXQgaXNcbiAgICogYSBnb29kIGlkZWEgdG8ga2VlcCBhY3Rpb25zIHNlcmlhbGl6YWJsZSBzbyB5b3UgY2FuIHJlY29yZCBhbmQgcmVwbGF5IHVzZXJcbiAgICogc2Vzc2lvbnMsIG9yIHVzZSB0aGUgdGltZSB0cmF2ZWxsaW5nIGByZWR1eC1kZXZ0b29sc2AuIEFuIGFjdGlvbiBtdXN0IGhhdmVcbiAgICogYSBgdHlwZWAgcHJvcGVydHkgd2hpY2ggbWF5IG5vdCBiZSBgdW5kZWZpbmVkYC4gSXQgaXMgYSBnb29kIGlkZWEgdG8gdXNlXG4gICAqIHN0cmluZyBjb25zdGFudHMgZm9yIGFjdGlvbiB0eXBlcy5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gRm9yIGNvbnZlbmllbmNlLCB0aGUgc2FtZSBhY3Rpb24gb2JqZWN0IHlvdSBkaXNwYXRjaGVkLlxuICAgKlxuICAgKiBOb3RlIHRoYXQsIGlmIHlvdSB1c2UgYSBjdXN0b20gbWlkZGxld2FyZSwgaXQgbWF5IHdyYXAgYGRpc3BhdGNoKClgIHRvXG4gICAqIHJldHVybiBzb21ldGhpbmcgZWxzZSAoZm9yIGV4YW1wbGUsIGEgUHJvbWlzZSB5b3UgY2FuIGF3YWl0KS5cbiAgICovXG4gIGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgIGlmICghaXNQbGFpbk9iamVjdChhY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbXVzdCBiZSBwbGFpbiBvYmplY3RzLiAnICsgJ1VzZSBjdXN0b20gbWlkZGxld2FyZSBmb3IgYXN5bmMgYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFjdGlvbi50eXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG1heSBub3QgaGF2ZSBhbiB1bmRlZmluZWQgXCJ0eXBlXCIgcHJvcGVydHkuICcgKyAnSGF2ZSB5b3UgbWlzc3BlbGxlZCBhIGNvbnN0YW50PycpO1xuICAgIH1cblxuICAgIGlmIChpc0Rpc3BhdGNoaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXJzIG1heSBub3QgZGlzcGF0Y2ggYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IHRydWU7XG4gICAgICBjdXJyZW50U3RhdGUgPSBjdXJyZW50UmVkdWNlcihjdXJyZW50U3RhdGUsIGFjdGlvbik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycyA9IG5leHRMaXN0ZW5lcnM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXSgpO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIHJlZHVjZXIgY3VycmVudGx5IHVzZWQgYnkgdGhlIHN0b3JlIHRvIGNhbGN1bGF0ZSB0aGUgc3RhdGUuXG4gICAqXG4gICAqIFlvdSBtaWdodCBuZWVkIHRoaXMgaWYgeW91ciBhcHAgaW1wbGVtZW50cyBjb2RlIHNwbGl0dGluZyBhbmQgeW91IHdhbnQgdG9cbiAgICogbG9hZCBzb21lIG9mIHRoZSByZWR1Y2VycyBkeW5hbWljYWxseS4gWW91IG1pZ2h0IGFsc28gbmVlZCB0aGlzIGlmIHlvdVxuICAgKiBpbXBsZW1lbnQgYSBob3QgcmVsb2FkaW5nIG1lY2hhbmlzbSBmb3IgUmVkdXguXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHRSZWR1Y2VyIFRoZSByZWR1Y2VyIGZvciB0aGUgc3RvcmUgdG8gdXNlIGluc3RlYWQuXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgZnVuY3Rpb24gcmVwbGFjZVJlZHVjZXIobmV4dFJlZHVjZXIpIHtcbiAgICBpZiAodHlwZW9mIG5leHRSZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBuZXh0UmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIGN1cnJlbnRSZWR1Y2VyID0gbmV4dFJlZHVjZXI7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEludGVyb3BlcmFiaWxpdHkgcG9pbnQgZm9yIG9ic2VydmFibGUvcmVhY3RpdmUgbGlicmFyaWVzLlxuICAgKiBAcmV0dXJucyB7b2JzZXJ2YWJsZX0gQSBtaW5pbWFsIG9ic2VydmFibGUgb2Ygc3RhdGUgY2hhbmdlcy5cbiAgICogRm9yIG1vcmUgaW5mb3JtYXRpb24sIHNlZSB0aGUgb2JzZXJ2YWJsZSBwcm9wb3NhbDpcbiAgICogaHR0cHM6Ly9naXRodWIuY29tL3plbnBhcnNpbmcvZXMtb2JzZXJ2YWJsZVxuICAgKi9cbiAgZnVuY3Rpb24gb2JzZXJ2YWJsZSgpIHtcbiAgICB2YXIgX3JlZjtcblxuICAgIHZhciBvdXRlclN1YnNjcmliZSA9IHN1YnNjcmliZTtcbiAgICByZXR1cm4gX3JlZiA9IHtcbiAgICAgIC8qKlxuICAgICAgICogVGhlIG1pbmltYWwgb2JzZXJ2YWJsZSBzdWJzY3JpcHRpb24gbWV0aG9kLlxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IG9ic2VydmVyIEFueSBvYmplY3QgdGhhdCBjYW4gYmUgdXNlZCBhcyBhbiBvYnNlcnZlci5cbiAgICAgICAqIFRoZSBvYnNlcnZlciBvYmplY3Qgc2hvdWxkIGhhdmUgYSBgbmV4dGAgbWV0aG9kLlxuICAgICAgICogQHJldHVybnMge3N1YnNjcmlwdGlvbn0gQW4gb2JqZWN0IHdpdGggYW4gYHVuc3Vic2NyaWJlYCBtZXRob2QgdGhhdCBjYW5cbiAgICAgICAqIGJlIHVzZWQgdG8gdW5zdWJzY3JpYmUgdGhlIG9ic2VydmFibGUgZnJvbSB0aGUgc3RvcmUsIGFuZCBwcmV2ZW50IGZ1cnRoZXJcbiAgICAgICAqIGVtaXNzaW9uIG9mIHZhbHVlcyBmcm9tIHRoZSBvYnNlcnZhYmxlLlxuICAgICAgICovXG4gICAgICBzdWJzY3JpYmU6IGZ1bmN0aW9uIHN1YnNjcmliZShvYnNlcnZlcikge1xuICAgICAgICBpZiAodHlwZW9mIG9ic2VydmVyICE9PSAnb2JqZWN0Jykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIHRoZSBvYnNlcnZlciB0byBiZSBhbiBvYmplY3QuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBvYnNlcnZlU3RhdGUoKSB7XG4gICAgICAgICAgaWYgKG9ic2VydmVyLm5leHQpIHtcbiAgICAgICAgICAgIG9ic2VydmVyLm5leHQoZ2V0U3RhdGUoKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgb2JzZXJ2ZVN0YXRlKCk7XG4gICAgICAgIHZhciB1bnN1YnNjcmliZSA9IG91dGVyU3Vic2NyaWJlKG9ic2VydmVTdGF0ZSk7XG4gICAgICAgIHJldHVybiB7IHVuc3Vic2NyaWJlOiB1bnN1YnNjcmliZSB9O1xuICAgICAgfVxuICAgIH0sIF9yZWZbJCRvYnNlcnZhYmxlXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sIF9yZWY7XG4gIH1cblxuICAvLyBXaGVuIGEgc3RvcmUgaXMgY3JlYXRlZCwgYW4gXCJJTklUXCIgYWN0aW9uIGlzIGRpc3BhdGNoZWQgc28gdGhhdCBldmVyeVxuICAvLyByZWR1Y2VyIHJldHVybnMgdGhlaXIgaW5pdGlhbCBzdGF0ZS4gVGhpcyBlZmZlY3RpdmVseSBwb3B1bGF0ZXNcbiAgLy8gdGhlIGluaXRpYWwgc3RhdGUgdHJlZS5cbiAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gIHJldHVybiBfcmVmMiA9IHtcbiAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXG4gICAgc3Vic2NyaWJlOiBzdWJzY3JpYmUsXG4gICAgZ2V0U3RhdGU6IGdldFN0YXRlLFxuICAgIHJlcGxhY2VSZWR1Y2VyOiByZXBsYWNlUmVkdWNlclxuICB9LCBfcmVmMlskJG9ic2VydmFibGVdID0gb2JzZXJ2YWJsZSwgX3JlZjI7XG59IiwiLyoqXG4gKiBQcmludHMgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgd2FybmluZyBtZXNzYWdlLlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdhcm5pbmcobWVzc2FnZSkge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICB0cnkge1xuICAgIC8vIFRoaXMgZXJyb3Igd2FzIHRocm93biBhcyBhIGNvbnZlbmllbmNlIHNvIHRoYXQgaWYgeW91IGVuYWJsZVxuICAgIC8vIFwiYnJlYWsgb24gYWxsIGV4Y2VwdGlvbnNcIiBpbiB5b3VyIGNvbnNvbGUsXG4gICAgLy8gaXQgd291bGQgcGF1c2UgdGhlIGV4ZWN1dGlvbiBhdCB0aGlzIGxpbmUuXG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG4gIH0gY2F0Y2ggKGUpIHt9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cbn0iLCJpbXBvcnQgeyBBY3Rpb25UeXBlcyB9IGZyb20gJy4vY3JlYXRlU3RvcmUnO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnbG9kYXNoLWVzL2lzUGxhaW5PYmplY3QnO1xuaW1wb3J0IHdhcm5pbmcgZnJvbSAnLi91dGlscy93YXJuaW5nJztcblxuZnVuY3Rpb24gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pIHtcbiAgdmFyIGFjdGlvblR5cGUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGU7XG4gIHZhciBhY3Rpb25OYW1lID0gYWN0aW9uVHlwZSAmJiAnXCInICsgYWN0aW9uVHlwZS50b1N0cmluZygpICsgJ1wiJyB8fCAnYW4gYWN0aW9uJztcblxuICByZXR1cm4gJ0dpdmVuIGFjdGlvbiAnICsgYWN0aW9uTmFtZSArICcsIHJlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZC4gJyArICdUbyBpZ25vcmUgYW4gYWN0aW9uLCB5b3UgbXVzdCBleHBsaWNpdGx5IHJldHVybiB0aGUgcHJldmlvdXMgc3RhdGUuJztcbn1cblxuZnVuY3Rpb24gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShpbnB1dFN0YXRlLCByZWR1Y2VycywgYWN0aW9uLCB1bmV4cGVjdGVkS2V5Q2FjaGUpIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgYXJndW1lbnROYW1lID0gYWN0aW9uICYmIGFjdGlvbi50eXBlID09PSBBY3Rpb25UeXBlcy5JTklUID8gJ3ByZWxvYWRlZFN0YXRlIGFyZ3VtZW50IHBhc3NlZCB0byBjcmVhdGVTdG9yZScgOiAncHJldmlvdXMgc3RhdGUgcmVjZWl2ZWQgYnkgdGhlIHJlZHVjZXInO1xuXG4gIGlmIChyZWR1Y2VyS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJ1N0b3JlIGRvZXMgbm90IGhhdmUgYSB2YWxpZCByZWR1Y2VyLiBNYWtlIHN1cmUgdGhlIGFyZ3VtZW50IHBhc3NlZCAnICsgJ3RvIGNvbWJpbmVSZWR1Y2VycyBpcyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSByZWR1Y2Vycy4nO1xuICB9XG5cbiAgaWYgKCFpc1BsYWluT2JqZWN0KGlucHV0U3RhdGUpKSB7XG4gICAgcmV0dXJuICdUaGUgJyArIGFyZ3VtZW50TmFtZSArICcgaGFzIHVuZXhwZWN0ZWQgdHlwZSBvZiBcIicgKyB7fS50b1N0cmluZy5jYWxsKGlucHV0U3RhdGUpLm1hdGNoKC9cXHMoW2EtenxBLVpdKykvKVsxXSArICdcIi4gRXhwZWN0ZWQgYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyAnICsgKCdrZXlzOiBcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIicpO1xuICB9XG5cbiAgdmFyIHVuZXhwZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMoaW5wdXRTdGF0ZSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gIXJlZHVjZXJzLmhhc093blByb3BlcnR5KGtleSkgJiYgIXVuZXhwZWN0ZWRLZXlDYWNoZVtrZXldO1xuICB9KTtcblxuICB1bmV4cGVjdGVkS2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB1bmV4cGVjdGVkS2V5Q2FjaGVba2V5XSA9IHRydWU7XG4gIH0pO1xuXG4gIGlmICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuICdVbmV4cGVjdGVkICcgKyAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMSA/ICdrZXlzJyA6ICdrZXknKSArICcgJyArICgnXCInICsgdW5leHBlY3RlZEtleXMuam9pbignXCIsIFwiJykgKyAnXCIgZm91bmQgaW4gJyArIGFyZ3VtZW50TmFtZSArICcuICcpICsgJ0V4cGVjdGVkIHRvIGZpbmQgb25lIG9mIHRoZSBrbm93biByZWR1Y2VyIGtleXMgaW5zdGVhZDogJyArICgnXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCIuIFVuZXhwZWN0ZWQga2V5cyB3aWxsIGJlIGlnbm9yZWQuJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0UmVkdWNlclNhbml0eShyZWR1Y2Vycykge1xuICBPYmplY3Qua2V5cyhyZWR1Y2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHJlZHVjZXIgPSByZWR1Y2Vyc1trZXldO1xuICAgIHZhciBpbml0aWFsU3RhdGUgPSByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gICAgaWYgKHR5cGVvZiBpbml0aWFsU3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24uICcgKyAnSWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGUgcmVkdWNlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0ICcgKyAnZXhwbGljaXRseSByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSAnICsgJ25vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgfVxuXG4gICAgdmFyIHR5cGUgPSAnQEByZWR1eC9QUk9CRV9VTktOT1dOX0FDVElPTl8nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpLnNwbGl0KCcnKS5qb2luKCcuJyk7XG4gICAgaWYgKHR5cGVvZiByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiB0eXBlIH0pID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgd2hlbiBwcm9iZWQgd2l0aCBhIHJhbmRvbSB0eXBlLiAnICsgKCdEb25cXCd0IHRyeSB0byBoYW5kbGUgJyArIEFjdGlvblR5cGVzLklOSVQgKyAnIG9yIG90aGVyIGFjdGlvbnMgaW4gXCJyZWR1eC8qXCIgJykgKyAnbmFtZXNwYWNlLiBUaGV5IGFyZSBjb25zaWRlcmVkIHByaXZhdGUuIEluc3RlYWQsIHlvdSBtdXN0IHJldHVybiB0aGUgJyArICdjdXJyZW50IHN0YXRlIGZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB1bmxlc3MgaXQgaXMgdW5kZWZpbmVkLCAnICsgJ2luIHdoaWNoIGNhc2UgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLCByZWdhcmRsZXNzIG9mIHRoZSAnICsgJ2FjdGlvbiB0eXBlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGRpZmZlcmVudCByZWR1Y2VyIGZ1bmN0aW9ucywgaW50byBhIHNpbmdsZVxuICogcmVkdWNlciBmdW5jdGlvbi4gSXQgd2lsbCBjYWxsIGV2ZXJ5IGNoaWxkIHJlZHVjZXIsIGFuZCBnYXRoZXIgdGhlaXIgcmVzdWx0c1xuICogaW50byBhIHNpbmdsZSBzdGF0ZSBvYmplY3QsIHdob3NlIGtleXMgY29ycmVzcG9uZCB0byB0aGUga2V5cyBvZiB0aGUgcGFzc2VkXG4gKiByZWR1Y2VyIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVkdWNlcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBjb3JyZXNwb25kIHRvIGRpZmZlcmVudFxuICogcmVkdWNlciBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlIGNvbWJpbmVkIGludG8gb25lLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpblxuICogaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXMgcmVkdWNlcnNgIHN5bnRheC4gVGhlIHJlZHVjZXJzIG1heSBuZXZlciByZXR1cm5cbiAqIHVuZGVmaW5lZCBmb3IgYW55IGFjdGlvbi4gSW5zdGVhZCwgdGhleSBzaG91bGQgcmV0dXJuIHRoZWlyIGluaXRpYWwgc3RhdGVcbiAqIGlmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlbSB3YXMgdW5kZWZpbmVkLCBhbmQgdGhlIGN1cnJlbnQgc3RhdGUgZm9yIGFueVxuICogdW5yZWNvZ25pemVkIGFjdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgcmVkdWNlciBmdW5jdGlvbiB0aGF0IGludm9rZXMgZXZlcnkgcmVkdWNlciBpbnNpZGUgdGhlXG4gKiBwYXNzZWQgb2JqZWN0LCBhbmQgYnVpbGRzIGEgc3RhdGUgb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2Vycykge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBmaW5hbFJlZHVjZXJzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gcmVkdWNlcktleXNbaV07XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB3YXJuaW5nKCdObyByZWR1Y2VyIHByb3ZpZGVkIGZvciBrZXkgXCInICsga2V5ICsgJ1wiJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmaW5hbFJlZHVjZXJzW2tleV0gPSByZWR1Y2Vyc1trZXldO1xuICAgIH1cbiAgfVxuICB2YXIgZmluYWxSZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKGZpbmFsUmVkdWNlcnMpO1xuXG4gIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgdmFyIHVuZXhwZWN0ZWRLZXlDYWNoZSA9IHt9O1xuICB9XG5cbiAgdmFyIHNhbml0eUVycm9yO1xuICB0cnkge1xuICAgIGFzc2VydFJlZHVjZXJTYW5pdHkoZmluYWxSZWR1Y2Vycyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzYW5pdHlFcnJvciA9IGU7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluYXRpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIGlmIChzYW5pdHlFcnJvcikge1xuICAgICAgdGhyb3cgc2FuaXR5RXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHZhciB3YXJuaW5nTWVzc2FnZSA9IGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2Uoc3RhdGUsIGZpbmFsUmVkdWNlcnMsIGFjdGlvbiwgdW5leHBlY3RlZEtleUNhY2hlKTtcbiAgICAgIGlmICh3YXJuaW5nTWVzc2FnZSkge1xuICAgICAgICB3YXJuaW5nKHdhcm5pbmdNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbmFsUmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBmaW5hbFJlZHVjZXJLZXlzW2ldO1xuICAgICAgdmFyIHJlZHVjZXIgPSBmaW5hbFJlZHVjZXJzW2tleV07XG4gICAgICB2YXIgcHJldmlvdXNTdGF0ZUZvcktleSA9IHN0YXRlW2tleV07XG4gICAgICB2YXIgbmV4dFN0YXRlRm9yS2V5ID0gcmVkdWNlcihwcmV2aW91c1N0YXRlRm9yS2V5LCBhY3Rpb24pO1xuICAgICAgaWYgKHR5cGVvZiBuZXh0U3RhdGVGb3JLZXkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgbmV4dFN0YXRlW2tleV0gPSBuZXh0U3RhdGVGb3JLZXk7XG4gICAgICBoYXNDaGFuZ2VkID0gaGFzQ2hhbmdlZCB8fCBuZXh0U3RhdGVGb3JLZXkgIT09IHByZXZpb3VzU3RhdGVGb3JLZXk7XG4gICAgfVxuICAgIHJldHVybiBoYXNDaGFuZ2VkID8gbmV4dFN0YXRlIDogc3RhdGU7XG4gIH07XG59IiwiLyoqXG4gKiBDb21wb3NlcyBzaW5nbGUtYXJndW1lbnQgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG8gbGVmdC4gVGhlIHJpZ2h0bW9zdFxuICogZnVuY3Rpb24gY2FuIHRha2UgbXVsdGlwbGUgYXJndW1lbnRzIGFzIGl0IHByb3ZpZGVzIHRoZSBzaWduYXR1cmUgZm9yXG4gKiB0aGUgcmVzdWx0aW5nIGNvbXBvc2l0ZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jcyBUaGUgZnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gb2J0YWluZWQgYnkgY29tcG9zaW5nIHRoZSBhcmd1bWVudCBmdW5jdGlvbnNcbiAqIGZyb20gcmlnaHQgdG8gbGVmdC4gRm9yIGV4YW1wbGUsIGNvbXBvc2UoZiwgZywgaCkgaXMgaWRlbnRpY2FsIHRvIGRvaW5nXG4gKiAoLi4uYXJncykgPT4gZihnKGgoLi4uYXJncykpKS5cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb21wb3NlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZnVuY3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBmdW5jc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIGlmIChmdW5jcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKGFyZykge1xuICAgICAgcmV0dXJuIGFyZztcbiAgICB9O1xuICB9XG5cbiAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBmdW5jc1swXTtcbiAgfVxuXG4gIHZhciBsYXN0ID0gZnVuY3NbZnVuY3MubGVuZ3RoIC0gMV07XG4gIHZhciByZXN0ID0gZnVuY3Muc2xpY2UoMCwgLTEpO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiByZXN0LnJlZHVjZVJpZ2h0KGZ1bmN0aW9uIChjb21wb3NlZCwgZikge1xuICAgICAgcmV0dXJuIGYoY29tcG9zZWQpO1xuICAgIH0sIGxhc3QuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn0iLCJ2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5pbXBvcnQgY29tcG9zZSBmcm9tICcuL2NvbXBvc2UnO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzdG9yZSBlbmhhbmNlciB0aGF0IGFwcGxpZXMgbWlkZGxld2FyZSB0byB0aGUgZGlzcGF0Y2ggbWV0aG9kXG4gKiBvZiB0aGUgUmVkdXggc3RvcmUuIFRoaXMgaXMgaGFuZHkgZm9yIGEgdmFyaWV0eSBvZiB0YXNrcywgc3VjaCBhcyBleHByZXNzaW5nXG4gKiBhc3luY2hyb25vdXMgYWN0aW9ucyBpbiBhIGNvbmNpc2UgbWFubmVyLCBvciBsb2dnaW5nIGV2ZXJ5IGFjdGlvbiBwYXlsb2FkLlxuICpcbiAqIFNlZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UgYXMgYW4gZXhhbXBsZSBvZiB0aGUgUmVkdXggbWlkZGxld2FyZS5cbiAqXG4gKiBCZWNhdXNlIG1pZGRsZXdhcmUgaXMgcG90ZW50aWFsbHkgYXN5bmNocm9ub3VzLCB0aGlzIHNob3VsZCBiZSB0aGUgZmlyc3RcbiAqIHN0b3JlIGVuaGFuY2VyIGluIHRoZSBjb21wb3NpdGlvbiBjaGFpbi5cbiAqXG4gKiBOb3RlIHRoYXQgZWFjaCBtaWRkbGV3YXJlIHdpbGwgYmUgZ2l2ZW4gdGhlIGBkaXNwYXRjaGAgYW5kIGBnZXRTdGF0ZWAgZnVuY3Rpb25zXG4gKiBhcyBuYW1lZCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gbWlkZGxld2FyZXMgVGhlIG1pZGRsZXdhcmUgY2hhaW4gdG8gYmUgYXBwbGllZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBzdG9yZSBlbmhhbmNlciBhcHBseWluZyB0aGUgbWlkZGxld2FyZS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgbWlkZGxld2FyZXMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBtaWRkbGV3YXJlc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoY3JlYXRlU3RvcmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlZHVjZXIsIHByZWxvYWRlZFN0YXRlLCBlbmhhbmNlcikge1xuICAgICAgdmFyIHN0b3JlID0gY3JlYXRlU3RvcmUocmVkdWNlciwgcHJlbG9hZGVkU3RhdGUsIGVuaGFuY2VyKTtcbiAgICAgIHZhciBfZGlzcGF0Y2ggPSBzdG9yZS5kaXNwYXRjaDtcbiAgICAgIHZhciBjaGFpbiA9IFtdO1xuXG4gICAgICB2YXIgbWlkZGxld2FyZUFQSSA9IHtcbiAgICAgICAgZ2V0U3RhdGU6IHN0b3JlLmdldFN0YXRlLFxuICAgICAgICBkaXNwYXRjaDogZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIF9kaXNwYXRjaChhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2hhaW4gPSBtaWRkbGV3YXJlcy5tYXAoZnVuY3Rpb24gKG1pZGRsZXdhcmUpIHtcbiAgICAgICAgcmV0dXJuIG1pZGRsZXdhcmUobWlkZGxld2FyZUFQSSk7XG4gICAgICB9KTtcbiAgICAgIF9kaXNwYXRjaCA9IGNvbXBvc2UuYXBwbHkodW5kZWZpbmVkLCBjaGFpbikoc3RvcmUuZGlzcGF0Y2gpO1xuXG4gICAgICByZXR1cm4gX2V4dGVuZHMoe30sIHN0b3JlLCB7XG4gICAgICAgIGRpc3BhdGNoOiBfZGlzcGF0Y2hcbiAgICAgIH0pO1xuICAgIH07XG4gIH07XG59IiwiaW1wb3J0IGNyZWF0ZVN0b3JlIGZyb20gJy4vY3JlYXRlU3RvcmUnO1xuaW1wb3J0IGNvbWJpbmVSZWR1Y2VycyBmcm9tICcuL2NvbWJpbmVSZWR1Y2Vycyc7XG5pbXBvcnQgYmluZEFjdGlvbkNyZWF0b3JzIGZyb20gJy4vYmluZEFjdGlvbkNyZWF0b3JzJztcbmltcG9ydCBhcHBseU1pZGRsZXdhcmUgZnJvbSAnLi9hcHBseU1pZGRsZXdhcmUnO1xuaW1wb3J0IGNvbXBvc2UgZnJvbSAnLi9jb21wb3NlJztcbmltcG9ydCB3YXJuaW5nIGZyb20gJy4vdXRpbHMvd2FybmluZyc7XG5cbi8qXG4qIFRoaXMgaXMgYSBkdW1teSBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgZnVuY3Rpb24gbmFtZSBoYXMgYmVlbiBhbHRlcmVkIGJ5IG1pbmlmaWNhdGlvbi5cbiogSWYgdGhlIGZ1bmN0aW9uIGhhcyBiZWVuIG1pbmlmaWVkIGFuZCBOT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nLCB3YXJuIHRoZSB1c2VyLlxuKi9cbmZ1bmN0aW9uIGlzQ3J1c2hlZCgpIHt9XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHR5cGVvZiBpc0NydXNoZWQubmFtZSA9PT0gJ3N0cmluZycgJiYgaXNDcnVzaGVkLm5hbWUgIT09ICdpc0NydXNoZWQnKSB7XG4gIHdhcm5pbmcoJ1lvdSBhcmUgY3VycmVudGx5IHVzaW5nIG1pbmlmaWVkIGNvZGUgb3V0c2lkZSBvZiBOT0RFX0VOViA9PT0gXFwncHJvZHVjdGlvblxcJy4gJyArICdUaGlzIG1lYW5zIHRoYXQgeW91IGFyZSBydW5uaW5nIGEgc2xvd2VyIGRldmVsb3BtZW50IGJ1aWxkIG9mIFJlZHV4LiAnICsgJ1lvdSBjYW4gdXNlIGxvb3NlLWVudmlmeSAoaHR0cHM6Ly9naXRodWIuY29tL3plcnRvc2gvbG9vc2UtZW52aWZ5KSBmb3IgYnJvd3NlcmlmeSAnICsgJ29yIERlZmluZVBsdWdpbiBmb3Igd2VicGFjayAoaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMDAzMDAzMSkgJyArICd0byBlbnN1cmUgeW91IGhhdmUgdGhlIGNvcnJlY3QgY29kZSBmb3IgeW91ciBwcm9kdWN0aW9uIGJ1aWxkLicpO1xufVxuXG5leHBvcnQgeyBjcmVhdGVTdG9yZSwgY29tYmluZVJlZHVjZXJzLCBiaW5kQWN0aW9uQ3JlYXRvcnMsIGFwcGx5TWlkZGxld2FyZSwgY29tcG9zZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7IGlmIChBcnJheS5pc0FycmF5KGFycikpIHsgZm9yICh2YXIgaSA9IDAsIGFycjIgPSBBcnJheShhcnIubGVuZ3RoKTsgaSA8IGFyci5sZW5ndGg7IGkrKykgeyBhcnIyW2ldID0gYXJyW2ldOyB9IHJldHVybiBhcnIyOyB9IGVsc2UgeyByZXR1cm4gQXJyYXkuZnJvbShhcnIpOyB9IH1cblxuZnVuY3Rpb24gX3R5cGVvZihvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sICE9PSBcInVuZGVmaW5lZFwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH1cblxudmFyIHJlcGVhdCA9IGZ1bmN0aW9uIHJlcGVhdChzdHIsIHRpbWVzKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodGltZXMgKyAxKS5qb2luKHN0cik7XG59O1xudmFyIHBhZCA9IGZ1bmN0aW9uIHBhZChudW0sIG1heExlbmd0aCkge1xuICByZXR1cm4gcmVwZWF0KFwiMFwiLCBtYXhMZW5ndGggLSBudW0udG9TdHJpbmcoKS5sZW5ndGgpICsgbnVtO1xufTtcbnZhciBmb3JtYXRUaW1lID0gZnVuY3Rpb24gZm9ybWF0VGltZSh0aW1lKSB7XG4gIHJldHVybiBcIkAgXCIgKyBwYWQodGltZS5nZXRIb3VycygpLCAyKSArIFwiOlwiICsgcGFkKHRpbWUuZ2V0TWludXRlcygpLCAyKSArIFwiOlwiICsgcGFkKHRpbWUuZ2V0U2Vjb25kcygpLCAyKSArIFwiLlwiICsgcGFkKHRpbWUuZ2V0TWlsbGlzZWNvbmRzKCksIDMpO1xufTtcblxuLy8gVXNlIHRoZSBuZXcgcGVyZm9ybWFuY2UgYXBpIHRvIGdldCBiZXR0ZXIgcHJlY2lzaW9uIGlmIGF2YWlsYWJsZVxudmFyIHRpbWVyID0gdHlwZW9mIHBlcmZvcm1hbmNlICE9PSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBwZXJmb3JtYW5jZS5ub3cgPT09IFwiZnVuY3Rpb25cIiA/IHBlcmZvcm1hbmNlIDogRGF0ZTtcblxuLyoqXG4gKiBwYXJzZSB0aGUgbGV2ZWwgb3B0aW9uIG9mIGNyZWF0ZUxvZ2dlclxuICpcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nIHwgZnVuY3Rpb24gfCBvYmplY3R9IGxldmVsIC0gY29uc29sZVtsZXZlbF1cbiAqIEBwcm9wZXJ0eSB7b2JqZWN0fSBhY3Rpb25cbiAqIEBwcm9wZXJ0eSB7YXJyYXl9IHBheWxvYWRcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSB0eXBlXG4gKi9cblxuZnVuY3Rpb24gZ2V0TG9nTGV2ZWwobGV2ZWwsIGFjdGlvbiwgcGF5bG9hZCwgdHlwZSkge1xuICBzd2l0Y2ggKHR5cGVvZiBsZXZlbCA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKGxldmVsKSkge1xuICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgIHJldHVybiB0eXBlb2YgbGV2ZWxbdHlwZV0gPT09IFwiZnVuY3Rpb25cIiA/IGxldmVsW3R5cGVdLmFwcGx5KGxldmVsLCBfdG9Db25zdW1hYmxlQXJyYXkocGF5bG9hZCkpIDogbGV2ZWxbdHlwZV07XG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICByZXR1cm4gbGV2ZWwoYWN0aW9uKTtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGxldmVsO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBsb2dnZXIgd2l0aCBmb2xsb3dlZCBvcHRpb25zXG4gKlxuICogQG5hbWVzcGFjZVxuICogQHByb3BlcnR5IHtvYmplY3R9IG9wdGlvbnMgLSBvcHRpb25zIGZvciBsb2dnZXJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nIHwgZnVuY3Rpb24gfCBvYmplY3R9IG9wdGlvbnMubGV2ZWwgLSBjb25zb2xlW2xldmVsXVxuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLmR1cmF0aW9uIC0gcHJpbnQgZHVyYXRpb24gb2YgZWFjaCBhY3Rpb24/XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMudGltZXN0YW1wIC0gcHJpbnQgdGltZXN0YW1wIHdpdGggZWFjaCBhY3Rpb24/XG4gKiBAcHJvcGVydHkge29iamVjdH0gb3B0aW9ucy5jb2xvcnMgLSBjdXN0b20gY29sb3JzXG4gKiBAcHJvcGVydHkge29iamVjdH0gb3B0aW9ucy5sb2dnZXIgLSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgYGNvbnNvbGVgIEFQSVxuICogQHByb3BlcnR5IHtib29sZWFufSBvcHRpb25zLmxvZ0Vycm9ycyAtIHNob3VsZCBlcnJvcnMgaW4gYWN0aW9uIGV4ZWN1dGlvbiBiZSBjYXVnaHQsIGxvZ2dlZCwgYW5kIHJlLXRocm93bj9cbiAqIEBwcm9wZXJ0eSB7Ym9vbGVhbn0gb3B0aW9ucy5jb2xsYXBzZWQgLSBpcyBncm91cCBjb2xsYXBzZWQ/XG4gKiBAcHJvcGVydHkge2Jvb2xlYW59IG9wdGlvbnMucHJlZGljYXRlIC0gY29uZGl0aW9uIHdoaWNoIHJlc29sdmVzIGxvZ2dlciBiZWhhdmlvclxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gb3B0aW9ucy5zdGF0ZVRyYW5zZm9ybWVyIC0gdHJhbnNmb3JtIHN0YXRlIGJlZm9yZSBwcmludFxuICogQHByb3BlcnR5IHtmdW5jdGlvbn0gb3B0aW9ucy5hY3Rpb25UcmFuc2Zvcm1lciAtIHRyYW5zZm9ybSBhY3Rpb24gYmVmb3JlIHByaW50XG4gKiBAcHJvcGVydHkge2Z1bmN0aW9ufSBvcHRpb25zLmVycm9yVHJhbnNmb3JtZXIgLSB0cmFuc2Zvcm0gZXJyb3IgYmVmb3JlIHByaW50XG4gKi9cblxuZnVuY3Rpb24gY3JlYXRlTG9nZ2VyKCkge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuICB2YXIgX29wdGlvbnMkbGV2ZWwgPSBvcHRpb25zLmxldmVsO1xuICB2YXIgbGV2ZWwgPSBfb3B0aW9ucyRsZXZlbCA9PT0gdW5kZWZpbmVkID8gXCJsb2dcIiA6IF9vcHRpb25zJGxldmVsO1xuICB2YXIgX29wdGlvbnMkbG9nZ2VyID0gb3B0aW9ucy5sb2dnZXI7XG4gIHZhciBsb2dnZXIgPSBfb3B0aW9ucyRsb2dnZXIgPT09IHVuZGVmaW5lZCA/IGNvbnNvbGUgOiBfb3B0aW9ucyRsb2dnZXI7XG4gIHZhciBfb3B0aW9ucyRsb2dFcnJvcnMgPSBvcHRpb25zLmxvZ0Vycm9ycztcbiAgdmFyIGxvZ0Vycm9ycyA9IF9vcHRpb25zJGxvZ0Vycm9ycyA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IF9vcHRpb25zJGxvZ0Vycm9ycztcbiAgdmFyIGNvbGxhcHNlZCA9IG9wdGlvbnMuY29sbGFwc2VkO1xuICB2YXIgcHJlZGljYXRlID0gb3B0aW9ucy5wcmVkaWNhdGU7XG4gIHZhciBfb3B0aW9ucyRkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb247XG4gIHZhciBkdXJhdGlvbiA9IF9vcHRpb25zJGR1cmF0aW9uID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IF9vcHRpb25zJGR1cmF0aW9uO1xuICB2YXIgX29wdGlvbnMkdGltZXN0YW1wID0gb3B0aW9ucy50aW1lc3RhbXA7XG4gIHZhciB0aW1lc3RhbXAgPSBfb3B0aW9ucyR0aW1lc3RhbXAgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBfb3B0aW9ucyR0aW1lc3RhbXA7XG4gIHZhciB0cmFuc2Zvcm1lciA9IG9wdGlvbnMudHJhbnNmb3JtZXI7XG4gIHZhciBfb3B0aW9ucyRzdGF0ZVRyYW5zZm8gPSBvcHRpb25zLnN0YXRlVHJhbnNmb3JtZXI7XG4gIHZhciAvLyBkZXByZWNhdGVkXG4gIHN0YXRlVHJhbnNmb3JtZXIgPSBfb3B0aW9ucyRzdGF0ZVRyYW5zZm8gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIHJldHVybiBzdGF0ZTtcbiAgfSA6IF9vcHRpb25zJHN0YXRlVHJhbnNmbztcbiAgdmFyIF9vcHRpb25zJGFjdGlvblRyYW5zZiA9IG9wdGlvbnMuYWN0aW9uVHJhbnNmb3JtZXI7XG4gIHZhciBhY3Rpb25UcmFuc2Zvcm1lciA9IF9vcHRpb25zJGFjdGlvblRyYW5zZiA9PT0gdW5kZWZpbmVkID8gZnVuY3Rpb24gKGFjdG4pIHtcbiAgICByZXR1cm4gYWN0bjtcbiAgfSA6IF9vcHRpb25zJGFjdGlvblRyYW5zZjtcbiAgdmFyIF9vcHRpb25zJGVycm9yVHJhbnNmbyA9IG9wdGlvbnMuZXJyb3JUcmFuc2Zvcm1lcjtcbiAgdmFyIGVycm9yVHJhbnNmb3JtZXIgPSBfb3B0aW9ucyRlcnJvclRyYW5zZm8gPT09IHVuZGVmaW5lZCA/IGZ1bmN0aW9uIChlcnJvcikge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfSA6IF9vcHRpb25zJGVycm9yVHJhbnNmbztcbiAgdmFyIF9vcHRpb25zJGNvbG9ycyA9IG9wdGlvbnMuY29sb3JzO1xuICB2YXIgY29sb3JzID0gX29wdGlvbnMkY29sb3JzID09PSB1bmRlZmluZWQgPyB7XG4gICAgdGl0bGU6IGZ1bmN0aW9uIHRpdGxlKCkge1xuICAgICAgcmV0dXJuIFwiIzAwMDAwMFwiO1xuICAgIH0sXG4gICAgcHJldlN0YXRlOiBmdW5jdGlvbiBwcmV2U3RhdGUoKSB7XG4gICAgICByZXR1cm4gXCIjOUU5RTlFXCI7XG4gICAgfSxcbiAgICBhY3Rpb246IGZ1bmN0aW9uIGFjdGlvbigpIHtcbiAgICAgIHJldHVybiBcIiMwM0E5RjRcIjtcbiAgICB9LFxuICAgIG5leHRTdGF0ZTogZnVuY3Rpb24gbmV4dFN0YXRlKCkge1xuICAgICAgcmV0dXJuIFwiIzRDQUY1MFwiO1xuICAgIH0sXG4gICAgZXJyb3I6IGZ1bmN0aW9uIGVycm9yKCkge1xuICAgICAgcmV0dXJuIFwiI0YyMDQwNFwiO1xuICAgIH1cbiAgfSA6IF9vcHRpb25zJGNvbG9ycztcblxuICAvLyBleGl0IGlmIGNvbnNvbGUgdW5kZWZpbmVkXG5cbiAgaWYgKHR5cGVvZiBsb2dnZXIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChuZXh0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfTtcbiAgfVxuXG4gIGlmICh0cmFuc2Zvcm1lcikge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJPcHRpb24gJ3RyYW5zZm9ybWVyJyBpcyBkZXByZWNhdGVkLCB1c2Ugc3RhdGVUcmFuc2Zvcm1lciBpbnN0ZWFkXCIpO1xuICB9XG5cbiAgdmFyIGxvZ0J1ZmZlciA9IFtdO1xuICBmdW5jdGlvbiBwcmludEJ1ZmZlcigpIHtcbiAgICBsb2dCdWZmZXIuZm9yRWFjaChmdW5jdGlvbiAobG9nRW50cnksIGtleSkge1xuICAgICAgdmFyIHN0YXJ0ZWQgPSBsb2dFbnRyeS5zdGFydGVkO1xuICAgICAgdmFyIHN0YXJ0ZWRUaW1lID0gbG9nRW50cnkuc3RhcnRlZFRpbWU7XG4gICAgICB2YXIgYWN0aW9uID0gbG9nRW50cnkuYWN0aW9uO1xuICAgICAgdmFyIHByZXZTdGF0ZSA9IGxvZ0VudHJ5LnByZXZTdGF0ZTtcbiAgICAgIHZhciBlcnJvciA9IGxvZ0VudHJ5LmVycm9yO1xuICAgICAgdmFyIHRvb2sgPSBsb2dFbnRyeS50b29rO1xuICAgICAgdmFyIG5leHRTdGF0ZSA9IGxvZ0VudHJ5Lm5leHRTdGF0ZTtcblxuICAgICAgdmFyIG5leHRFbnRyeSA9IGxvZ0J1ZmZlcltrZXkgKyAxXTtcbiAgICAgIGlmIChuZXh0RW50cnkpIHtcbiAgICAgICAgbmV4dFN0YXRlID0gbmV4dEVudHJ5LnByZXZTdGF0ZTtcbiAgICAgICAgdG9vayA9IG5leHRFbnRyeS5zdGFydGVkIC0gc3RhcnRlZDtcbiAgICAgIH1cbiAgICAgIC8vIG1lc3NhZ2VcbiAgICAgIHZhciBmb3JtYXR0ZWRBY3Rpb24gPSBhY3Rpb25UcmFuc2Zvcm1lcihhY3Rpb24pO1xuICAgICAgdmFyIGlzQ29sbGFwc2VkID0gdHlwZW9mIGNvbGxhcHNlZCA9PT0gXCJmdW5jdGlvblwiID8gY29sbGFwc2VkKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5leHRTdGF0ZTtcbiAgICAgIH0sIGFjdGlvbikgOiBjb2xsYXBzZWQ7XG5cbiAgICAgIHZhciBmb3JtYXR0ZWRUaW1lID0gZm9ybWF0VGltZShzdGFydGVkVGltZSk7XG4gICAgICB2YXIgdGl0bGVDU1MgPSBjb2xvcnMudGl0bGUgPyBcImNvbG9yOiBcIiArIGNvbG9ycy50aXRsZShmb3JtYXR0ZWRBY3Rpb24pICsgXCI7XCIgOiBudWxsO1xuICAgICAgdmFyIHRpdGxlID0gXCJhY3Rpb24gXCIgKyAodGltZXN0YW1wID8gZm9ybWF0dGVkVGltZSA6IFwiXCIpICsgXCIgXCIgKyBmb3JtYXR0ZWRBY3Rpb24udHlwZSArIFwiIFwiICsgKGR1cmF0aW9uID8gXCIoaW4gXCIgKyB0b29rLnRvRml4ZWQoMikgKyBcIiBtcylcIiA6IFwiXCIpO1xuXG4gICAgICAvLyByZW5kZXJcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChpc0NvbGxhcHNlZCkge1xuICAgICAgICAgIGlmIChjb2xvcnMudGl0bGUpIGxvZ2dlci5ncm91cENvbGxhcHNlZChcIiVjIFwiICsgdGl0bGUsIHRpdGxlQ1NTKTtlbHNlIGxvZ2dlci5ncm91cENvbGxhcHNlZCh0aXRsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNvbG9ycy50aXRsZSkgbG9nZ2VyLmdyb3VwKFwiJWMgXCIgKyB0aXRsZSwgdGl0bGVDU1MpO2Vsc2UgbG9nZ2VyLmdyb3VwKHRpdGxlKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dnZXIubG9nKHRpdGxlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHByZXZTdGF0ZUxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW3ByZXZTdGF0ZV0sIFwicHJldlN0YXRlXCIpO1xuICAgICAgdmFyIGFjdGlvbkxldmVsID0gZ2V0TG9nTGV2ZWwobGV2ZWwsIGZvcm1hdHRlZEFjdGlvbiwgW2Zvcm1hdHRlZEFjdGlvbl0sIFwiYWN0aW9uXCIpO1xuICAgICAgdmFyIGVycm9yTGV2ZWwgPSBnZXRMb2dMZXZlbChsZXZlbCwgZm9ybWF0dGVkQWN0aW9uLCBbZXJyb3IsIHByZXZTdGF0ZV0sIFwiZXJyb3JcIik7XG4gICAgICB2YXIgbmV4dFN0YXRlTGV2ZWwgPSBnZXRMb2dMZXZlbChsZXZlbCwgZm9ybWF0dGVkQWN0aW9uLCBbbmV4dFN0YXRlXSwgXCJuZXh0U3RhdGVcIik7XG5cbiAgICAgIGlmIChwcmV2U3RhdGVMZXZlbCkge1xuICAgICAgICBpZiAoY29sb3JzLnByZXZTdGF0ZSkgbG9nZ2VyW3ByZXZTdGF0ZUxldmVsXShcIiVjIHByZXYgc3RhdGVcIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMucHJldlN0YXRlKHByZXZTdGF0ZSkgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgcHJldlN0YXRlKTtlbHNlIGxvZ2dlcltwcmV2U3RhdGVMZXZlbF0oXCJwcmV2IHN0YXRlXCIsIHByZXZTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChhY3Rpb25MZXZlbCkge1xuICAgICAgICBpZiAoY29sb3JzLmFjdGlvbikgbG9nZ2VyW2FjdGlvbkxldmVsXShcIiVjIGFjdGlvblwiLCBcImNvbG9yOiBcIiArIGNvbG9ycy5hY3Rpb24oZm9ybWF0dGVkQWN0aW9uKSArIFwiOyBmb250LXdlaWdodDogYm9sZFwiLCBmb3JtYXR0ZWRBY3Rpb24pO2Vsc2UgbG9nZ2VyW2FjdGlvbkxldmVsXShcImFjdGlvblwiLCBmb3JtYXR0ZWRBY3Rpb24pO1xuICAgICAgfVxuXG4gICAgICBpZiAoZXJyb3IgJiYgZXJyb3JMZXZlbCkge1xuICAgICAgICBpZiAoY29sb3JzLmVycm9yKSBsb2dnZXJbZXJyb3JMZXZlbF0oXCIlYyBlcnJvclwiLCBcImNvbG9yOiBcIiArIGNvbG9ycy5lcnJvcihlcnJvciwgcHJldlN0YXRlKSArIFwiOyBmb250LXdlaWdodDogYm9sZFwiLCBlcnJvcik7ZWxzZSBsb2dnZXJbZXJyb3JMZXZlbF0oXCJlcnJvclwiLCBlcnJvcik7XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXh0U3RhdGVMZXZlbCkge1xuICAgICAgICBpZiAoY29sb3JzLm5leHRTdGF0ZSkgbG9nZ2VyW25leHRTdGF0ZUxldmVsXShcIiVjIG5leHQgc3RhdGVcIiwgXCJjb2xvcjogXCIgKyBjb2xvcnMubmV4dFN0YXRlKG5leHRTdGF0ZSkgKyBcIjsgZm9udC13ZWlnaHQ6IGJvbGRcIiwgbmV4dFN0YXRlKTtlbHNlIGxvZ2dlcltuZXh0U3RhdGVMZXZlbF0oXCJuZXh0IHN0YXRlXCIsIG5leHRTdGF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGxvZ2dlci5ncm91cEVuZCgpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBsb2dnZXIubG9nKFwi4oCU4oCUIGxvZyBlbmQg4oCU4oCUXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGxvZ0J1ZmZlci5sZW5ndGggPSAwO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIGdldFN0YXRlID0gX3JlZi5nZXRTdGF0ZTtcbiAgICByZXR1cm4gZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIC8vIGV4aXQgZWFybHkgaWYgcHJlZGljYXRlIGZ1bmN0aW9uIHJldHVybnMgZmFsc2VcbiAgICAgICAgaWYgKHR5cGVvZiBwcmVkaWNhdGUgPT09IFwiZnVuY3Rpb25cIiAmJiAhcHJlZGljYXRlKGdldFN0YXRlLCBhY3Rpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIG5leHQoYWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2dFbnRyeSA9IHt9O1xuICAgICAgICBsb2dCdWZmZXIucHVzaChsb2dFbnRyeSk7XG5cbiAgICAgICAgbG9nRW50cnkuc3RhcnRlZCA9IHRpbWVyLm5vdygpO1xuICAgICAgICBsb2dFbnRyeS5zdGFydGVkVGltZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGxvZ0VudHJ5LnByZXZTdGF0ZSA9IHN0YXRlVHJhbnNmb3JtZXIoZ2V0U3RhdGUoKSk7XG4gICAgICAgIGxvZ0VudHJ5LmFjdGlvbiA9IGFjdGlvbjtcblxuICAgICAgICB2YXIgcmV0dXJuZWRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgaWYgKGxvZ0Vycm9ycykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm5lZFZhbHVlID0gbmV4dChhY3Rpb24pO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGxvZ0VudHJ5LmVycm9yID0gZXJyb3JUcmFuc2Zvcm1lcihlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuZWRWYWx1ZSA9IG5leHQoYWN0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ0VudHJ5LnRvb2sgPSB0aW1lci5ub3coKSAtIGxvZ0VudHJ5LnN0YXJ0ZWQ7XG4gICAgICAgIGxvZ0VudHJ5Lm5leHRTdGF0ZSA9IHN0YXRlVHJhbnNmb3JtZXIoZ2V0U3RhdGUoKSk7XG5cbiAgICAgICAgcHJpbnRCdWZmZXIoKTtcblxuICAgICAgICBpZiAobG9nRW50cnkuZXJyb3IpIHRocm93IGxvZ0VudHJ5LmVycm9yO1xuICAgICAgICByZXR1cm4gcmV0dXJuZWRWYWx1ZTtcbiAgICAgIH07XG4gICAgfTtcbiAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVMb2dnZXI7IiwiZnVuY3Rpb24gY3JlYXRlVGh1bmtNaWRkbGV3YXJlKGV4dHJhQXJndW1lbnQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChfcmVmKSB7XG4gICAgdmFyIGRpc3BhdGNoID0gX3JlZi5kaXNwYXRjaDtcbiAgICB2YXIgZ2V0U3RhdGUgPSBfcmVmLmdldFN0YXRlO1xuICAgIHJldHVybiBmdW5jdGlvbiAobmV4dCkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChhY3Rpb24pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICByZXR1cm4gYWN0aW9uKGRpc3BhdGNoLCBnZXRTdGF0ZSwgZXh0cmFBcmd1bWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgICAgfTtcbiAgICB9O1xuICB9O1xufVxuXG52YXIgdGh1bmsgPSBjcmVhdGVUaHVua01pZGRsZXdhcmUoKTtcbnRodW5rLndpdGhFeHRyYUFyZ3VtZW50ID0gY3JlYXRlVGh1bmtNaWRkbGV3YXJlO1xuXG5leHBvcnQgZGVmYXVsdCB0aHVuazsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7IHJldHVybiB0eXBlb2Ygb2JqOyB9IDogZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gb2JqICYmIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IFN5bWJvbCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5leHBvcnRzLmRlZmF1bHQgPSBpc1Byb21pc2U7XG5mdW5jdGlvbiBpc1Byb21pc2UodmFsdWUpIHtcbiAgaWYgKHZhbHVlICE9PSBudWxsICYmICh0eXBlb2YgdmFsdWUgPT09ICd1bmRlZmluZWQnID8gJ3VuZGVmaW5lZCcgOiBfdHlwZW9mKHZhbHVlKSkgPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZS50aGVuID09PSAnZnVuY3Rpb24nO1xuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufSIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbnZhciBfc2xpY2VkVG9BcnJheSA9IGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gc2xpY2VJdGVyYXRvcihhcnIsIGkpIHsgdmFyIF9hcnIgPSBbXTsgdmFyIF9uID0gdHJ1ZTsgdmFyIF9kID0gZmFsc2U7IHZhciBfZSA9IHVuZGVmaW5lZDsgdHJ5IHsgZm9yICh2YXIgX2kgPSBhcnJbU3ltYm9sLml0ZXJhdG9yXSgpLCBfczsgIShfbiA9IChfcyA9IF9pLm5leHQoKSkuZG9uZSk7IF9uID0gdHJ1ZSkgeyBfYXJyLnB1c2goX3MudmFsdWUpOyBpZiAoaSAmJiBfYXJyLmxlbmd0aCA9PT0gaSkgYnJlYWs7IH0gfSBjYXRjaCAoZXJyKSB7IF9kID0gdHJ1ZTsgX2UgPSBlcnI7IH0gZmluYWxseSB7IHRyeSB7IGlmICghX24gJiYgX2lbXCJyZXR1cm5cIl0pIF9pW1wicmV0dXJuXCJdKCk7IH0gZmluYWxseSB7IGlmIChfZCkgdGhyb3cgX2U7IH0gfSByZXR1cm4gX2FycjsgfSByZXR1cm4gZnVuY3Rpb24gKGFyciwgaSkgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IHJldHVybiBhcnI7IH0gZWxzZSBpZiAoU3ltYm9sLml0ZXJhdG9yIGluIE9iamVjdChhcnIpKSB7IHJldHVybiBzbGljZUl0ZXJhdG9yKGFyciwgaSk7IH0gZWxzZSB7IHRocm93IG5ldyBUeXBlRXJyb3IoXCJJbnZhbGlkIGF0dGVtcHQgdG8gZGVzdHJ1Y3R1cmUgbm9uLWl0ZXJhYmxlIGluc3RhbmNlXCIpOyB9IH07IH0oKTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gcHJvbWlzZU1pZGRsZXdhcmU7XG5cbnZhciBfaXNQcm9taXNlID0gcmVxdWlyZSgnLi9pc1Byb21pc2UnKTtcblxudmFyIF9pc1Byb21pc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQcm9taXNlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxudmFyIGRlZmF1bHRUeXBlcyA9IFsnUEVORElORycsICdGVUxGSUxMRUQnLCAnUkVKRUNURUQnXTtcblxuLyoqXG4gKiBAZnVuY3Rpb24gcHJvbWlzZU1pZGRsZXdhcmVcbiAqIEBkZXNjcmlwdGlvblxuICogQHJldHVybnMge2Z1bmN0aW9ufSB0aHVua1xuICovXG5mdW5jdGlvbiBwcm9taXNlTWlkZGxld2FyZSgpIHtcbiAgdmFyIGNvbmZpZyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuXG4gIHZhciBwcm9taXNlVHlwZVN1ZmZpeGVzID0gY29uZmlnLnByb21pc2VUeXBlU3VmZml4ZXMgfHwgZGVmYXVsdFR5cGVzO1xuXG4gIHJldHVybiBmdW5jdGlvbiAocmVmKSB7XG4gICAgdmFyIGRpc3BhdGNoID0gcmVmLmRpc3BhdGNoO1xuXG5cbiAgICByZXR1cm4gZnVuY3Rpb24gKG5leHQpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoYWN0aW9uKSB7XG4gICAgICAgIGlmIChhY3Rpb24ucGF5bG9hZCkge1xuICAgICAgICAgIGlmICghKDAsIF9pc1Byb21pc2UyLmRlZmF1bHQpKGFjdGlvbi5wYXlsb2FkKSAmJiAhKDAsIF9pc1Byb21pc2UyLmRlZmF1bHQpKGFjdGlvbi5wYXlsb2FkLnByb21pc2UpKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gbmV4dChhY3Rpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGVjb25zdHJ1Y3QgdGhlIHByb3BlcnRpZXMgb2YgdGhlIG9yaWdpbmFsIGFjdGlvbiBvYmplY3QgdG8gY29uc3RhbnRzXG4gICAgICAgIHZhciB0eXBlID0gYWN0aW9uLnR5cGU7XG4gICAgICAgIHZhciBwYXlsb2FkID0gYWN0aW9uLnBheWxvYWQ7XG4gICAgICAgIHZhciBtZXRhID0gYWN0aW9uLm1ldGE7XG5cbiAgICAgICAgLy8gQXNzaWduIHZhbHVlcyBmb3IgcHJvbWlzZSB0eXBlIHN1ZmZpeGVzXG5cbiAgICAgICAgdmFyIF9wcm9taXNlVHlwZVN1ZmZpeGVzID0gX3NsaWNlZFRvQXJyYXkocHJvbWlzZVR5cGVTdWZmaXhlcywgMyk7XG5cbiAgICAgICAgdmFyIFBFTkRJTkcgPSBfcHJvbWlzZVR5cGVTdWZmaXhlc1swXTtcbiAgICAgICAgdmFyIEZVTEZJTExFRCA9IF9wcm9taXNlVHlwZVN1ZmZpeGVzWzFdO1xuICAgICAgICB2YXIgUkVKRUNURUQgPSBfcHJvbWlzZVR5cGVTdWZmaXhlc1syXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogQGZ1bmN0aW9uIGdldEFjdGlvblxuICAgICAgICAgKiBAZGVzY3JpcHRpb24gVXRpbGl0eSBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSByZWplY3RlZCBvciBmdWxmaWxsZWRcbiAgICAgICAgICogZmx1eCBzdGFuZGFyZCBhY3Rpb24gb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IElzIHRoZSBhY3Rpb24gcmVqZWN0ZWQ/XG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGFjdGlvblxuICAgICAgICAgKi9cblxuICAgICAgICB2YXIgZ2V0QWN0aW9uID0gZnVuY3Rpb24gZ2V0QWN0aW9uKG5ld1BheWxvYWQsIGlzUmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gX2V4dGVuZHMoe1xuICAgICAgICAgICAgdHlwZTogdHlwZSArICdfJyArIChpc1JlamVjdGVkID8gUkVKRUNURUQgOiBGVUxGSUxMRUQpXG4gICAgICAgICAgfSwgbmV3UGF5bG9hZCA/IHtcbiAgICAgICAgICAgIHBheWxvYWQ6IG5ld1BheWxvYWRcbiAgICAgICAgICB9IDoge30sICEhbWV0YSA/IHsgbWV0YTogbWV0YSB9IDoge30sIGlzUmVqZWN0ZWQgPyB7XG4gICAgICAgICAgICBlcnJvcjogdHJ1ZVxuICAgICAgICAgIH0gOiB7fSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEFzc2lnbiB2YWx1ZXMgZm9yIHByb21pc2UgYW5kIGRhdGEgdmFyaWFibGVzLiBJbiB0aGUgY2FzZSB0aGUgcGF5bG9hZFxuICAgICAgICAgKiBpcyBhbiBvYmplY3Qgd2l0aCBhIGBwcm9taXNlYCBhbmQgYGRhdGFgIHByb3BlcnR5LCB0aGUgdmFsdWVzIG9mIHRob3NlXG4gICAgICAgICAqIHByb3BlcnRpZXMgd2lsbCBiZSB1c2VkLiBJbiB0aGUgY2FzZSB0aGUgcGF5bG9hZCBpcyBhIHByb21pc2UsIHRoZVxuICAgICAgICAgKiB2YWx1ZSBvZiB0aGUgcGF5bG9hZCB3aWxsIGJlIHVzZWQgYW5kIGRhdGEgd2lsbCBiZSBudWxsLlxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIHByb21pc2UgPSB2b2lkIDA7XG4gICAgICAgIHZhciBkYXRhID0gdm9pZCAwO1xuXG4gICAgICAgIGlmICghKDAsIF9pc1Byb21pc2UyLmRlZmF1bHQpKGFjdGlvbi5wYXlsb2FkKSAmJiBfdHlwZW9mKGFjdGlvbi5wYXlsb2FkKSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICBwcm9taXNlID0gcGF5bG9hZC5wcm9taXNlO1xuICAgICAgICAgIGRhdGEgPSBwYXlsb2FkLmRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvbWlzZSA9IHBheWxvYWQ7XG4gICAgICAgICAgZGF0YSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICogRmlyc3QsIGRpc3BhdGNoIHRoZSBwZW5kaW5nIGFjdGlvbi4gVGhpcyBmbHV4IHN0YW5kYXJkIGFjdGlvbiBvYmplY3RcbiAgICAgICAgICogZGVzY3JpYmVzIHRoZSBwZW5kaW5nIHN0YXRlIG9mIGEgcHJvbWlzZSBhbmQgd2lsbCBpbmNsdWRlIGFueSBkYXRhXG4gICAgICAgICAqIChmb3Igb3B0aW1pc3RpYyB1cGRhdGVzKSBhbmQvb3IgbWV0YSBmcm9tIHRoZSBvcmlnaW5hbCBhY3Rpb24uXG4gICAgICAgICAqL1xuICAgICAgICBuZXh0KF9leHRlbmRzKHtcbiAgICAgICAgICB0eXBlOiB0eXBlICsgJ18nICsgUEVORElOR1xuICAgICAgICB9LCAhIWRhdGEgPyB7IHBheWxvYWQ6IGRhdGEgfSA6IHt9LCAhIW1ldGEgPyB7IG1ldGE6IG1ldGEgfSA6IHt9KSk7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogQGZ1bmN0aW9uIGhhbmRsZVJlamVjdFxuICAgICAgICAgKiBAZGVzY3JpcHRpb24gRGlzcGF0Y2ggdGhlIHJlamVjdGVkIGFjdGlvbiBhbmQgcmV0dXJuXG4gICAgICAgICAqIGFuIGVycm9yIG9iamVjdC4gVGhlIGVycm9yIG9iamVjdCBpcyB0aGUgb3JpZ2luYWwgZXJyb3JcbiAgICAgICAgICogdGhhdCB3YXMgdGhyb3duLiBUaGUgdXNlciBvZiB0aGUgbGlicmFyeSBpcyByZXNwb25zaWJsZSBmb3JcbiAgICAgICAgICogYmVzdCBwcmFjdGljZXMgaW4gZW5zdXJlIHRoYXQgdGhleSBhcmUgdGhyb3dpbmcgYW4gRXJyb3Igb2JqZWN0LlxuICAgICAgICAgKiBAcGFyYW1zIHJlYXNvbiBUaGUgcmVhc29uIHRoZSBwcm9taXNlIHdhcyByZWplY3RlZFxuICAgICAgICAgKiBAcmV0dXJucyB7b2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgdmFyIGhhbmRsZVJlamVjdCA9IGZ1bmN0aW9uIGhhbmRsZVJlamVjdChyZWFzb24pIHtcbiAgICAgICAgICB2YXIgcmVqZWN0ZWRBY3Rpb24gPSBnZXRBY3Rpb24ocmVhc29uLCB0cnVlKTtcbiAgICAgICAgICBkaXNwYXRjaChyZWplY3RlZEFjdGlvbik7XG4gICAgICAgICAgdGhyb3cgcmVhc29uO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIEBmdW5jdGlvbiBoYW5kbGVGdWxmaWxsXG4gICAgICAgICAqIEBkZXNjcmlwdGlvbiBEaXNwYXRjaCB0aGUgZnVsZmlsbGVkIGFjdGlvbiBhbmRcbiAgICAgICAgICogcmV0dXJuIHRoZSBzdWNjZXNzIG9iamVjdC4gVGhlIHN1Y2Nlc3Mgb2JqZWN0IHNob3VsZFxuICAgICAgICAgKiBjb250YWluIHRoZSB2YWx1ZSBhbmQgdGhlIGRpc3BhdGNoZWQgYWN0aW9uLlxuICAgICAgICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRoZSBwcm9taXNlIHdhcyByZXNsb3ZlZCB3aXRoXG4gICAgICAgICAqIEByZXR1cm5zIHtvYmplY3R9XG4gICAgICAgICAqL1xuICAgICAgICB2YXIgaGFuZGxlRnVsZmlsbCA9IGZ1bmN0aW9uIGhhbmRsZUZ1bGZpbGwoKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGFyZ3VtZW50c1swXTtcblxuICAgICAgICAgIHZhciByZXNvbHZlZEFjdGlvbiA9IGdldEFjdGlvbih2YWx1ZSwgZmFsc2UpO1xuICAgICAgICAgIGRpc3BhdGNoKHJlc29sdmVkQWN0aW9uKTtcblxuICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgYWN0aW9uOiByZXNvbHZlZEFjdGlvbiB9O1xuICAgICAgICB9O1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTZWNvbmQsIGRpc3BhdGNoIGEgcmVqZWN0ZWQgb3IgZnVsZmlsbGVkIGFjdGlvbi4gVGhpcyBmbHV4IHN0YW5kYXJkXG4gICAgICAgICAqIGFjdGlvbiBvYmplY3Qgd2lsbCBkZXNjcmliZSB0aGUgcmVzb2x2ZWQgc3RhdGUgb2YgdGhlIHByb21pc2UuIEluXG4gICAgICAgICAqIHRoZSBjYXNlIG9mIGEgcmVqZWN0ZWQgcHJvbWlzZSwgaXQgd2lsbCBpbmNsdWRlIGFuIGBlcnJvcmAgcHJvcGVydHkuXG4gICAgICAgICAqXG4gICAgICAgICAqIEluIG9yZGVyIHRvIGFsbG93IHByb3BlciBjaGFpbmluZyBvZiBhY3Rpb25zIHVzaW5nIGB0aGVuYCwgYSBuZXdcbiAgICAgICAgICogcHJvbWlzZSBpcyBjb25zdHJ1Y3RlZCBhbmQgcmV0dXJuZWQuIFRoaXMgcHJvbWlzZSB3aWxsIHJlc29sdmVcbiAgICAgICAgICogd2l0aCB0d28gcHJvcGVydGllczogKDEpIHRoZSB2YWx1ZSAoaWYgZnVsZmlsbGVkKSBvciByZWFzb25cbiAgICAgICAgICogKGlmIHJlamVjdGVkKSBhbmQgKDIpIHRoZSBmbHV4IHN0YW5kYXJkIGFjdGlvbi5cbiAgICAgICAgICpcbiAgICAgICAgICogUmVqZWN0ZWQgb2JqZWN0OlxuICAgICAgICAgKiB7XG4gICAgICAgICAqICAgcmVhc29uOiAuLi5cbiAgICAgICAgICogICBhY3Rpb246IHtcbiAgICAgICAgICogICAgIGVycm9yOiB0cnVlLFxuICAgICAgICAgKiAgICAgdHlwZTogJ0FDVElPTl9SRUpFQ1RFRCcsXG4gICAgICAgICAqICAgICBwYXlsb2FkOiAuLi5cbiAgICAgICAgICogICB9XG4gICAgICAgICAqIH1cbiAgICAgICAgICpcbiAgICAgICAgICogRnVsZmlsbGVkIG9iamVjdDpcbiAgICAgICAgICoge1xuICAgICAgICAgKiAgIHZhbHVlOiAuLi5cbiAgICAgICAgICogICBhY3Rpb246IHtcbiAgICAgICAgICogICAgIHR5cGU6ICdBQ1RJT05fRlVMRklMTEVEJyxcbiAgICAgICAgICogICAgIHBheWxvYWQ6IC4uLlxuICAgICAgICAgKiAgIH1cbiAgICAgICAgICogfVxuICAgICAgICAgKi9cbiAgICAgICAgcmV0dXJuIHByb21pc2UudGhlbihoYW5kbGVGdWxmaWxsLCBoYW5kbGVSZWplY3QpO1xuICAgICAgfTtcbiAgICB9O1xuICB9O1xufSIsImltcG9ydCB7IGNyZWF0ZVN0b3JlLCBhcHBseU1pZGRsZXdhcmUsIGNvbWJpbmVSZWR1Y2VycyB9IGZyb20gJ3JlZHV4JztcbmltcG9ydCBsb2dnZXIgZnJvbSAncmVkdXgtbG9nZ2VyJztcbmltcG9ydCB0aHVuayBmcm9tICdyZWR1eC10aHVuayc7XG5pbXBvcnQgcHJvbWlzZSBmcm9tICdyZWR1eC1wcm9taXNlLW1pZGRsZXdhcmUnO1xuXG5cbi8vIFJFRFVDRVJTIDw9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcbiAgZmV0Y2hpbmc6IGZhbHNlLFxuICBmZXRjaGVkOiBmYWxzZSxcbiAgZXJyb3I6IG51bGwsXG4gIHVzZXJzTGlzdDogW10sXG59XG5jb25zdCB1c2VyUmVkdWNlciA9IGZ1bmN0aW9uIChzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKSB7XG4gIHN3aXRjaCAoYWN0aW9uLnR5cGUpIHtcbiAgICBjYXNlICdGRVRDSF9VU0VSU19QRU5ESU5HJzpcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge2ZldGNoaW5nOiB0cnVlfSlcbiAgICBjYXNlICdGRVRDSF9VU0VSU19SRUpFQ1RFRCc6XG4gICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUsIHtcbiAgICAgICAgZmV0Y2hpbmc6IGZhbHNlLFxuICAgICAgICBlcnJvcjogYWN0aW9uLnBheWxvYWRcbiAgICAgIH0pXG4gICAgY2FzZSAnRkVUQ0hfVVNFUlNfRlVMRklMTEVEJzpcbiAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSwge1xuICAgICAgICBmZXRjaGluZzogZmFsc2UsXG4gICAgICAgIGZldGNoZWQ6IHRydWUsXG4gICAgICAgIHVzZXJzTGlzdDogYWN0aW9uLnBheWxvYWRcbiAgICAgIH0pXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBzdGF0ZVxuICB9XG59O1xuXG5jb25zdCBwb3N0c1JlZHVjZXIgPSBmdW5jdGlvbiAoc3RhdGUgPSBbXSwgYWN0aW9uKSB7XG4gIHJldHVybiBzdGF0ZTtcbn07XG5cbmNvbnN0IHJvb3RSZWR1Y2VyID0gY29tYmluZVJlZHVjZXJzKHtcbiAgdXNlcnM6IHVzZXJSZWR1Y2VyLFxuICBwb3N0czogcG9zdHNSZWR1Y2VyXG59KTtcbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxuLy8gTUlERExFV0FSRSA8PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbmNvbnN0IG1pZGRsZXdhcmUgPSBhcHBseU1pZGRsZXdhcmUocHJvbWlzZSgpLCB0aHVuaywgbG9nZ2VyKCkpO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIFNUT1JFIElOSVQgPD09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZShyb290UmVkdWNlciwgbWlkZGxld2FyZSk7XG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbi8vIE1BTlVBTFxuLy8gc3RvcmUuZGlzcGF0Y2goKGRpc3BhdGNoKSA9PiB7XG4vLyAgIGRpc3BhdGNoKHsgdHlwZTogJ0ZFVENIX1VTRVJTX1BFTkRJTkcnfSlcbi8vXG4vLyAgIGZldGNoKCdodHRwOi8vanNvbnBsYWNlaG9sZGVyLnR5cGljb2RlLmNvbS91c2VycycpXG4vLyAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4vLyAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4vLyAgICAgICBkaXNwYXRjaCh7IHR5cGU6ICdGRVRDSF9VU0VSU19GVUxGSUxMRUQnLCBwYXlsb2FkOiByZXNwb25zZSB9KVxuLy8gICAgIH0pXG4vLyAgICAgLmNhdGNoKChlcnJvcikgPT4ge1xuLy8gICAgICAgZGlzcGF0Y2goe3R5cGU6ICdGRVRDSF9VU0VSU19SRUpFQ1RFRCcsIHBheWxvYWQ6IGVycm9yfSlcbi8vICAgICB9KVxuLy9cbi8vIH0pXG5cbi8vIFdJVEggUkVEVVgtUFJPTUlTRS1NSURETEVXQVJFXG5zdG9yZS5kaXNwYXRjaCh7XG4gIHR5cGU6ICdGRVRDSF9VU0VSUycsXG4gIHBheWxvYWQ6IGZldGNoKCdodHRwOi8vanNvbnBsYWNlaG9sZGVyLnR5cGljb2RlLmNvbS91c2VycycpXG4gICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG59KVxuIl0sIm5hbWVzIjpbInRoaXMiLCJwb255ZmlsbCIsIiQkb2JzZXJ2YWJsZSIsInJlcXVpcmUkJDAiLCJpbml0aWFsU3RhdGUiLCJ1c2VyUmVkdWNlciIsInN0YXRlIiwiYWN0aW9uIiwidHlwZSIsIk9iamVjdCIsImFzc2lnbiIsImZldGNoaW5nIiwicGF5bG9hZCIsInBvc3RzUmVkdWNlciIsInJvb3RSZWR1Y2VyIiwiY29tYmluZVJlZHVjZXJzIiwibWlkZGxld2FyZSIsImFwcGx5TWlkZGxld2FyZSIsInByb21pc2UiLCJ0aHVuayIsImxvZ2dlciIsInN0b3JlIiwiY3JlYXRlU3RvcmUiLCJkaXNwYXRjaCIsImZldGNoIiwidGhlbiIsInJlc3BvbnNlIiwianNvbiJdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7Ozs7O0FBUUEsU0FBUyxPQUFPLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtFQUNoQyxPQUFPLFNBQVMsR0FBRyxFQUFFO0lBQ25CLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzdCLENBQUM7Q0FDSCxBQUVELEFBQXVCOztBQ1p2QjtBQUNBLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEFBRTFELEFBQTRCOztBQ0w1Qjs7Ozs7OztBQU9BLFNBQVMsWUFBWSxDQUFDLEtBQUssRUFBRTs7O0VBRzNCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztFQUNuQixJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksT0FBTyxLQUFLLENBQUMsUUFBUSxJQUFJLFVBQVUsRUFBRTtJQUN4RCxJQUFJO01BQ0YsTUFBTSxH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QUFPLE1BQU0sQ0FBQyxFQUFFLENBQUM7O0FBRWpRLElBQUksY0FBYyxHQUFHLFlBQVksRUFBRSxTQUFTLGFBQWEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUUsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsS0FBSyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsSUFBSSxFQUFFLEtBQUssSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsTUFBTSxFQUFFLEVBQUUsQ0FBQyxPQUFPLEdBQUcsRUFBRSxFQUFFLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTyxVQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUUsRUFBRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxPQUFPLEdBQUcsQ0FBQyxFQUFFLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLE9BQU8sYUFBYSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLElBQUksU0FBUyxDQUFDLHNEQUFzRCxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7O0FBRXhwQixlQUFlLEdBQUcsaUJBQWlCLENBQUM7O0FBRXBDLElBQUksVUFBVSxHQUFHQyxXQUFzQixDQUFDOztBQUV4QyxJQUFJLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsQ0FBQzs7QUFFckQsU0FBUyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFOztBQUUvRixJQUFJLFlBQVksR0FBRyxDQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7Ozs7Ozs7QUFPeEQsU0FBUyxpQkFBaUIsR0FBRztFQUMzQixJQUFJLE1BQU0sR0FBRyxTQUFTLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7O0VBRXJGLElBQUksbUJBQW1CLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixJQUFJLFlBQVksQ0FBQzs7RUFFckUsT0FBTyxVQUFVLEdBQUcsRUFBRTtJQUNwQixJQUFJLFFBQVEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDOzs7SUFHNUIsT0FBTyxVQUFVLElBQUksRUFBRTtNQUNyQixPQUFPLFVBQVUsTUFBTSxFQUFFO1FBQ3ZCLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtVQUNsQixJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDbEcsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7V0FDckI7U0FDRixNQUFNO1VBQ0wsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDckI7OztRQUdELElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBSSxPQUFPLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUM3QixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDOzs7O1FBSXZCLElBQUksb0JBQW9CLEdBQUcsY0FBYyxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDOztRQUVsRSxJQUFJLE9BQU8sR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN0QyxJQUFJLFNBQVMsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN4QyxJQUFJLFFBQVEsR0FBRyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7Ozs7OztRQVV2QyxJQUFJLFNBQVMsR0FBRyxTQUFTLFNBQVMsQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFO1VBQ3pELE9BQU8sUUFBUSxDQUFDO1lBQ2QsSUFBSSxFQUFFLElBQUksR0FBRyxHQUFHLElBQUksVUFBVSxHQUFHLFFBQVEsR0FBRyxTQUFTLENBQUM7V0FDdkQsRUFBRSxVQUFVLEdBQUc7WUFDZCxPQUFPLEVBQUUsVUFBVTtXQUNwQixHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUMsSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxVQUFVLEdBQUc7WUFDakQsS0FBSyxFQUFFLElBQUk7V0FDWixHQUFHLEVBQUUsQ0FBQyxDQUFDO1NBQ1QsQ0FBQzs7Ozs7Ozs7UUFRRixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQztRQUNyQixJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQzs7UUFFbEIsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFFO1VBQ3JGLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1VBQzFCLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1NBQ3JCLE1BQU07VUFDTCxPQUFPLEdBQUcsT0FBTyxDQUFDO1VBQ2xCLElBQUksR0FBRyxJQUFJLENBQUM7U0FDYjs7Ozs7OztRQU9ELElBQUksQ0FBQyxRQUFRLENBQUM7VUFDWixJQUFJLEVBQUUsSUFBSSxHQUFHLEdBQUcsR0FBRyxPQUFPO1NBQzNCLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksR0FBRyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDOzs7Ozs7Ozs7OztRQVduRSxJQUFJLFlBQVksR0FBRyxTQUFTLFlBQVksQ0FBQyxNQUFNLEVBQUU7VUFDL0MsSUFBSSxjQUFjLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztVQUM3QyxRQUFRLENBQUMsY0FBYyxDQUFDLENBQUM7VUFDekIsTUFBTSxNQUFNLENBQUM7U0FDZCxDQUFDOzs7Ozs7Ozs7O1FBVUYsSUFBSSxhQUFhLEdBQUcsU0FBUyxhQUFhLEdBQUc7VUFDM0MsSUFBSSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsR0FBRyxJQUFJLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDOztVQUV0RixJQUFJLGNBQWMsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO1VBQzdDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQzs7VUFFekIsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxDQUFDO1NBQ2pELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUErQkYsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztPQUNsRCxDQUFDO0tBQ0gsQ0FBQztHQUNILENBQUM7Ozs7OztBQ2pLSjtBQUNBLElBQU1DLGVBQWU7WUFDVCxLQURTO1dBRVYsS0FGVTtTQUdaLElBSFk7YUFJUjtDQUpiO0FBTUEsSUFBTUMsY0FBYyxTQUFkQSxXQUFjLEdBQXdDO01BQTlCQyxLQUE4Qix5REFBdEJGLFlBQXNCO01BQVJHLE1BQVE7O1VBQ2xEQSxPQUFPQyxJQUFmO1NBQ08scUJBQUw7YUFDU0MsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JKLEtBQWxCLEVBQXlCLEVBQUNLLFVBQVUsSUFBWCxFQUF6QixDQUFQO1NBQ0csc0JBQUw7YUFDU0YsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JKLEtBQWxCLEVBQXlCO2tCQUNwQixLQURvQjtlQUV2QkMsT0FBT0s7T0FGVCxDQUFQO1NBSUcsdUJBQUw7YUFDU0gsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JKLEtBQWxCLEVBQXlCO2tCQUNwQixLQURvQjtpQkFFckIsSUFGcUI7bUJBR25CQyxPQUFPSztPQUhiLENBQVA7O2FBTU9OLEtBQVA7O0NBaEJOOztBQW9CQSxJQUFNTyxlQUFlLFNBQWZBLFlBQWUsR0FBOEI7TUFBcEJQLEtBQW9CLHlEQUFaLEVBQVk7TUFBUkMsTUFBUTs7U0FDMUNELEtBQVA7Q0FERjs7QUFJQSxJQUFNUSxjQUFjQyxnQkFBZ0I7U0FDM0JWLFdBRDJCO1NBRTNCUTtDQUZXLENBQXBCOzs7OztBQVFBLElBQU1HLGFBQWFDLGdCQUFnQkMsU0FBaEIsRUFBMkJDLEtBQTNCLEVBQWtDQyxPQUFsQyxDQUFuQjs7Ozs7QUFLQSxJQUFNQyxRQUFRQyxZQUFZUixXQUFaLEVBQXlCRSxVQUF6QixDQUFkOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBSyxNQUFNRSxRQUFOLENBQWU7UUFDUCxhQURPO1dBRUpDLE1BQU0sMkNBQU4sRUFDTkMsSUFETSxDQUNELFVBQUNDLFFBQUQ7V0FBY0EsU0FBU0MsSUFBVCxFQUFkO0dBREM7Q0FGWDs7In0=
