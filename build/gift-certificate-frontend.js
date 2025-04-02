/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@stripe/react-stripe-js/dist/react-stripe.umd.js":
/*!***********************************************************************!*\
  !*** ./node_modules/@stripe/react-stripe-js/dist/react-stripe.umd.js ***!
  \***********************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

(function (global, factory) {
   true ? factory(exports, __webpack_require__(/*! react */ "react")) :
  0;
})(this, (function (exports, React) { 'use strict';

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);

      if (enumerableOnly) {
        symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
      }

      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
      key = sourceKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      target[key] = source[key];
    }

    return target;
  }

  function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};

    var target = _objectWithoutPropertiesLoose(source, excluded);

    var key, i;

    if (Object.getOwnPropertySymbols) {
      var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

      for (i = 0; i < sourceSymbolKeys.length; i++) {
        key = sourceSymbolKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
        target[key] = source[key];
      }
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]);

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function getDefaultExportFromCjs (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  var propTypes = {exports: {}};

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var ReactPropTypesSecret_1;
  var hasRequiredReactPropTypesSecret;

  function requireReactPropTypesSecret() {
    if (hasRequiredReactPropTypesSecret) return ReactPropTypesSecret_1;
    hasRequiredReactPropTypesSecret = 1;

    var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
    ReactPropTypesSecret_1 = ReactPropTypesSecret;
    return ReactPropTypesSecret_1;
  }

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var factoryWithThrowingShims;
  var hasRequiredFactoryWithThrowingShims;

  function requireFactoryWithThrowingShims() {
    if (hasRequiredFactoryWithThrowingShims) return factoryWithThrowingShims;
    hasRequiredFactoryWithThrowingShims = 1;

    var ReactPropTypesSecret = requireReactPropTypesSecret();

    function emptyFunction() {}

    function emptyFunctionWithReset() {}

    emptyFunctionWithReset.resetWarningCache = emptyFunction;

    factoryWithThrowingShims = function () {
      function shim(props, propName, componentName, location, propFullName, secret) {
        if (secret === ReactPropTypesSecret) {
          // It is still safe when called from React.
          return;
        }

        var err = new Error('Calling PropTypes validators directly is not supported by the `prop-types` package. ' + 'Use PropTypes.checkPropTypes() to call them. ' + 'Read more at http://fb.me/use-check-prop-types');
        err.name = 'Invariant Violation';
        throw err;
      }
      shim.isRequired = shim;

      function getShim() {
        return shim;
      }
      // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.

      var ReactPropTypes = {
        array: shim,
        bool: shim,
        func: shim,
        number: shim,
        object: shim,
        string: shim,
        symbol: shim,
        any: shim,
        arrayOf: getShim,
        element: shim,
        elementType: shim,
        instanceOf: getShim,
        node: shim,
        objectOf: getShim,
        oneOf: getShim,
        oneOfType: getShim,
        shape: getShim,
        exact: getShim,
        checkPropTypes: emptyFunctionWithReset,
        resetWarningCache: emptyFunction
      };
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };

    return factoryWithThrowingShims;
  }

  /**
   * Copyright (c) 2013-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  {
    // By explicitly using `prop-types` you are opting into new production behavior.
    // http://fb.me/prop-types-in-prod
    propTypes.exports = requireFactoryWithThrowingShims()();
  }

  var propTypesExports = propTypes.exports;
  var PropTypes = /*@__PURE__*/getDefaultExportFromCjs(propTypesExports);

  var useAttachEvent = function useAttachEvent(element, event, cb) {
    var cbDefined = !!cb;
    var cbRef = React.useRef(cb); // In many integrations the callback prop changes on each render.
    // Using a ref saves us from calling element.on/.off every render.

    React.useEffect(function () {
      cbRef.current = cb;
    }, [cb]);
    React.useEffect(function () {
      if (!cbDefined || !element) {
        return function () {};
      }

      var decoratedCb = function decoratedCb() {
        if (cbRef.current) {
          cbRef.current.apply(cbRef, arguments);
        }
      };

      element.on(event, decoratedCb);
      return function () {
        element.off(event, decoratedCb);
      };
    }, [cbDefined, event, element, cbRef]);
  };

  var usePrevious = function usePrevious(value) {
    var ref = React.useRef(value);
    React.useEffect(function () {
      ref.current = value;
    }, [value]);
    return ref.current;
  };

  var isUnknownObject = function isUnknownObject(raw) {
    return raw !== null && _typeof(raw) === 'object';
  };
  var isPromise = function isPromise(raw) {
    return isUnknownObject(raw) && typeof raw.then === 'function';
  }; // We are using types to enforce the `stripe` prop in this lib,
  // but in an untyped integration `stripe` could be anything, so we need
  // to do some sanity validation to prevent type errors.

  var isStripe = function isStripe(raw) {
    return isUnknownObject(raw) && typeof raw.elements === 'function' && typeof raw.createToken === 'function' && typeof raw.createPaymentMethod === 'function' && typeof raw.confirmCardPayment === 'function';
  };

  var PLAIN_OBJECT_STR = '[object Object]';
  var isEqual = function isEqual(left, right) {
    if (!isUnknownObject(left) || !isUnknownObject(right)) {
      return left === right;
    }

    var leftArray = Array.isArray(left);
    var rightArray = Array.isArray(right);
    if (leftArray !== rightArray) return false;
    var leftPlainObject = Object.prototype.toString.call(left) === PLAIN_OBJECT_STR;
    var rightPlainObject = Object.prototype.toString.call(right) === PLAIN_OBJECT_STR;
    if (leftPlainObject !== rightPlainObject) return false; // not sure what sort of special object this is (regexp is one option), so
    // fallback to reference check.

    if (!leftPlainObject && !leftArray) return left === right;
    var leftKeys = Object.keys(left);
    var rightKeys = Object.keys(right);
    if (leftKeys.length !== rightKeys.length) return false;
    var keySet = {};

    for (var i = 0; i < leftKeys.length; i += 1) {
      keySet[leftKeys[i]] = true;
    }

    for (var _i = 0; _i < rightKeys.length; _i += 1) {
      keySet[rightKeys[_i]] = true;
    }

    var allKeys = Object.keys(keySet);

    if (allKeys.length !== leftKeys.length) {
      return false;
    }

    var l = left;
    var r = right;

    var pred = function pred(key) {
      return isEqual(l[key], r[key]);
    };

    return allKeys.every(pred);
  };

  var extractAllowedOptionsUpdates = function extractAllowedOptionsUpdates(options, prevOptions, immutableKeys) {
    if (!isUnknownObject(options)) {
      return null;
    }

    return Object.keys(options).reduce(function (newOptions, key) {
      var isUpdated = !isUnknownObject(prevOptions) || !isEqual(options[key], prevOptions[key]);

      if (immutableKeys.includes(key)) {
        if (isUpdated) {
          console.warn("Unsupported prop change: options.".concat(key, " is not a mutable property."));
        }

        return newOptions;
      }

      if (!isUpdated) {
        return newOptions;
      }

      return _objectSpread2(_objectSpread2({}, newOptions || {}), {}, _defineProperty({}, key, options[key]));
    }, null);
  };

  var INVALID_STRIPE_ERROR$2 = 'Invalid prop `stripe` supplied to `Elements`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.'; // We are using types to enforce the `stripe` prop in this lib, but in a real
  // integration `stripe` could be anything, so we need to do some sanity
  // validation to prevent type errors.

  var validateStripe = function validateStripe(maybeStripe) {
    var errorMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INVALID_STRIPE_ERROR$2;

    if (maybeStripe === null || isStripe(maybeStripe)) {
      return maybeStripe;
    }

    throw new Error(errorMsg);
  };

  var parseStripeProp = function parseStripeProp(raw) {
    var errorMsg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INVALID_STRIPE_ERROR$2;

    if (isPromise(raw)) {
      return {
        tag: 'async',
        stripePromise: Promise.resolve(raw).then(function (result) {
          return validateStripe(result, errorMsg);
        })
      };
    }

    var stripe = validateStripe(raw, errorMsg);

    if (stripe === null) {
      return {
        tag: 'empty'
      };
    }

    return {
      tag: 'sync',
      stripe: stripe
    };
  };

  var registerWithStripeJs = function registerWithStripeJs(stripe) {
    if (!stripe || !stripe._registerWrapper || !stripe.registerAppInfo) {
      return;
    }

    stripe._registerWrapper({
      name: 'react-stripe-js',
      version: "3.1.0"
    });

    stripe.registerAppInfo({
      name: 'react-stripe-js',
      version: "3.1.0",
      url: 'https://stripe.com/docs/stripe-js/react'
    });
  };

  var ElementsContext = /*#__PURE__*/React.createContext(null);
  ElementsContext.displayName = 'ElementsContext';
  var parseElementsContext = function parseElementsContext(ctx, useCase) {
    if (!ctx) {
      throw new Error("Could not find Elements context; You need to wrap the part of your app that ".concat(useCase, " in an <Elements> provider."));
    }

    return ctx;
  };
  /**
   * The `Elements` provider allows you to use [Element components](https://stripe.com/docs/stripe-js/react#element-components) and access the [Stripe object](https://stripe.com/docs/js/initializing) in any nested component.
   * Render an `Elements` provider at the root of your React app so that it is available everywhere you need it.
   *
   * To use the `Elements` provider, call `loadStripe` from `@stripe/stripe-js` with your publishable key.
   * The `loadStripe` function will asynchronously load the Stripe.js script and initialize a `Stripe` object.
   * Pass the returned `Promise` to `Elements`.
   *
   * @docs https://stripe.com/docs/stripe-js/react#elements-provider
   */

  var Elements = function Elements(_ref) {
    var rawStripeProp = _ref.stripe,
        options = _ref.options,
        children = _ref.children;
    var parsed = React.useMemo(function () {
      return parseStripeProp(rawStripeProp);
    }, [rawStripeProp]); // For a sync stripe instance, initialize into context

    var _React$useState = React.useState(function () {
      return {
        stripe: parsed.tag === 'sync' ? parsed.stripe : null,
        elements: parsed.tag === 'sync' ? parsed.stripe.elements(options) : null
      };
    }),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        ctx = _React$useState2[0],
        setContext = _React$useState2[1];

    React.useEffect(function () {
      var isMounted = true;

      var safeSetContext = function safeSetContext(stripe) {
        setContext(function (ctx) {
          // no-op if we already have a stripe instance (https://github.com/stripe/react-stripe-js/issues/296)
          if (ctx.stripe) return ctx;
          return {
            stripe: stripe,
            elements: stripe.elements(options)
          };
        });
      }; // For an async stripePromise, store it in context once resolved


      if (parsed.tag === 'async' && !ctx.stripe) {
        parsed.stripePromise.then(function (stripe) {
          if (stripe && isMounted) {
            // Only update Elements context if the component is still mounted
            // and stripe is not null. We allow stripe to be null to make
            // handling SSR easier.
            safeSetContext(stripe);
          }
        });
      } else if (parsed.tag === 'sync' && !ctx.stripe) {
        // Or, handle a sync stripe instance going from null -> populated
        safeSetContext(parsed.stripe);
      }

      return function () {
        isMounted = false;
      };
    }, [parsed, ctx, options]); // Warn on changes to stripe prop

    var prevStripe = usePrevious(rawStripeProp);
    React.useEffect(function () {
      if (prevStripe !== null && prevStripe !== rawStripeProp) {
        console.warn('Unsupported prop change on Elements: You cannot change the `stripe` prop after setting it.');
      }
    }, [prevStripe, rawStripeProp]); // Apply updates to elements when options prop has relevant changes

    var prevOptions = usePrevious(options);
    React.useEffect(function () {
      if (!ctx.elements) {
        return;
      }

      var updates = extractAllowedOptionsUpdates(options, prevOptions, ['clientSecret', 'fonts']);

      if (updates) {
        ctx.elements.update(updates);
      }
    }, [options, prevOptions, ctx.elements]); // Attach react-stripe-js version to stripe.js instance

    React.useEffect(function () {
      registerWithStripeJs(ctx.stripe);
    }, [ctx.stripe]);
    return /*#__PURE__*/React.createElement(ElementsContext.Provider, {
      value: ctx
    }, children);
  };
  Elements.propTypes = {
    stripe: PropTypes.any,
    options: PropTypes.object
  };
  var useElementsContextWithUseCase = function useElementsContextWithUseCase(useCaseMessage) {
    var ctx = React.useContext(ElementsContext);
    return parseElementsContext(ctx, useCaseMessage);
  };
  /**
   * @docs https://stripe.com/docs/stripe-js/react#useelements-hook
   */

  var useElements = function useElements() {
    var _useElementsContextWi = useElementsContextWithUseCase('calls useElements()'),
        elements = _useElementsContextWi.elements;

    return elements;
  };
  /**
   * @docs https://stripe.com/docs/stripe-js/react#elements-consumer
   */

  var ElementsConsumer = function ElementsConsumer(_ref2) {
    var children = _ref2.children;
    var ctx = useElementsContextWithUseCase('mounts <ElementsConsumer>'); // Assert to satisfy the busted React.FC return type (it should be ReactNode)

    return children(ctx);
  };
  ElementsConsumer.propTypes = {
    children: PropTypes.func.isRequired
  };

  var _excluded = ["on", "session"];
  var CheckoutSdkContext = /*#__PURE__*/React.createContext(null);
  CheckoutSdkContext.displayName = 'CheckoutSdkContext';
  var parseCheckoutSdkContext = function parseCheckoutSdkContext(ctx, useCase) {
    if (!ctx) {
      throw new Error("Could not find CheckoutProvider context; You need to wrap the part of your app that ".concat(useCase, " in an <CheckoutProvider> provider."));
    }

    return ctx;
  };
  var CheckoutContext = /*#__PURE__*/React.createContext(null);
  CheckoutContext.displayName = 'CheckoutContext';
  var extractCheckoutContextValue = function extractCheckoutContextValue(checkoutSdk, sessionState) {
    if (!checkoutSdk) {
      return null;
    }

    checkoutSdk.on;
        checkoutSdk.session;
        var actions = _objectWithoutProperties(checkoutSdk, _excluded);

    if (!sessionState) {
      return _objectSpread2(_objectSpread2({}, actions), checkoutSdk.session());
    }

    return _objectSpread2(_objectSpread2({}, actions), sessionState);
  };
  var INVALID_STRIPE_ERROR$1 = 'Invalid prop `stripe` supplied to `CheckoutProvider`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.';
  var CheckoutProvider = function CheckoutProvider(_ref) {
    var rawStripeProp = _ref.stripe,
        options = _ref.options,
        children = _ref.children;
    var parsed = React.useMemo(function () {
      return parseStripeProp(rawStripeProp, INVALID_STRIPE_ERROR$1);
    }, [rawStripeProp]); // State used to trigger a re-render when sdk.session is updated

    var _React$useState = React.useState(null),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        session = _React$useState2[0],
        setSession = _React$useState2[1];

    var _React$useState3 = React.useState(function () {
      return {
        stripe: parsed.tag === 'sync' ? parsed.stripe : null,
        checkoutSdk: null
      };
    }),
        _React$useState4 = _slicedToArray(_React$useState3, 2),
        ctx = _React$useState4[0],
        setContext = _React$useState4[1];

    var safeSetContext = function safeSetContext(stripe, checkoutSdk) {
      setContext(function (ctx) {
        if (ctx.stripe && ctx.checkoutSdk) {
          return ctx;
        }

        return {
          stripe: stripe,
          checkoutSdk: checkoutSdk
        };
      });
    }; // Ref used to avoid calling initCheckout multiple times when options changes


    var initCheckoutCalledRef = React.useRef(false);
    React.useEffect(function () {
      var isMounted = true;

      if (parsed.tag === 'async' && !ctx.stripe) {
        parsed.stripePromise.then(function (stripe) {
          if (stripe && isMounted && !initCheckoutCalledRef.current) {
            // Only update context if the component is still mounted
            // and stripe is not null. We allow stripe to be null to make
            // handling SSR easier.
            initCheckoutCalledRef.current = true;
            stripe.initCheckout(options).then(function (checkoutSdk) {
              if (checkoutSdk) {
                safeSetContext(stripe, checkoutSdk);
                checkoutSdk.on('change', setSession);
              }
            });
          }
        });
      } else if (parsed.tag === 'sync' && parsed.stripe && !initCheckoutCalledRef.current) {
        initCheckoutCalledRef.current = true;
        parsed.stripe.initCheckout(options).then(function (checkoutSdk) {
          if (checkoutSdk) {
            safeSetContext(parsed.stripe, checkoutSdk);
            checkoutSdk.on('change', setSession);
          }
        });
      }

      return function () {
        isMounted = false;
      };
    }, [parsed, ctx, options, setSession]); // Warn on changes to stripe prop

    var prevStripe = usePrevious(rawStripeProp);
    React.useEffect(function () {
      if (prevStripe !== null && prevStripe !== rawStripeProp) {
        console.warn('Unsupported prop change on CheckoutProvider: You cannot change the `stripe` prop after setting it.');
      }
    }, [prevStripe, rawStripeProp]); // Apply updates to elements when options prop has relevant changes

    var prevOptions = usePrevious(options);
    React.useEffect(function () {
      var _prevOptions$elements, _options$elementsOpti;

      if (!ctx.checkoutSdk) {
        return;
      }

      if (options.clientSecret && !isUnknownObject(prevOptions) && !isEqual(options.clientSecret, prevOptions.clientSecret)) {
        console.warn('Unsupported prop change: options.clientSecret is not a mutable property.');
      }

      var previousAppearance = prevOptions === null || prevOptions === void 0 ? void 0 : (_prevOptions$elements = prevOptions.elementsOptions) === null || _prevOptions$elements === void 0 ? void 0 : _prevOptions$elements.appearance;
      var currentAppearance = options === null || options === void 0 ? void 0 : (_options$elementsOpti = options.elementsOptions) === null || _options$elementsOpti === void 0 ? void 0 : _options$elementsOpti.appearance;

      if (currentAppearance && !isEqual(currentAppearance, previousAppearance)) {
        ctx.checkoutSdk.changeAppearance(currentAppearance);
      }
    }, [options, prevOptions, ctx.checkoutSdk]); // Attach react-stripe-js version to stripe.js instance

    React.useEffect(function () {
      registerWithStripeJs(ctx.stripe);
    }, [ctx.stripe]);
    var checkoutContextValue = React.useMemo(function () {
      return extractCheckoutContextValue(ctx.checkoutSdk, session);
    }, [ctx.checkoutSdk, session]);

    if (!ctx.checkoutSdk) {
      return null;
    }

    return /*#__PURE__*/React.createElement(CheckoutSdkContext.Provider, {
      value: ctx
    }, /*#__PURE__*/React.createElement(CheckoutContext.Provider, {
      value: checkoutContextValue
    }, children));
  };
  CheckoutProvider.propTypes = {
    stripe: PropTypes.any,
    options: PropTypes.shape({
      clientSecret: PropTypes.string.isRequired,
      elementsOptions: PropTypes.object
    }).isRequired
  };
  var useCheckoutSdkContextWithUseCase = function useCheckoutSdkContextWithUseCase(useCaseString) {
    var ctx = React.useContext(CheckoutSdkContext);
    return parseCheckoutSdkContext(ctx, useCaseString);
  };
  var useElementsOrCheckoutSdkContextWithUseCase = function useElementsOrCheckoutSdkContextWithUseCase(useCaseString) {
    var checkoutSdkContext = React.useContext(CheckoutSdkContext);
    var elementsContext = React.useContext(ElementsContext);

    if (checkoutSdkContext && elementsContext) {
      throw new Error("You cannot wrap the part of your app that ".concat(useCaseString, " in both <CheckoutProvider> and <Elements> providers."));
    }

    if (checkoutSdkContext) {
      return parseCheckoutSdkContext(checkoutSdkContext, useCaseString);
    }

    return parseElementsContext(elementsContext, useCaseString);
  };
  var useCheckout = function useCheckout() {
    // ensure it's in CheckoutProvider
    useCheckoutSdkContextWithUseCase('calls useCheckout()');
    var ctx = React.useContext(CheckoutContext);

    if (!ctx) {
      throw new Error('Could not find Checkout Context; You need to wrap the part of your app that calls useCheckout() in an <CheckoutProvider> provider.');
    }

    return ctx;
  };

  var capitalized = function capitalized(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  var createElementComponent = function createElementComponent(type, isServer) {
    var displayName = "".concat(capitalized(type), "Element");

    var ClientElement = function ClientElement(_ref) {
      var id = _ref.id,
          className = _ref.className,
          _ref$options = _ref.options,
          options = _ref$options === void 0 ? {} : _ref$options,
          onBlur = _ref.onBlur,
          onFocus = _ref.onFocus,
          onReady = _ref.onReady,
          onChange = _ref.onChange,
          onEscape = _ref.onEscape,
          onClick = _ref.onClick,
          onLoadError = _ref.onLoadError,
          onLoaderStart = _ref.onLoaderStart,
          onNetworksChange = _ref.onNetworksChange,
          onConfirm = _ref.onConfirm,
          onCancel = _ref.onCancel,
          onShippingAddressChange = _ref.onShippingAddressChange,
          onShippingRateChange = _ref.onShippingRateChange;
      var ctx = useElementsOrCheckoutSdkContextWithUseCase("mounts <".concat(displayName, ">"));
      var elements = 'elements' in ctx ? ctx.elements : null;
      var checkoutSdk = 'checkoutSdk' in ctx ? ctx.checkoutSdk : null;

      var _React$useState = React.useState(null),
          _React$useState2 = _slicedToArray(_React$useState, 2),
          element = _React$useState2[0],
          setElement = _React$useState2[1];

      var elementRef = React.useRef(null);
      var domNode = React.useRef(null); // For every event where the merchant provides a callback, call element.on
      // with that callback. If the merchant ever changes the callback, removes
      // the old callback with element.off and then call element.on with the new one.

      useAttachEvent(element, 'blur', onBlur);
      useAttachEvent(element, 'focus', onFocus);
      useAttachEvent(element, 'escape', onEscape);
      useAttachEvent(element, 'click', onClick);
      useAttachEvent(element, 'loaderror', onLoadError);
      useAttachEvent(element, 'loaderstart', onLoaderStart);
      useAttachEvent(element, 'networkschange', onNetworksChange);
      useAttachEvent(element, 'confirm', onConfirm);
      useAttachEvent(element, 'cancel', onCancel);
      useAttachEvent(element, 'shippingaddresschange', onShippingAddressChange);
      useAttachEvent(element, 'shippingratechange', onShippingRateChange);
      useAttachEvent(element, 'change', onChange);
      var readyCallback;

      if (onReady) {
        if (type === 'expressCheckout') {
          // Passes through the event, which includes visible PM types
          readyCallback = onReady;
        } else {
          // For other Elements, pass through the Element itself.
          readyCallback = function readyCallback() {
            onReady(element);
          };
        }
      }

      useAttachEvent(element, 'ready', readyCallback);
      React.useLayoutEffect(function () {
        if (elementRef.current === null && domNode.current !== null && (elements || checkoutSdk)) {
          var newElement = null;

          if (checkoutSdk) {
            newElement = checkoutSdk.createElement(type, options);
          } else if (elements) {
            newElement = elements.create(type, options);
          } // Store element in a ref to ensure it's _immediately_ available in cleanup hooks in StrictMode


          elementRef.current = newElement; // Store element in state to facilitate event listener attachment

          setElement(newElement);

          if (newElement) {
            newElement.mount(domNode.current);
          }
        }
      }, [elements, checkoutSdk, options]);
      var prevOptions = usePrevious(options);
      React.useEffect(function () {
        if (!elementRef.current) {
          return;
        }

        var updates = extractAllowedOptionsUpdates(options, prevOptions, ['paymentRequest']);

        if (updates && 'update' in elementRef.current) {
          elementRef.current.update(updates);
        }
      }, [options, prevOptions]);
      React.useLayoutEffect(function () {
        return function () {
          if (elementRef.current && typeof elementRef.current.destroy === 'function') {
            try {
              elementRef.current.destroy();
              elementRef.current = null;
            } catch (error) {// Do nothing
            }
          }
        };
      }, []);
      return /*#__PURE__*/React.createElement("div", {
        id: id,
        className: className,
        ref: domNode
      });
    }; // Only render the Element wrapper in a server environment.


    var ServerElement = function ServerElement(props) {
      useElementsOrCheckoutSdkContextWithUseCase("mounts <".concat(displayName, ">"));
      var id = props.id,
          className = props.className;
      return /*#__PURE__*/React.createElement("div", {
        id: id,
        className: className
      });
    };

    var Element = isServer ? ServerElement : ClientElement;
    Element.propTypes = {
      id: PropTypes.string,
      className: PropTypes.string,
      onChange: PropTypes.func,
      onBlur: PropTypes.func,
      onFocus: PropTypes.func,
      onReady: PropTypes.func,
      onEscape: PropTypes.func,
      onClick: PropTypes.func,
      onLoadError: PropTypes.func,
      onLoaderStart: PropTypes.func,
      onNetworksChange: PropTypes.func,
      onConfirm: PropTypes.func,
      onCancel: PropTypes.func,
      onShippingAddressChange: PropTypes.func,
      onShippingRateChange: PropTypes.func,
      options: PropTypes.object
    };
    Element.displayName = displayName;
    Element.__elementType = type;
    return Element;
  };

  var isServer = typeof window === 'undefined';

  var EmbeddedCheckoutContext = /*#__PURE__*/React.createContext(null);
  EmbeddedCheckoutContext.displayName = 'EmbeddedCheckoutProviderContext';
  var useEmbeddedCheckoutContext = function useEmbeddedCheckoutContext() {
    var ctx = React.useContext(EmbeddedCheckoutContext);

    if (!ctx) {
      throw new Error('<EmbeddedCheckout> must be used within <EmbeddedCheckoutProvider>');
    }

    return ctx;
  };
  var INVALID_STRIPE_ERROR = 'Invalid prop `stripe` supplied to `EmbeddedCheckoutProvider`. We recommend using the `loadStripe` utility from `@stripe/stripe-js`. See https://stripe.com/docs/stripe-js/react#elements-props-stripe for details.';
  var EmbeddedCheckoutProvider = function EmbeddedCheckoutProvider(_ref) {
    var rawStripeProp = _ref.stripe,
        options = _ref.options,
        children = _ref.children;
    var parsed = React.useMemo(function () {
      return parseStripeProp(rawStripeProp, INVALID_STRIPE_ERROR);
    }, [rawStripeProp]);
    var embeddedCheckoutPromise = React.useRef(null);
    var loadedStripe = React.useRef(null);

    var _React$useState = React.useState({
      embeddedCheckout: null
    }),
        _React$useState2 = _slicedToArray(_React$useState, 2),
        ctx = _React$useState2[0],
        setContext = _React$useState2[1];

    React.useEffect(function () {
      // Don't support any ctx updates once embeddedCheckout or stripe is set.
      if (loadedStripe.current || embeddedCheckoutPromise.current) {
        return;
      }

      var setStripeAndInitEmbeddedCheckout = function setStripeAndInitEmbeddedCheckout(stripe) {
        if (loadedStripe.current || embeddedCheckoutPromise.current) return;
        loadedStripe.current = stripe;
        embeddedCheckoutPromise.current = loadedStripe.current.initEmbeddedCheckout(options).then(function (embeddedCheckout) {
          setContext({
            embeddedCheckout: embeddedCheckout
          });
        });
      }; // For an async stripePromise, store it once resolved


      if (parsed.tag === 'async' && !loadedStripe.current && (options.clientSecret || options.fetchClientSecret)) {
        parsed.stripePromise.then(function (stripe) {
          if (stripe) {
            setStripeAndInitEmbeddedCheckout(stripe);
          }
        });
      } else if (parsed.tag === 'sync' && !loadedStripe.current && (options.clientSecret || options.fetchClientSecret)) {
        // Or, handle a sync stripe instance going from null -> populated
        setStripeAndInitEmbeddedCheckout(parsed.stripe);
      }
    }, [parsed, options, ctx, loadedStripe]);
    React.useEffect(function () {
      // cleanup on unmount
      return function () {
        // If embedded checkout is fully initialized, destroy it.
        if (ctx.embeddedCheckout) {
          embeddedCheckoutPromise.current = null;
          ctx.embeddedCheckout.destroy();
        } else if (embeddedCheckoutPromise.current) {
          // If embedded checkout is still initializing, destroy it once
          // it's done. This could be caused by unmounting very quickly
          // after mounting.
          embeddedCheckoutPromise.current.then(function () {
            embeddedCheckoutPromise.current = null;

            if (ctx.embeddedCheckout) {
              ctx.embeddedCheckout.destroy();
            }
          });
        }
      };
    }, [ctx.embeddedCheckout]); // Attach react-stripe-js version to stripe.js instance

    React.useEffect(function () {
      registerWithStripeJs(loadedStripe);
    }, [loadedStripe]); // Warn on changes to stripe prop.
    // The stripe prop value can only go from null to non-null once and
    // can't be changed after that.

    var prevStripe = usePrevious(rawStripeProp);
    React.useEffect(function () {
      if (prevStripe !== null && prevStripe !== rawStripeProp) {
        console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the `stripe` prop after setting it.');
      }
    }, [prevStripe, rawStripeProp]); // Warn on changes to options.

    var prevOptions = usePrevious(options);
    React.useEffect(function () {
      if (prevOptions == null) {
        return;
      }

      if (options == null) {
        console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot unset options after setting them.');
        return;
      }

      if (options.clientSecret === undefined && options.fetchClientSecret === undefined) {
        console.warn('Invalid props passed to EmbeddedCheckoutProvider: You must provide one of either `options.fetchClientSecret` or `options.clientSecret`.');
      }

      if (prevOptions.clientSecret != null && options.clientSecret !== prevOptions.clientSecret) {
        console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the client secret after setting it. Unmount and create a new instance of EmbeddedCheckoutProvider instead.');
      }

      if (prevOptions.fetchClientSecret != null && options.fetchClientSecret !== prevOptions.fetchClientSecret) {
        console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change fetchClientSecret after setting it. Unmount and create a new instance of EmbeddedCheckoutProvider instead.');
      }

      if (prevOptions.onComplete != null && options.onComplete !== prevOptions.onComplete) {
        console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the onComplete option after setting it.');
      }

      if (prevOptions.onShippingDetailsChange != null && options.onShippingDetailsChange !== prevOptions.onShippingDetailsChange) {
        console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the onShippingDetailsChange option after setting it.');
      }

      if (prevOptions.onLineItemsChange != null && options.onLineItemsChange !== prevOptions.onLineItemsChange) {
        console.warn('Unsupported prop change on EmbeddedCheckoutProvider: You cannot change the onLineItemsChange option after setting it.');
      }
    }, [prevOptions, options]);
    return /*#__PURE__*/React.createElement(EmbeddedCheckoutContext.Provider, {
      value: ctx
    }, children);
  };

  var EmbeddedCheckoutClientElement = function EmbeddedCheckoutClientElement(_ref) {
    var id = _ref.id,
        className = _ref.className;

    var _useEmbeddedCheckoutC = useEmbeddedCheckoutContext(),
        embeddedCheckout = _useEmbeddedCheckoutC.embeddedCheckout;

    var isMounted = React.useRef(false);
    var domNode = React.useRef(null);
    React.useLayoutEffect(function () {
      if (!isMounted.current && embeddedCheckout && domNode.current !== null) {
        embeddedCheckout.mount(domNode.current);
        isMounted.current = true;
      } // Clean up on unmount


      return function () {
        if (isMounted.current && embeddedCheckout) {
          try {
            embeddedCheckout.unmount();
            isMounted.current = false;
          } catch (e) {// Do nothing.
            // Parent effects are destroyed before child effects, so
            // in cases where both the EmbeddedCheckoutProvider and
            // the EmbeddedCheckout component are removed at the same
            // time, the embeddedCheckout instance will be destroyed,
            // which causes an error when calling unmount.
          }
        }
      };
    }, [embeddedCheckout]);
    return /*#__PURE__*/React.createElement("div", {
      ref: domNode,
      id: id,
      className: className
    });
  }; // Only render the wrapper in a server environment.


  var EmbeddedCheckoutServerElement = function EmbeddedCheckoutServerElement(_ref2) {
    var id = _ref2.id,
        className = _ref2.className;
    // Validate that we are in the right context by calling useEmbeddedCheckoutContext.
    useEmbeddedCheckoutContext();
    return /*#__PURE__*/React.createElement("div", {
      id: id,
      className: className
    });
  };

  var EmbeddedCheckout = isServer ? EmbeddedCheckoutServerElement : EmbeddedCheckoutClientElement;

  /**
   * @docs https://stripe.com/docs/stripe-js/react#usestripe-hook
   */

  var useStripe = function useStripe() {
    var _useElementsOrCheckou = useElementsOrCheckoutSdkContextWithUseCase('calls useStripe()'),
        stripe = _useElementsOrCheckou.stripe;

    return stripe;
  };

  /**
   * Requires beta access:
   * Contact [Stripe support](https://support.stripe.com/) for more information.
   *
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var AuBankAccountElement = createElementComponent('auBankAccount', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var CardElement = createElementComponent('card', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var CardNumberElement = createElementComponent('cardNumber', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var CardExpiryElement = createElementComponent('cardExpiry', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var CardCvcElement = createElementComponent('cardCvc', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var FpxBankElement = createElementComponent('fpxBank', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var IbanElement = createElementComponent('iban', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var IdealBankElement = createElementComponent('idealBank', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var P24BankElement = createElementComponent('p24Bank', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var EpsBankElement = createElementComponent('epsBank', isServer);
  var PaymentElement = createElementComponent('payment', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var ExpressCheckoutElement = createElementComponent('expressCheckout', isServer);
  /**
   * Requires beta access:
   * Contact [Stripe support](https://support.stripe.com/) for more information.
   */

  var CurrencySelectorElement = createElementComponent('currencySelector', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var PaymentRequestButtonElement = createElementComponent('paymentRequestButton', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var LinkAuthenticationElement = createElementComponent('linkAuthentication', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var AddressElement = createElementComponent('address', isServer);
  /**
   * @deprecated
   * Use `AddressElement` instead.
   *
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var ShippingAddressElement = createElementComponent('shippingAddress', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var PaymentMethodMessagingElement = createElementComponent('paymentMethodMessaging', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var AffirmMessageElement = createElementComponent('affirmMessage', isServer);
  /**
   * @docs https://stripe.com/docs/stripe-js/react#element-components
   */

  var AfterpayClearpayMessageElement = createElementComponent('afterpayClearpayMessage', isServer);

  exports.AddressElement = AddressElement;
  exports.AffirmMessageElement = AffirmMessageElement;
  exports.AfterpayClearpayMessageElement = AfterpayClearpayMessageElement;
  exports.AuBankAccountElement = AuBankAccountElement;
  exports.CardCvcElement = CardCvcElement;
  exports.CardElement = CardElement;
  exports.CardExpiryElement = CardExpiryElement;
  exports.CardNumberElement = CardNumberElement;
  exports.CheckoutProvider = CheckoutProvider;
  exports.CurrencySelectorElement = CurrencySelectorElement;
  exports.Elements = Elements;
  exports.ElementsConsumer = ElementsConsumer;
  exports.EmbeddedCheckout = EmbeddedCheckout;
  exports.EmbeddedCheckoutProvider = EmbeddedCheckoutProvider;
  exports.EpsBankElement = EpsBankElement;
  exports.ExpressCheckoutElement = ExpressCheckoutElement;
  exports.FpxBankElement = FpxBankElement;
  exports.IbanElement = IbanElement;
  exports.IdealBankElement = IdealBankElement;
  exports.LinkAuthenticationElement = LinkAuthenticationElement;
  exports.P24BankElement = P24BankElement;
  exports.PaymentElement = PaymentElement;
  exports.PaymentMethodMessagingElement = PaymentMethodMessagingElement;
  exports.PaymentRequestButtonElement = PaymentRequestButtonElement;
  exports.ShippingAddressElement = ShippingAddressElement;
  exports.useCheckout = useCheckout;
  exports.useElements = useElements;
  exports.useStripe = useStripe;

}));


/***/ }),

/***/ "./node_modules/@stripe/stripe-js/dist/index.mjs":
/*!*******************************************************!*\
  !*** ./node_modules/@stripe/stripe-js/dist/index.mjs ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadStripe: () => (/* binding */ loadStripe)
/* harmony export */ });
var V3_URL = 'https://js.stripe.com/v3';
var V3_URL_REGEX = /^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/;
var EXISTING_SCRIPT_MESSAGE = 'loadStripe.setLoadParameters was called but an existing Stripe.js script already exists in the document; existing script parameters will be used';
var findScript = function findScript() {
  var scripts = document.querySelectorAll("script[src^=\"".concat(V3_URL, "\"]"));

  for (var i = 0; i < scripts.length; i++) {
    var script = scripts[i];

    if (!V3_URL_REGEX.test(script.src)) {
      continue;
    }

    return script;
  }

  return null;
};

var injectScript = function injectScript(params) {
  var queryString = params && !params.advancedFraudSignals ? '?advancedFraudSignals=false' : '';
  var script = document.createElement('script');
  script.src = "".concat(V3_URL).concat(queryString);
  var headOrBody = document.head || document.body;

  if (!headOrBody) {
    throw new Error('Expected document.body not to be null. Stripe.js requires a <body> element.');
  }

  headOrBody.appendChild(script);
  return script;
};

var registerWrapper = function registerWrapper(stripe, startTime) {
  if (!stripe || !stripe._registerWrapper) {
    return;
  }

  stripe._registerWrapper({
    name: 'stripe-js',
    version: "5.6.0",
    startTime: startTime
  });
};

var stripePromise$1 = null;
var onErrorListener = null;
var onLoadListener = null;

var onError = function onError(reject) {
  return function () {
    reject(new Error('Failed to load Stripe.js'));
  };
};

var onLoad = function onLoad(resolve, reject) {
  return function () {
    if (window.Stripe) {
      resolve(window.Stripe);
    } else {
      reject(new Error('Stripe.js not available'));
    }
  };
};

var loadScript = function loadScript(params) {
  // Ensure that we only attempt to load Stripe.js at most once
  if (stripePromise$1 !== null) {
    return stripePromise$1;
  }

  stripePromise$1 = new Promise(function (resolve, reject) {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // Resolve to null when imported server side. This makes the module
      // safe to import in an isomorphic code base.
      resolve(null);
      return;
    }

    if (window.Stripe && params) {
      console.warn(EXISTING_SCRIPT_MESSAGE);
    }

    if (window.Stripe) {
      resolve(window.Stripe);
      return;
    }

    try {
      var script = findScript();

      if (script && params) {
        console.warn(EXISTING_SCRIPT_MESSAGE);
      } else if (!script) {
        script = injectScript(params);
      } else if (script && onLoadListener !== null && onErrorListener !== null) {
        var _script$parentNode;

        // remove event listeners
        script.removeEventListener('load', onLoadListener);
        script.removeEventListener('error', onErrorListener); // if script exists, but we are reloading due to an error,
        // reload script to trigger 'load' event

        (_script$parentNode = script.parentNode) === null || _script$parentNode === void 0 ? void 0 : _script$parentNode.removeChild(script);
        script = injectScript(params);
      }

      onLoadListener = onLoad(resolve, reject);
      onErrorListener = onError(reject);
      script.addEventListener('load', onLoadListener);
      script.addEventListener('error', onErrorListener);
    } catch (error) {
      reject(error);
      return;
    }
  }); // Resets stripePromise on error

  return stripePromise$1["catch"](function (error) {
    stripePromise$1 = null;
    return Promise.reject(error);
  });
};
var initStripe = function initStripe(maybeStripe, args, startTime) {
  if (maybeStripe === null) {
    return null;
  }

  var stripe = maybeStripe.apply(undefined, args);
  registerWrapper(stripe, startTime);
  return stripe;
}; // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

var stripePromise;
var loadCalled = false;

var getStripePromise = function getStripePromise() {
  if (stripePromise) {
    return stripePromise;
  }

  stripePromise = loadScript(null)["catch"](function (error) {
    // clear cache on error
    stripePromise = null;
    return Promise.reject(error);
  });
  return stripePromise;
}; // Execute our own script injection after a tick to give users time to do their
// own script injection.


Promise.resolve().then(function () {
  return getStripePromise();
})["catch"](function (error) {
  if (!loadCalled) {
    console.warn(error);
  }
});
var loadStripe = function loadStripe() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  loadCalled = true;
  var startTime = Date.now(); // if previous attempts are unsuccessful, will re-load script

  return getStripePromise().then(function (maybeStripe) {
    return initStripe(maybeStripe, args, startTime);
  });
};




/***/ }),

/***/ "./node_modules/@stripe/stripe-js/lib/index.mjs":
/*!******************************************************!*\
  !*** ./node_modules/@stripe/stripe-js/lib/index.mjs ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loadStripe: () => (/* reexport safe */ _dist_index_mjs__WEBPACK_IMPORTED_MODULE_0__.loadStripe)
/* harmony export */ });
/* harmony import */ var _dist_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../dist/index.mjs */ "./node_modules/@stripe/stripe-js/dist/index.mjs");



/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "React" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = window["React"];

/***/ }),

/***/ "react-dom":
/*!***************************!*\
  !*** external "ReactDOM" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = window["ReactDOM"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
/*!******************************************!*\
  !*** ./src/gift-certificate-frontend.js ***!
  \******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _stripe_stripe_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @stripe/stripe-js */ "./node_modules/@stripe/stripe-js/lib/index.mjs");
/* harmony import */ var _stripe_react_stripe_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @stripe/react-stripe-js */ "./node_modules/@stripe/react-stripe-js/dist/react-stripe.umd.js");
/* harmony import */ var _stripe_react_stripe_js__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_stripe_react_stripe_js__WEBPACK_IMPORTED_MODULE_3__);





// Form validation function
function validateForm() {
  const fields = [{
    id: 'gc_amount',
    name: 'Amount'
  }, {
    id: 'gc_to',
    name: 'To'
  }, {
    id: 'gc_from',
    name: 'From'
  }, {
    id: 'gc_message',
    name: 'Message'
  }, {
    id: 'recipient_first_name',
    name: 'Recipient First Name'
  }, {
    id: 'recipient_last_name',
    name: 'Recipient Last Name'
  }, {
    id: 'customer_first_name',
    name: 'Your First Name'
  }, {
    id: 'customer_last_name',
    name: 'Your Last Name'
  }, {
    id: 'customer_phone',
    name: 'Your Phone'
  }, {
    id: 'customer_email',
    name: 'Your Email'
  }];
  let isValid = true;
  let errorMessages = [];
  fields.forEach(field => {
    const element = document.getElementById(field.id);
    if (!element.value.trim()) {
      isValid = false;
      errorMessages.push(`${field.name} is required.`);
      element.classList.add('is-invalid');
    } else {
      element.classList.remove('is-invalid');
    }
  });

  // Additional validation for email and phone
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(document.getElementById('customer_email').value.trim())) {
    isValid = false;
    errorMessages.push('Please enter a valid email address.');
    document.getElementById('customer_email').classList.add('is-invalid');
  }
  const phoneRegex = /^\+?[0-9]{10,14}$/;
  if (!phoneRegex.test(document.getElementById('customer_phone').value.trim())) {
    isValid = false;
    errorMessages.push('Please enter a valid phone number.');
    document.getElementById('customer_phone').classList.add('is-invalid');
  }
  return {
    isValid,
    errorMessages
  };
}

// Payment form component using Stripe Elements.
function GiftCertificatePaymentForm({
  stripePk,
  totalAmount,
  surcharge,
  onPaymentSuccess
}) {
  const stripe = (0,_stripe_react_stripe_js__WEBPACK_IMPORTED_MODULE_3__.useStripe)();
  const elements = (0,_stripe_react_stripe_js__WEBPACK_IMPORTED_MODULE_3__.useElements)();
  const [loading, setLoading] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [error, setError] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
  const [success, setSuccess] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)("");
  const handleSubmit = async event => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");
    setSuccess("");
    const cardElement = elements.getElement(_stripe_react_stripe_js__WEBPACK_IMPORTED_MODULE_3__.CardElement);
    try {
      const {
        paymentMethod,
        error
      } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Retrieve additional form fields from the DOM.
      const gcAmount = document.getElementById("gc_amount").value;
      const gcTo = document.getElementById("gc_to").value;
      const gcFrom = document.getElementById("gc_from").value;
      const gcMessage = document.getElementById("gc_message").value;
      const recipientFirstName = document.getElementById("recipient_first_name").value;
      const recipientLastName = document.getElementById("recipient_last_name").value;
      const customerFirstName = document.getElementById("customer_first_name").value;
      const customerLastName = document.getElementById("customer_last_name").value;
      const customerPhone = document.getElementById("customer_phone").value;
      const customerEmail = document.getElementById("customer_email").value;

      // Build the payload.
      const payload = {
        stripePaymentMethodId: paymentMethod.id,
        amount: totalAmount,
        // total payable (in dollars, including surcharge)
        currency: "AUD",
        giftCertificateApplied: true,
        gc_details: {
          amount: gcAmount,
          to: gcTo,
          from: gcFrom,
          message: gcMessage,
          recipient_first_name: recipientFirstName,
          recipient_last_name: recipientLastName
        },
        customer: {
          first_name: customerFirstName,
          last_name: customerLastName,
          phone: customerPhone,
          email: customerEmail
        },
        surcharge: surcharge
      };

      // Send the payload via your REST API endpoint.
      const response = await fetch("/wp-json/bookitfast/v1/process-gift-certificate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        onPaymentSuccess(result);
        setSuccess("Payment successful! Your gift certificate has been processed.");
        // You can add additional UI updates or redirects here
      } else if (response.status === 422) {
        // Handle validation errors
        setError("Validation failed. Please check your input and try again.");
        console.error("Validation errors:", result.errors);
      } else {
        setError(result.message || "Payment failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Payment processing error:", err);
    } finally {
      setLoading(false);
    }
  };
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "payment-container"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("h3", null, "Payment Details"), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", {
    className: "amount-summary"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Total Payable:"), " $", parseFloat(totalAmount).toFixed(2)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("strong", null, "Includes Processing Surcharge:"), " $", parseFloat(surcharge).toFixed(2))), error && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "alert alert-danger"
  }, error), success && /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("p", {
    className: "alert alert-success"
  }, success), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_stripe_react_stripe_js__WEBPACK_IMPORTED_MODULE_3__.CardElement, {
    options: {
      hidePostalCode: true,
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4"
          }
        },
        invalid: {
          color: "#9e2146"
        }
      }
    }
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", {
    type: "submit",
    disabled: !stripe || loading || success,
    className: "btn btn-primary stripe-payment-button"
  }, loading ? "Processing..." : success ? "Payment Complete" : "Pay Now")));
}

// Main front-end logic.
function GiftCertificateFrontend() {
  console.log("GiftCertificateFrontend");
  const container = document.querySelector(".bookitfast-certificate-form");
  if (!container) return;
  console.log('GiftCertificatePaymentForm');
  const stripePk = container.getAttribute("data-stripe-pk");
  const surchargeRate = parseFloat(container.getAttribute("data-surcharge-rate"));

  // Listen for the "Proceed to Payment" button click.
  const proceedButton = document.getElementById("gc-proceed-button");
  if (!proceedButton) return;
  proceedButton.addEventListener("click", () => {
    const {
      isValid,
      errorMessages
    } = validateForm();
    if (!isValid) {
      // Display error messages
      const errorContainer = document.getElementById('gc-error-container');
      errorContainer.innerHTML = errorMessages.map(msg => `<p>${msg}</p>`).join('');
      errorContainer.style.display = 'block';
      return;
    }

    // Clear any previous error messages
    document.getElementById('gc-error-container').style.display = 'none';

    // Get the entered amount.
    const amountField = container.querySelector("#gc_amount");
    let amount = parseFloat(amountField.value);
    if (isNaN(amount)) amount = 0;

    // Calculate surcharge if applicable:
    // Formula: ((amount + 0.3) / (1 - (surchargeRate/100))) - amount
    const calculatedSurcharge = (amount + 0.3) / (1 - surchargeRate / 100) - amount;
    const totalAmount = parseFloat((amount + calculatedSurcharge).toFixed(2));
    proceedButton.disabled = true;
    console.log(`Amount: $${amount.toFixed(2)}, Surcharge: $${calculatedSurcharge.toFixed(2)}, Total: $${totalAmount.toFixed(2)}`);

    // Create a container for the Stripe payment form.
    const paymentContainer = document.createElement("div");
    paymentContainer.id = "gift-certificate-payment-form-container";
    container.querySelector("form").appendChild(paymentContainer);

    // Render the React payment form.
    const App = () => /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_stripe_react_stripe_js__WEBPACK_IMPORTED_MODULE_3__.Elements, {
      stripe: (0,_stripe_stripe_js__WEBPACK_IMPORTED_MODULE_2__.loadStripe)(stripePk)
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(GiftCertificatePaymentForm, {
      stripePk: stripePk,
      totalAmount: totalAmount,
      surcharge: calculatedSurcharge.toFixed(2),
      onPaymentSuccess: result => {
        console.log("Payment completed:", result);
        // You can redirect or update the UI here.
      }
    }));
    react_dom__WEBPACK_IMPORTED_MODULE_1___default().render(/*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default().createElement(App, null), paymentContainer);
  });
}
document.addEventListener("DOMContentLoaded", () => {
  GiftCertificateFrontend();
});
})();

/******/ })()
;
//# sourceMappingURL=gift-certificate-frontend.js.map