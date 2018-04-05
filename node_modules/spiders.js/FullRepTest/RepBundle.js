(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var spiders = require("../src/spiders");
class TestRepliq extends spiders.Repliq {
    constructor() {
        super();
        this.val = 1;
    }
    inc() {
        this.val = this.val.read() + 1;
    }
}
__decorate([
    spiders.Count
], TestRepliq.prototype, "val", void 0);
class TestApp extends spiders.Application {
    constructor() {
        super();
        this.remote("127.0.0.1", 8888).then((serverRef) => {
            this.server = serverRef;
            console.log("Connected to server");
            //serverRef.newClient(this)
            if (window["isFirst"]) {
                this.masterRep = this.newRepliq(TestRepliq);
                this.masterRep.val.onCommit(() => {
                    console.log("New value on master: " + this.masterRep.val);
                });
                serverRef.pushReplica(this.masterRep);
                this.update(5);
            }
            else {
                serverRef.newClient(this);
            }
        });
    }
    getRepliq(repliq) {
        this.slaveRep = repliq;
        console.log("Got repliq. init val: " + repliq.val);
        repliq.val.onCommit(() => {
            console.log("New value for repliq: " + repliq.val);
        });
    }
    masterDone() {
        this.slaveRep.inc();
    }
    update(count) {
        if (count > 0) {
            setTimeout(() => {
                this.masterRep.inc();
                this.update(--count);
            }, 2000);
        }
        else {
            this.server.masterDone();
        }
    }
}
new TestApp();

},{"../src/spiders":69}],2:[function(require,module,exports){
module.exports = after

function after(count, callback, err_cb) {
    var bail = false
    err_cb = err_cb || noop
    proxy.count = count

    return (count === 0) ? callback() : proxy

    function proxy(err, result) {
        if (proxy.count <= 0) {
            throw new Error('after called too many times')
        }
        --proxy.count

        // after first error, rest are passed to err_cb
        if (err) {
            bail = true
            callback(err)
            // future error callbacks will go to error handler
            callback = err_cb
        } else if (proxy.count === 0 && !bail) {
            callback(null, result)
        }
    }
}

function noop() {}

},{}],3:[function(require,module,exports){
/**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */

module.exports = function(arraybuffer, start, end) {
  var bytes = arraybuffer.byteLength;
  start = start || 0;
  end = end || bytes;

  if (arraybuffer.slice) { return arraybuffer.slice(start, end); }

  if (start < 0) { start += bytes; }
  if (end < 0) { end += bytes; }
  if (end > bytes) { end = bytes; }

  if (start >= bytes || start >= end || bytes === 0) {
    return new ArrayBuffer(0);
  }

  var abv = new Uint8Array(arraybuffer);
  var result = new Uint8Array(end - start);
  for (var i = start, ii = 0; i < end; i++, ii++) {
    result[ii] = abv[i];
  }
  return result.buffer;
};

},{}],4:[function(require,module,exports){

/**
 * Expose `Backoff`.
 */

module.exports = Backoff;

/**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */

function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 10000;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}

/**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */

Backoff.prototype.duration = function(){
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand =  Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0  ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};

/**
 * Reset the number of attempts.
 *
 * @api public
 */

Backoff.prototype.reset = function(){
  this.attempts = 0;
};

/**
 * Set the minimum duration
 *
 * @api public
 */

Backoff.prototype.setMin = function(min){
  this.ms = min;
};

/**
 * Set the maximum duration
 *
 * @api public
 */

Backoff.prototype.setMax = function(max){
  this.max = max;
};

/**
 * Set the jitter
 *
 * @api public
 */

Backoff.prototype.setJitter = function(jitter){
  this.jitter = jitter;
};


},{}],5:[function(require,module,exports){
/*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */
(function(){
  "use strict";

  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  // Use a lookup table to find the index.
  var lookup = new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }

  exports.encode = function(arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
    i, len = bytes.length, base64 = "";

    for (i = 0; i < len; i+=3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }

    if ((len % 3) === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }

    return base64;
  };

  exports.decode =  function(base64) {
    var bufferLength = base64.length * 0.75,
    len = base64.length, i, p = 0,
    encoded1, encoded2, encoded3, encoded4;

    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }

    var arraybuffer = new ArrayBuffer(bufferLength),
    bytes = new Uint8Array(arraybuffer);

    for (i = 0; i < len; i+=4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i+1)];
      encoded3 = lookup[base64.charCodeAt(i+2)];
      encoded4 = lookup[base64.charCodeAt(i+3)];

      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
    }

    return arraybuffer;
  };
})();

},{}],6:[function(require,module,exports){
(function (global){
/**
 * Create a blob builder even when vendor prefixes exist
 */

var BlobBuilder = global.BlobBuilder
  || global.WebKitBlobBuilder
  || global.MSBlobBuilder
  || global.MozBlobBuilder;

/**
 * Check if Blob constructor is supported
 */

var blobSupported = (function() {
  try {
    var a = new Blob(['hi']);
    return a.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */

var blobSupportsArrayBufferView = blobSupported && (function() {
  try {
    var b = new Blob([new Uint8Array([1,2])]);
    return b.size === 2;
  } catch(e) {
    return false;
  }
})();

/**
 * Check if BlobBuilder is supported
 */

var blobBuilderSupported = BlobBuilder
  && BlobBuilder.prototype.append
  && BlobBuilder.prototype.getBlob;

/**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */

function mapArrayBufferViews(ary) {
  for (var i = 0; i < ary.length; i++) {
    var chunk = ary[i];
    if (chunk.buffer instanceof ArrayBuffer) {
      var buf = chunk.buffer;

      // if this is a subarray, make a copy so we only
      // include the subarray region from the underlying buffer
      if (chunk.byteLength !== buf.byteLength) {
        var copy = new Uint8Array(chunk.byteLength);
        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
        buf = copy.buffer;
      }

      ary[i] = buf;
    }
  }
}

function BlobBuilderConstructor(ary, options) {
  options = options || {};

  var bb = new BlobBuilder();
  mapArrayBufferViews(ary);

  for (var i = 0; i < ary.length; i++) {
    bb.append(ary[i]);
  }

  return (options.type) ? bb.getBlob(options.type) : bb.getBlob();
};

function BlobConstructor(ary, options) {
  mapArrayBufferViews(ary);
  return new Blob(ary, options || {});
};

module.exports = (function() {
  if (blobSupported) {
    return blobSupportsArrayBufferView ? global.Blob : BlobConstructor;
  } else if (blobBuilderSupported) {
    return BlobBuilderConstructor;
  } else {
    return undefined;
  }
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){

},{}],8:[function(require,module,exports){
/**
 * Slice reference.
 */

var slice = [].slice;

/**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */

module.exports = function(obj, fn){
  if ('string' == typeof fn) fn = obj[fn];
  if ('function' != typeof fn) throw new Error('bind() requires a function');
  var args = slice.call(arguments, 2);
  return function(){
    return fn.apply(obj, args.concat(slice.call(arguments)));
  }
};

},{}],9:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],10:[function(require,module,exports){

module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};
},{}],11:[function(require,module,exports){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  return ('WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  return JSON.stringify(v);
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}
  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

},{"./debug":12}],12:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = Array.prototype.slice.call(arguments);

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    if ('function' === typeof exports.formatArgs) {
      args = exports.formatArgs.apply(self, args);
    }
    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":20}],13:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var keys = require('./keys');
var hasBinary = require('has-binary');
var sliceBuffer = require('arraybuffer.slice');
var after = require('after');
var utf8 = require('wtf-8');

var base64encoder;
if (global && global.ArrayBuffer) {
  base64encoder = require('base64-arraybuffer');
}

/**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */

var isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

/**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */
var isPhantomJS = typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);

/**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */
var dontSendBlobs = isAndroid || isPhantomJS;

/**
 * Current protocol version.
 */

exports.protocol = 3;

/**
 * Packet types.
 */

var packets = exports.packets = {
    open:     0    // non-ws
  , close:    1    // non-ws
  , ping:     2
  , pong:     3
  , message:  4
  , upgrade:  5
  , noop:     6
};

var packetslist = keys(packets);

/**
 * Premade error packet.
 */

var err = { type: 'error', data: 'parser error' };

/**
 * Create a blob api even for blob builder when vendor prefixes exist
 */

var Blob = require('blob');

/**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */

exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
  if ('function' == typeof supportsBinary) {
    callback = supportsBinary;
    supportsBinary = false;
  }

  if ('function' == typeof utf8encode) {
    callback = utf8encode;
    utf8encode = null;
  }

  var data = (packet.data === undefined)
    ? undefined
    : packet.data.buffer || packet.data;

  if (global.ArrayBuffer && data instanceof ArrayBuffer) {
    return encodeArrayBuffer(packet, supportsBinary, callback);
  } else if (Blob && data instanceof global.Blob) {
    return encodeBlob(packet, supportsBinary, callback);
  }

  // might be an object with { base64: true, data: dataAsBase64String }
  if (data && data.base64) {
    return encodeBase64Object(packet, callback);
  }

  // Sending data as a utf-8 string
  var encoded = packets[packet.type];

  // data fragment is optional
  if (undefined !== packet.data) {
    encoded += utf8encode ? utf8.encode(String(packet.data)) : String(packet.data);
  }

  return callback('' + encoded);

};

function encodeBase64Object(packet, callback) {
  // packet data is an object { base64: true, data: dataAsBase64String }
  var message = 'b' + exports.packets[packet.type] + packet.data.data;
  return callback(message);
}

/**
 * Encode packet helpers for binary types
 */

function encodeArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var data = packet.data;
  var contentArray = new Uint8Array(data);
  var resultBuffer = new Uint8Array(1 + data.byteLength);

  resultBuffer[0] = packets[packet.type];
  for (var i = 0; i < contentArray.length; i++) {
    resultBuffer[i+1] = contentArray[i];
  }

  return callback(resultBuffer.buffer);
}

function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  var fr = new FileReader();
  fr.onload = function() {
    packet.data = fr.result;
    exports.encodePacket(packet, supportsBinary, true, callback);
  };
  return fr.readAsArrayBuffer(packet.data);
}

function encodeBlob(packet, supportsBinary, callback) {
  if (!supportsBinary) {
    return exports.encodeBase64Packet(packet, callback);
  }

  if (dontSendBlobs) {
    return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
  }

  var length = new Uint8Array(1);
  length[0] = packets[packet.type];
  var blob = new Blob([length.buffer, packet.data]);

  return callback(blob);
}

/**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */

exports.encodeBase64Packet = function(packet, callback) {
  var message = 'b' + exports.packets[packet.type];
  if (Blob && packet.data instanceof global.Blob) {
    var fr = new FileReader();
    fr.onload = function() {
      var b64 = fr.result.split(',')[1];
      callback(message + b64);
    };
    return fr.readAsDataURL(packet.data);
  }

  var b64data;
  try {
    b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
  } catch (e) {
    // iPhone Safari doesn't let you apply with typed arrays
    var typed = new Uint8Array(packet.data);
    var basic = new Array(typed.length);
    for (var i = 0; i < typed.length; i++) {
      basic[i] = typed[i];
    }
    b64data = String.fromCharCode.apply(null, basic);
  }
  message += global.btoa(b64data);
  return callback(message);
};

/**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */

exports.decodePacket = function (data, binaryType, utf8decode) {
  if (data === undefined) {
    return err;
  }
  // String data
  if (typeof data == 'string') {
    if (data.charAt(0) == 'b') {
      return exports.decodeBase64Packet(data.substr(1), binaryType);
    }

    if (utf8decode) {
      data = tryDecode(data);
      if (data === false) {
        return err;
      }
    }
    var type = data.charAt(0);

    if (Number(type) != type || !packetslist[type]) {
      return err;
    }

    if (data.length > 1) {
      return { type: packetslist[type], data: data.substring(1) };
    } else {
      return { type: packetslist[type] };
    }
  }

  var asArray = new Uint8Array(data);
  var type = asArray[0];
  var rest = sliceBuffer(data, 1);
  if (Blob && binaryType === 'blob') {
    rest = new Blob([rest]);
  }
  return { type: packetslist[type], data: rest };
};

function tryDecode(data) {
  try {
    data = utf8.decode(data);
  } catch (e) {
    return false;
  }
  return data;
}

/**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */

exports.decodeBase64Packet = function(msg, binaryType) {
  var type = packetslist[msg.charAt(0)];
  if (!base64encoder) {
    return { type: type, data: { base64: true, data: msg.substr(1) } };
  }

  var data = base64encoder.decode(msg.substr(1));

  if (binaryType === 'blob' && Blob) {
    data = new Blob([data]);
  }

  return { type: type, data: data };
};

/**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */

exports.encodePayload = function (packets, supportsBinary, callback) {
  if (typeof supportsBinary == 'function') {
    callback = supportsBinary;
    supportsBinary = null;
  }

  var isBinary = hasBinary(packets);

  if (supportsBinary && isBinary) {
    if (Blob && !dontSendBlobs) {
      return exports.encodePayloadAsBlob(packets, callback);
    }

    return exports.encodePayloadAsArrayBuffer(packets, callback);
  }

  if (!packets.length) {
    return callback('0:');
  }

  function setLengthHeader(message) {
    return message.length + ':' + message;
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function(message) {
      doneCallback(null, setLengthHeader(message));
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(results.join(''));
  });
};

/**
 * Async array map using after
 */

function map(ary, each, done) {
  var result = new Array(ary.length);
  var next = after(ary.length, done);

  var eachWithIndex = function(i, el, cb) {
    each(el, function(error, msg) {
      result[i] = msg;
      cb(error, result);
    });
  };

  for (var i = 0; i < ary.length; i++) {
    eachWithIndex(i, ary[i], next);
  }
}

/*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */

exports.decodePayload = function (data, binaryType, callback) {
  if (typeof data != 'string') {
    return exports.decodePayloadAsBinary(data, binaryType, callback);
  }

  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var packet;
  if (data == '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

  var length = ''
    , n, msg;

  for (var i = 0, l = data.length; i < l; i++) {
    var chr = data.charAt(i);

    if (':' != chr) {
      length += chr;
    } else {
      if ('' == length || (length != (n = Number(length)))) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      msg = data.substr(i + 1, n);

      if (length != msg.length) {
        // parser error - ignoring payload
        return callback(err, 0, 1);
      }

      if (msg.length) {
        packet = exports.decodePacket(msg, binaryType, true);

        if (err.type == packet.type && err.data == packet.data) {
          // parser error in individual packet - ignoring payload
          return callback(err, 0, 1);
        }

        var ret = callback(packet, i + n, l);
        if (false === ret) return;
      }

      // advance cursor
      i += n;
      length = '';
    }
  }

  if (length != '') {
    // parser error - ignoring payload
    return callback(err, 0, 1);
  }

};

/**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */

exports.encodePayloadAsArrayBuffer = function(packets, callback) {
  if (!packets.length) {
    return callback(new ArrayBuffer(0));
  }

  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(data) {
      return doneCallback(null, data);
    });
  }

  map(packets, encodeOne, function(err, encodedPackets) {
    var totalLength = encodedPackets.reduce(function(acc, p) {
      var len;
      if (typeof p === 'string'){
        len = p.length;
      } else {
        len = p.byteLength;
      }
      return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
    }, 0);

    var resultArray = new Uint8Array(totalLength);

    var bufferIndex = 0;
    encodedPackets.forEach(function(p) {
      var isString = typeof p === 'string';
      var ab = p;
      if (isString) {
        var view = new Uint8Array(p.length);
        for (var i = 0; i < p.length; i++) {
          view[i] = p.charCodeAt(i);
        }
        ab = view.buffer;
      }

      if (isString) { // not true binary
        resultArray[bufferIndex++] = 0;
      } else { // true binary
        resultArray[bufferIndex++] = 1;
      }

      var lenStr = ab.byteLength.toString();
      for (var i = 0; i < lenStr.length; i++) {
        resultArray[bufferIndex++] = parseInt(lenStr[i]);
      }
      resultArray[bufferIndex++] = 255;

      var view = new Uint8Array(ab);
      for (var i = 0; i < view.length; i++) {
        resultArray[bufferIndex++] = view[i];
      }
    });

    return callback(resultArray.buffer);
  });
};

/**
 * Encode as Blob
 */

exports.encodePayloadAsBlob = function(packets, callback) {
  function encodeOne(packet, doneCallback) {
    exports.encodePacket(packet, true, true, function(encoded) {
      var binaryIdentifier = new Uint8Array(1);
      binaryIdentifier[0] = 1;
      if (typeof encoded === 'string') {
        var view = new Uint8Array(encoded.length);
        for (var i = 0; i < encoded.length; i++) {
          view[i] = encoded.charCodeAt(i);
        }
        encoded = view.buffer;
        binaryIdentifier[0] = 0;
      }

      var len = (encoded instanceof ArrayBuffer)
        ? encoded.byteLength
        : encoded.size;

      var lenStr = len.toString();
      var lengthAry = new Uint8Array(lenStr.length + 1);
      for (var i = 0; i < lenStr.length; i++) {
        lengthAry[i] = parseInt(lenStr[i]);
      }
      lengthAry[lenStr.length] = 255;

      if (Blob) {
        var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
        doneCallback(null, blob);
      }
    });
  }

  map(packets, encodeOne, function(err, results) {
    return callback(new Blob(results));
  });
};

/*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */

exports.decodePayloadAsBinary = function (data, binaryType, callback) {
  if (typeof binaryType === 'function') {
    callback = binaryType;
    binaryType = null;
  }

  var bufferTail = data;
  var buffers = [];

  var numberTooLong = false;
  while (bufferTail.byteLength > 0) {
    var tailArray = new Uint8Array(bufferTail);
    var isString = tailArray[0] === 0;
    var msgLength = '';

    for (var i = 1; ; i++) {
      if (tailArray[i] == 255) break;

      if (msgLength.length > 310) {
        numberTooLong = true;
        break;
      }

      msgLength += tailArray[i];
    }

    if(numberTooLong) return callback(err, 0, 1);

    bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
    msgLength = parseInt(msgLength);

    var msg = sliceBuffer(bufferTail, 0, msgLength);
    if (isString) {
      try {
        msg = String.fromCharCode.apply(null, new Uint8Array(msg));
      } catch (e) {
        // iPhone Safari doesn't let you apply to typed arrays
        var typed = new Uint8Array(msg);
        msg = '';
        for (var i = 0; i < typed.length; i++) {
          msg += String.fromCharCode(typed[i]);
        }
      }
    }

    buffers.push(msg);
    bufferTail = sliceBuffer(bufferTail, msgLength);
  }

  var total = buffers.length;
  buffers.forEach(function(buffer, i) {
    callback(exports.decodePacket(buffer, binaryType, true), i, total);
  });
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./keys":14,"after":2,"arraybuffer.slice":3,"base64-arraybuffer":5,"blob":6,"has-binary":15,"wtf-8":49}],14:[function(require,module,exports){

/**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */

module.exports = Object.keys || function keys (obj){
  var arr = [];
  var has = Object.prototype.hasOwnProperty;

  for (var i in obj) {
    if (has.call(obj, i)) {
      arr.push(i);
    }
  }
  return arr;
};

},{}],15:[function(require,module,exports){
(function (global){

/*
 * Module requirements.
 */

var isArray = require('isarray');

/**
 * Module exports.
 */

module.exports = hasBinary;

/**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */

function hasBinary(data) {

  function _hasBinary(obj) {
    if (!obj) return false;

    if ( (global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer) ||
         (global.Blob && obj instanceof Blob) ||
         (global.File && obj instanceof File)
        ) {
      return true;
    }

    if (isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
          if (_hasBinary(obj[i])) {
              return true;
          }
      }
    } else if (obj && 'object' == typeof obj) {
      // see: https://github.com/Automattic/has-binary/pull/4
      if (obj.toJSON && 'function' == typeof obj.toJSON) {
        obj = obj.toJSON();
      }

      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key) && _hasBinary(obj[key])) {
          return true;
        }
      }
    }

    return false;
  }

  return _hasBinary(data);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"isarray":18}],16:[function(require,module,exports){

/**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */

try {
  module.exports = typeof XMLHttpRequest !== 'undefined' &&
    'withCredentials' in new XMLHttpRequest();
} catch (err) {
  // if XMLHttp support is disabled in IE then it will throw
  // when trying to create
  module.exports = false;
}

},{}],17:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],18:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],19:[function(require,module,exports){
(function (global){
/*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */
;(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof define === "function" && define.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], ((className = getClass.call(value)), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && ((charCode = source.charCodeAt(Index + 1)), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && ((charCode = source.charCodeAt(Index)), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && ((charCode = source.charCodeAt(position)), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    define(function () {
      return JSON3;
    });
  }
}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],20:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options){
  options = options || {};
  if ('string' == typeof val) return parse(val);
  return options.long
    ? long(val)
    : short(val);
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = '' + str;
  if (str.length > 10000) return;
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function short(ms) {
  if (ms >= d) return Math.round(ms / d) + 'd';
  if (ms >= h) return Math.round(ms / h) + 'h';
  if (ms >= m) return Math.round(ms / m) + 'm';
  if (ms >= s) return Math.round(ms / s) + 's';
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function long(ms) {
  return plural(ms, d, 'day')
    || plural(ms, h, 'hour')
    || plural(ms, m, 'minute')
    || plural(ms, s, 'second')
    || ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) return;
  if (ms < n * 1.5) return Math.floor(ms / n) + ' ' + name;
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],21:[function(require,module,exports){
(function (global){
/**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */

var rvalidchars = /^[\],:{}\s]*$/;
var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
var rtrimLeft = /^\s+/;
var rtrimRight = /\s+$/;

module.exports = function parsejson(data) {
  if ('string' != typeof data || !data) {
    return null;
  }

  data = data.replace(rtrimLeft, '').replace(rtrimRight, '');

  // Attempt to parse using the native JSON parser first
  if (global.JSON && JSON.parse) {
    return JSON.parse(data);
  }

  if (rvalidchars.test(data.replace(rvalidescape, '@')
      .replace(rvalidtokens, ']')
      .replace(rvalidbraces, ''))) {
    return (new Function('return ' + data))();
  }
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],22:[function(require,module,exports){
/**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */

exports.encode = function (obj) {
  var str = '';

  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      if (str.length) str += '&';
      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
    }
  }

  return str;
};

/**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */

exports.decode = function(qs){
  var qry = {};
  var pairs = qs.split('&');
  for (var i = 0, l = pairs.length; i < l; i++) {
    var pair = pairs[i].split('=');
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
};

},{}],23:[function(require,module,exports){
/**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */

var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;

var parts = [
    'source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'
];

module.exports = function parseuri(str) {
    var src = str,
        b = str.indexOf('['),
        e = str.indexOf(']');

    if (b != -1 && e != -1) {
        str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
    }

    var m = re.exec(str || ''),
        uri = {},
        i = 14;

    while (i--) {
        uri[parts[i]] = m[i] || '';
    }

    if (b != -1 && e != -1) {
        uri.source = src;
        uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
        uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
        uri.ipv6uri = true;
    }

    return uri;
};

},{}],24:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],25:[function(require,module,exports){

/**
 * Module dependencies.
 */

var url = require('./url');
var parser = require('socket.io-parser');
var Manager = require('./manager');
var debug = require('debug')('socket.io-client');

/**
 * Module exports.
 */

module.exports = exports = lookup;

/**
 * Managers cache.
 */

var cache = exports.managers = {};

/**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */

function lookup (uri, opts) {
  if (typeof uri === 'object') {
    opts = uri;
    uri = undefined;
  }

  opts = opts || {};

  var parsed = url(uri);
  var source = parsed.source;
  var id = parsed.id;
  var path = parsed.path;
  var sameNamespace = cache[id] && path in cache[id].nsps;
  var newConnection = opts.forceNew || opts['force new connection'] ||
                      false === opts.multiplex || sameNamespace;

  var io;

  if (newConnection) {
    debug('ignoring socket cache for %s', source);
    io = Manager(source, opts);
  } else {
    if (!cache[id]) {
      debug('new io instance for %s', source);
      cache[id] = Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.query;
  } else if (opts && 'object' === typeof opts.query) {
    opts.query = encodeQueryString(opts.query);
  }
  return io.socket(parsed.path, opts);
}
/**
 *  Helper method to parse query objects to string.
 * @param {object} query
 * @returns {string}
 */
function encodeQueryString (obj) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}
/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = parser.protocol;

/**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */

exports.connect = lookup;

/**
 * Expose constructors for standalone build.
 *
 * @api public
 */

exports.Manager = require('./manager');
exports.Socket = require('./socket');

},{"./manager":26,"./socket":28,"./url":29,"debug":31,"socket.io-parser":45}],26:[function(require,module,exports){

/**
 * Module dependencies.
 */

var eio = require('engine.io-client');
var Socket = require('./socket');
var Emitter = require('component-emitter');
var parser = require('socket.io-parser');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:manager');
var indexOf = require('indexof');
var Backoff = require('backo2');

/**
 * IE6+ hasOwnProperty
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Module exports
 */

module.exports = Manager;

/**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */

function Manager (uri, opts) {
  if (!(this instanceof Manager)) return new Manager(uri, opts);
  if (uri && ('object' === typeof uri)) {
    opts = uri;
    uri = undefined;
  }
  opts = opts || {};

  opts.path = opts.path || '/socket.io';
  this.nsps = {};
  this.subs = [];
  this.opts = opts;
  this.reconnection(opts.reconnection !== false);
  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
  this.reconnectionDelay(opts.reconnectionDelay || 1000);
  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
  this.randomizationFactor(opts.randomizationFactor || 0.5);
  this.backoff = new Backoff({
    min: this.reconnectionDelay(),
    max: this.reconnectionDelayMax(),
    jitter: this.randomizationFactor()
  });
  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
  this.readyState = 'closed';
  this.uri = uri;
  this.connecting = [];
  this.lastPing = null;
  this.encoding = false;
  this.packetBuffer = [];
  this.encoder = new parser.Encoder();
  this.decoder = new parser.Decoder();
  this.autoConnect = opts.autoConnect !== false;
  if (this.autoConnect) this.open();
}

/**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */

Manager.prototype.emitAll = function () {
  this.emit.apply(this, arguments);
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
    }
  }
};

/**
 * Update `socket.id` of all sockets
 *
 * @api private
 */

Manager.prototype.updateSocketIds = function () {
  for (var nsp in this.nsps) {
    if (has.call(this.nsps, nsp)) {
      this.nsps[nsp].id = this.engine.id;
    }
  }
};

/**
 * Mix in `Emitter`.
 */

Emitter(Manager.prototype);

/**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnection = function (v) {
  if (!arguments.length) return this._reconnection;
  this._reconnection = !!v;
  return this;
};

/**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionAttempts = function (v) {
  if (!arguments.length) return this._reconnectionAttempts;
  this._reconnectionAttempts = v;
  return this;
};

/**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelay = function (v) {
  if (!arguments.length) return this._reconnectionDelay;
  this._reconnectionDelay = v;
  this.backoff && this.backoff.setMin(v);
  return this;
};

Manager.prototype.randomizationFactor = function (v) {
  if (!arguments.length) return this._randomizationFactor;
  this._randomizationFactor = v;
  this.backoff && this.backoff.setJitter(v);
  return this;
};

/**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.reconnectionDelayMax = function (v) {
  if (!arguments.length) return this._reconnectionDelayMax;
  this._reconnectionDelayMax = v;
  this.backoff && this.backoff.setMax(v);
  return this;
};

/**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */

Manager.prototype.timeout = function (v) {
  if (!arguments.length) return this._timeout;
  this._timeout = v;
  return this;
};

/**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */

Manager.prototype.maybeReconnectOnOpen = function () {
  // Only try to reconnect if it's the first time we're connecting
  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
    // keeps reconnection from firing twice for the same reconnection loop
    this.reconnect();
  }
};

/**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */

Manager.prototype.open =
Manager.prototype.connect = function (fn, opts) {
  debug('readyState %s', this.readyState);
  if (~this.readyState.indexOf('open')) return this;

  debug('opening %s', this.uri);
  this.engine = eio(this.uri, this.opts);
  var socket = this.engine;
  var self = this;
  this.readyState = 'opening';
  this.skipReconnect = false;

  // emit `open`
  var openSub = on(socket, 'open', function () {
    self.onopen();
    fn && fn();
  });

  // emit `connect_error`
  var errorSub = on(socket, 'error', function (data) {
    debug('connect_error');
    self.cleanup();
    self.readyState = 'closed';
    self.emitAll('connect_error', data);
    if (fn) {
      var err = new Error('Connection error');
      err.data = data;
      fn(err);
    } else {
      // Only do this if there is no fn to handle the error
      self.maybeReconnectOnOpen();
    }
  });

  // emit `connect_timeout`
  if (false !== this._timeout) {
    var timeout = this._timeout;
    debug('connect attempt will timeout after %d', timeout);

    // set timer
    var timer = setTimeout(function () {
      debug('connect attempt timed out after %d', timeout);
      openSub.destroy();
      socket.close();
      socket.emit('error', 'timeout');
      self.emitAll('connect_timeout', timeout);
    }, timeout);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }

  this.subs.push(openSub);
  this.subs.push(errorSub);

  return this;
};

/**
 * Called upon transport open.
 *
 * @api private
 */

Manager.prototype.onopen = function () {
  debug('open');

  // clear old subs
  this.cleanup();

  // mark as open
  this.readyState = 'open';
  this.emit('open');

  // add new subs
  var socket = this.engine;
  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
};

/**
 * Called upon a ping.
 *
 * @api private
 */

Manager.prototype.onping = function () {
  this.lastPing = new Date();
  this.emitAll('ping');
};

/**
 * Called upon a packet.
 *
 * @api private
 */

Manager.prototype.onpong = function () {
  this.emitAll('pong', new Date() - this.lastPing);
};

/**
 * Called with data.
 *
 * @api private
 */

Manager.prototype.ondata = function (data) {
  this.decoder.add(data);
};

/**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */

Manager.prototype.ondecoded = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon socket error.
 *
 * @api private
 */

Manager.prototype.onerror = function (err) {
  debug('error', err);
  this.emitAll('error', err);
};

/**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */

Manager.prototype.socket = function (nsp, opts) {
  var socket = this.nsps[nsp];
  if (!socket) {
    socket = new Socket(this, nsp, opts);
    this.nsps[nsp] = socket;
    var self = this;
    socket.on('connecting', onConnecting);
    socket.on('connect', function () {
      socket.id = self.engine.id;
    });

    if (this.autoConnect) {
      // manually call here since connecting evnet is fired before listening
      onConnecting();
    }
  }

  function onConnecting () {
    if (!~indexOf(self.connecting, socket)) {
      self.connecting.push(socket);
    }
  }

  return socket;
};

/**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */

Manager.prototype.destroy = function (socket) {
  var index = indexOf(this.connecting, socket);
  if (~index) this.connecting.splice(index, 1);
  if (this.connecting.length) return;

  this.close();
};

/**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */

Manager.prototype.packet = function (packet) {
  debug('writing packet %j', packet);
  var self = this;
  if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

  if (!self.encoding) {
    // encode, then write to engine with result
    self.encoding = true;
    this.encoder.encode(packet, function (encodedPackets) {
      for (var i = 0; i < encodedPackets.length; i++) {
        self.engine.write(encodedPackets[i], packet.options);
      }
      self.encoding = false;
      self.processPacketQueue();
    });
  } else { // add packet to the queue
    self.packetBuffer.push(packet);
  }
};

/**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */

Manager.prototype.processPacketQueue = function () {
  if (this.packetBuffer.length > 0 && !this.encoding) {
    var pack = this.packetBuffer.shift();
    this.packet(pack);
  }
};

/**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */

Manager.prototype.cleanup = function () {
  debug('cleanup');

  var subsLength = this.subs.length;
  for (var i = 0; i < subsLength; i++) {
    var sub = this.subs.shift();
    sub.destroy();
  }

  this.packetBuffer = [];
  this.encoding = false;
  this.lastPing = null;

  this.decoder.destroy();
};

/**
 * Close the current socket.
 *
 * @api private
 */

Manager.prototype.close =
Manager.prototype.disconnect = function () {
  debug('disconnect');
  this.skipReconnect = true;
  this.reconnecting = false;
  if ('opening' === this.readyState) {
    // `onclose` will not fire because
    // an open event never happened
    this.cleanup();
  }
  this.backoff.reset();
  this.readyState = 'closed';
  if (this.engine) this.engine.close();
};

/**
 * Called upon engine close.
 *
 * @api private
 */

Manager.prototype.onclose = function (reason) {
  debug('onclose');

  this.cleanup();
  this.backoff.reset();
  this.readyState = 'closed';
  this.emit('close', reason);

  if (this._reconnection && !this.skipReconnect) {
    this.reconnect();
  }
};

/**
 * Attempt a reconnection.
 *
 * @api private
 */

Manager.prototype.reconnect = function () {
  if (this.reconnecting || this.skipReconnect) return this;

  var self = this;

  if (this.backoff.attempts >= this._reconnectionAttempts) {
    debug('reconnect failed');
    this.backoff.reset();
    this.emitAll('reconnect_failed');
    this.reconnecting = false;
  } else {
    var delay = this.backoff.duration();
    debug('will wait %dms before reconnect attempt', delay);

    this.reconnecting = true;
    var timer = setTimeout(function () {
      if (self.skipReconnect) return;

      debug('attempting reconnect');
      self.emitAll('reconnect_attempt', self.backoff.attempts);
      self.emitAll('reconnecting', self.backoff.attempts);

      // check again for the case socket closed in above events
      if (self.skipReconnect) return;

      self.open(function (err) {
        if (err) {
          debug('reconnect attempt error');
          self.reconnecting = false;
          self.reconnect();
          self.emitAll('reconnect_error', err.data);
        } else {
          debug('reconnect success');
          self.onreconnect();
        }
      });
    }, delay);

    this.subs.push({
      destroy: function () {
        clearTimeout(timer);
      }
    });
  }
};

/**
 * Called upon successful reconnect.
 *
 * @api private
 */

Manager.prototype.onreconnect = function () {
  var attempt = this.backoff.attempts;
  this.reconnecting = false;
  this.backoff.reset();
  this.updateSocketIds();
  this.emitAll('reconnect', attempt);
};

},{"./on":27,"./socket":28,"backo2":4,"component-bind":8,"component-emitter":30,"debug":31,"engine.io-client":33,"indexof":17,"socket.io-parser":45}],27:[function(require,module,exports){

/**
 * Module exports.
 */

module.exports = on;

/**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */

function on (obj, ev, fn) {
  obj.on(ev, fn);
  return {
    destroy: function () {
      obj.removeListener(ev, fn);
    }
  };
}

},{}],28:[function(require,module,exports){

/**
 * Module dependencies.
 */

var parser = require('socket.io-parser');
var Emitter = require('component-emitter');
var toArray = require('to-array');
var on = require('./on');
var bind = require('component-bind');
var debug = require('debug')('socket.io-client:socket');
var hasBin = require('has-binary');

/**
 * Module exports.
 */

module.exports = exports = Socket;

/**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */

var events = {
  connect: 1,
  connect_error: 1,
  connect_timeout: 1,
  connecting: 1,
  disconnect: 1,
  error: 1,
  reconnect: 1,
  reconnect_attempt: 1,
  reconnect_failed: 1,
  reconnect_error: 1,
  reconnecting: 1,
  ping: 1,
  pong: 1
};

/**
 * Shortcut to `Emitter#emit`.
 */

var emit = Emitter.prototype.emit;

/**
 * `Socket` constructor.
 *
 * @api public
 */

function Socket (io, nsp, opts) {
  this.io = io;
  this.nsp = nsp;
  this.json = this; // compat
  this.ids = 0;
  this.acks = {};
  this.receiveBuffer = [];
  this.sendBuffer = [];
  this.connected = false;
  this.disconnected = true;
  if (opts && opts.query) {
    this.query = opts.query;
  }
  if (this.io.autoConnect) this.open();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Subscribe to open, close and packet events
 *
 * @api private
 */

Socket.prototype.subEvents = function () {
  if (this.subs) return;

  var io = this.io;
  this.subs = [
    on(io, 'open', bind(this, 'onopen')),
    on(io, 'packet', bind(this, 'onpacket')),
    on(io, 'close', bind(this, 'onclose'))
  ];
};

/**
 * "Opens" the socket.
 *
 * @api public
 */

Socket.prototype.open =
Socket.prototype.connect = function () {
  if (this.connected) return this;

  this.subEvents();
  this.io.open(); // ensure open
  if ('open' === this.io.readyState) this.onopen();
  this.emit('connecting');
  return this;
};

/**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.send = function () {
  var args = toArray(arguments);
  args.unshift('message');
  this.emit.apply(this, args);
  return this;
};

/**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */

Socket.prototype.emit = function (ev) {
  if (events.hasOwnProperty(ev)) {
    emit.apply(this, arguments);
    return this;
  }

  var args = toArray(arguments);
  var parserType = parser.EVENT; // default
  if (hasBin(args)) { parserType = parser.BINARY_EVENT; } // binary
  var packet = { type: parserType, data: args };

  packet.options = {};
  packet.options.compress = !this.flags || false !== this.flags.compress;

  // event ack callback
  if ('function' === typeof args[args.length - 1]) {
    debug('emitting packet with ack id %d', this.ids);
    this.acks[this.ids] = args.pop();
    packet.id = this.ids++;
  }

  if (this.connected) {
    this.packet(packet);
  } else {
    this.sendBuffer.push(packet);
  }

  delete this.flags;

  return this;
};

/**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.packet = function (packet) {
  packet.nsp = this.nsp;
  this.io.packet(packet);
};

/**
 * Called upon engine `open`.
 *
 * @api private
 */

Socket.prototype.onopen = function () {
  debug('transport is open - connecting');

  // write connect packet if necessary
  if ('/' !== this.nsp) {
    if (this.query) {
      this.packet({type: parser.CONNECT, query: this.query});
    } else {
      this.packet({type: parser.CONNECT});
    }
  }
};

/**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */

Socket.prototype.onclose = function (reason) {
  debug('close (%s)', reason);
  this.connected = false;
  this.disconnected = true;
  delete this.id;
  this.emit('disconnect', reason);
};

/**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onpacket = function (packet) {
  if (packet.nsp !== this.nsp) return;

  switch (packet.type) {
    case parser.CONNECT:
      this.onconnect();
      break;

    case parser.EVENT:
      this.onevent(packet);
      break;

    case parser.BINARY_EVENT:
      this.onevent(packet);
      break;

    case parser.ACK:
      this.onack(packet);
      break;

    case parser.BINARY_ACK:
      this.onack(packet);
      break;

    case parser.DISCONNECT:
      this.ondisconnect();
      break;

    case parser.ERROR:
      this.emit('error', packet.data);
      break;
  }
};

/**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onevent = function (packet) {
  var args = packet.data || [];
  debug('emitting event %j', args);

  if (null != packet.id) {
    debug('attaching ack callback to event');
    args.push(this.ack(packet.id));
  }

  if (this.connected) {
    emit.apply(this, args);
  } else {
    this.receiveBuffer.push(args);
  }
};

/**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */

Socket.prototype.ack = function (id) {
  var self = this;
  var sent = false;
  return function () {
    // prevent double callbacks
    if (sent) return;
    sent = true;
    var args = toArray(arguments);
    debug('sending ack %j', args);

    var type = hasBin(args) ? parser.BINARY_ACK : parser.ACK;
    self.packet({
      type: type,
      id: id,
      data: args
    });
  };
};

/**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */

Socket.prototype.onack = function (packet) {
  var ack = this.acks[packet.id];
  if ('function' === typeof ack) {
    debug('calling ack %s with %j', packet.id, packet.data);
    ack.apply(this, packet.data);
    delete this.acks[packet.id];
  } else {
    debug('bad ack %s', packet.id);
  }
};

/**
 * Called upon server connect.
 *
 * @api private
 */

Socket.prototype.onconnect = function () {
  this.connected = true;
  this.disconnected = false;
  this.emit('connect');
  this.emitBuffered();
};

/**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */

Socket.prototype.emitBuffered = function () {
  var i;
  for (i = 0; i < this.receiveBuffer.length; i++) {
    emit.apply(this, this.receiveBuffer[i]);
  }
  this.receiveBuffer = [];

  for (i = 0; i < this.sendBuffer.length; i++) {
    this.packet(this.sendBuffer[i]);
  }
  this.sendBuffer = [];
};

/**
 * Called upon server disconnect.
 *
 * @api private
 */

Socket.prototype.ondisconnect = function () {
  debug('server disconnect (%s)', this.nsp);
  this.destroy();
  this.onclose('io server disconnect');
};

/**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */

Socket.prototype.destroy = function () {
  if (this.subs) {
    // clean subscriptions to avoid reconnections
    for (var i = 0; i < this.subs.length; i++) {
      this.subs[i].destroy();
    }
    this.subs = null;
  }

  this.io.destroy(this);
};

/**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */

Socket.prototype.close =
Socket.prototype.disconnect = function () {
  if (this.connected) {
    debug('performing disconnect (%s)', this.nsp);
    this.packet({ type: parser.DISCONNECT });
  }

  // remove socket from pool
  this.destroy();

  if (this.connected) {
    // fire events
    this.onclose('io client disconnect');
  }
  return this;
};

/**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */

Socket.prototype.compress = function (compress) {
  this.flags = this.flags || {};
  this.flags.compress = compress;
  return this;
};

},{"./on":27,"component-bind":8,"component-emitter":30,"debug":31,"has-binary":15,"socket.io-parser":45,"to-array":47}],29:[function(require,module,exports){
(function (global){

/**
 * Module dependencies.
 */

var parseuri = require('parseuri');
var debug = require('debug')('socket.io-client:url');

/**
 * Module exports.
 */

module.exports = url;

/**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */

function url (uri, loc) {
  var obj = uri;

  // default to window.location
  loc = loc || global.location;
  if (null == uri) uri = loc.protocol + '//' + loc.host;

  // relative path support
  if ('string' === typeof uri) {
    if ('/' === uri.charAt(0)) {
      if ('/' === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }

    if (!/^(https?|wss?):\/\//.test(uri)) {
      debug('protocol-less url %s', uri);
      if ('undefined' !== typeof loc) {
        uri = loc.protocol + '//' + uri;
      } else {
        uri = 'https://' + uri;
      }
    }

    // parse
    debug('parse %s', uri);
    obj = parseuri(uri);
  }

  // make sure we treat `localhost:80` and `localhost` equally
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = '80';
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = '443';
    }
  }

  obj.path = obj.path || '/';

  var ipv6 = obj.host.indexOf(':') !== -1;
  var host = ipv6 ? '[' + obj.host + ']' : obj.host;

  // define unique id
  obj.id = obj.protocol + '://' + host + ':' + obj.port;
  // define href
  obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : (':' + obj.port));

  return obj;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"debug":31,"parseuri":23}],30:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],31:[function(require,module,exports){
(function (process){

/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (window.console && (console.firebug || (console.exception && console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31);
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs() {
  var args = arguments;
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return args;

  var c = 'color: ' + this.color;
  args = [args[0], c, 'color: inherit'].concat(Array.prototype.slice.call(args, 1));

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
  return args;
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    return exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (typeof process !== 'undefined' && 'env' in process) {
    return process.env.DEBUG;
  }
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage(){
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":32,"_process":24}],32:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug.debug = debug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */

exports.formatters = {};

/**
 * Previously assigned color.
 */

var prevColor = 0;

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */

function selectColor() {
  return exports.colors[prevColor++ % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function debug(namespace) {

  // define the `disabled` version
  function disabled() {
  }
  disabled.enabled = false;

  // define the `enabled` version
  function enabled() {

    var self = enabled;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // add the `color` if not set
    if (null == self.useColors) self.useColors = exports.useColors();
    if (null == self.color && self.useColors) self.color = selectColor();

    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %o
      args = ['%o'].concat(args);
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting
    args = exports.formatArgs.apply(self, args);

    var logFn = enabled.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }
  enabled.enabled = true;

  var fn = exports.enabled(namespace) ? enabled : disabled;

  fn.namespace = namespace;

  return fn;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  var split = (namespaces || '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/[\\^$+?.()|[\]{}]/g, '\\$&').replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":43}],33:[function(require,module,exports){

module.exports = require('./lib/index');

},{"./lib/index":34}],34:[function(require,module,exports){

module.exports = require('./socket');

/**
 * Exports parser
 *
 * @api public
 *
 */
module.exports.parser = require('engine.io-parser');

},{"./socket":35,"engine.io-parser":13}],35:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var transports = require('./transports/index');
var Emitter = require('component-emitter');
var debug = require('debug')('engine.io-client:socket');
var index = require('indexof');
var parser = require('engine.io-parser');
var parseuri = require('parseuri');
var parsejson = require('parsejson');
var parseqs = require('parseqs');

/**
 * Module exports.
 */

module.exports = Socket;

/**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */

function Socket (uri, opts) {
  if (!(this instanceof Socket)) return new Socket(uri, opts);

  opts = opts || {};

  if (uri && 'object' === typeof uri) {
    opts = uri;
    uri = null;
  }

  if (uri) {
    uri = parseuri(uri);
    opts.hostname = uri.host;
    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
    opts.port = uri.port;
    if (uri.query) opts.query = uri.query;
  } else if (opts.host) {
    opts.hostname = parseuri(opts.host).host;
  }

  this.secure = null != opts.secure ? opts.secure
    : (global.location && 'https:' === location.protocol);

  if (opts.hostname && !opts.port) {
    // if no port is specified manually, use the protocol default
    opts.port = this.secure ? '443' : '80';
  }

  this.agent = opts.agent || false;
  this.hostname = opts.hostname ||
    (global.location ? location.hostname : 'localhost');
  this.port = opts.port || (global.location && location.port
      ? location.port
      : (this.secure ? 443 : 80));
  this.query = opts.query || {};
  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
  this.upgrade = false !== opts.upgrade;
  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
  this.forceJSONP = !!opts.forceJSONP;
  this.jsonp = false !== opts.jsonp;
  this.forceBase64 = !!opts.forceBase64;
  this.enablesXDR = !!opts.enablesXDR;
  this.timestampParam = opts.timestampParam || 't';
  this.timestampRequests = opts.timestampRequests;
  this.transports = opts.transports || ['polling', 'websocket'];
  this.readyState = '';
  this.writeBuffer = [];
  this.prevBufferLen = 0;
  this.policyPort = opts.policyPort || 843;
  this.rememberUpgrade = opts.rememberUpgrade || false;
  this.binaryType = null;
  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
  this.perMessageDeflate = false !== opts.perMessageDeflate ? (opts.perMessageDeflate || {}) : false;

  if (true === this.perMessageDeflate) this.perMessageDeflate = {};
  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
    this.perMessageDeflate.threshold = 1024;
  }

  // SSL options for Node.js client
  this.pfx = opts.pfx || null;
  this.key = opts.key || null;
  this.passphrase = opts.passphrase || null;
  this.cert = opts.cert || null;
  this.ca = opts.ca || null;
  this.ciphers = opts.ciphers || null;
  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? null : opts.rejectUnauthorized;
  this.forceNode = !!opts.forceNode;

  // other options for Node.js client
  var freeGlobal = typeof global === 'object' && global;
  if (freeGlobal.global === freeGlobal) {
    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
      this.extraHeaders = opts.extraHeaders;
    }

    if (opts.localAddress) {
      this.localAddress = opts.localAddress;
    }
  }

  // set on handshake
  this.id = null;
  this.upgrades = null;
  this.pingInterval = null;
  this.pingTimeout = null;

  // set on heartbeat
  this.pingIntervalTimer = null;
  this.pingTimeoutTimer = null;

  this.open();
}

Socket.priorWebsocketSuccess = false;

/**
 * Mix in `Emitter`.
 */

Emitter(Socket.prototype);

/**
 * Protocol version.
 *
 * @api public
 */

Socket.protocol = parser.protocol; // this is an int

/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */

Socket.Socket = Socket;
Socket.Transport = require('./transport');
Socket.transports = require('./transports/index');
Socket.parser = require('engine.io-parser');

/**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */

Socket.prototype.createTransport = function (name) {
  debug('creating transport "%s"', name);
  var query = clone(this.query);

  // append engine.io protocol identifier
  query.EIO = parser.protocol;

  // transport name
  query.transport = name;

  // session id if we already have one
  if (this.id) query.sid = this.id;

  var transport = new transports[name]({
    agent: this.agent,
    hostname: this.hostname,
    port: this.port,
    secure: this.secure,
    path: this.path,
    query: query,
    forceJSONP: this.forceJSONP,
    jsonp: this.jsonp,
    forceBase64: this.forceBase64,
    enablesXDR: this.enablesXDR,
    timestampRequests: this.timestampRequests,
    timestampParam: this.timestampParam,
    policyPort: this.policyPort,
    socket: this,
    pfx: this.pfx,
    key: this.key,
    passphrase: this.passphrase,
    cert: this.cert,
    ca: this.ca,
    ciphers: this.ciphers,
    rejectUnauthorized: this.rejectUnauthorized,
    perMessageDeflate: this.perMessageDeflate,
    extraHeaders: this.extraHeaders,
    forceNode: this.forceNode,
    localAddress: this.localAddress
  });

  return transport;
};

function clone (obj) {
  var o = {};
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      o[i] = obj[i];
    }
  }
  return o;
}

/**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */
Socket.prototype.open = function () {
  var transport;
  if (this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
    transport = 'websocket';
  } else if (0 === this.transports.length) {
    // Emit error on next tick so it can be listened to
    var self = this;
    setTimeout(function () {
      self.emit('error', 'No transports available');
    }, 0);
    return;
  } else {
    transport = this.transports[0];
  }
  this.readyState = 'opening';

  // Retry with the next transport if the transport is disabled (jsonp: false)
  try {
    transport = this.createTransport(transport);
  } catch (e) {
    this.transports.shift();
    this.open();
    return;
  }

  transport.open();
  this.setTransport(transport);
};

/**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */

Socket.prototype.setTransport = function (transport) {
  debug('setting transport %s', transport.name);
  var self = this;

  if (this.transport) {
    debug('clearing existing transport %s', this.transport.name);
    this.transport.removeAllListeners();
  }

  // set up transport
  this.transport = transport;

  // set up transport listeners
  transport
  .on('drain', function () {
    self.onDrain();
  })
  .on('packet', function (packet) {
    self.onPacket(packet);
  })
  .on('error', function (e) {
    self.onError(e);
  })
  .on('close', function () {
    self.onClose('transport close');
  });
};

/**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */

Socket.prototype.probe = function (name) {
  debug('probing transport "%s"', name);
  var transport = this.createTransport(name, { probe: 1 });
  var failed = false;
  var self = this;

  Socket.priorWebsocketSuccess = false;

  function onTransportOpen () {
    if (self.onlyBinaryUpgrades) {
      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
      failed = failed || upgradeLosesBinary;
    }
    if (failed) return;

    debug('probe transport "%s" opened', name);
    transport.send([{ type: 'ping', data: 'probe' }]);
    transport.once('packet', function (msg) {
      if (failed) return;
      if ('pong' === msg.type && 'probe' === msg.data) {
        debug('probe transport "%s" pong', name);
        self.upgrading = true;
        self.emit('upgrading', transport);
        if (!transport) return;
        Socket.priorWebsocketSuccess = 'websocket' === transport.name;

        debug('pausing current transport "%s"', self.transport.name);
        self.transport.pause(function () {
          if (failed) return;
          if ('closed' === self.readyState) return;
          debug('changing transport and sending upgrade packet');

          cleanup();

          self.setTransport(transport);
          transport.send([{ type: 'upgrade' }]);
          self.emit('upgrade', transport);
          transport = null;
          self.upgrading = false;
          self.flush();
        });
      } else {
        debug('probe transport "%s" failed', name);
        var err = new Error('probe error');
        err.transport = transport.name;
        self.emit('upgradeError', err);
      }
    });
  }

  function freezeTransport () {
    if (failed) return;

    // Any callback called by transport should be ignored since now
    failed = true;

    cleanup();

    transport.close();
    transport = null;
  }

  // Handle any error that happens while probing
  function onerror (err) {
    var error = new Error('probe error: ' + err);
    error.transport = transport.name;

    freezeTransport();

    debug('probe transport "%s" failed because of error: %s', name, err);

    self.emit('upgradeError', error);
  }

  function onTransportClose () {
    onerror('transport closed');
  }

  // When the socket is closed while we're probing
  function onclose () {
    onerror('socket closed');
  }

  // When the socket is upgraded while we're probing
  function onupgrade (to) {
    if (transport && to.name !== transport.name) {
      debug('"%s" works - aborting "%s"', to.name, transport.name);
      freezeTransport();
    }
  }

  // Remove all listeners on the transport and on self
  function cleanup () {
    transport.removeListener('open', onTransportOpen);
    transport.removeListener('error', onerror);
    transport.removeListener('close', onTransportClose);
    self.removeListener('close', onclose);
    self.removeListener('upgrading', onupgrade);
  }

  transport.once('open', onTransportOpen);
  transport.once('error', onerror);
  transport.once('close', onTransportClose);

  this.once('close', onclose);
  this.once('upgrading', onupgrade);

  transport.open();
};

/**
 * Called when connection is deemed open.
 *
 * @api public
 */

Socket.prototype.onOpen = function () {
  debug('socket open');
  this.readyState = 'open';
  Socket.priorWebsocketSuccess = 'websocket' === this.transport.name;
  this.emit('open');
  this.flush();

  // we check for `readyState` in case an `open`
  // listener already closed the socket
  if ('open' === this.readyState && this.upgrade && this.transport.pause) {
    debug('starting upgrade probes');
    for (var i = 0, l = this.upgrades.length; i < l; i++) {
      this.probe(this.upgrades[i]);
    }
  }
};

/**
 * Handles a packet.
 *
 * @api private
 */

Socket.prototype.onPacket = function (packet) {
  if ('opening' === this.readyState || 'open' === this.readyState ||
      'closing' === this.readyState) {
    debug('socket receive: type "%s", data "%s"', packet.type, packet.data);

    this.emit('packet', packet);

    // Socket is live - any packet counts
    this.emit('heartbeat');

    switch (packet.type) {
      case 'open':
        this.onHandshake(parsejson(packet.data));
        break;

      case 'pong':
        this.setPing();
        this.emit('pong');
        break;

      case 'error':
        var err = new Error('server error');
        err.code = packet.data;
        this.onError(err);
        break;

      case 'message':
        this.emit('data', packet.data);
        this.emit('message', packet.data);
        break;
    }
  } else {
    debug('packet received with socket readyState "%s"', this.readyState);
  }
};

/**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */

Socket.prototype.onHandshake = function (data) {
  this.emit('handshake', data);
  this.id = data.sid;
  this.transport.query.sid = data.sid;
  this.upgrades = this.filterUpgrades(data.upgrades);
  this.pingInterval = data.pingInterval;
  this.pingTimeout = data.pingTimeout;
  this.onOpen();
  // In case open handler closes socket
  if ('closed' === this.readyState) return;
  this.setPing();

  // Prolong liveness of socket on heartbeat
  this.removeListener('heartbeat', this.onHeartbeat);
  this.on('heartbeat', this.onHeartbeat);
};

/**
 * Resets ping timeout.
 *
 * @api private
 */

Socket.prototype.onHeartbeat = function (timeout) {
  clearTimeout(this.pingTimeoutTimer);
  var self = this;
  self.pingTimeoutTimer = setTimeout(function () {
    if ('closed' === self.readyState) return;
    self.onClose('ping timeout');
  }, timeout || (self.pingInterval + self.pingTimeout));
};

/**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */

Socket.prototype.setPing = function () {
  var self = this;
  clearTimeout(self.pingIntervalTimer);
  self.pingIntervalTimer = setTimeout(function () {
    debug('writing ping packet - expecting pong within %sms', self.pingTimeout);
    self.ping();
    self.onHeartbeat(self.pingTimeout);
  }, self.pingInterval);
};

/**
* Sends a ping packet.
*
* @api private
*/

Socket.prototype.ping = function () {
  var self = this;
  this.sendPacket('ping', function () {
    self.emit('ping');
  });
};

/**
 * Called on `drain` event
 *
 * @api private
 */

Socket.prototype.onDrain = function () {
  this.writeBuffer.splice(0, this.prevBufferLen);

  // setting prevBufferLen = 0 is very important
  // for example, when upgrading, upgrade packet is sent over,
  // and a nonzero prevBufferLen could cause problems on `drain`
  this.prevBufferLen = 0;

  if (0 === this.writeBuffer.length) {
    this.emit('drain');
  } else {
    this.flush();
  }
};

/**
 * Flush write buffers.
 *
 * @api private
 */

Socket.prototype.flush = function () {
  if ('closed' !== this.readyState && this.transport.writable &&
    !this.upgrading && this.writeBuffer.length) {
    debug('flushing %d packets in socket', this.writeBuffer.length);
    this.transport.send(this.writeBuffer);
    // keep track of current length of writeBuffer
    // splice writeBuffer and callbackBuffer on `drain`
    this.prevBufferLen = this.writeBuffer.length;
    this.emit('flush');
  }
};

/**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */

Socket.prototype.write =
Socket.prototype.send = function (msg, options, fn) {
  this.sendPacket('message', msg, options, fn);
  return this;
};

/**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */

Socket.prototype.sendPacket = function (type, data, options, fn) {
  if ('function' === typeof data) {
    fn = data;
    data = undefined;
  }

  if ('function' === typeof options) {
    fn = options;
    options = null;
  }

  if ('closing' === this.readyState || 'closed' === this.readyState) {
    return;
  }

  options = options || {};
  options.compress = false !== options.compress;

  var packet = {
    type: type,
    data: data,
    options: options
  };
  this.emit('packetCreate', packet);
  this.writeBuffer.push(packet);
  if (fn) this.once('flush', fn);
  this.flush();
};

/**
 * Closes the connection.
 *
 * @api private
 */

Socket.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.readyState = 'closing';

    var self = this;

    if (this.writeBuffer.length) {
      this.once('drain', function () {
        if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      });
    } else if (this.upgrading) {
      waitForUpgrade();
    } else {
      close();
    }
  }

  function close () {
    self.onClose('forced close');
    debug('socket closing - telling transport to close');
    self.transport.close();
  }

  function cleanupAndClose () {
    self.removeListener('upgrade', cleanupAndClose);
    self.removeListener('upgradeError', cleanupAndClose);
    close();
  }

  function waitForUpgrade () {
    // wait for upgrade to finish since we can't send packets while pausing a transport
    self.once('upgrade', cleanupAndClose);
    self.once('upgradeError', cleanupAndClose);
  }

  return this;
};

/**
 * Called upon transport error
 *
 * @api private
 */

Socket.prototype.onError = function (err) {
  debug('socket error %j', err);
  Socket.priorWebsocketSuccess = false;
  this.emit('error', err);
  this.onClose('transport error', err);
};

/**
 * Called upon transport close.
 *
 * @api private
 */

Socket.prototype.onClose = function (reason, desc) {
  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
    debug('socket close with reason: "%s"', reason);
    var self = this;

    // clear timers
    clearTimeout(this.pingIntervalTimer);
    clearTimeout(this.pingTimeoutTimer);

    // stop event from firing again for transport
    this.transport.removeAllListeners('close');

    // ensure transport won't stay open
    this.transport.close();

    // ignore further transport communication
    this.transport.removeAllListeners();

    // set ready state
    this.readyState = 'closed';

    // clear session id
    this.id = null;

    // emit close event
    this.emit('close', reason, desc);

    // clean buffers after, so users can still
    // grab the buffers on `close` event
    self.writeBuffer = [];
    self.prevBufferLen = 0;
  }
};

/**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */

Socket.prototype.filterUpgrades = function (upgrades) {
  var filteredUpgrades = [];
  for (var i = 0, j = upgrades.length; i < j; i++) {
    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
  }
  return filteredUpgrades;
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./transport":36,"./transports/index":37,"component-emitter":30,"debug":31,"engine.io-parser":13,"indexof":17,"parsejson":21,"parseqs":22,"parseuri":23}],36:[function(require,module,exports){
/**
 * Module dependencies.
 */

var parser = require('engine.io-parser');
var Emitter = require('component-emitter');

/**
 * Module exports.
 */

module.exports = Transport;

/**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */

function Transport (opts) {
  this.path = opts.path;
  this.hostname = opts.hostname;
  this.port = opts.port;
  this.secure = opts.secure;
  this.query = opts.query;
  this.timestampParam = opts.timestampParam;
  this.timestampRequests = opts.timestampRequests;
  this.readyState = '';
  this.agent = opts.agent || false;
  this.socket = opts.socket;
  this.enablesXDR = opts.enablesXDR;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;
  this.forceNode = opts.forceNode;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;
  this.localAddress = opts.localAddress;
}

/**
 * Mix in `Emitter`.
 */

Emitter(Transport.prototype);

/**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */

Transport.prototype.onError = function (msg, desc) {
  var err = new Error(msg);
  err.type = 'TransportError';
  err.description = desc;
  this.emit('error', err);
  return this;
};

/**
 * Opens the transport.
 *
 * @api public
 */

Transport.prototype.open = function () {
  if ('closed' === this.readyState || '' === this.readyState) {
    this.readyState = 'opening';
    this.doOpen();
  }

  return this;
};

/**
 * Closes the transport.
 *
 * @api private
 */

Transport.prototype.close = function () {
  if ('opening' === this.readyState || 'open' === this.readyState) {
    this.doClose();
    this.onClose();
  }

  return this;
};

/**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */

Transport.prototype.send = function (packets) {
  if ('open' === this.readyState) {
    this.write(packets);
  } else {
    throw new Error('Transport not open');
  }
};

/**
 * Called upon open
 *
 * @api private
 */

Transport.prototype.onOpen = function () {
  this.readyState = 'open';
  this.writable = true;
  this.emit('open');
};

/**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */

Transport.prototype.onData = function (data) {
  var packet = parser.decodePacket(data, this.socket.binaryType);
  this.onPacket(packet);
};

/**
 * Called with a decoded packet.
 */

Transport.prototype.onPacket = function (packet) {
  this.emit('packet', packet);
};

/**
 * Called upon close.
 *
 * @api private
 */

Transport.prototype.onClose = function () {
  this.readyState = 'closed';
  this.emit('close');
};

},{"component-emitter":30,"engine.io-parser":13}],37:[function(require,module,exports){
(function (global){
/**
 * Module dependencies
 */

var XMLHttpRequest = require('xmlhttprequest-ssl');
var XHR = require('./polling-xhr');
var JSONP = require('./polling-jsonp');
var websocket = require('./websocket');

/**
 * Export transports.
 */

exports.polling = polling;
exports.websocket = websocket;

/**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */

function polling (opts) {
  var xhr;
  var xd = false;
  var xs = false;
  var jsonp = false !== opts.jsonp;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    xd = opts.hostname !== location.hostname || port !== opts.port;
    xs = opts.secure !== isSSL;
  }

  opts.xdomain = xd;
  opts.xscheme = xs;
  xhr = new XMLHttpRequest(opts);

  if ('open' in xhr && !opts.forceJSONP) {
    return new XHR(opts);
  } else {
    if (!jsonp) throw new Error('JSONP disabled');
    return new JSONP(opts);
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling-jsonp":38,"./polling-xhr":39,"./websocket":41,"xmlhttprequest-ssl":42}],38:[function(require,module,exports){
(function (global){

/**
 * Module requirements.
 */

var Polling = require('./polling');
var inherit = require('component-inherit');

/**
 * Module exports.
 */

module.exports = JSONPPolling;

/**
 * Cached regular expressions.
 */

var rNewline = /\n/g;
var rEscapedNewline = /\\n/g;

/**
 * Global JSONP callbacks.
 */

var callbacks;

/**
 * Noop.
 */

function empty () { }

/**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */

function JSONPPolling (opts) {
  Polling.call(this, opts);

  this.query = this.query || {};

  // define global callbacks array if not present
  // we do this here (lazily) to avoid unneeded global pollution
  if (!callbacks) {
    // we need to consider multiple engines in the same page
    if (!global.___eio) global.___eio = [];
    callbacks = global.___eio;
  }

  // callback identifier
  this.index = callbacks.length;

  // add callback to jsonp global
  var self = this;
  callbacks.push(function (msg) {
    self.onData(msg);
  });

  // append to query string
  this.query.j = this.index;

  // prevent spurious errors from being emitted when the window is unloaded
  if (global.document && global.addEventListener) {
    global.addEventListener('beforeunload', function () {
      if (self.script) self.script.onerror = empty;
    }, false);
  }
}

/**
 * Inherits from Polling.
 */

inherit(JSONPPolling, Polling);

/*
 * JSONP only supports binary as base64 encoded strings
 */

JSONPPolling.prototype.supportsBinary = false;

/**
 * Closes the socket.
 *
 * @api private
 */

JSONPPolling.prototype.doClose = function () {
  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  if (this.form) {
    this.form.parentNode.removeChild(this.form);
    this.form = null;
    this.iframe = null;
  }

  Polling.prototype.doClose.call(this);
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

JSONPPolling.prototype.doPoll = function () {
  var self = this;
  var script = document.createElement('script');

  if (this.script) {
    this.script.parentNode.removeChild(this.script);
    this.script = null;
  }

  script.async = true;
  script.src = this.uri();
  script.onerror = function (e) {
    self.onError('jsonp poll error', e);
  };

  var insertAt = document.getElementsByTagName('script')[0];
  if (insertAt) {
    insertAt.parentNode.insertBefore(script, insertAt);
  } else {
    (document.head || document.body).appendChild(script);
  }
  this.script = script;

  var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

  if (isUAgecko) {
    setTimeout(function () {
      var iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      document.body.removeChild(iframe);
    }, 100);
  }
};

/**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */

JSONPPolling.prototype.doWrite = function (data, fn) {
  var self = this;

  if (!this.form) {
    var form = document.createElement('form');
    var area = document.createElement('textarea');
    var id = this.iframeId = 'eio_iframe_' + this.index;
    var iframe;

    form.className = 'socketio';
    form.style.position = 'absolute';
    form.style.top = '-1000px';
    form.style.left = '-1000px';
    form.target = id;
    form.method = 'POST';
    form.setAttribute('accept-charset', 'utf-8');
    area.name = 'd';
    form.appendChild(area);
    document.body.appendChild(form);

    this.form = form;
    this.area = area;
  }

  this.form.action = this.uri();

  function complete () {
    initIframe();
    fn();
  }

  function initIframe () {
    if (self.iframe) {
      try {
        self.form.removeChild(self.iframe);
      } catch (e) {
        self.onError('jsonp polling iframe removal error', e);
      }
    }

    try {
      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
      var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
      iframe = document.createElement(html);
    } catch (e) {
      iframe = document.createElement('iframe');
      iframe.name = self.iframeId;
      iframe.src = 'javascript:0';
    }

    iframe.id = self.iframeId;

    self.form.appendChild(iframe);
    self.iframe = iframe;
  }

  initIframe();

  // escape \n to prevent it from being converted into \r\n by some UAs
  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
  data = data.replace(rEscapedNewline, '\\\n');
  this.area.value = data.replace(rNewline, '\\n');

  try {
    this.form.submit();
  } catch (e) {}

  if (this.iframe.attachEvent) {
    this.iframe.onreadystatechange = function () {
      if (self.iframe.readyState === 'complete') {
        complete();
      }
    };
  } else {
    this.iframe.onload = complete;
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":40,"component-inherit":10}],39:[function(require,module,exports){
(function (global){
/**
 * Module requirements.
 */

var XMLHttpRequest = require('xmlhttprequest-ssl');
var Polling = require('./polling');
var Emitter = require('component-emitter');
var inherit = require('component-inherit');
var debug = require('debug')('engine.io-client:polling-xhr');

/**
 * Module exports.
 */

module.exports = XHR;
module.exports.Request = Request;

/**
 * Empty function
 */

function empty () {}

/**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */

function XHR (opts) {
  Polling.call(this, opts);
  this.requestTimeout = opts.requestTimeout;

  if (global.location) {
    var isSSL = 'https:' === location.protocol;
    var port = location.port;

    // some user agents have empty `location.port`
    if (!port) {
      port = isSSL ? 443 : 80;
    }

    this.xd = opts.hostname !== global.location.hostname ||
      port !== opts.port;
    this.xs = opts.secure !== isSSL;
  } else {
    this.extraHeaders = opts.extraHeaders;
  }
}

/**
 * Inherits from Polling.
 */

inherit(XHR, Polling);

/**
 * XHR supports binary
 */

XHR.prototype.supportsBinary = true;

/**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */

XHR.prototype.request = function (opts) {
  opts = opts || {};
  opts.uri = this.uri();
  opts.xd = this.xd;
  opts.xs = this.xs;
  opts.agent = this.agent || false;
  opts.supportsBinary = this.supportsBinary;
  opts.enablesXDR = this.enablesXDR;

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  opts.requestTimeout = this.requestTimeout;

  // other options for Node.js client
  opts.extraHeaders = this.extraHeaders;

  return new Request(opts);
};

/**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */

XHR.prototype.doWrite = function (data, fn) {
  var isBinary = typeof data !== 'string' && data !== undefined;
  var req = this.request({ method: 'POST', data: data, isBinary: isBinary });
  var self = this;
  req.on('success', fn);
  req.on('error', function (err) {
    self.onError('xhr post error', err);
  });
  this.sendXhr = req;
};

/**
 * Starts a poll cycle.
 *
 * @api private
 */

XHR.prototype.doPoll = function () {
  debug('xhr poll');
  var req = this.request();
  var self = this;
  req.on('data', function (data) {
    self.onData(data);
  });
  req.on('error', function (err) {
    self.onError('xhr poll error', err);
  });
  this.pollXhr = req;
};

/**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */

function Request (opts) {
  this.method = opts.method || 'GET';
  this.uri = opts.uri;
  this.xd = !!opts.xd;
  this.xs = !!opts.xs;
  this.async = false !== opts.async;
  this.data = undefined !== opts.data ? opts.data : null;
  this.agent = opts.agent;
  this.isBinary = opts.isBinary;
  this.supportsBinary = opts.supportsBinary;
  this.enablesXDR = opts.enablesXDR;
  this.requestTimeout = opts.requestTimeout;

  // SSL options for Node.js client
  this.pfx = opts.pfx;
  this.key = opts.key;
  this.passphrase = opts.passphrase;
  this.cert = opts.cert;
  this.ca = opts.ca;
  this.ciphers = opts.ciphers;
  this.rejectUnauthorized = opts.rejectUnauthorized;

  // other options for Node.js client
  this.extraHeaders = opts.extraHeaders;

  this.create();
}

/**
 * Mix in `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */

Request.prototype.create = function () {
  var opts = { agent: this.agent, xdomain: this.xd, xscheme: this.xs, enablesXDR: this.enablesXDR };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;

  var xhr = this.xhr = new XMLHttpRequest(opts);
  var self = this;

  try {
    debug('xhr open %s: %s', this.method, this.uri);
    xhr.open(this.method, this.uri, this.async);
    try {
      if (this.extraHeaders) {
        xhr.setDisableHeaderCheck(true);
        for (var i in this.extraHeaders) {
          if (this.extraHeaders.hasOwnProperty(i)) {
            xhr.setRequestHeader(i, this.extraHeaders[i]);
          }
        }
      }
    } catch (e) {}
    if (this.supportsBinary) {
      // This has to be done after open because Firefox is stupid
      // http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
      xhr.responseType = 'arraybuffer';
    }

    if ('POST' === this.method) {
      try {
        if (this.isBinary) {
          xhr.setRequestHeader('Content-type', 'application/octet-stream');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain;charset=UTF-8');
        }
      } catch (e) {}
    }

    try {
      xhr.setRequestHeader('Accept', '*/*');
    } catch (e) {}

    // ie6 check
    if ('withCredentials' in xhr) {
      xhr.withCredentials = true;
    }

    if (this.requestTimeout) {
      xhr.timeout = this.requestTimeout;
    }

    if (this.hasXDR()) {
      xhr.onload = function () {
        self.onLoad();
      };
      xhr.onerror = function () {
        self.onError(xhr.responseText);
      };
    } else {
      xhr.onreadystatechange = function () {
        if (4 !== xhr.readyState) return;
        if (200 === xhr.status || 1223 === xhr.status) {
          self.onLoad();
        } else {
          // make sure the `error` event handler that's user-set
          // does not throw in the same tick and gets caught here
          setTimeout(function () {
            self.onError(xhr.status);
          }, 0);
        }
      };
    }

    debug('xhr data %s', this.data);
    xhr.send(this.data);
  } catch (e) {
    // Need to defer since .create() is called directly fhrom the constructor
    // and thus the 'error' event can only be only bound *after* this exception
    // occurs.  Therefore, also, we cannot throw here at all.
    setTimeout(function () {
      self.onError(e);
    }, 0);
    return;
  }

  if (global.document) {
    this.index = Request.requestsCount++;
    Request.requests[this.index] = this;
  }
};

/**
 * Called upon successful response.
 *
 * @api private
 */

Request.prototype.onSuccess = function () {
  this.emit('success');
  this.cleanup();
};

/**
 * Called if we have data.
 *
 * @api private
 */

Request.prototype.onData = function (data) {
  this.emit('data', data);
  this.onSuccess();
};

/**
 * Called upon error.
 *
 * @api private
 */

Request.prototype.onError = function (err) {
  this.emit('error', err);
  this.cleanup(true);
};

/**
 * Cleans up house.
 *
 * @api private
 */

Request.prototype.cleanup = function (fromError) {
  if ('undefined' === typeof this.xhr || null === this.xhr) {
    return;
  }
  // xmlhttprequest
  if (this.hasXDR()) {
    this.xhr.onload = this.xhr.onerror = empty;
  } else {
    this.xhr.onreadystatechange = empty;
  }

  if (fromError) {
    try {
      this.xhr.abort();
    } catch (e) {}
  }

  if (global.document) {
    delete Request.requests[this.index];
  }

  this.xhr = null;
};

/**
 * Called upon load.
 *
 * @api private
 */

Request.prototype.onLoad = function () {
  var data;
  try {
    var contentType;
    try {
      contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];
    } catch (e) {}
    if (contentType === 'application/octet-stream') {
      data = this.xhr.response || this.xhr.responseText;
    } else {
      if (!this.supportsBinary) {
        data = this.xhr.responseText;
      } else {
        try {
          data = String.fromCharCode.apply(null, new Uint8Array(this.xhr.response));
        } catch (e) {
          var ui8Arr = new Uint8Array(this.xhr.response);
          var dataArray = [];
          for (var idx = 0, length = ui8Arr.length; idx < length; idx++) {
            dataArray.push(ui8Arr[idx]);
          }

          data = String.fromCharCode.apply(null, dataArray);
        }
      }
    }
  } catch (e) {
    this.onError(e);
  }
  if (null != data) {
    this.onData(data);
  }
};

/**
 * Check if it has XDomainRequest.
 *
 * @api private
 */

Request.prototype.hasXDR = function () {
  return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;
};

/**
 * Aborts the request.
 *
 * @api public
 */

Request.prototype.abort = function () {
  this.cleanup();
};

/**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */

Request.requestsCount = 0;
Request.requests = {};

if (global.document) {
  if (global.attachEvent) {
    global.attachEvent('onunload', unloadHandler);
  } else if (global.addEventListener) {
    global.addEventListener('beforeunload', unloadHandler, false);
  }
}

function unloadHandler () {
  for (var i in Request.requests) {
    if (Request.requests.hasOwnProperty(i)) {
      Request.requests[i].abort();
    }
  }
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./polling":40,"component-emitter":30,"component-inherit":10,"debug":31,"xmlhttprequest-ssl":42}],40:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parseqs = require('parseqs');
var parser = require('engine.io-parser');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:polling');

/**
 * Module exports.
 */

module.exports = Polling;

/**
 * Is XHR2 supported?
 */

var hasXHR2 = (function () {
  var XMLHttpRequest = require('xmlhttprequest-ssl');
  var xhr = new XMLHttpRequest({ xdomain: false });
  return null != xhr.responseType;
})();

/**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */

function Polling (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (!hasXHR2 || forceBase64) {
    this.supportsBinary = false;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(Polling, Transport);

/**
 * Transport name.
 */

Polling.prototype.name = 'polling';

/**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */

Polling.prototype.doOpen = function () {
  this.poll();
};

/**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */

Polling.prototype.pause = function (onPause) {
  var self = this;

  this.readyState = 'pausing';

  function pause () {
    debug('paused');
    self.readyState = 'paused';
    onPause();
  }

  if (this.polling || !this.writable) {
    var total = 0;

    if (this.polling) {
      debug('we are currently polling - waiting to pause');
      total++;
      this.once('pollComplete', function () {
        debug('pre-pause polling complete');
        --total || pause();
      });
    }

    if (!this.writable) {
      debug('we are currently writing - waiting to pause');
      total++;
      this.once('drain', function () {
        debug('pre-pause writing complete');
        --total || pause();
      });
    }
  } else {
    pause();
  }
};

/**
 * Starts polling cycle.
 *
 * @api public
 */

Polling.prototype.poll = function () {
  debug('polling');
  this.polling = true;
  this.doPoll();
  this.emit('poll');
};

/**
 * Overloads onData to detect payloads.
 *
 * @api private
 */

Polling.prototype.onData = function (data) {
  var self = this;
  debug('polling got data %s', data);
  var callback = function (packet, index, total) {
    // if its the first message we consider the transport open
    if ('opening' === self.readyState) {
      self.onOpen();
    }

    // if its a close packet, we close the ongoing requests
    if ('close' === packet.type) {
      self.onClose();
      return false;
    }

    // otherwise bypass onData and handle the message
    self.onPacket(packet);
  };

  // decode payload
  parser.decodePayload(data, this.socket.binaryType, callback);

  // if an event did not trigger closing
  if ('closed' !== this.readyState) {
    // if we got data we're not polling
    this.polling = false;
    this.emit('pollComplete');

    if ('open' === this.readyState) {
      this.poll();
    } else {
      debug('ignoring poll - transport state "%s"', this.readyState);
    }
  }
};

/**
 * For polling, send a close packet.
 *
 * @api private
 */

Polling.prototype.doClose = function () {
  var self = this;

  function close () {
    debug('writing close packet');
    self.write([{ type: 'close' }]);
  }

  if ('open' === this.readyState) {
    debug('transport open - closing');
    close();
  } else {
    // in case we're trying to close while
    // handshaking is in progress (GH-164)
    debug('transport not open - deferring close');
    this.once('open', close);
  }
};

/**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */

Polling.prototype.write = function (packets) {
  var self = this;
  this.writable = false;
  var callbackfn = function () {
    self.writable = true;
    self.emit('drain');
  };

  parser.encodePayload(packets, this.supportsBinary, function (data) {
    self.doWrite(data, callbackfn);
  });
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

Polling.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'https' : 'http';
  var port = '';

  // cache busting is forced
  if (false !== this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  if (!this.supportsBinary && !query.sid) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // avoid port if default for schema
  if (this.port && (('https' === schema && Number(this.port) !== 443) ||
     ('http' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

},{"../transport":36,"component-inherit":10,"debug":31,"engine.io-parser":13,"parseqs":22,"xmlhttprequest-ssl":42,"yeast":50}],41:[function(require,module,exports){
(function (global){
/**
 * Module dependencies.
 */

var Transport = require('../transport');
var parser = require('engine.io-parser');
var parseqs = require('parseqs');
var inherit = require('component-inherit');
var yeast = require('yeast');
var debug = require('debug')('engine.io-client:websocket');
var BrowserWebSocket = global.WebSocket || global.MozWebSocket;
var NodeWebSocket;
if (typeof window === 'undefined') {
  try {
    NodeWebSocket = require('ws');
  } catch (e) { }
}

/**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or try to resolve WebSocket-compatible
 * interface exposed by `ws` for Node-like environment.
 */

var WebSocket = BrowserWebSocket;
if (!WebSocket && typeof window === 'undefined') {
  WebSocket = NodeWebSocket;
}

/**
 * Module exports.
 */

module.exports = WS;

/**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */

function WS (opts) {
  var forceBase64 = (opts && opts.forceBase64);
  if (forceBase64) {
    this.supportsBinary = false;
  }
  this.perMessageDeflate = opts.perMessageDeflate;
  this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
  if (!this.usingBrowserWebSocket) {
    WebSocket = NodeWebSocket;
  }
  Transport.call(this, opts);
}

/**
 * Inherits from Transport.
 */

inherit(WS, Transport);

/**
 * Transport name.
 *
 * @api public
 */

WS.prototype.name = 'websocket';

/*
 * WebSockets support binary
 */

WS.prototype.supportsBinary = true;

/**
 * Opens socket.
 *
 * @api private
 */

WS.prototype.doOpen = function () {
  if (!this.check()) {
    // let probe timeout
    return;
  }

  var uri = this.uri();
  var protocols = void (0);
  var opts = {
    agent: this.agent,
    perMessageDeflate: this.perMessageDeflate
  };

  // SSL options for Node.js client
  opts.pfx = this.pfx;
  opts.key = this.key;
  opts.passphrase = this.passphrase;
  opts.cert = this.cert;
  opts.ca = this.ca;
  opts.ciphers = this.ciphers;
  opts.rejectUnauthorized = this.rejectUnauthorized;
  if (this.extraHeaders) {
    opts.headers = this.extraHeaders;
  }
  if (this.localAddress) {
    opts.localAddress = this.localAddress;
  }

  try {
    this.ws = this.usingBrowserWebSocket ? new WebSocket(uri) : new WebSocket(uri, protocols, opts);
  } catch (err) {
    return this.emit('error', err);
  }

  if (this.ws.binaryType === undefined) {
    this.supportsBinary = false;
  }

  if (this.ws.supports && this.ws.supports.binary) {
    this.supportsBinary = true;
    this.ws.binaryType = 'nodebuffer';
  } else {
    this.ws.binaryType = 'arraybuffer';
  }

  this.addEventListeners();
};

/**
 * Adds event listeners to the socket
 *
 * @api private
 */

WS.prototype.addEventListeners = function () {
  var self = this;

  this.ws.onopen = function () {
    self.onOpen();
  };
  this.ws.onclose = function () {
    self.onClose();
  };
  this.ws.onmessage = function (ev) {
    self.onData(ev.data);
  };
  this.ws.onerror = function (e) {
    self.onError('websocket error', e);
  };
};

/**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */

WS.prototype.write = function (packets) {
  var self = this;
  this.writable = false;

  // encodePacket efficient as it uses WS framing
  // no need for encodePayload
  var total = packets.length;
  for (var i = 0, l = total; i < l; i++) {
    (function (packet) {
      parser.encodePacket(packet, self.supportsBinary, function (data) {
        if (!self.usingBrowserWebSocket) {
          // always create a new object (GH-437)
          var opts = {};
          if (packet.options) {
            opts.compress = packet.options.compress;
          }

          if (self.perMessageDeflate) {
            var len = 'string' === typeof data ? global.Buffer.byteLength(data) : data.length;
            if (len < self.perMessageDeflate.threshold) {
              opts.compress = false;
            }
          }
        }

        // Sometimes the websocket has already been closed but the browser didn't
        // have a chance of informing us about it yet, in that case send will
        // throw an error
        try {
          if (self.usingBrowserWebSocket) {
            // TypeError is thrown when passing the second argument on Safari
            self.ws.send(data);
          } else {
            self.ws.send(data, opts);
          }
        } catch (e) {
          debug('websocket closed before onclose event');
        }

        --total || done();
      });
    })(packets[i]);
  }

  function done () {
    self.emit('flush');

    // fake drain
    // defer to next tick to allow Socket to clear writeBuffer
    setTimeout(function () {
      self.writable = true;
      self.emit('drain');
    }, 0);
  }
};

/**
 * Called upon close
 *
 * @api private
 */

WS.prototype.onClose = function () {
  Transport.prototype.onClose.call(this);
};

/**
 * Closes socket.
 *
 * @api private
 */

WS.prototype.doClose = function () {
  if (typeof this.ws !== 'undefined') {
    this.ws.close();
  }
};

/**
 * Generates uri for connection.
 *
 * @api private
 */

WS.prototype.uri = function () {
  var query = this.query || {};
  var schema = this.secure ? 'wss' : 'ws';
  var port = '';

  // avoid port if default for schema
  if (this.port && (('wss' === schema && Number(this.port) !== 443) ||
    ('ws' === schema && Number(this.port) !== 80))) {
    port = ':' + this.port;
  }

  // append timestamp to URI
  if (this.timestampRequests) {
    query[this.timestampParam] = yeast();
  }

  // communicate binary support capabilities
  if (!this.supportsBinary) {
    query.b64 = 1;
  }

  query = parseqs.encode(query);

  // prepend ? to query
  if (query.length) {
    query = '?' + query;
  }

  var ipv6 = this.hostname.indexOf(':') !== -1;
  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
};

/**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */

WS.prototype.check = function () {
  return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../transport":36,"component-inherit":10,"debug":31,"engine.io-parser":13,"parseqs":22,"ws":7,"yeast":50}],42:[function(require,module,exports){
(function (global){
// browser shim for xmlhttprequest module

var hasCORS = require('has-cors');

module.exports = function (opts) {
  var xdomain = opts.xdomain;

  // scheme must be same when usign XDomainRequest
  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
  var xscheme = opts.xscheme;

  // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
  // https://github.com/Automattic/engine.io-client/pull/217
  var enablesXDR = opts.enablesXDR;

  // XMLHttpRequest can be disabled on IE
  try {
    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) { }

  // Use XDomainRequest for IE8 if enablesXDR is true
  // because loading bar keeps flashing when using jsonp-polling
  // https://github.com/yujiosaka/socke.io-ie8-loading-example
  try {
    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
      return new XDomainRequest();
    }
  } catch (e) { }

  if (!xdomain) {
    try {
      return new global[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
    } catch (e) { }
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"has-cors":16}],43:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000
var m = s * 60
var h = m * 60
var d = h * 24
var y = d * 365.25

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function (val, options) {
  options = options || {}
  var type = typeof val
  if (type === 'string' && val.length > 0) {
    return parse(val)
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ?
			fmtLong(val) :
			fmtShort(val)
  }
  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val))
}

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str)
  if (str.length > 10000) {
    return
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str)
  if (!match) {
    return
  }
  var n = parseFloat(match[1])
  var type = (match[2] || 'ms').toLowerCase()
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y
    case 'days':
    case 'day':
    case 'd':
      return n * d
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n
    default:
      return undefined
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd'
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h'
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm'
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's'
  }
  return ms + 'ms'
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms'
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name
  }
  return Math.ceil(ms / n) + ' ' + name + 's'
}

},{}],44:[function(require,module,exports){
(function (global){
/*global Blob,File*/

/**
 * Module requirements
 */

var isArray = require('isarray');
var isBuf = require('./is-buffer');

/**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */

exports.deconstructPacket = function(packet){
  var buffers = [];
  var packetData = packet.data;

  function _deconstructPacket(data) {
    if (!data) return data;

    if (isBuf(data)) {
      var placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (isArray(data)) {
      var newData = new Array(data.length);
      for (var i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i]);
      }
      return newData;
    } else if ('object' == typeof data && !(data instanceof Date)) {
      var newData = {};
      for (var key in data) {
        newData[key] = _deconstructPacket(data[key]);
      }
      return newData;
    }
    return data;
  }

  var pack = packet;
  pack.data = _deconstructPacket(packetData);
  pack.attachments = buffers.length; // number of binary 'attachments'
  return {packet: pack, buffers: buffers};
};

/**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */

exports.reconstructPacket = function(packet, buffers) {
  var curPlaceHolder = 0;

  function _reconstructPacket(data) {
    if (data && data._placeholder) {
      var buf = buffers[data.num]; // appropriate buffer (should be natural order anyway)
      return buf;
    } else if (isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i]);
      }
      return data;
    } else if (data && 'object' == typeof data) {
      for (var key in data) {
        data[key] = _reconstructPacket(data[key]);
      }
      return data;
    }
    return data;
  }

  packet.data = _reconstructPacket(packet.data);
  packet.attachments = undefined; // no longer useful
  return packet;
};

/**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */

exports.removeBlobs = function(data, callback) {
  function _removeBlobs(obj, curKey, containingObject) {
    if (!obj) return obj;

    // convert any blob
    if ((global.Blob && obj instanceof Blob) ||
        (global.File && obj instanceof File)) {
      pendingBlobs++;

      // async filereader
      var fileReader = new FileReader();
      fileReader.onload = function() { // this.result == arraybuffer
        if (containingObject) {
          containingObject[curKey] = this.result;
        }
        else {
          bloblessData = this.result;
        }

        // if nothing pending its callback time
        if(! --pendingBlobs) {
          callback(bloblessData);
        }
      };

      fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
    } else if (isArray(obj)) { // handle array
      for (var i = 0; i < obj.length; i++) {
        _removeBlobs(obj[i], i, obj);
      }
    } else if (obj && 'object' == typeof obj && !isBuf(obj)) { // and object
      for (var key in obj) {
        _removeBlobs(obj[key], key, obj);
      }
    }
  }

  var pendingBlobs = 0;
  var bloblessData = data;
  _removeBlobs(bloblessData);
  if (!pendingBlobs) {
    callback(bloblessData);
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./is-buffer":46,"isarray":18}],45:[function(require,module,exports){

/**
 * Module dependencies.
 */

var debug = require('debug')('socket.io-parser');
var json = require('json3');
var Emitter = require('component-emitter');
var binary = require('./binary');
var isBuf = require('./is-buffer');

/**
 * Protocol version.
 *
 * @api public
 */

exports.protocol = 4;

/**
 * Packet types.
 *
 * @api public
 */

exports.types = [
  'CONNECT',
  'DISCONNECT',
  'EVENT',
  'ACK',
  'ERROR',
  'BINARY_EVENT',
  'BINARY_ACK'
];

/**
 * Packet type `connect`.
 *
 * @api public
 */

exports.CONNECT = 0;

/**
 * Packet type `disconnect`.
 *
 * @api public
 */

exports.DISCONNECT = 1;

/**
 * Packet type `event`.
 *
 * @api public
 */

exports.EVENT = 2;

/**
 * Packet type `ack`.
 *
 * @api public
 */

exports.ACK = 3;

/**
 * Packet type `error`.
 *
 * @api public
 */

exports.ERROR = 4;

/**
 * Packet type 'binary event'
 *
 * @api public
 */

exports.BINARY_EVENT = 5;

/**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */

exports.BINARY_ACK = 6;

/**
 * Encoder constructor.
 *
 * @api public
 */

exports.Encoder = Encoder;

/**
 * Decoder constructor.
 *
 * @api public
 */

exports.Decoder = Decoder;

/**
 * A socket.io Encoder instance
 *
 * @api public
 */

function Encoder() {}

/**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */

Encoder.prototype.encode = function(obj, callback){
  debug('encoding packet %j', obj);

  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    encodeAsBinary(obj, callback);
  }
  else {
    var encoding = encodeAsString(obj);
    callback([encoding]);
  }
};

/**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */

function encodeAsString(obj) {
  var str = '';
  var nsp = false;

  // first is type
  str += obj.type;

  // attachments if we have them
  if (exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type) {
    str += obj.attachments;
    str += '-';
  }

  // if we have a namespace other than `/`
  // we append it followed by a comma `,`
  if (obj.nsp && '/' != obj.nsp) {
    nsp = true;
    str += obj.nsp;
  }

  // immediately followed by the id
  if (null != obj.id) {
    if (nsp) {
      str += ',';
      nsp = false;
    }
    str += obj.id;
  }

  // json data
  if (null != obj.data) {
    if (nsp) str += ',';
    str += json.stringify(obj.data);
  }

  debug('encoded %j as %s', obj, str);
  return str;
}

/**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */

function encodeAsBinary(obj, callback) {

  function writeEncoding(bloblessData) {
    var deconstruction = binary.deconstructPacket(bloblessData);
    var pack = encodeAsString(deconstruction.packet);
    var buffers = deconstruction.buffers;

    buffers.unshift(pack); // add packet info to beginning of data list
    callback(buffers); // write all the buffers
  }

  binary.removeBlobs(obj, writeEncoding);
}

/**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */

function Decoder() {
  this.reconstructor = null;
}

/**
 * Mix in `Emitter` with Decoder.
 */

Emitter(Decoder.prototype);

/**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */

Decoder.prototype.add = function(obj) {
  var packet;
  if ('string' == typeof obj) {
    packet = decodeString(obj);
    if (exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type) { // binary packet's json
      this.reconstructor = new BinaryReconstructor(packet);

      // no attachments, labeled binary but no binary data to follow
      if (this.reconstructor.reconPack.attachments === 0) {
        this.emit('decoded', packet);
      }
    } else { // non-binary full packet
      this.emit('decoded', packet);
    }
  }
  else if (isBuf(obj) || obj.base64) { // raw binary data
    if (!this.reconstructor) {
      throw new Error('got binary data when not reconstructing a packet');
    } else {
      packet = this.reconstructor.takeBinaryData(obj);
      if (packet) { // received final buffer
        this.reconstructor = null;
        this.emit('decoded', packet);
      }
    }
  }
  else {
    throw new Error('Unknown type: ' + obj);
  }
};

/**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */

function decodeString(str) {
  var p = {};
  var i = 0;

  // look up type
  p.type = Number(str.charAt(0));
  if (null == exports.types[p.type]) return error();

  // look up attachments if type binary
  if (exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type) {
    var buf = '';
    while (str.charAt(++i) != '-') {
      buf += str.charAt(i);
      if (i == str.length) break;
    }
    if (buf != Number(buf) || str.charAt(i) != '-') {
      throw new Error('Illegal attachments');
    }
    p.attachments = Number(buf);
  }

  // look up namespace (if any)
  if ('/' == str.charAt(i + 1)) {
    p.nsp = '';
    while (++i) {
      var c = str.charAt(i);
      if (',' == c) break;
      p.nsp += c;
      if (i == str.length) break;
    }
  } else {
    p.nsp = '/';
  }

  // look up id
  var next = str.charAt(i + 1);
  if ('' !== next && Number(next) == next) {
    p.id = '';
    while (++i) {
      var c = str.charAt(i);
      if (null == c || Number(c) != c) {
        --i;
        break;
      }
      p.id += str.charAt(i);
      if (i == str.length) break;
    }
    p.id = Number(p.id);
  }

  // look up json data
  if (str.charAt(++i)) {
    p = tryParse(p, str.substr(i));
  }

  debug('decoded %s as %j', str, p);
  return p;
}

function tryParse(p, str) {
  try {
    p.data = json.parse(str);
  } catch(e){
    return error();
  }
  return p; 
};

/**
 * Deallocates a parser's resources
 *
 * @api public
 */

Decoder.prototype.destroy = function() {
  if (this.reconstructor) {
    this.reconstructor.finishedReconstruction();
  }
};

/**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */

function BinaryReconstructor(packet) {
  this.reconPack = packet;
  this.buffers = [];
}

/**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */

BinaryReconstructor.prototype.takeBinaryData = function(binData) {
  this.buffers.push(binData);
  if (this.buffers.length == this.reconPack.attachments) { // done with buffer list
    var packet = binary.reconstructPacket(this.reconPack, this.buffers);
    this.finishedReconstruction();
    return packet;
  }
  return null;
};

/**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */

BinaryReconstructor.prototype.finishedReconstruction = function() {
  this.reconPack = null;
  this.buffers = [];
};

function error(data){
  return {
    type: exports.ERROR,
    data: 'parser error'
  };
}

},{"./binary":44,"./is-buffer":46,"component-emitter":9,"debug":11,"json3":19}],46:[function(require,module,exports){
(function (global){

module.exports = isBuf;

/**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */

function isBuf(obj) {
  return (global.Buffer && global.Buffer.isBuffer(obj)) ||
         (global.ArrayBuffer && obj instanceof ArrayBuffer);
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],47:[function(require,module,exports){
module.exports = toArray

function toArray(list, index) {
    var array = []

    index = index || 0

    for (var i = index || 0; i < list.length; i++) {
        array[i - index] = list[i]
    }

    return array
}

},{}],48:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var workerSources = {};
    resolveSources(skey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],49:[function(require,module,exports){
(function (global){
/*! https://mths.be/wtf8 v1.0.0 by @mathias */
;(function(root) {

	// Detect free variables `exports`
	var freeExports = typeof exports == 'object' && exports;

	// Detect free variable `module`
	var freeModule = typeof module == 'object' && module &&
		module.exports == freeExports && module;

	// Detect free variable `global`, from Node.js or Browserified code,
	// and use it as `root`
	var freeGlobal = typeof global == 'object' && global;
	if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
		root = freeGlobal;
	}

	/*--------------------------------------------------------------------------*/

	var stringFromCharCode = String.fromCharCode;

	// Taken from https://mths.be/punycode
	function ucs2decode(string) {
		var output = [];
		var counter = 0;
		var length = string.length;
		var value;
		var extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	// Taken from https://mths.be/punycode
	function ucs2encode(array) {
		var length = array.length;
		var index = -1;
		var value;
		var output = '';
		while (++index < length) {
			value = array[index];
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
		}
		return output;
	}

	/*--------------------------------------------------------------------------*/

	function createByte(codePoint, shift) {
		return stringFromCharCode(((codePoint >> shift) & 0x3F) | 0x80);
	}

	function encodeCodePoint(codePoint) {
		if ((codePoint & 0xFFFFFF80) == 0) { // 1-byte sequence
			return stringFromCharCode(codePoint);
		}
		var symbol = '';
		if ((codePoint & 0xFFFFF800) == 0) { // 2-byte sequence
			symbol = stringFromCharCode(((codePoint >> 6) & 0x1F) | 0xC0);
		}
		else if ((codePoint & 0xFFFF0000) == 0) { // 3-byte sequence
			symbol = stringFromCharCode(((codePoint >> 12) & 0x0F) | 0xE0);
			symbol += createByte(codePoint, 6);
		}
		else if ((codePoint & 0xFFE00000) == 0) { // 4-byte sequence
			symbol = stringFromCharCode(((codePoint >> 18) & 0x07) | 0xF0);
			symbol += createByte(codePoint, 12);
			symbol += createByte(codePoint, 6);
		}
		symbol += stringFromCharCode((codePoint & 0x3F) | 0x80);
		return symbol;
	}

	function wtf8encode(string) {
		var codePoints = ucs2decode(string);
		var length = codePoints.length;
		var index = -1;
		var codePoint;
		var byteString = '';
		while (++index < length) {
			codePoint = codePoints[index];
			byteString += encodeCodePoint(codePoint);
		}
		return byteString;
	}

	/*--------------------------------------------------------------------------*/

	function readContinuationByte() {
		if (byteIndex >= byteCount) {
			throw Error('Invalid byte index');
		}

		var continuationByte = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		if ((continuationByte & 0xC0) == 0x80) {
			return continuationByte & 0x3F;
		}

		// If we end up here, it’s not a continuation byte.
		throw Error('Invalid continuation byte');
	}

	function decodeSymbol() {
		var byte1;
		var byte2;
		var byte3;
		var byte4;
		var codePoint;

		if (byteIndex > byteCount) {
			throw Error('Invalid byte index');
		}

		if (byteIndex == byteCount) {
			return false;
		}

		// Read the first byte.
		byte1 = byteArray[byteIndex] & 0xFF;
		byteIndex++;

		// 1-byte sequence (no continuation bytes)
		if ((byte1 & 0x80) == 0) {
			return byte1;
		}

		// 2-byte sequence
		if ((byte1 & 0xE0) == 0xC0) {
			var byte2 = readContinuationByte();
			codePoint = ((byte1 & 0x1F) << 6) | byte2;
			if (codePoint >= 0x80) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 3-byte sequence (may include unpaired surrogates)
		if ((byte1 & 0xF0) == 0xE0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 12) | (byte2 << 6) | byte3;
			if (codePoint >= 0x0800) {
				return codePoint;
			} else {
				throw Error('Invalid continuation byte');
			}
		}

		// 4-byte sequence
		if ((byte1 & 0xF8) == 0xF0) {
			byte2 = readContinuationByte();
			byte3 = readContinuationByte();
			byte4 = readContinuationByte();
			codePoint = ((byte1 & 0x0F) << 0x12) | (byte2 << 0x0C) |
				(byte3 << 0x06) | byte4;
			if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
				return codePoint;
			}
		}

		throw Error('Invalid WTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;
	function wtf8decode(byteString) {
		byteArray = ucs2decode(byteString);
		byteCount = byteArray.length;
		byteIndex = 0;
		var codePoints = [];
		var tmp;
		while ((tmp = decodeSymbol()) !== false) {
			codePoints.push(tmp);
		}
		return ucs2encode(codePoints);
	}

	/*--------------------------------------------------------------------------*/

	var wtf8 = {
		'version': '1.0.0',
		'encode': wtf8encode,
		'decode': wtf8decode
	};

	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define(function() {
			return wtf8;
		});
	}	else if (freeExports && !freeExports.nodeType) {
		if (freeModule) { // in Node.js or RingoJS v0.8.0+
			freeModule.exports = wtf8;
		} else { // in Narwhal or RingoJS v0.7.0-
			var object = {};
			var hasOwnProperty = object.hasOwnProperty;
			for (var key in wtf8) {
				hasOwnProperty.call(wtf8, key) && (freeExports[key] = wtf8[key]);
			}
		}
	} else { // in Rhino or a web browser
		root.wtf8 = wtf8;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],50:[function(require,module,exports){
'use strict';

var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split('')
  , length = 64
  , map = {}
  , seed = 0
  , i = 0
  , prev;

/**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */
function encode(num) {
  var encoded = '';

  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);

  return encoded;
}

/**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */
function decode(str) {
  var decoded = 0;

  for (i = 0; i < str.length; i++) {
    decoded = decoded * length + map[str.charAt(i)];
  }

  return decoded;
}

/**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */
function yeast() {
  var now = encode(+new Date());

  if (now !== prev) return seed = 0, prev = now;
  return now +'.'+ encode(seed++);
}

//
// Map each character to its index.
//
for (; i < length; i++) map[alphabet[i]] = i;

//
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;
yeast.decode = decode;
module.exports = yeast;

},{}],51:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const commMedium_1 = require("../src/CommMedium");
/**
 * Created by flo on 18/01/2017.
 */
var utils = require("./utils");
class ChannelManager extends commMedium_1.CommMedium {
    init(messageHandler) {
        super.init(messageHandler);
        this.connections = new Map();
    }
    newConnection(actorId, channelPort) {
        this.connections.set(actorId, channelPort);
        channelPort.onmessage = (ev) => {
            this.messageHandler.dispatch(JSON.parse(ev.data), ev.ports);
        };
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId, actorAddress, actorPort) {
        this.socketHandler.openConnection(actorId, actorAddress, actorPort);
    }
    hasConnection(actorId) {
        var inChannel = this.connections.has(actorId);
        var connected = this.connectedActors.has(actorId);
        var disconnected = this.socketHandler.disconnectedActors.indexOf(actorId) != -1;
        return inChannel || connected || disconnected;
    }
    sendMessage(actorId, message, first = true) {
        if (this.connections.has(actorId)) {
            this.connections.get(actorId).postMessage(JSON.stringify(message));
        }
        else if (this.connectedActors.has(actorId) || this.socketHandler.disconnectedActors.indexOf(actorId) != -1) {
            this.socketHandler.sendMessage(actorId, message);
        }
        else {
            //Dirty, but it could be that an actor sends a message to the application actor, leading it to spawn a new actor and returning this new reference.
            //Upon receiving this reference the spawning actor immediatly invokes a method on the reference, but hasn't received the open ports message
            if (first) {
                var that = this;
                setTimeout(() => {
                    that.sendMessage(actorId, message, false);
                }, 10);
            }
            else {
                throw new Error("Unable to send message to unknown actor (channel manager): " + actorId + " in : " + this.messageHandler.thisRef.ownerId);
            }
        }
    }
}
exports.ChannelManager = ChannelManager;

},{"./commMedium":62,"./utils":70}],52:[function(require,module,exports){
/**
 * Created by flo on 22/12/2016.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class PromiseAllocation {
    constructor(promise, promiseId) {
        this.promise = promise;
        this.promiseId = promiseId;
    }
}
exports.PromiseAllocation = PromiseAllocation;
class ForeignPromiseAllocation extends PromiseAllocation {
    constructor(promise, promiseId, promiseOwnerId) {
        super(promise, promiseId);
        this.promiseOwnerId = promiseOwnerId;
    }
}
exports.ForeignPromiseAllocation = ForeignPromiseAllocation;
class PromisePool {
    constructor() {
        this.ids = 0;
        this.promises = new Map();
        this.foreignPromises = new Map();
    }
    newPromise() {
        var res;
        var rej;
        var promId = this.ids;
        var prom = new Promise((resolve, reject) => {
            res = resolve;
            rej = reject;
        });
        this.promises.set(this.ids, [res, rej]);
        this.ids += 1;
        return new PromiseAllocation(prom, promId);
    }
    applyForPromise(promiseId, arg, funcIndex) {
        if (this.promises.has(promiseId)) {
            this.promises.get(promiseId)[funcIndex](arg);
        }
    }
    resolvePromise(promiseId, value) {
        this.applyForPromise(promiseId, value, 0);
    }
    rejectPromise(promiseId, reason) {
        this.applyForPromise(promiseId, reason, 1);
    }
    newForeignPromise(promiseId, promiseOwnerId) {
        var existing = [];
        if (this.foreignPromises.has(promiseOwnerId)) {
            existing = this.foreignPromises.get(promiseOwnerId);
        }
        var prom = new Promise((resolve, reject) => {
            var alloc = new ForeignPromiseAllocation(prom, promiseId, promiseOwnerId);
            existing.push([alloc, resolve, reject]);
            this.foreignPromises.set(promiseOwnerId, existing);
        });
        return prom;
    }
    applyForForeignPromise(promiseId, promiseOwnerId, arg, funcIndex) {
        var promises = this.foreignPromises.get(promiseOwnerId);
        promises.forEach((alloc) => {
            var foreignAlloc = alloc[0];
            if (foreignAlloc.promiseId == promiseId) {
                alloc[funcIndex](arg);
            }
        });
    }
    resolveForeignPromise(promiseId, promiseOwnerId, value) {
        this.applyForForeignPromise(promiseId, promiseOwnerId, value, 1);
    }
    rejectForeignPromise(promiseId, promiseOwnerId, reason) {
        this.applyForForeignPromise(promiseId, promiseOwnerId, reason, 2);
    }
}
exports.PromisePool = PromisePool;

},{}],53:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const serialisation_1 = require("../serialisation");
/**
 * Created by flo on 21/06/2017.
 */
var utils = require("../utils");
class Dependency {
    constructor(val, position) {
        this.value = val;
        this.position = position;
    }
}
class SignalDependency extends Dependency {
    constructor(signal, val, position) {
        super(val, position);
        this.signal = signal;
    }
}
exports.SignalDependency = SignalDependency;
class StaticDependency extends Dependency {
}
//Used to represent the state of a signal, provided to the programmer as "Signal"
class SignalValue {
    constructor() {
        this[serialisation_1.SignalContainer.checkSignalFuncKey] = true;
    }
    setHolder(holder) {
        this.holder = holder;
    }
}
SignalValue.IS_MUTATOR = "_IS_MUTATOR_";
SignalValue.GET_ORIGINAL = "_GET_ORIGINAL_";
SignalValue.LOWER_BOUND = "_LOWER_BOUND_";
SignalValue.UPPER_BOUND = "_UPPER_BOUND_";
SignalValue.WEAK_ANN = "_WEAK_ANN_";
exports.SignalValue = SignalValue;
function mutator(target, propertyKey, descriptor) {
    let originalMethod = descriptor.value;
    originalMethod[SignalValue.IS_MUTATOR] = true;
    return {
        value: originalMethod
    };
}
exports.mutator = mutator;
function lease(timeOut) {
    return function boundsDecorator(constructor) {
        return function NewAble(...args) {
            let sigObject = new constructor(...args);
            sigObject[SignalValue.LOWER_BOUND] = timeOut;
            sigObject[SignalValue.UPPER_BOUND] = -1;
            return sigObject;
        };
    };
}
exports.lease = lease;
function weak(constructor) {
    return function NewAble(...args) {
        let sigObject = new constructor(...args);
        sigObject[SignalValue.WEAK_ANN] = true;
        return sigObject;
    };
}
exports.weak = weak;
//strong is the default, so doesn't do anything but there for consistencies sake
function strong(constructor) {
    return constructor;
}
exports.strong = strong;
class SignalObject extends SignalValue {
    instantiateMeta() {
        let methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        methodKeys.forEach((methodName) => {
            var property = Reflect.get(Object.getPrototypeOf(this), methodName);
            if (property[SignalValue.IS_MUTATOR]) {
                let wrapped = (...args) => {
                    property.apply(this, args, this);
                    this.holder.change();
                };
                wrapped[SignalValue.IS_MUTATOR] = true;
                wrapped[SignalValue.GET_ORIGINAL] = property;
                Object.getPrototypeOf(this)[methodName] = wrapped;
            }
        });
    }
}
exports.SignalObject = SignalObject;
class SignalFunction extends SignalValue {
    constructor(f) {
        super();
        this.f = f;
    }
    reeval(...args) {
        this.lastVal = this.f(...args);
        return this.lastVal;
    }
}
exports.SignalFunction = SignalFunction;
class Signal {
    constructor(signalObject, isGarbage = false) {
        //this[SignalContainer.checkSignalFuncKey]    = true
        this.id = utils.generateId();
        this.value = signalObject;
        this.children = new Map();
        this.garbageChildren = new Map();
        this.signalDependencies = new Map();
        this.staticDependencies = new Array();
        this.garbageSignalDependencies = new Map();
        this.garbageStaticDependencies = new Array();
        this.changesReceived = 0;
        this.noChangesReceived = 0;
        this.onChangeListeners = new Array();
        this.onDeleteListeners = new Array();
        this.clock = 0;
        this.isGarbage = isGarbage;
        if (Reflect.has(signalObject, SignalValue.LOWER_BOUND)) {
            this.rateLowerBound = signalObject[SignalValue.LOWER_BOUND];
            this.rateUpperBound = signalObject[SignalValue.UPPER_BOUND];
        }
        else {
            this.rateLowerBound = -1;
            this.rateUpperBound = -1;
        }
        this.isSource = true;
        if (Reflect.has(signalObject, SignalValue.WEAK_ANN)) {
            this.strong = false;
            this.tempStrong = false;
        }
        else {
            this.strong = true;
            this.tempStrong = true;
        }
        if (isGarbage) {
            this.strong = false;
            this.tempStrong = false;
        }
    }
    addChild(signal) {
        this.children.set(signal.id, signal);
    }
    addGarbageChild(signal) {
        this.garbageChildren.set(signal.id, signal);
    }
    removeChild(signalId) {
        this.children.delete(signalId);
    }
    removeGarbageChild(signalId) {
        this.children.delete(signalId);
    }
    addSignalDependency(signal, position) {
        this.signalDependencies.set(signal.id, new SignalDependency(signal, signal.value, position));
        this.isSource = false;
    }
    addStaticDependency(value, position) {
        this.staticDependencies.push(new StaticDependency(value, position));
        this.isSource = false;
    }
    addGarbageSignalDependency(signal, position) {
        this.garbageSignalDependencies.set(signal.id, new SignalDependency(signal, signal.value, position));
    }
    addGarbageStaticDependency(value, position) {
        this.garbageStaticDependencies.push(new StaticDependency(value, position));
    }
    //Signals is made weak by current actor. In case it is published it must be weak as well (hence tempStrong = false)
    makeWeak() {
        this.strong = false;
        this.tempStrong = false;
    }
    //Used to indicate that signal should be transferred weakly, but must remain strong for sender
    makeTempWeak() {
        this.tempStrong = false;
    }
    //Called on source nodes by "external" code
    change(val = null) {
        if (val == Signal.NO_CHANGE) {
            this.propagate(val);
        }
        else if (val instanceof SignalFunction) {
            this.clock++;
            this.value.lastVal = val.lastVal;
            this.propagate(val.lastVal);
            this.triggerExternal();
        }
        else if (val instanceof SignalObject) {
            this.clock++;
            this.value = val;
            this.propagate(this.value);
            this.triggerExternal();
        }
        else {
            this.clock++;
            this.propagate(this.value);
            this.triggerExternal();
        }
    }
    propagate(val) {
        this.children.forEach((child) => {
            child.parentChanged(this.id, val);
        });
    }
    propagateGarbage(val = undefined) {
        let ret = true;
        this.garbageChildren.forEach((child) => {
            ret = ret && child.parentGarbageCollected(this.id, val);
        });
        return ret;
    }
    triggerExternal() {
        this.onChangeListeners.forEach((listener) => {
            listener();
        });
    }
    parentChanged(parentId, val) {
        this.changesReceived += 1;
        let dependency = this.signalDependencies.get(parentId);
        if (val == Signal.NO_CHANGE) {
            this.noChangesReceived += 1;
        }
        else {
            dependency.value = val;
        }
        if (this.changesReceived == this.signalDependencies.size && this.noChangesReceived != this.signalDependencies.size) {
            let args = [];
            this.signalDependencies.forEach((dep) => {
                args[dep.position] = dep.value;
            });
            this.staticDependencies.forEach((dep) => {
                args[dep.position] = dep.value;
            });
            //If the signal has parents it cannot be source and must therefore have a function as value object
            let ret = this.value.reeval(...args);
            this.changesReceived = 0;
            this.noChangesReceived = 0;
            this.clock++;
            this.triggerExternal();
            this.propagate(ret);
        }
        else if (this.noChangesReceived == this.signalDependencies.size) {
            this.noChangesReceived = 0;
            this.changesReceived = 0;
            this.propagate(Signal.NO_CHANGE);
        }
    }
    //Return indicates whether propagation happened fully, in which case signal pool will collect all garbage nodes as well
    parentGarbageCollected(parentId, val = undefined) {
        this.changesReceived++;
        if (this.changesReceived == this.garbageSignalDependencies.size) {
            let args = [];
            let dependency = this.garbageSignalDependencies.get(parentId);
            dependency.value = val;
            this.garbageSignalDependencies.forEach((dep) => {
                //Garbage dependencies do not propagate values (simply propagate the "undefined" event)
                args[dep.position] = dep.value;
            });
            this.garbageStaticDependencies.forEach((dep) => {
                args[dep.position] = dep.value;
            });
            let ret = this.value.reeval(...args);
            return this.propagateGarbage(ret);
        }
        else {
            return false;
        }
    }
    //Used by Spiders.js to notify remote signals of a change
    registerOnChangeListener(callback) {
        this.onChangeListeners.push(callback);
    }
    //Used by spiders.js to notify remote signal of garbage collection
    registerOnDeleteListener(callback) {
        this.onDeleteListeners.push(callback);
    }
    //Trigger garbage collection propagation (notify remote signal of destruction, not garbage value propagation)
    triggerOnDelete() {
        this.onDeleteListeners.forEach((callback) => {
            callback();
        });
    }
}
Signal.NO_CHANGE = "_NO_CHANGE_";
exports.Signal = Signal;
function lift(func) {
    return (...args) => {
        let sig = new Signal(new SignalFunction(func));
        let lowerBound = Infinity;
        let upperBound = -Infinity;
        args.forEach((a, i) => {
            if (a instanceof SignalValue) {
                a.holder.addChild(sig);
                sig.addSignalDependency(a.holder, i);
                if (a.holder.rateLowerBound > 0) {
                    lowerBound = Math.min(lowerBound, a.holder.rateLowerBound);
                    upperBound = Math.max(upperBound, a.holder.rateUpperBound);
                }
            }
            else {
                sig.addStaticDependency(a, i);
            }
        });
        sig.rateLowerBound = lowerBound;
        sig.rateUpperBound = upperBound;
        return sig;
    };
}
exports.lift = lift;
function liftGarbage(func) {
    return (...args) => {
        let sig = new Signal(new SignalFunction(func), true);
        sig.rateLowerBound = -1;
        sig.rateUpperBound = -1;
        args.forEach((a, i) => {
            if (a instanceof SignalValue) {
                a.holder.addGarbageChild(sig);
                sig.addGarbageSignalDependency(a.holder, i);
            }
            else {
                sig.addGarbageStaticDependency(a, i);
            }
        });
        return sig;
    };
}
exports.liftGarbage = liftGarbage;

},{"../serialisation":67,"../utils":70}],54:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const signal_1 = require("./signal");
const messages_1 = require("../messages");
const serialisation_1 = require("../serialisation");
/**
 * Created by flo on 22/06/2017.
 */
class SignalPool {
    constructor(commMedium, thisRef, promisePool, objectPool) {
        this.commMedium = commMedium;
        this.thisRef = thisRef;
        this.signals = new Map();
        this.garbageSignals = new Map();
        this.garbageDependencies = new Map();
        this.sources = new Map();
        this.garbageCollected = new Array();
        this.promisePool = promisePool;
        this.objectPool = objectPool;
    }
    newSource(signal) {
        this.sources.set(signal.id, signal);
        if (signal.rateLowerBound > 0) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    }
    knownSignal(signalId) {
        return this.sources.has(signalId) || this.signals.has(signalId);
    }
    trackLease(signalId, bound) {
        let signal;
        if (this.sources.has(signalId)) {
            signal = this.sources.get(signalId);
        }
        else {
            signal = this.signals.get(signalId);
        }
        let clockBefore = signal.clock;
        setTimeout(() => {
            let clockAfter = signal.clock;
            if (clockBefore == clockAfter) {
                if (!signal.strong) {
                    //console.log("Garbage collecting")
                    this.garbageCollect(signal.id);
                }
                else {
                    //console.log("Lease failed but signal is strong so its ok ! ")
                }
            }
            else if (!this.garbageCollected.includes(signalId)) {
                this.trackLease(signalId, bound);
            }
        }, bound);
    }
    //TODO first propagate garbage collection, then garbage collect the actual node
    //TODO will need to garbage collect the "failure" dependency graph as well !
    //Recursively delete all children of the specified head node
    garbageCollect(headId) {
        //Node might have been removed by common ancestor
        if (this.signals.has(headId) || this.sources.has(headId)) {
            let head;
            if (this.sources.has(headId)) {
                head = this.sources.get(headId);
            }
            else {
                head = this.signals.get(headId);
            }
            this.initiateGarbagePropagation(head);
            this.deleteSignal(head);
            head.children.forEach((child) => {
                this.garbageCollect(child.id);
            });
        }
    }
    //Garbage collect the garbage dependency graph (i.e. signals triggered by garbage collection of "regular" value signals)
    garbageCollectGarbage(headId) {
        let sig = this.garbageSignals.get(headId);
        this.garbageSignals.delete(headId);
        sig.garbageSignalDependencies.forEach((dependency) => {
            dependency.signal.removeGarbageChild(headId);
        });
        sig.garbageChildren.forEach((child) => {
            this.garbageCollectGarbage(child.id);
        });
    }
    initiateGarbagePropagation(signal) {
        if (this.garbageDependencies.has(signal.id)) {
            this.garbageDependencies.get(signal.id).forEach((garbageId) => {
                let destroy = this.garbageSignals.get(garbageId).parentGarbageCollected(signal.id);
                if (destroy) {
                    this.garbageCollectGarbage(garbageId);
                }
            });
        }
    }
    deleteSignal(signal) {
        this.signals.delete(signal.id);
        this.sources.delete(signal.id);
        this.garbageCollected.push(signal.id);
        signal.signalDependencies.forEach((dependency) => {
            dependency.signal.removeChild(signal.id);
        });
        signal.triggerOnDelete();
    }
    newSignal(signal) {
        this.signals.set(signal.id, signal);
        if (signal.rateLowerBound > 0) {
            this.trackLease(signal.id, signal.rateLowerBound);
        }
    }
    newGarbageSignal(signal) {
        this.garbageSignals.set(signal.id, signal);
    }
    addGarbageDependency(regularNodeId, garbageNodeId) {
        if (!this.garbageDependencies.has(regularNodeId)) {
            this.garbageDependencies.set(regularNodeId, new Array());
        }
        this.garbageDependencies.get(regularNodeId).push(garbageNodeId);
    }
    registerExternalListener(signalId, holderId) {
        let signal;
        if (this.signals.has(signalId)) {
            signal = this.signals.get(signalId);
        }
        else if (this.sources.has(signalId)) {
            signal = this.sources.get(signalId);
        }
        else {
            throw new Error("Unable to find signal to register listener");
        }
        signal.registerOnChangeListener(() => {
            this.commMedium.sendMessage(holderId, new messages_1.ExternalSignalChangeMessage(this.thisRef, signal.id, serialisation_1.serialise(signal.value, this.thisRef, holderId, this.commMedium, this.promisePool, this.objectPool)));
        });
        signal.registerOnDeleteListener(() => {
            this.commMedium.sendMessage(holderId, new messages_1.ExternalSignalDeleteMessage(this.thisRef, signal.id));
        });
    }
    sourceChanged(signalId, val) {
        //Could be that the signal was garbage collected (shouldn't happen given the failure model)
        if (this.knownSignal(signalId)) {
            //Elm style propagation, signal pool serves as event dispatcher
            this.sources.forEach((sourceSignal, id) => {
                if (id == signalId) {
                    sourceSignal.clock++;
                    sourceSignal.change(val);
                }
                else {
                    sourceSignal.change(signal_1.Signal.NO_CHANGE);
                }
            });
        }
    }
}
exports.SignalPool = SignalPool;

},{"../messages":65,"../serialisation":67,"./signal":53}],55:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../messages");
const Repliq_1 = require("./Repliq");
const Round_1 = require("./Round");
var utils = require("../utils");
class GSP {
    //Checks whether this instance is master of a given gsp object (using the gsp object's owner id)
    isMaster(anId) {
        return anId == this.thisActorId;
    }
    playRound(round) {
        //Replay changes for top-level Repliq
        let object = this.repliqs.get(Round_1.roundMasterObjectId(round));
        let fields = object[Repliq_1.Repliq.getRepliqFields];
        Reflect.ownKeys(Round_1.roundUpdates(round)).forEach((fieldName) => {
            fields.get(fieldName).update(Reflect.get(Round_1.roundUpdates(round), fieldName));
        });
        //Replay changes for inner Repliqs
        /*let innerObjectIds = Reflect.ownKeys(round.innerUpdates)
        innerObjectIds.forEach((repId)=>{
            if(this.repliqs.has(repId.toString())){
                let rep         = this.repliqs.get(repId.toString())
                let repFields   = rep[Repliq.getRepliqFields]
                Reflect.ownKeys(round.innerUpdates[repId]).forEach((fieldName)=>{
                    repFields.get(fieldName).update(Reflect.get(round.innerUpdates[repId],fieldName))
                })
            }
        })*/
    }
    constructor(commMedium, thisActorId, thisRef) {
        this.commMedium = commMedium;
        this.thisActorId = thisActorId;
        //TODO Initialisisation of fields will be refactored together with communication
        this.thisActorAddress = thisRef.ownerAddress;
        this.thisActorPort = thisRef.ownerPort;
        this.thisRef = thisRef;
        this.repliqs = new Map();
        this.current = new Map();
        this.pending = new Map();
        this.committed = new Map();
        this.roundNumbers = new Map();
        this.replicaOwners = new Map();
        this.replay = [];
        this.roundCommitListeners = new Map();
        this.forwardingM = new Map();
        this.forwardingS = new Map();
    }
    //////////////////////////////////
    //Methods invoked by Repliqs    //
    //////////////////////////////////
    newMasterRepliq(repliqProxy, repliqId) {
        this.repliqs.set(repliqId, repliqProxy);
    }
    inReplay(objectId) {
        return this.replay.includes(objectId);
    }
    newRound(objectId, ownerId, methodName, args) {
        //Round number will be determined upon Yield by the master
        let roundNumber = -1;
        let listenerID = utils.generateId();
        let round = Round_1.newRound(objectId, ownerId, roundNumber, methodName, args, listenerID);
        this.current.set(objectId, round);
        return round;
    }
    registerRoundListener(callback, listenerID) {
        if (!this.roundCommitListeners.has(listenerID)) {
            this.roundCommitListeners.set(listenerID, []);
        }
        this.roundCommitListeners.get(listenerID).push(callback);
    }
    //Called at the end of a method invocation on a gsp object
    yield(objectId, ownerId) {
        if (this.isMaster(ownerId)) {
            this.yieldMasterRound(this.current.get(objectId));
        }
        else {
            this.yieldReplicaRound(this.current.get(objectId));
        }
    }
    yieldMasterRound(round) {
        //Commit round on the master
        if (!this.roundNumbers.has(Round_1.roundMasterObjectId(round))) {
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), 0);
        }
        let prevRoundNumber = this.roundNumbers.get(Round_1.roundMasterObjectId(round));
        Round_1.setRoundNumber(round, prevRoundNumber + 1);
        this.roundNumbers.set(Round_1.roundMasterObjectId(round), prevRoundNumber + 1);
        this.commitRound(round);
        //Broadcast round to all holders of replicaOwners
        if (this.replicaOwners.has(Round_1.roundMasterObjectId(round))) {
            this.replicaOwners.get(Round_1.roundMasterObjectId(round)).forEach((replicaHolderId) => {
                this.commMedium.sendMessage(replicaHolderId, new messages_1.GSPRoundMessage(this.thisRef, round));
            });
        }
    }
    yieldReplicaRound(round) {
        //A replica just finished performing updates.
        //Add these updates to the pending map and sent the round to the master
        if (!this.pending.has(Round_1.roundMasterObjectId(round))) {
            this.pending.set(Round_1.roundMasterObjectId(round), []);
        }
        this.pending.get(Round_1.roundMasterObjectId(round)).push(round);
        this.commMedium.sendMessage(Round_1.roundMasterOwnerId(round), new messages_1.GSPRoundMessage(this.thisRef, round));
    }
    confirmMasterRound(round) {
        console.log("Confirming master round");
        if (!this.roundNumbers.has(Round_1.roundMasterObjectId(round))) {
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), 0);
        }
        //console.log("Confirming master round: " + roundNumber(round) + " for object id: " + roundMasterObjectId(round))
        //console.log("Last known round: " + this.roundNumbers.get(roundMasterObjectId(round)))
        if (Round_1.roundNumber(round) == this.roundNumbers.get(Round_1.roundMasterObjectId(round)) + 1) {
            //Remove all older pending rounds
            if (this.pending.has(Round_1.roundMasterObjectId(round))) {
                let res = this.pending.get(Round_1.roundMasterObjectId(round)).filter((pendingRound) => {
                    return Round_1.roundNumber(pendingRound) > Round_1.roundNumber(round);
                });
                this.pending.set(Round_1.roundMasterObjectId(round), res);
            }
            //Commit the round
            this.commitRound(round);
            //Update the last known round number for the replicated object
            this.roundNumbers.set(Round_1.roundMasterObjectId(round), Round_1.roundNumber(round));
        }
        else {
            //We missed a number of rounds, request owner of master object to sync with us
            this.commMedium.sendMessage(Round_1.roundMasterOwnerId(round), new messages_1.GSPSyncMessage(this.thisRef, this.thisActorId, Round_1.roundMasterObjectId(round)));
        }
    }
    commitRound(round) {
        //1) Set concerned object on replay modus (i.e. reset concerned fields to commited values)
        this.replay.push(Round_1.roundMasterObjectId(round));
        let object = this.repliqs.get(Round_1.roundMasterObjectId(round));
        object[Repliq_1.Repliq.resetRepliqCommit](Round_1.roundUpdates(round));
        //reset to commit for inner repliqs
        /*Reflect.ownKeys(round.innerUpdates).forEach((innerId)=>{
            if(this.repliqs.has(innerId.toString())){
                let innerRep = this.repliqs.get(innerId.toString())
                let updates  = round.innerUpdates[innerId]
                innerRep[Repliq.resetRepliqCommit](updates)
            }
        })*/
        //2) Replay the round on the object. Depending on the field implementation this will commit tentative values
        this.playRound(round);
        //3) Commit all tentative values as a result fo the replay
        object[Repliq_1.Repliq.commitRepliq](Round_1.roundUpdates(round));
        //Commit all tentative values of inner Repliqs
        /*Reflect.ownKeys(round.innerUpdates).forEach((innerId)=>{
            if(this.repliqs.has(innerId.toString())){
                let innerRep = this.repliqs.get(innerId.toString())
                let updates  = round.innerUpdates[innerId]
                innerRep[Repliq.commitRepliq](updates)
            }
        })*/
        //4) Play pending rounds
        if (this.pending.has(Round_1.roundMasterObjectId(round))) {
            this.pending.get(Round_1.roundMasterObjectId(round)).forEach((round) => {
                this.playRound(round);
            });
        }
        //5) Add round to commit
        if (!this.committed.has(Round_1.roundMasterObjectId(round))) {
            this.committed.set(Round_1.roundMasterObjectId(round), []);
        }
        this.committed.get(Round_1.roundMasterObjectId(round)).push(round);
        this.replay = this.replay.filter((oId) => {
            oId != Round_1.roundMasterObjectId(round);
        });
        //6) trigger all onceCommited listeners for this round
        this.triggerCommitListeners(Round_1.roundListenerId(round));
    }
    triggerCommitListeners(listenerID) {
        if (this.roundCommitListeners.has(listenerID)) {
            this.roundCommitListeners.get(listenerID).forEach((callback) => {
                callback();
            });
        }
    }
    /////////////////////////////////////////////
    //Methods invoked by the network interface //
    /////////////////////////////////////////////
    registerReplica(replicaId, replica) {
        this.repliqs.set(replicaId, replica);
        this.commMedium.sendMessage(replica[Repliq_1.Repliq.getRepliqOwnerID], new messages_1.GSPRegisterMessage(this.thisRef, this.thisActorId, replicaId, this.thisActorAddress, this.thisActorPort, this.roundNumbers.get(replicaId)));
    }
    registerReplicaHolder(replicaId, holderId, roundNr) {
        if (!this.replicaOwners.has(replicaId)) {
            this.replicaOwners.set(replicaId, []);
        }
        this.replicaOwners.get(replicaId).push(holderId);
        //Added for p2p
        if (this.forwardingM.has(replicaId)) {
            if (!this.forwardingS.has(replicaId)) {
                this.forwardingS.set(replicaId, []);
            }
            this.forwardingS.get(replicaId).push(holderId);
        }
        //
        if (this.committed.has(replicaId) && roundNr < this.roundNumbers.get(replicaId)) {
            this.committed.get(replicaId).forEach((round) => {
                this.commMedium.sendMessage(holderId, new messages_1.GSPRoundMessage(this.thisRef, round));
            });
        }
    }
    roundReceived(round, senderId) {
        if (this.isMaster(Round_1.roundMasterOwnerId(round))) {
            //added for p2p
            if (this.forwardingM.has(Round_1.roundMasterObjectId(round))) {
                Round_1.setRoundMasterOwnerId(round, this.forwardingM.get(Round_1.roundMasterObjectId(round)));
                this.commMedium.sendMessage(this.forwardingM.get(Round_1.roundMasterObjectId(round)), new messages_1.GSPRoundMessage(this.thisRef, round));
            }
            else {
                //
                this.yieldMasterRound(round);
            }
        }
        else {
            //Added for p2p
            if (this.forwardingM.has(Round_1.roundMasterObjectId(round))) {
                //Original master has confirmed a round
                if (senderId == this.forwardingM.get(Round_1.roundMasterObjectId(round))) {
                    this.confirmMasterRound(round);
                    this.forwardingS.get(Round_1.roundMasterObjectId(round)).forEach((slaveId) => {
                        this.commMedium.sendMessage(slaveId, new messages_1.GSPRoundMessage(this.thisRef, round));
                    });
                }
                else {
                    let originalOwner = this.forwardingM.get(Round_1.roundMasterObjectId(round));
                    this.commMedium.sendMessage(originalOwner, new messages_1.GSPRoundMessage(this.thisRef, round));
                }
            }
            else {
                this.confirmMasterRound(round);
            }
        }
    }
    receiveSync(sender, masterObjectId) {
        console.log("Received sync request from: " + sender);
        this.committed.get(masterObjectId).forEach((round) => {
            this.commMedium.sendMessage(sender, new messages_1.GSPRoundMessage(this.thisRef, round));
        });
    }
    addForward(replicaId, ownerId) {
        console.log("Adding forward for owner: " + ownerId);
        this.forwardingM.set(replicaId, ownerId);
    }
}
exports.GSP = GSP;

},{"../messages":65,"../utils":70,"./Repliq":56,"./Round":60}],56:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const serialisation_1 = require("../serialisation");
const RepliqPrimitiveField_1 = require("./RepliqPrimitiveField");
const RepliqObjectField_1 = require("./RepliqObjectField");
const Round_1 = require("./Round");
var utils = require("../utils");
/**
 * Created by flo on 16/03/2017.
 */
var RepliqFields = require("./RepliqPrimitiveField");
function atomic(target, propertyKey, descriptor) {
    let originalMethod = descriptor.value;
    originalMethod[Repliq.isAtomic] = true;
    return {
        value: originalMethod
    };
}
exports.atomic = atomic;
class OnceCommited {
    constructor(gspInstance, listenerID) {
        this.gspInstance = gspInstance;
        this.listenerID = listenerID;
    }
    onceCommited(callback) {
        this.gspInstance.registerRoundListener(callback, this.listenerID);
    }
}
let isAtomicContext = false;
let atomicRound = null;
class Repliq {
    isMetaField(fieldName) {
        return fieldName == Repliq.getRepliqFields || fieldName == Repliq.getRepliqID || fieldName == Repliq.getRepliqOwnerID || fieldName == Repliq.getRepliqOriginalMethods || fieldName == Repliq.resetRepliqCommit || fieldName == Repliq.commitRepliq || fieldName == serialisation_1.RepliqContainer.checkRepliqFuncKey || fieldName == Repliq.isClientMaster || fieldName == Repliq.getRepliqOwnerPort || fieldName == Repliq.getRepliqOwnerAddress;
    }
    makeAtomicMethodProxyHandler(gspInstance, objectId, ownerId, methodName, fields) {
        var that = this;
        return {
            apply: function (target, thisArg, args) {
                let stateChanging = false;
                if (!gspInstance.inReplay(objectId)) {
                    isAtomicContext = true;
                    atomicRound = gspInstance.newRound(objectId, ownerId, methodName, args);
                }
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                let thisProxy = new Proxy(thisArg, {
                    set: function (target, property, value) {
                        let gspField = fields.get(property);
                        if (!gspInstance.inReplay(objectId)) {
                            stateChanging = true;
                            let update = new RepliqPrimitiveField_1.PrimitiveFieldUpdate(property, gspField.read(), value);
                            Round_1.addRoundUpdate(atomicRound, update, objectId);
                        }
                        gspField.writeField(value);
                        return true;
                    },
                    get: function (target, name) {
                        if (fields.has(name)) {
                            let field = fields.get(name);
                            if (field instanceof RepliqObjectField_1.RepliqObjectField) {
                                if (!gspInstance.inReplay(objectId)) {
                                    atomicRound = gspInstance.newRound(objectId, ownerId, methodName, args);
                                }
                                return that.makeObjectFieldProxy(target[name], field, gspInstance.inReplay(objectId), true, atomicRound, objectId, ownerId, gspInstance);
                            }
                            else {
                                return field;
                            }
                        }
                        else {
                            return target[name];
                        }
                    }
                });
                let res = target.apply(thisProxy, args);
                if (!gspInstance.inReplay(objectId)) {
                    gspInstance.yield(objectId, ownerId);
                    let ret = new OnceCommited(gspInstance, Round_1.roundListenerId(atomicRound));
                    isAtomicContext = false;
                    atomicRound = null;
                    return ret;
                }
                else {
                    return res;
                }
            }
        };
    }
    makeMethodProxyHandler(gspInstance, objectId, ownerId, methodName, fields) {
        var that = this;
        return {
            apply: function (target, thisArg, args) {
                //The "this" argument of a method is set to a proxy around the original object which intercepts assignment and calls "writeField" on the Field
                let round;
                let stateChanging = false;
                let thisProxy = new Proxy(thisArg, {
                    //Set is only called on primitive fields
                    set: function (target, property, value) {
                        let gspField = fields.get(property);
                        if (!gspInstance.inReplay(objectId)) {
                            stateChanging = true;
                            let update = new RepliqPrimitiveField_1.PrimitiveFieldUpdate(property, gspField.read(), value);
                            if (!isAtomicContext) {
                                round = gspInstance.newRound(objectId, ownerId, methodName, args);
                                Round_1.addRoundUpdate(round, update, objectId);
                                gspInstance.yield(objectId, ownerId);
                            }
                            else {
                                Round_1.addRoundUpdate(atomicRound, update, objectId);
                            }
                        }
                        gspField.writeField(value);
                        return true;
                    },
                    get: function (target, name) {
                        if (fields.has(name)) {
                            let field = fields.get(name);
                            if (field instanceof RepliqObjectField_1.RepliqObjectField) {
                                if (!gspInstance.inReplay(objectId)) {
                                    round = gspInstance.newRound(objectId, ownerId, methodName, args);
                                    stateChanging = true;
                                }
                                return that.makeObjectFieldProxy(target[name], field, gspInstance.inReplay(objectId), false, round, objectId, ownerId, gspInstance);
                            }
                            else {
                                return field;
                            }
                        }
                        else {
                            return target[name];
                        }
                    }
                });
                let res = target.apply(thisProxy, args);
                //The invoked method might not update the Repliq's state
                if (!gspInstance.inReplay(objectId) && stateChanging) {
                    if (isAtomicContext) {
                        return new OnceCommited(gspInstance, Round_1.roundListenerId(atomicRound));
                    }
                    else {
                        return new OnceCommited(gspInstance, Round_1.roundListenerId(round));
                    }
                }
                else {
                    return res;
                }
            }
        };
    }
    makeObjectFieldProxy(unwrappedField, field, replay, atomic, round, objectId, ownerId, gspInstance) {
        return new Proxy({}, {
            get: function (target, name) {
                let property = unwrappedField[name];
                if (property instanceof Function) {
                    return new Proxy(property, {
                        apply: function (target, thisArg, args) {
                            if (!replay) {
                                let update = new RepliqObjectField_1.ObjectFieldUpdate(field.name, name.toString(), args);
                                Round_1.addRoundUpdate(round, update, objectId);
                                if (!atomic) {
                                    gspInstance.yield(objectId, ownerId);
                                }
                            }
                            let ret = field.methodInvoked(name.toString(), args);
                            return ret;
                        }
                    });
                }
                else {
                    return property;
                }
            }
        });
    }
    makeProxyHandler(fields, originalMethods, objectID, ownerId, isClient, ownerAddress = null, ownerPort = null) {
        var that = this;
        return {
            set: function (target, property, value, receiver) {
                console.log(property);
                throw new Error("Assignment of Repliq fields not allowed");
            },
            get: function (target, name) {
                if (Reflect.has(target, name) || that.isMetaField(name)) {
                    var property = Reflect.get(target, name);
                    if (typeof property != 'function') {
                        if (name == Repliq.getRepliqID) {
                            return objectID;
                        }
                        else if (name == Repliq.getRepliqOwnerID) {
                            return ownerId;
                        }
                        else if (name == Repliq.getRepliqFields) {
                            return fields;
                        }
                        else if (name == Repliq.getRepliqOriginalMethods) {
                            return originalMethods;
                        }
                        else if (name == Repliq.resetRepliqCommit) {
                            return (updates) => {
                                Reflect.ownKeys(updates).forEach((key) => {
                                    fields.get(key.toString()).resetToCommit();
                                });
                            };
                        }
                        else if (name == Repliq.commitRepliq) {
                            return (updates) => {
                                Reflect.ownKeys(updates).forEach((key) => {
                                    fields.get(key.toString()).commit();
                                });
                            };
                        }
                        else if (name == serialisation_1.RepliqContainer.checkRepliqFuncKey) {
                            return true;
                        }
                        else if (name == Repliq.isClientMaster) {
                            return isClient;
                        }
                        else if (name == Repliq.getRepliqOwnerAddress) {
                            return ownerAddress;
                        }
                        else if (name == Repliq.getRepliqOwnerPort) {
                            return ownerPort;
                        }
                        else {
                            let field = fields.get(name);
                            let val;
                            if (field instanceof RepliqObjectField_1.RepliqObjectField) {
                                val = field.read();
                            }
                            else if (field[serialisation_1.RepliqContainer.checkRepliqFuncKey]) {
                                return field;
                            }
                            else {
                                //Wrap value in an object in order to be able to install onCommit and onTentative listeners
                                val = Object(field.read());
                            }
                            Reflect.set(val, "onCommit", (callback) => {
                                field.onCommit(callback);
                            });
                            Reflect.set(val, "onTentative", (callback) => {
                                field.onTentative(callback);
                            });
                            //TODO for security reasons we could return a proxy in case of a ObjectField which disallows the invocation of methods (i.e. because methods on object fields can only be called from withint a Repliq)
                            return val;
                        }
                    }
                    else {
                        return property;
                    }
                }
                else {
                    return undefined;
                }
            }
        };
    }
    instantiate(gspInstance, thisActorId, isClient, ownerAddress = null, ownerPort = null) {
        this[serialisation_1.RepliqContainer.checkRepliqFuncKey] = true;
        let objectToProxy = {};
        let proxyProto = {};
        Object.setPrototypeOf(objectToProxy, proxyProto);
        let fields = new Map();
        let originalMethods = new Map();
        let repliqId = utils.generateId();
        let fieldKeys = Reflect.ownKeys(this);
        let methodKeys = Reflect.ownKeys(Object.getPrototypeOf(this));
        let handler = this.makeProxyHandler(fields, originalMethods, repliqId, thisActorId, isClient, ownerAddress, ownerPort);
        let meta = RepliqFields.fieldMetaData;
        //"Regular" fields are transformed into standard LWR Fields
        fieldKeys.forEach((key) => {
            var gspField = Reflect.get(this, key);
            if (meta.has(key)) {
                let fieldClass = meta.get(key);
                gspField = new fieldClass(key, gspField);
            }
            if (!(gspField instanceof RepliqPrimitiveField_1.RepliqPrimitiveField) && !(gspField instanceof RepliqObjectField_1.RepliqObjectField) && !(gspField[serialisation_1.RepliqContainer.checkRepliqFuncKey])) {
                if (gspField instanceof Object) {
                    gspField = new RepliqObjectField_1.RepliqObjectField(key.toString(), gspField);
                }
                else {
                    gspField = new RepliqPrimitiveField_1.RepliqPrimitiveField(key.toString(), gspField);
                }
            }
            fields.set(key.toString(), gspField);
            Reflect.set(objectToProxy, key, gspField);
        });
        //Replace all methods with proxies which intercept apply to log method application
        methodKeys.shift(); // First entry is always constructor method
        methodKeys.forEach((key) => {
            var property = Reflect.get(Object.getPrototypeOf(this), key);
            originalMethods.set(key, property);
            let proxyMethod;
            if (property[Repliq.isAtomic]) {
                proxyMethod = new Proxy(property, this.makeAtomicMethodProxyHandler(gspInstance, repliqId, thisActorId, key.toString(), fields));
            }
            else {
                proxyMethod = new Proxy(property, this.makeMethodProxyHandler(gspInstance, repliqId, thisActorId, key.toString(), fields));
            }
            Reflect.set(Object.getPrototypeOf(objectToProxy), key, proxyMethod);
        });
        let repliqProxy = new Proxy(objectToProxy, handler);
        gspInstance.newMasterRepliq(repliqProxy, repliqId);
        return repliqProxy;
    }
    reconstruct(gspInstance, repliqId, repliqOwnerId, fields, methods, atomicMethods, isClient, ownerAddress, ownerPort, roundNumber) {
        if (gspInstance.repliqs.has(repliqId)) {
            return gspInstance.repliqs.get(repliqId);
        }
        else {
            gspInstance.roundNumbers.set(repliqId, roundNumber);
            let objectToProxy = {};
            let protoToProxy = {};
            Object.setPrototypeOf(objectToProxy, protoToProxy);
            fields.forEach((repliqField, fieldName) => {
                Reflect.set(objectToProxy, fieldName, repliqField);
            });
            methods.forEach((method, methodName) => {
                let proxyMethod = new Proxy(method, this.makeMethodProxyHandler(gspInstance, repliqId, repliqOwnerId, methodName, fields));
                Reflect.set(protoToProxy, methodName, proxyMethod);
            });
            atomicMethods.forEach((method, methodName) => {
                method[Repliq.isAtomic] = true;
                let proxyMethod = new Proxy(method, this.makeAtomicMethodProxyHandler(gspInstance, repliqId, repliqOwnerId, methodName, fields));
                Reflect.set(protoToProxy, methodName, proxyMethod);
                //Store the atomic method in regular methods (in case this repliq is serialised again
                methods.set(methodName, method);
            });
            let handler = this.makeProxyHandler(fields, methods, repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort);
            let repliqProxy = new Proxy(objectToProxy, handler);
            gspInstance.registerReplica(repliqId, repliqProxy);
            return repliqProxy;
        }
    }
}
Repliq.getRepliqFields = "_GET_REPLIQ_FIELDS_";
Repliq.getRepliqID = "_GET_REPLIQ_ID_";
Repliq.getRepliqOwnerID = "_GET_REPLIQ_OWNER_ID_";
Repliq.getRepliqOriginalMethods = "_GET_REPLIQ_ORIGI_METHODS_";
Repliq.resetRepliqCommit = "_RESET_REPLIQ_";
Repliq.commitRepliq = "_COMMIT_";
Repliq.isAtomic = "_IS_ATOMIC_";
Repliq.isClientMaster = "_IS_CLIENT_MASTER_";
Repliq.getRepliqOwnerPort = "_GET_REPLIQ_OWNER_PORT_";
Repliq.getRepliqOwnerAddress = "_GET_REPLIQ_OWNER_ADDRESS_";
exports.Repliq = Repliq;

},{"../serialisation":67,"../utils":70,"./RepliqObjectField":58,"./RepliqPrimitiveField":59,"./Round":60}],57:[function(require,module,exports){
/**
 * Created by flo on 30/03/2017.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class FieldUpdate {
    constructor(fieldName) {
        this.fieldName = fieldName;
    }
}
exports.FieldUpdate = FieldUpdate;
class RepliqField {
    constructor(name) {
        this.commitListeners = [];
        this.tentativeListeners = [];
        this.name = name;
    }
    resetToCommit() {
        this.tentative = this.commited;
    }
    onCommit(callback) {
        this.commitListeners.push(callback);
    }
    triggerCommit() {
        this.commitListeners.forEach((callback) => {
            callback(this.commited);
        });
    }
    onTentative(callback) {
        this.tentativeListeners.push(callback);
    }
    triggerTentative() {
        this.tentativeListeners.forEach((callback) => {
            callback(this.tentative);
        });
    }
}
exports.RepliqField = RepliqField;

},{}],58:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const RepliqField_1 = require("./RepliqField");
/**
 * Created by flo on 30/03/2017.
 */
class ObjectFieldUpdate extends RepliqField_1.FieldUpdate {
    constructor(fieldName, methodName, args) {
        super(fieldName);
        this.methodName = methodName;
        this.args = args;
    }
}
exports.ObjectFieldUpdate = ObjectFieldUpdate;
class RepliqObjectField extends RepliqField_1.RepliqField {
    read() {
        return this.tentative;
    }
    writeField(newValue) {
        //TODO should not happen, throw exception
    }
    methodInvoked(methodName, args) {
        this.tentative[methodName](...args);
    }
    commit() {
        this.commited = this.utils.clone(this.tentative);
        this.triggerCommit();
    }
    update(updates) {
        updates.forEach((update) => {
            this.methodInvoked(update.methodName, update.args);
        });
        this.triggerTentative();
    }
    constructor(name, value) {
        super(name);
        this.tentative = value;
        this.utils = require("../utils");
        this.commited = this.utils.clone(value);
    }
}
exports.RepliqObjectField = RepliqObjectField;

},{"../utils":70,"./RepliqField":57}],59:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const RepliqField_1 = require("./RepliqField");
/**
 * Created by flo on 16/03/2017.
 */
class PrimitiveFieldUpdate extends RepliqField_1.FieldUpdate {
    constructor(fieldName, initVal, resVal) {
        super(fieldName);
        this.initVal = initVal;
        this.resVal = resVal;
    }
}
exports.PrimitiveFieldUpdate = PrimitiveFieldUpdate;
class RepliqPrimitiveField extends RepliqField_1.RepliqField {
    constructor(name, value) {
        super(name);
        this.tentative = value;
        this.commited = value;
    }
    read() {
        return this.tentative;
    }
    writeField(newValue) {
        this.tentative = newValue;
    }
    commit() {
        this.commited = this.tentative;
        this.triggerCommit();
    }
    update(updates) {
        updates.forEach((update) => {
            this.tentative = update.resVal;
        });
        this.triggerTentative();
    }
}
exports.RepliqPrimitiveField = RepliqPrimitiveField;
exports.fieldMetaData = new Map();
function makeAnnotation(fieldClass) {
    return function (target, propertyKey) {
        exports.fieldMetaData.set(propertyKey, fieldClass);
    };
}
exports.makeAnnotation = makeAnnotation;
class RepliqCountField extends RepliqPrimitiveField {
    update(updates) {
        let inc = 0;
        updates.forEach((update) => {
            inc += (update.resVal - update.initVal);
        });
        this.tentative += inc;
        this.triggerTentative();
    }
}
exports.RepliqCountField = RepliqCountField;
exports.LWR = makeAnnotation(RepliqPrimitiveField);
exports.Count = makeAnnotation(RepliqCountField);

},{"./RepliqField":57}],60:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("../spiders");
/**
 * Created by flo on 09/03/2017.
 */
let gspObjectIdIndex = 0;
let masterOwnerIdIndex = 1;
let roundNumberIndex = 2;
let methodNameIndex = 3;
let argsIndex = 4;
let listenerIdIndex = 5;
let updatesIndex = 6;
function newRound(gspObjectId, masterOwnerId, roundNumber, methodName, args, listenerID) {
    let round = [];
    round[gspObjectIdIndex] = gspObjectId;
    round[masterOwnerIdIndex] = masterOwnerId;
    round[roundNumberIndex] = roundNumber;
    round[methodNameIndex] = methodName;
    round[argsIndex] = args;
    round[listenerIdIndex] = listenerID;
    round[updatesIndex] = {};
    return new spiders_1.ArrayIsolate(round);
}
exports.newRound = newRound;
function addRoundUpdate(round, update, forObjectId) {
    //TODO forObjectId used to be part of nested Repliqs implementation
    if (!Reflect.has(round[updatesIndex], update.fieldName)) {
        round[updatesIndex][update.fieldName] = [];
        round.array[updatesIndex][update.fieldName] = [];
    }
    round[updatesIndex][update.fieldName].push(update);
}
exports.addRoundUpdate = addRoundUpdate;
function roundMasterObjectId(round) {
    return round[gspObjectIdIndex];
}
exports.roundMasterObjectId = roundMasterObjectId;
function roundMasterOwnerId(round) {
    return round[masterOwnerIdIndex];
}
exports.roundMasterOwnerId = roundMasterOwnerId;
function setRoundMasterOwnerId(round, newId) {
    round[masterOwnerIdIndex] = newId;
}
exports.setRoundMasterOwnerId = setRoundMasterOwnerId;
function roundNumber(round) {
    return round[roundNumberIndex];
}
exports.roundNumber = roundNumber;
function setRoundNumber(round, newNumber) {
    round[roundNumberIndex] = newNumber;
}
exports.setRoundNumber = setRoundNumber;
function roundMethodName(round) {
    return round[methodNameIndex];
}
exports.roundMethodName = roundMethodName;
function roundArgs(round) {
    return round[argsIndex];
}
exports.roundArgs = roundArgs;
function roundListenerId(round) {
    return round[listenerIdIndex];
}
exports.roundListenerId = roundListenerId;
function roundUpdates(round) {
    return round[updatesIndex];
}
exports.roundUpdates = roundUpdates;
/*export class Round{
    masterOwnerId           : string
    masterObjectId          : ReplicaId
    innerUpdates            : any
    roundNumber             : number
    methodName              : string
    args                    : Array<any>
    updates                 : any
    listenerID              : string

    constructor(gspObjectId : ReplicaId,masterOwnerId : string,roundNumber : number,methodName : string,args : Array<any>,listenerID : string){
        this.masterObjectId         = gspObjectId
        this.innerUpdates           = {}
        this.masterOwnerId          = masterOwnerId
        this.roundNumber            = roundNumber
        this.methodName             = methodName
        this.args                   = args
        this.updates                = {}
        this.listenerID             = listenerID
    }

    addUpdate(update : FieldUpdate,forObjectId : string){
        if(forObjectId == this.masterObjectId){
            if(!Reflect.has(this.updates,update.fieldName)){
                this.updates[update.fieldName] = []
            }
            this.updates[update.fieldName].push(update)
        }
        else{
            if(!Reflect.has(this.innerUpdates,forObjectId)){
                this.innerUpdates[forObjectId] = {}
            }
            if(!Reflect.has(this.innerUpdates[forObjectId],update.fieldName)){
                this.innerUpdates[forObjectId][update.fieldName] = []
            }
            this.innerUpdates[forObjectId][update.fieldName].push(update)
        }
    }
}*/ 

},{"../spiders":69}],61:[function(require,module,exports){
(function (process){
Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
const messageHandler_1 = require("./messageHandler");
const sockets_1 = require("../src/Sockets");
const objectPool_1 = require("../src/ObjectPool");
const farRef_1 = require("../src/FarRef");
const PromisePool_1 = require("./PromisePool");
const serialisation_1 = require("./serialisation");
const ChannelManager_1 = require("./ChannelManager");
const GSP_1 = require("./Replication/GSP");
const signalPool_1 = require("./Reactivivity/signalPool");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
var messageHandler;
var objectPool;
var promisePool;
var signalPool;
var gspInstance;
var parentRef;
var thisId;
if (utils.isBrowser()) {
    module.exports = function (self) {
        //At spawning time the actor's behaviour, id and main id are not known. This information will be extracted from an install message handled by the messageHandler (which will make sure this information is set (e.g. in the objectPool)
        var channelManager = new ChannelManager_1.ChannelManager();
        promisePool = new PromisePool_1.PromisePool();
        objectPool = new objectPool_1.ObjectPool();
        messageHandler = new messageHandler_1.MessageHandler(null, channelManager, promisePool, objectPool, null, null);
        channelManager.init(messageHandler);
        self.addEventListener('message', function (ev) {
            //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
            messageHandler.dispatch(JSON.parse(ev.data), ev.ports);
        });
    };
}
else {
    var loadFromFile = JSON.parse(process.argv[2]);
    var address = process.argv[3];
    var port = parseInt(process.argv[4]);
    thisId = process.argv[5];
    var parentId = process.argv[6];
    var parentPort = parseInt(process.argv[7]);
    var socketManager = new sockets_1.ServerSocketManager(address, port);
    promisePool = new PromisePool_1.PromisePool();
    objectPool = new objectPool_1.ObjectPool();
    var thisRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, thisId, address, port, null, null, null, null, null);
    gspInstance = new GSP_1.GSP(socketManager, thisId, thisRef);
    signalPool = new signalPool_1.SignalPool(socketManager, thisRef, promisePool, objectPool);
    var behaviourObject;
    if (loadFromFile) {
        var filePath = process.argv[8];
        var className = process.argv[9];
        var serialisedArgs = JSON.parse(process.argv[10]);
        var constructorArgs = [];
        serialisedArgs.forEach((serArg) => {
            constructorArgs.push(serialisation_1.deserialise(thisRef, serArg, promisePool, socketManager, objectPool, gspInstance, signalPool));
        });
        var actorClass = require(filePath)[className];
        behaviourObject = new actorClass();
    }
    else {
        var variables = JSON.parse(process.argv[8]);
        var methods = JSON.parse(process.argv[9]);
        behaviourObject = serialisation_1.reconstructBehaviour({}, variables, methods, thisRef, promisePool, socketManager, objectPool, gspInstance, signalPool);
        //reconstructStatic(behaviourObject,JSON.parse(process.argv[10]),thisRef,promisePool,socketManager,objectPool,gspInstance)
    }
    objectPool.installBehaviourObject(behaviourObject);
    messageHandler = new messageHandler_1.MessageHandler(thisRef, socketManager, promisePool, objectPool, gspInstance, signalPool);
    socketManager.init(messageHandler);
    parentRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, parentId, address, parentPort, thisRef, socketManager, promisePool, objectPool, gspInstance);
    var parentServer = parentRef;
    socketManager.openConnection(parentServer.ownerId, parentServer.ownerAddress, parentServer.ownerPort);
    utils.installSTDLib(false, thisRef, parentRef, behaviourObject, socketManager, promisePool, gspInstance, signalPool);
}

}).call(this,require('_process'))
},{"./ChannelManager":51,"./PromisePool":52,"./Reactivivity/signalPool":54,"./Replication/GSP":55,"./farRef":63,"./messageHandler":64,"./objectPool":66,"./serialisation":67,"./sockets":68,"./utils":70,"_process":24}],62:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../src/Message");
const farRef_1 = require("../src/FarRef");
const sockets_1 = require("../src/Sockets");
/**
 * Created by flo on 17/01/2017.
 */
class CommMedium {
    constructor() {
        this.pendingActors = new Map();
        this.connectedActors = new Map();
        this.pendingConnectionId = 0;
        this.socketHandler = new sockets_1.SocketHandler(this);
    }
    init(messageHandler) {
        this.messageHandler = messageHandler;
    }
    //Called whenever a server far reference is passed around between actors.
    //Given that at this point the id of the server is known (in contrast to when "remote" is called, we can simply open up a port to the server and mark the socket as "disconnected" using the actor id
    connectTransientRemote(sender, toServerRef, promisePool) {
        this.connectRemote(sender, toServerRef.ownerAddress, toServerRef.ownerPort, promisePool);
        this.socketHandler.addDisconnected(toServerRef.ownerId);
    }
    connectRemote(sender, address, port, promisePool) {
        var promiseAllocation = promisePool.newPromise();
        var connection = require('socket.io-client')('http://' + address + ":" + port);
        var connectionId = this.pendingConnectionId;
        this.pendingActors.set(connectionId, connection);
        this.pendingConnectionId += 1;
        connection.on('connect', () => {
            connection.emit('message', new messages_1.ConnectRemoteMessage(sender, promiseAllocation.promiseId, connectionId));
        });
        connection.on('message', (data) => {
            if (sender instanceof farRef_1.ServerFarReference) {
                this.messageHandler.dispatch(data);
            }
            else {
                this.messageHandler.dispatch(JSON.parse(data));
            }
        });
        return promiseAllocation.promise;
    }
    resolvePendingConnection(actorId, connectionId) {
        var connection = this.pendingActors.get(connectionId);
        this.socketHandler.removeFromDisconnected(actorId, connection);
        this.connectedActors.set(actorId, connection);
    }
}
exports.CommMedium = CommMedium;

},{"./farRef":63,"./messages":65,"./sockets":68,"socket.io-client":25}],63:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../src/Message");
const serialisation_1 = require("./serialisation");
/**
 * Created by flo on 21/12/2016.
 */
class FarReference {
    constructor(objectId, ownerId, holderRef, commMedium, promisePool, objectPool, gspIstance, isServer) {
        this.ownerId = ownerId;
        this.objectId = objectId;
        this.promisePool = promisePool;
        this.objectPool = objectPool;
        this.holderRef = holderRef;
        this.commMedium = commMedium;
        this.isServer = isServer;
        this.gspInstance = gspIstance;
    }
    sendFieldAccess(fieldName) {
        var promiseAlloc = this.promisePool.newPromise();
        this.commMedium.sendMessage(this.ownerId, new messages_1.FieldAccessMessage(this.holderRef, this.objectId, fieldName, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    }
    sendMethodInvocation(methodName, args) {
        var promiseAlloc = this.promisePool.newPromise();
        this.commMedium.sendMessage(this.ownerId, new messages_1.MethodInvocationMessage(this.holderRef, this.objectId, methodName, args, promiseAlloc.promiseId));
        return promiseAlloc.promise;
    }
    proxyify() {
        var baseObject = this;
        return new Proxy({}, {
            get: function (target, property) {
                //Ugly but needed to acquire the proxied far reference
                if (property == FarReference.farRefAccessorKey) {
                    return baseObject;
                }
                else if (property == FarReference.ClientProxyTypeKey) {
                    return !(baseObject.isServer);
                }
                else if (property == FarReference.ServerProxyTypeKey) {
                    return baseObject.isServer;
                }
                else {
                    //Given that a proxified far reference is actually also a promise we need to make sure that JS does not accidentally pipeline the far reference in a chain of promises
                    if (property.toString() != "then" && property.toString() != "catch") {
                        //This field access might be wrong (i.e. might be part of ref.foo()), receiver of field access foo will ignore it if foo is a function type (ugly but needed)
                        var prom = baseObject.sendFieldAccess(property.toString());
                        var ret = function (...args) {
                            var serialisedArgs = args.map((arg) => {
                                return serialisation_1.serialise(arg, baseObject.holderRef, baseObject.ownerId, baseObject.commMedium, baseObject.promisePool, baseObject.objectPool, baseObject.gspInstance);
                            });
                            return baseObject.sendMethodInvocation(property.toString(), serialisedArgs);
                        };
                        ret["then"] = function (onFull, onRej) {
                            return prom.then(onFull, onRej);
                        };
                        ret["catch"] = function (onRej) {
                            return prom.catch(onRej);
                        };
                        ret[FarReference.proxyWrapperAccessorKey] = true;
                        return ret;
                    }
                }
            }
        });
    }
}
FarReference.farRefAccessorKey = "_FAR_REF_";
FarReference.proxyWrapperAccessorKey = "_PROXY_WRAPPER_";
FarReference.ServerProxyTypeKey = "SPIDER_SERVER_TYPE";
FarReference.ClientProxyTypeKey = "SPIDER_CLIENT_TYPE";
exports.FarReference = FarReference;
class ClientFarReference extends FarReference {
    constructor(objectId, ownerId, mainId, holderRef, commMedium, promisePool, objectPool, gspInstance, contactId = null, contactAddress = null, contactPort = null) {
        super(objectId, ownerId, holderRef, commMedium, promisePool, objectPool, gspInstance, false);
        this.mainId = mainId;
        this.contactId = contactId;
        this.contactAddress = contactAddress;
        this.contactPort = contactPort;
    }
    sendRoute(toId, msg) {
        if (!this.commMedium.hasConnection(this.contactId)) {
            this.commMedium.openConnection(this.contactId, this.contactAddress, this.contactPort);
        }
        //TODO quick fix, need to refactor to make sure that message contains the correct contact info (needed to produce return values)
        msg.contactId = this.contactId;
        msg.contactAddress = this.contactAddress;
        msg.contactPort = this.contactPort;
        this.commMedium.sendMessage(this.contactId, new messages_1.RouteMessage(this, this.ownerId, msg));
    }
    send(toId, msg) {
        if (this.holderRef instanceof ServerFarReference) {
            if (this.holderRef.ownerId == this.contactId) {
                this.commMedium.sendMessage(toId, msg);
            }
            else {
                this.sendRoute(this.contactId, msg);
            }
        }
        else {
            if (this.holderRef.mainId == this.mainId) {
                this.commMedium.sendMessage(this.ownerId, msg);
            }
            else {
                this.sendRoute(this.contactId, msg);
            }
        }
    }
    sendFieldAccess(fieldName) {
        var promiseAlloc = this.promisePool.newPromise();
        var message = new messages_1.FieldAccessMessage(this.holderRef, this.objectId, fieldName, promiseAlloc.promiseId);
        this.send(this.ownerId, message);
        return promiseAlloc.promise;
    }
    sendMethodInvocation(methodName, args) {
        var promiseAlloc = this.promisePool.newPromise();
        var message = new messages_1.MethodInvocationMessage(this.holderRef, this.objectId, methodName, args, promiseAlloc.promiseId);
        this.send(this.ownerId, message);
        return promiseAlloc.promise;
    }
}
exports.ClientFarReference = ClientFarReference;
class ServerFarReference extends FarReference {
    constructor(objectId, ownerId, ownerAddress, ownerPort, holderRef, commMedium, promisePool, objectPool, gspInstance) {
        super(objectId, ownerId, holderRef, commMedium, promisePool, objectPool, gspInstance, true);
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
}
exports.ServerFarReference = ServerFarReference;

},{"./messages":65,"./serialisation":67}],64:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../src/Message");
const objectPool_1 = require("../src/ObjectPool");
const serialisation_1 = require("./serialisation");
const farRef_1 = require("../src/FarRef");
const GSP_1 = require("./Replication/GSP");
const signalPool_1 = require("./Reactivivity/signalPool");
/**
 * Created by flo on 20/12/2016.
 */
var utils = require('./utils');
class MessageHandler {
    constructor(thisRef, commMedium, promisePool, objectPool, gspInstance, signalPool) {
        this.commMedium = commMedium;
        this.promisePool = promisePool;
        this.objectPool = objectPool;
        this.gspInstance = gspInstance;
        this.signalPool = signalPool;
        this.thisRef = thisRef;
    }
    sendReturnServer(actorId, actorAddress, actorPort, msg) {
        if (!(this.commMedium.hasConnection(actorId))) {
            this.commMedium.openConnection(actorId, actorAddress, actorPort);
        }
        this.commMedium.sendMessage(actorId, msg);
    }
    sendReturnClient(actorId, originalMsg, returnMsg) {
        if (this.thisRef instanceof farRef_1.ClientFarReference) {
            //Message to which actor is replying came from a different client host, send routing message to contact server actor
            if (this.thisRef.mainId != originalMsg.senderMainId) {
                this.sendReturnServer(originalMsg.contactId, originalMsg.contactAddress, originalMsg.contactPort, new messages_1.RouteMessage(this.thisRef, actorId, returnMsg));
            }
            else {
                this.commMedium.sendMessage(actorId, returnMsg);
            }
        }
        else {
            this.commMedium.sendMessage(actorId, returnMsg);
        }
    }
    //Only received as first message by a web worker (i.e. newly spawned client side actor)
    handleInstall(msg, ports) {
        var thisId = msg.actorId;
        var mainId = msg.mainId;
        var thisRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, thisId, mainId, null, this.commMedium, this.promisePool, this.objectPool, this.gspInstance);
        this.gspInstance = new GSP_1.GSP(this.commMedium, thisId, thisRef);
        var behaviourObject = serialisation_1.reconstructBehaviour({}, msg.vars, msg.methods, thisRef, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        serialisation_1.reconstructStatic(behaviourObject, msg.staticProperties, thisRef, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        var otherActorIds = msg.otherActorIds;
        this.objectPool.installBehaviourObject(behaviourObject);
        this.thisRef = thisRef;
        var parentRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, mainId, mainId, this.thisRef, this.commMedium, this.promisePool, this.objectPool, this.gspInstance);
        var channelManag = this.commMedium;
        this.signalPool = new signalPool_1.SignalPool(channelManag, thisRef, this.promisePool, this.objectPool);
        var mainPort = ports[0];
        channelManag.newConnection(mainId, mainPort);
        otherActorIds.forEach((id, index) => {
            //Ports at position 0 contains main channel (i.e. channel used to communicate with application actor)
            channelManag.newConnection(id, ports[index + 1]);
        });
        utils.installSTDLib(false, thisRef, parentRef, behaviourObject, this.commMedium, this.promisePool, this.gspInstance, this.signalPool);
    }
    handleOpenPort(msg, port) {
        var channelManager = this.commMedium;
        channelManager.newConnection(msg.actorId, port);
    }
    handleFieldAccess(msg) {
        var targetObject = this.objectPool.getObject(msg.objectId);
        var fieldVal = Reflect.get(targetObject, msg.fieldName);
        //Due to JS' crappy meta API actor might receive field access as part of a method invocation (see farRef implementation)
        if (typeof fieldVal != 'function') {
            var serialised = serialisation_1.serialise(fieldVal, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool, this.gspInstance);
            var message = new messages_1.ResolvePromiseMessage(this.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
    }
    handleMethodInvocation(msg) {
        var targetObject = this.objectPool.getObject(msg.objectId);
        var methodName = msg.methodName;
        var args = msg.args;
        var deserialisedArgs = args.map((arg) => {
            return serialisation_1.deserialise(this.thisRef, arg, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        });
        var retVal;
        try {
            retVal = targetObject[methodName].apply(targetObject, deserialisedArgs);
            //retVal = targetObject[methodName](...deserialisedArgs)
            var serialised = serialisation_1.serialise(retVal, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool, this.gspInstance);
            var message = new messages_1.ResolvePromiseMessage(this.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
        catch (reason) {
            console.log("Went wrong for : " + methodName);
            var serialised = serialisation_1.serialise(reason, this.thisRef, msg.senderId, this.commMedium, this.promisePool, this.objectPool, this.gspInstance);
            message = new messages_1.RejectPromiseMessage(this.thisRef, msg.promiseId, serialised);
            if (msg.senderType == messages_1.Message.serverSenderType) {
                this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, message);
            }
            else {
                this.sendReturnClient(msg.senderId, msg, message);
            }
        }
    }
    handlePromiseResolve(msg) {
        var deSerialised = serialisation_1.deserialise(this.thisRef, msg.value, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        if (msg.foreign) {
            this.promisePool.resolveForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            this.promisePool.resolvePromise(msg.promiseId, deSerialised);
        }
    }
    handlePromiseReject(msg) {
        var deSerialised = serialisation_1.deserialise(this.thisRef, msg.reason, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        if (msg.foreign) {
            this.promisePool.rejectForeignPromise(msg.promiseId, msg.senderId, deSerialised);
        }
        else {
            this.promisePool.rejectPromise(msg.promiseId, deSerialised);
        }
    }
    //Can only be received by a server actor
    handleConnectRemote(msg, clientSocket) {
        var resolveMessage = new messages_1.ResolveConnectionMessage(this.thisRef, msg.promiseId, msg.connectionId);
        if (msg.senderType == messages_1.Message.serverSenderType) {
            this.sendReturnServer(msg.senderId, msg.senderAddress, msg.senderPort, resolveMessage);
        }
        else {
            var socketManager = this.commMedium;
            socketManager.addNewClient(msg.senderId, clientSocket);
            this.sendReturnClient(msg.senderId, msg, resolveMessage);
        }
    }
    handleResolveConnection(msg) {
        this.commMedium.resolvePendingConnection(msg.senderId, msg.connectionId);
        var farRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, msg.senderId, msg.senderAddress, msg.senderPort, this.thisRef, this.commMedium, this.promisePool, this.objectPool, this.gspInstance);
        this.promisePool.resolvePromise(msg.promiseId, farRef.proxyify());
    }
    handleRoute(msg) {
        //TODO temp fix , works but should be refactored
        if (msg.message.typeTag == messages_1._METHOD_INVOC_) {
            var args = msg.message.args;
            args.forEach((valContainer) => {
                if (valContainer.type == serialisation_1.ValueContainer.clientFarRefType) {
                    var container = valContainer;
                    if (container.contactId == null) {
                        container.contactId = this.thisRef.ownerId;
                        container.contactAddress = this.thisRef.ownerAddress;
                        container.contactPort = this.thisRef.ownerPort;
                    }
                }
            });
        }
        this.commMedium.sendMessage(msg.targetId, msg.message);
    }
    handleGSPRound(msg) {
        this.gspInstance.roundReceived(msg.round, msg.senderId);
    }
    handleGSPSync(msg) {
        this.gspInstance.receiveSync(msg.requesterId, msg.repliqId);
    }
    handleGSPRegister(msg) {
        if (!this.commMedium.hasConnection(msg.holderId)) {
            this.commMedium.openConnection(msg.holderId, msg.holderAddress, msg.holderPort);
        }
        this.gspInstance.registerReplicaHolder(msg.replicaId, msg.holderId, msg.roundNr);
    }
    handleRegisterExternalSignal(msg) {
        if (!this.commMedium.hasConnection(msg.requesterId)) {
            this.commMedium.openConnection(msg.requesterId, msg.requesterAddress, msg.requesterPort);
        }
        //console.log("External listener added for actor: "  + msg.requesterId + " in " + this.thisRef.ownerId + " signal: " + msg.signalId)
        this.signalPool.registerExternalListener(msg.signalId, msg.requesterId);
    }
    handleExternalSignalChange(msg) {
        //console.log("External signal changed in: " + this.thisRef.ownerId + " signal: " + msg.signalId)
        let newVal = serialisation_1.deserialise(this.thisRef, msg.newVal, this.promisePool, this.commMedium, this.objectPool, this.gspInstance, this.signalPool);
        this.signalPool.sourceChanged(msg.signalId, newVal);
    }
    handleExternalSignalDelete(msg) {
        this.signalPool.garbageCollect(msg.signalId);
    }
    //Ports are needed for client side actor communication and cannot be serialised together with message objects (is always empty for server-side code)
    //Client socket is provided by server-side implementation and is used whenever a client connects remotely to a server actor
    dispatch(msg, ports = [], clientSocket = null) {
        switch (msg.typeTag) {
            case messages_1._INSTALL_BEHAVIOUR_:
                this.handleInstall(msg, ports);
                break;
            case messages_1._OPEN_PORT_:
                this.handleOpenPort(msg, ports[0]);
                break;
            case messages_1._FIELD_ACCESS_:
                this.handleFieldAccess(msg);
                break;
            case messages_1._METHOD_INVOC_:
                this.handleMethodInvocation(msg);
                break;
            case messages_1._RESOLVE_PROMISE_:
                this.handlePromiseResolve(msg);
                break;
            case messages_1._REJECT_PROMISE_:
                this.handlePromiseReject(msg);
                break;
            case messages_1._CONNECT_REMOTE_:
                this.handleConnectRemote(msg, clientSocket);
                break;
            case messages_1._RESOLVE_CONNECTION_:
                this.handleResolveConnection(msg);
                break;
            case messages_1._ROUTE_:
                this.handleRoute(msg);
                break;
            case messages_1._GSP_ROUND_:
                this.handleGSPRound(msg);
                break;
            case messages_1._GSP_SYNC_:
                this.handleGSPSync(msg);
                break;
            case messages_1._GSP_REGISTER_:
                this.handleGSPRegister(msg);
                break;
            case messages_1._REGISTER_EXTERNAL_SIGNAL_:
                this.handleRegisterExternalSignal(msg);
                break;
            case messages_1._EXTERNAL_SIGNAL_CHANGE_:
                this.handleExternalSignalChange(msg);
                break;
            case messages_1._EXTERNAL_SIGNAL_DELETE_:
                this.handleExternalSignalDelete(msg);
                break;
            default:
                throw "Unknown message in actor : " + msg.toString();
        }
    }
}
exports.MessageHandler = MessageHandler;

},{"./Reactivivity/signalPool":54,"./Replication/GSP":55,"./farRef":63,"./messages":65,"./objectPool":66,"./serialisation":67,"./utils":70}],65:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const farRef_1 = require("../src/FarRef");
class Message {
    constructor(typeTag, senderRef) {
        this.typeTag = typeTag;
        this.senderId = senderRef.ownerId;
        if (senderRef instanceof farRef_1.ServerFarReference) {
            this.senderType = Message.serverSenderType;
            this.senderAddress = senderRef.ownerAddress;
            this.senderPort = senderRef.ownerPort;
        }
        else {
            var clientRef = senderRef;
            this.senderType = Message.clientSenderType;
            this.senderMainId = clientRef.mainId;
            this.contactId = clientRef.contactId;
            this.contactAddress = clientRef.contactAddress;
            this.contactPort = clientRef.contactPort;
        }
    }
}
Message.serverSenderType = "_SERVER_";
Message.clientSenderType = "_CLIENT_";
exports.Message = Message;
exports._INSTALL_BEHAVIOUR_ = 0;
class InstallBehaviourMessage extends Message {
    constructor(senderRef, mainId, actorId, vars, methods, staticProperties, otherActorIds) {
        super(exports._INSTALL_BEHAVIOUR_, senderRef);
        this.mainId = mainId;
        this.actorId = actorId;
        this.vars = vars;
        this.methods = methods;
        this.staticProperties = staticProperties;
        this.otherActorIds = otherActorIds;
    }
}
exports.InstallBehaviourMessage = InstallBehaviourMessage;
exports._FIELD_ACCESS_ = 1;
class FieldAccessMessage extends Message {
    constructor(senderRef, objectId, fieldName, promiseId) {
        super(exports._FIELD_ACCESS_, senderRef);
        this.objectId = objectId;
        this.fieldName = fieldName;
        this.promiseId = promiseId;
    }
}
exports.FieldAccessMessage = FieldAccessMessage;
exports._METHOD_INVOC_ = 2;
class MethodInvocationMessage extends Message {
    constructor(senderRef, objectId, methodName, args, promiseId) {
        super(exports._METHOD_INVOC_, senderRef);
        this.objectId = objectId;
        this.methodName = methodName;
        this.args = args;
        this.promiseId = promiseId;
    }
}
exports.MethodInvocationMessage = MethodInvocationMessage;
exports._RESOLVE_PROMISE_ = 3;
class ResolvePromiseMessage extends Message {
    constructor(senderRef, promiseId, value, foreign = false) {
        super(exports._RESOLVE_PROMISE_, senderRef);
        this.promiseId = promiseId;
        this.value = value;
        this.foreign = foreign;
    }
}
exports.ResolvePromiseMessage = ResolvePromiseMessage;
exports._REJECT_PROMISE_ = 4;
class RejectPromiseMessage extends Message {
    constructor(senderRef, promiseId, reason, foreign = false) {
        super(exports._REJECT_PROMISE_, senderRef);
        this.promiseId = promiseId;
        this.reason = reason;
        this.foreign = foreign;
    }
}
exports.RejectPromiseMessage = RejectPromiseMessage;
exports._OPEN_PORT_ = 5;
class OpenPortMessage extends Message {
    constructor(senderRef, actorId) {
        super(exports._OPEN_PORT_, senderRef);
        this.actorId = actorId;
    }
}
exports.OpenPortMessage = OpenPortMessage;
exports._CONNECT_REMOTE_ = 6;
class ConnectRemoteMessage extends Message {
    constructor(senderRef, promiseId, connectionId) {
        super(exports._CONNECT_REMOTE_, senderRef);
        this.promiseId = promiseId;
        this.connectionId = connectionId;
    }
}
exports.ConnectRemoteMessage = ConnectRemoteMessage;
exports._RESOLVE_CONNECTION_ = 7;
class ResolveConnectionMessage extends Message {
    constructor(senderRef, promiseId, connectionId) {
        super(exports._RESOLVE_CONNECTION_, senderRef);
        this.promiseId = promiseId;
        this.connectionId = connectionId;
    }
}
exports.ResolveConnectionMessage = ResolveConnectionMessage;
exports._ROUTE_ = 8;
class RouteMessage extends Message {
    constructor(senderRef, targetId, message) {
        super(exports._ROUTE_, senderRef);
        this.message = message;
        this.targetId = targetId;
    }
}
exports.RouteMessage = RouteMessage;
//TODO address and port will be removed once communication refactor is done
exports._GSP_REGISTER_ = 9;
class GSPRegisterMessage extends Message {
    constructor(senderRef, holderId, replicaId, holderAddress, holderPort, roundNr) {
        super(exports._GSP_REGISTER_, senderRef);
        this.holderId = holderId;
        this.replicaId = replicaId;
        this.holderAddress = holderAddress;
        this.holderPort = holderPort;
        this.roundNr = roundNr;
    }
}
exports.GSPRegisterMessage = GSPRegisterMessage;
exports._GSP_ROUND_ = 10;
class GSPRoundMessage extends Message {
    constructor(senderRef, round) {
        super(exports._GSP_ROUND_, senderRef);
        this.round = round;
        this.senderId = senderRef.ownerId;
    }
}
exports.GSPRoundMessage = GSPRoundMessage;
exports._GSP_SYNC_ = 11;
class GSPSyncMessage extends Message {
    constructor(senderRef, requesterId, repliqId) {
        super(exports._GSP_SYNC_, senderRef);
        this.requesterId = requesterId;
        this.repliqId = repliqId;
    }
}
exports.GSPSyncMessage = GSPSyncMessage;
exports._REGISTER_EXTERNAL_SIGNAL_ = 12;
class RegisterExternalSignalMessage extends Message {
    constructor(senderRef, requesterId, signalId, requesterAddress, requesterPort) {
        super(exports._REGISTER_EXTERNAL_SIGNAL_, senderRef);
        this.requesterId = requesterId;
        this.signalId = signalId;
        this.requesterAddress = requesterAddress;
        this.requesterPort = requesterPort;
    }
}
exports.RegisterExternalSignalMessage = RegisterExternalSignalMessage;
exports._EXTERNAL_SIGNAL_CHANGE_ = 13;
class ExternalSignalChangeMessage extends Message {
    constructor(senderRef, signalId, newVal) {
        super(exports._EXTERNAL_SIGNAL_CHANGE_, senderRef);
        this.signalId = signalId;
        this.newVal = newVal;
    }
}
exports.ExternalSignalChangeMessage = ExternalSignalChangeMessage;
exports._EXTERNAL_SIGNAL_DELETE_ = 14;
class ExternalSignalDeleteMessage extends Message {
    constructor(senderRef, signalId) {
        super(exports._EXTERNAL_SIGNAL_DELETE_, senderRef);
        this.signalId = signalId;
    }
}
exports.ExternalSignalDeleteMessage = ExternalSignalDeleteMessage;

},{"./farRef":63}],66:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by flo on 08/01/2017.
 */
class ObjectPool {
    constructor(behaviourObject = null) {
        this.currentId = 1;
        this.pool = new Map();
        this.pool.set(ObjectPool._BEH_OBJ_ID, behaviourObject);
    }
    installBehaviourObject(behaviourObject) {
        this.pool.set(ObjectPool._BEH_OBJ_ID, behaviourObject);
    }
    allocateObject(obj) {
        var objectId = this.currentId;
        this.pool.set(objectId, obj);
        this.currentId += 1;
        return objectId;
    }
    getObject(objectId) {
        return this.pool.get(objectId);
    }
}
ObjectPool._BEH_OBJ_ID = 0;
exports.ObjectPool = ObjectPool;

},{}],67:[function(require,module,exports){
///<reference path="../../../Library/Preferences/WebStorm2016.3/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_node_node.d.ts"/>
Object.defineProperty(exports, "__esModule", { value: true });
const messages_1 = require("../src/Message");
const farRef_1 = require("../src/FarRef");
const spiders_1 = require("./spiders");
const Repliq_1 = require("./Replication/Repliq");
const RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
const RepliqObjectField_1 = require("./Replication/RepliqObjectField");
const signal_1 = require("./Reactivivity/signal");
var Signal = require("./Reactivivity/signal").Signal;
/**
 * Created by flo on 19/12/2016.
 */
//Enables to detect true type of instances (e.g. array)
function toType(obj) {
    return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
}
function getObjectVars(object, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance, ignoreSet = []) {
    var vars = [];
    var properties = Reflect.ownKeys(object);
    for (var i in properties) {
        var key = properties[i];
        if (!ignoreSet.includes(key)) {
            var val = Reflect.get(object, key);
            var serialisedval = serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
            vars.push([key, serialisedval]);
        }
    }
    return vars;
}
exports.getObjectVars = getObjectVars;
function getObjectMethods(object) {
    var methods = [];
    var proto = Object.getPrototypeOf(object);
    var properties = Reflect.ownKeys(proto);
    for (var i in properties) {
        var key = properties[i];
        var method = Reflect.get(proto, key);
        //Avoid copying over any construction functions (i.e. class declarations)
        if (typeof method == 'function' && !(method.toString()).startsWith("class")) {
            methods.push([key, method.toString()]);
        }
    }
    return methods;
}
exports.getObjectMethods = getObjectMethods;
function deconstructStatic(actorClass, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance, results) {
    //Reached the end of the class chain (i.e. current class is function(){})
    if (actorClass.name == "") {
        return results;
    }
    else {
        var thisName = actorClass.name;
        var thisVars = [];
        var thisMethods = [];
        var keys = Reflect.ownKeys(actorClass);
        keys.forEach((key) => {
            //Avoid sending the prototype and other function specific properties (given that classes are just functions)
            if (!(key == "prototype" || key == "name" || key == "length")) {
                var property = Reflect.get(actorClass, key);
                if (property instanceof Function) {
                    thisMethods.push([key, property.toString()]);
                }
                else {
                    thisVars.push([key, serialise(property, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance)]);
                }
            }
        });
        results.push([thisName, thisVars, thisMethods]);
        return deconstructStatic(actorClass.__proto__, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance, results);
    }
}
exports.deconstructStatic = deconstructStatic;
function constructMethod(functionSource) {
    if (functionSource.startsWith("function")) {
        var method = eval("(" + functionSource + ")");
    }
    else {
        var method = eval("(function " + functionSource + ")");
    }
    return method;
}
function reconstructStatic(behaviourObject, staticProperties, thisRef, promisePool, commMedium, objectPool, gspInstance, signalPool) {
    staticProperties.forEach((propertyArray) => {
        var className = propertyArray[0];
        var stub = {};
        var vars = propertyArray[1];
        var methods = propertyArray[2];
        vars.forEach((varPair) => {
            var key = varPair[0];
            var val = deserialise(thisRef, varPair[1], promisePool, commMedium, objectPool, gspInstance, signalPool);
            stub[key] = val;
        });
        methods.forEach((methodPair) => {
            var key = methodPair[0];
            var functionSource = methodPair[1];
            stub[key] = constructMethod(functionSource);
        });
        var stubProxy = new Proxy(stub, {
            set: function (obj, prop, value) {
                throw new Error("Cannot mutate static property in actors");
            }
        });
        behaviourObject[className] = stubProxy;
    });
}
exports.reconstructStatic = reconstructStatic;
function deconstructBehaviour(object, currentLevel, accumVars, accumMethods, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance) {
    var properties = Reflect.ownKeys(object);
    var localAccumVars = [];
    for (var i in properties) {
        var key = properties[i];
        var val = Reflect.get(object, key);
        if (typeof val != 'function' || isIsolateClass(val) || isRepliqClass(val)) {
            var serialisedval = serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
            localAccumVars.push([key, serialisedval]);
        }
    }
    localAccumVars.unshift(currentLevel);
    accumVars.push(localAccumVars);
    var localAccumMethods = [];
    var proto = object.__proto__;
    properties = Reflect.ownKeys(proto);
    properties.shift();
    var lastProto = properties.indexOf("spawn") != -1;
    if (!lastProto) {
        for (var i in properties) {
            var key = properties[i];
            var method = Reflect.get(proto, key);
            if (typeof method == 'function') {
                localAccumMethods.push([key, method.toString()]);
            }
        }
        localAccumMethods.unshift(currentLevel + 1);
        accumMethods.push(localAccumMethods);
        return deconstructBehaviour(proto, currentLevel + 1, accumVars, accumMethods, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
    }
    else {
        return [accumVars, accumMethods];
    }
}
exports.deconstructBehaviour = deconstructBehaviour;
function reconstructBehaviour(baseObject, variables, methods, thisRef, promisePool, commMedium, objectPool, gspInstance, signalPool) {
    var amountOfProtos = methods.length;
    for (var i = 0; i < amountOfProtos; i++) {
        var copy = baseObject.__proto__;
        var newProto = {};
        newProto.__proto__ = copy;
        baseObject.__proto__ = newProto;
    }
    variables.forEach((levelVariables) => {
        var installIn = getProtoForLevel(levelVariables[0], baseObject);
        levelVariables.shift();
        levelVariables.forEach((varEntry) => {
            var key = varEntry[0];
            var rawVal = varEntry[1];
            var val = deserialise(thisRef, rawVal, promisePool, commMedium, objectPool, gspInstance, signalPool);
            installIn[key] = val;
        });
    });
    methods.forEach((levelMethods) => {
        var installIn = getProtoForLevel(levelMethods[0], baseObject);
        levelMethods.shift();
        levelMethods.forEach((methodEntry) => {
            var key = methodEntry[0];
            var functionSource = methodEntry[1];
            installIn[key] = constructMethod(functionSource);
        });
    });
    return baseObject;
}
exports.reconstructBehaviour = reconstructBehaviour;
function getProtoForLevel(level, object) {
    var ret = object;
    for (var i = 0; i < level; i++) {
        ret = ret.__proto__;
    }
    return ret;
}
function reconstructObject(baseObject, variables, methods, thisRef, promisePool, commMedium, objectPool, gspInstance, signalPool) {
    variables.forEach((varEntry) => {
        var key = varEntry[0];
        var rawVal = varEntry[1];
        var val = deserialise(thisRef, rawVal, promisePool, commMedium, objectPool, gspInstance, signalPool);
        baseObject[key] = val;
    });
    methods.forEach((methodEntry) => {
        var key = methodEntry[0];
        var functionSource = methodEntry[1];
        (baseObject.__proto__)[key] = constructMethod(functionSource);
    });
    return baseObject;
}
exports.reconstructObject = reconstructObject;
class ValueContainer {
    constructor(type) {
        this.type = type;
    }
}
ValueContainer.nativeType = 0;
ValueContainer.promiseType = 1;
ValueContainer.serverFarRefType = 2;
ValueContainer.errorType = 3;
ValueContainer.arrayType = 4;
ValueContainer.isolateType = 5;
ValueContainer.isolateDefType = 6;
ValueContainer.clientFarRefType = 7;
ValueContainer.arrayIsolateType = 8;
ValueContainer.repliqType = 9;
ValueContainer.repliqFieldType = 10;
ValueContainer.repliqDefinition = 11;
ValueContainer.signalType = 12;
ValueContainer.signalDefinition = 13;
exports.ValueContainer = ValueContainer;
class NativeContainer extends ValueContainer {
    constructor(value) {
        super(ValueContainer.nativeType);
        this.value = value;
    }
}
exports.NativeContainer = NativeContainer;
class PromiseContainer extends ValueContainer {
    constructor(promiseId, promiseCreatorId) {
        super(ValueContainer.promiseType);
        this.promiseId = promiseId;
        this.promiseCreatorId = promiseCreatorId;
    }
}
exports.PromiseContainer = PromiseContainer;
class ServerFarRefContainer extends ValueContainer {
    constructor(objectId, ownerId, ownerAddress, ownerPort) {
        super(ValueContainer.serverFarRefType);
        this.objectId = objectId;
        this.ownerId = ownerId;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
}
exports.ServerFarRefContainer = ServerFarRefContainer;
class ClientFarRefContainer extends ValueContainer {
    constructor(objectId, ownerId, mainId, contactId, contactAddress, contactPort) {
        super(ValueContainer.clientFarRefType);
        this.objectId = objectId;
        this.ownerId = ownerId;
        this.mainId = mainId;
        this.contactId = contactId;
        this.contactAddress = contactAddress;
        this.contactPort = contactPort;
    }
}
exports.ClientFarRefContainer = ClientFarRefContainer;
class ErrorContainer extends ValueContainer {
    constructor(error) {
        super(ValueContainer.errorType);
        this.message = error.message;
        this.stack = error.stack;
        this.name = error.name;
    }
}
exports.ErrorContainer = ErrorContainer;
class ArrayContainer extends ValueContainer {
    constructor(values) {
        super(ValueContainer.arrayType);
        this.values = values;
    }
}
exports.ArrayContainer = ArrayContainer;
class IsolateContainer extends ValueContainer {
    constructor(vars, methods) {
        super(ValueContainer.isolateType);
        this.vars = vars;
        this.methods = methods;
    }
}
IsolateContainer.checkIsolateFuncKey = "_INSTANCEOF_ISOLATE_";
exports.IsolateContainer = IsolateContainer;
class IsolateDefinitionContainer extends ValueContainer {
    constructor(definition) {
        super(ValueContainer.isolateDefType);
        this.definition = definition;
    }
}
exports.IsolateDefinitionContainer = IsolateDefinitionContainer;
class ArrayIsolateContainer extends ValueContainer {
    constructor(array) {
        super(ValueContainer.arrayIsolateType);
        this.array = array;
    }
}
ArrayIsolateContainer.checkArrayIsolateFuncKey = "_INSTANCEOF_ARRAY_ISOLATE_";
exports.ArrayIsolateContainer = ArrayIsolateContainer;
class RepliqContainer extends ValueContainer {
    constructor(primitiveFields, objectFields, innerRepFields, methods, atomicMethods, repliqId, masterOwnerId, isClient, ownerAddress, ownerPort, lastConfirmedRound, innerName = "") {
        super(ValueContainer.repliqType);
        this.primitiveFields = primitiveFields;
        this.objectFields = objectFields;
        this.innerRepFields = innerRepFields;
        this.innerName = innerName;
        this.methods = methods;
        this.atomicMethods = atomicMethods;
        this.repliqId = repliqId;
        this.masterOwnerId = masterOwnerId;
        this.isClient = isClient;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
        this.lastConfirmedRound = lastConfirmedRound;
    }
}
RepliqContainer.checkRepliqFuncKey = "_INSTANCEOF_REPLIQ_";
exports.RepliqContainer = RepliqContainer;
class RepliqFieldContainer extends ValueContainer {
    constructor(name, tentative, commited, readFunc, writeFunc, resetFunc, commitFunc, updateFunc) {
        super(ValueContainer.repliqFieldType);
        this.name = name;
        this.tentative = tentative;
        this.commited = commited;
        this.readFunc = readFunc;
        this.writeFunc = writeFunc;
        this.resetFunc = resetFunc;
        this.commitFunc = commitFunc;
        this.updateFunc = updateFunc;
    }
}
class RepliqDefinitionContainer extends ValueContainer {
    constructor(definition) {
        super(ValueContainer.repliqDefinition);
        this.definition = definition;
    }
}
exports.RepliqDefinitionContainer = RepliqDefinitionContainer;
//When a signal is serialised and passed to another actor it can implicitly only depend on the original signal
//From the moment the signal is deserialised on the receiving side it will act as a source for that actor
//Hence, all the information needed is the signal's id and its current value
class SignalContainer extends ValueContainer {
    constructor(id, objectValue, currentValue, rateLowerBound, rateUpperBound, clock, strong, ownerId, ownerAddress, ownerPort) {
        super(ValueContainer.signalType);
        this.id = id;
        this.obectValue = objectValue;
        this.currentValue = currentValue;
        this.rateLowerBound = rateLowerBound;
        this.rateUpperBound = rateUpperBound;
        this.clock = clock;
        this.strong = strong;
        this.ownerId = ownerId;
        this.ownerAddress = ownerAddress;
        this.ownerPort = ownerPort;
    }
}
SignalContainer.checkSignalFuncKey = "_INSTANCEOF_Signal_";
exports.SignalContainer = SignalContainer;
class SignalDefinitionContainer extends ValueContainer {
    constructor(definition) {
        super(ValueContainer.signalDefinition);
        this.definition = definition;
    }
}
exports.SignalDefinitionContainer = SignalDefinitionContainer;
function isClass(func) {
    return typeof func === 'function' && /^\s*class\s+/.test(func.toString());
}
function isIsolateClass(func) {
    return (func.toString().search(/extends.*?Isolate/) != -1);
}
function isRepliqClass(func) {
    return (func.toString().search(/extends.*?Repliq/) != -1);
}
function isSignalClass(func) {
    return (func.toString().search(/extends.*?Signal/) != -1);
}
function serialisePromise(promise, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance) {
    var wrapper = promisePool.newPromise();
    promise.then((val) => {
        commMedium.sendMessage(receiverId, new messages_1.ResolvePromiseMessage(thisRef, wrapper.promiseId, serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance), true));
    });
    promise.catch((reason) => {
        commMedium.sendMessage(receiverId, new messages_1.RejectPromiseMessage(thisRef, wrapper.promiseId, serialise(reason, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance), true));
    });
    return new PromiseContainer(wrapper.promiseId, thisRef.ownerId);
}
function serialiseObject(object, thisRef, objectPool) {
    var oId = objectPool.allocateObject(object);
    if (thisRef instanceof farRef_1.ServerFarReference) {
        return new ServerFarRefContainer(oId, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
    }
    else {
        var clientRef = thisRef;
        return new ClientFarRefContainer(oId, clientRef.ownerId, clientRef.mainId, clientRef.contactId, clientRef.contactAddress, clientRef.contactPort);
    }
}
function serialiseRepliqFields(fields, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance) {
    let primitives = [];
    let objects = [];
    let innerReps = [];
    let ret = [primitives, objects, innerReps];
    fields.forEach((repliqField, fieldName) => {
        if (repliqField instanceof RepliqPrimitiveField_1.RepliqPrimitiveField) {
            primitives.push(new RepliqFieldContainer(fieldName, repliqField.tentative, repliqField.commited, repliqField.read.toString(), repliqField.writeField.toString(), repliqField.resetToCommit.toString(), repliqField.commit.toString(), repliqField.update.toString()));
        }
        else if (repliqField instanceof RepliqObjectField_1.RepliqObjectField) {
            let field = repliqField;
            let tentMethods;
            let commMethods;
            //Avoid copying over Object prototype methods containing native javascript code (cannot be evalled by deserialiser)
            if (Object.getPrototypeOf(field.tentative) == Object.getPrototypeOf({})) {
                tentMethods = [];
                commMethods = [];
            }
            else {
                tentMethods = getObjectMethods(field.tentative);
                commMethods = getObjectMethods(field.commited);
            }
            let tentative = JSON.stringify([JSON.stringify(getObjectVars(field.tentative, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance)), JSON.stringify(tentMethods)]);
            let commited = JSON.stringify([JSON.stringify(getObjectVars(field.commited, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance)), JSON.stringify(commMethods)]);
            objects.push(new RepliqFieldContainer(fieldName, tentative, commited, field.read.toString(), field.writeField.toString(), field.resetToCommit.toString(), field.commit.toString(), field.update.toString()));
        }
        else if (repliqField[RepliqContainer.checkRepliqFuncKey]) {
            innerReps.push(serialiseRepliq(repliqField, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance, fieldName));
        }
        else {
            throw new Error("Unknown Repliq field type in serialisation");
        }
    });
    return ret;
}
function serialiseRepliq(repliqProxy, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance, innerName = "") {
    let fields = repliqProxy[Repliq_1.Repliq.getRepliqFields];
    let fieldsArr = serialiseRepliqFields(fields, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
    let primitiveFields = fieldsArr[0];
    let objectFields = fieldsArr[1];
    let innerReps = fieldsArr[2];
    let methods = repliqProxy[Repliq_1.Repliq.getRepliqOriginalMethods];
    let methodArr = [];
    let atomicArr = [];
    methods.forEach((method, methodName) => {
        if (method[Repliq_1.Repliq.isAtomic]) {
            atomicArr.push([methodName, method.toString()]);
        }
        else {
            methodArr.push([methodName, method.toString()]);
        }
    });
    let repliqId = repliqProxy[Repliq_1.Repliq.getRepliqID];
    let repliqOwnerId = repliqProxy[Repliq_1.Repliq.getRepliqOwnerID];
    let isClient = repliqProxy[Repliq_1.Repliq.isClientMaster];
    let ownerAddress = repliqProxy[Repliq_1.Repliq.getRepliqOwnerAddress];
    let ownerPort = repliqProxy[Repliq_1.Repliq.getRepliqOwnerPort];
    let roundNr;
    //Possible that repliq has not yet been modified at serialisation time
    if (gspInstance.roundNumbers.has(repliqId)) {
        roundNr = gspInstance.roundNumbers.get(repliqId);
    }
    else {
        roundNr = 0;
    }
    let ret = new RepliqContainer(JSON.stringify(primitiveFields), JSON.stringify(objectFields), JSON.stringify(innerReps), JSON.stringify(methodArr), JSON.stringify(atomicArr), repliqId, repliqOwnerId, isClient, ownerAddress, ownerPort, roundNr, innerName);
    if (thisRef instanceof farRef_1.ServerFarReference) {
        if (ret.isClient) {
            gspInstance.addForward(ret.repliqId, ret.masterOwnerId);
            ret.masterOwnerId = thisRef.ownerId;
            ret.ownerAddress = thisRef.ownerAddress;
            ret.ownerPort = thisRef.ownerPort;
            ret.isClient = false;
        }
        else if (ret.ownerAddress == null) {
            ret.ownerAddress = thisRef.ownerAddress;
            ret.ownerPort = thisRef.ownerPort;
            ret.isClient = false;
        }
    }
    else {
        ret.isClient = true;
    }
    return ret;
}
function serialise(value, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance) {
    if (typeof value == 'object') {
        if (value == null) {
            return new NativeContainer(null);
        }
        else if (value instanceof Promise) {
            return serialisePromise(value, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
        }
        else if (value instanceof Error) {
            return new ErrorContainer(value);
        }
        else if (value[farRef_1.FarReference.ServerProxyTypeKey]) {
            var farRef = value[farRef_1.FarReference.farRefAccessorKey];
            return new ServerFarRefContainer(farRef.objectId, farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
        }
        else if (value[farRef_1.FarReference.ClientProxyTypeKey]) {
            let farRef = value[farRef_1.FarReference.farRefAccessorKey];
            if (thisRef instanceof farRef_1.ServerFarReference && farRef.contactId == null) {
                //Current actor is a server and is the first to obtain a reference to this client actor. conversation with this client should now be rooted through this actor given that it has a socket reference to it
                return new ClientFarRefContainer(farRef.objectId, farRef.ownerId, farRef.mainId, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
            }
            else {
                return new ClientFarRefContainer(farRef.objectId, farRef.ownerId, farRef.mainId, farRef.contactId, farRef.contactAddress, farRef.contactPort);
            }
        }
        else if (value[ArrayIsolateContainer.checkArrayIsolateFuncKey]) {
            return new ArrayIsolateContainer(value.array);
        }
        else if (value instanceof Array) {
            var values = value.map((val) => {
                return serialise(val, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
            });
            return new ArrayContainer(values);
        }
        else if (value[IsolateContainer.checkIsolateFuncKey]) {
            var vars = getObjectVars(value, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
            var methods = getObjectMethods(value);
            return new IsolateContainer(JSON.stringify(vars), JSON.stringify(methods));
        }
        else if (value[RepliqContainer.checkRepliqFuncKey]) {
            return serialiseRepliq(value, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
        }
        else if (value[SignalContainer.checkSignalFuncKey]) {
            let sig = (value.holder);
            if (!sig.isGarbage) {
                let isValueObject = sig.value instanceof signal_1.SignalObject;
                let val;
                if (isValueObject) {
                    let vars = getObjectVars(sig.value, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance, ["holder"]);
                    let methods = getObjectMethods(sig.value);
                    //No need to keep track of which methods are mutators during serialisation. Only owner can mutate and change/propagate!
                    methods.forEach((methodArr, index) => {
                        let name = methodArr[0];
                        if (sig.value[name][signal_1.SignalValue.IS_MUTATOR]) {
                            let sigProto = Object.getPrototypeOf(sig.value);
                            let method = Reflect.get(sigProto, name);
                            methods[index] = [name, method[signal_1.SignalValue.GET_ORIGINAL].toString()];
                        }
                    });
                    val = [JSON.stringify(vars), JSON.stringify(methods)];
                }
                else {
                    //Only way that value isn't an object is if it is the result of a lifted function
                    val = sig.value.lastVal;
                }
                return new SignalContainer(sig.id, isValueObject, val, sig.rateLowerBound, sig.rateUpperBound, sig.clock, sig.tempStrong, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
            }
            else {
                throw new Error("Serialisation of signals part of garbage dependency graph dissalowed ");
            }
        }
        else {
            return serialiseObject(value, thisRef, objectPool);
        }
    }
    else if (typeof value == 'function') {
        //Value is actualy not a function but the result of a field access on a proxy (which is technically a function, see farRef)
        if (value[farRef_1.FarReference.proxyWrapperAccessorKey]) {
            return serialisePromise(value, thisRef, receiverId, commMedium, promisePool, objectPool, gspInstance);
        }
        else if (isClass(value) && isIsolateClass(value)) {
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            return new IsolateDefinitionContainer(definition.replace("super()", ''));
        }
        else if (isClass(value) && isRepliqClass(value)) {
            var definition = value.toString().replace(/(\extends)(.*?)(?=\{)/, '');
            return new RepliqDefinitionContainer(definition);
        }
        else if (isClass(value) && isSignalClass(value)) {
            var definition = value.toString.replace(/(\extends)(.*?)(?=\{)/, '');
            return new SignalDefinitionContainer(definition);
        }
        else if (isClass(value)) {
            throw new Error("Serialisation of classes disallowed");
        }
        else {
            throw new Error("Serialisation of functions disallowed: " + value.toString());
        }
    }
    else {
        return new NativeContainer(value);
    }
}
exports.serialise = serialise;
function deserialise(thisRef, value, promisePool, commMedium, objectPool, gspInstance, signalPool) {
    function deSerialisePromise(promiseContainer) {
        return promisePool.newForeignPromise(promiseContainer.promiseId, promiseContainer.promiseCreatorId);
    }
    function deSerialiseServerFarRef(farRefContainer) {
        var farRef = new farRef_1.ServerFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.ownerAddress, farRefContainer.ownerPort, thisRef, commMedium, promisePool, objectPool, gspInstance);
        if (thisRef instanceof farRef_1.ServerFarReference) {
            if (!(commMedium.hasConnection(farRef.ownerId))) {
                commMedium.openConnection(farRef.ownerId, farRef.ownerAddress, farRef.ownerPort);
            }
        }
        else {
            if (!(commMedium.hasConnection(farRef.ownerId))) {
                commMedium.connectTransientRemote(thisRef, farRef, promisePool);
            }
        }
        return farRef.proxyify();
    }
    function deSerialiseClientFarRef(farRefContainer) {
        var farRef;
        if ((thisRef instanceof farRef_1.ServerFarReference) && farRefContainer.contactId == null) {
            //This is the first server side actor to come into contact with this client-side far reference and will henceforth be the contact point for all messages sent to this far reference
            farRef = new farRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.mainId, thisRef, commMedium, promisePool, objectPool, gspInstance, thisRef.ownerId, thisRef.ownerAddress, thisRef.ownerPort);
        }
        else {
            farRef = new farRef_1.ClientFarReference(farRefContainer.objectId, farRefContainer.ownerId, farRefContainer.mainId, thisRef, commMedium, promisePool, objectPool, gspInstance, farRefContainer.contactId, farRefContainer.contactAddress, farRefContainer.contactPort);
        }
        return farRef.proxyify();
    }
    function deSerialiseError(errorContainer) {
        var error = new Error(errorContainer.message);
        error.stack = errorContainer.stack;
        error.name = errorContainer.name;
        return error;
    }
    function deSerialiseArray(arrayContainer) {
        var deserialised = arrayContainer.values.map((valCont) => {
            return deserialise(thisRef, valCont, promisePool, commMedium, objectPool, gspInstance, signalPool);
        });
        return deserialised;
    }
    function deSerialiseIsolate(isolateContainer) {
        var isolate = reconstructObject(new spiders_1.Isolate(), JSON.parse(isolateContainer.vars), JSON.parse(isolateContainer.methods), thisRef, promisePool, commMedium, objectPool, gspInstance, signalPool);
        return isolate;
    }
    function deSerialiseIsolateDefinition(isolateDefContainer) {
        var classObj = eval(isolateDefContainer.definition);
        classObj.prototype[IsolateContainer.checkIsolateFuncKey] = true;
        return classObj;
    }
    function deSerialiseArrayIsolate(arrayIsolateContainer) {
        return new spiders_1.ArrayIsolate(arrayIsolateContainer.array);
    }
    function deSerialiseRepliq(repliqContainer) {
        let blankRepliq = new Repliq_1.Repliq();
        let fields = new Map();
        (JSON.parse(repliqContainer.primitiveFields)).forEach((repliqField) => {
            let field = new RepliqPrimitiveField_1.RepliqPrimitiveField(repliqField.name, repliqField.tentative);
            field.commited = repliqField.commited;
            field.read = constructMethod(repliqField.readFunc);
            field.writeField = constructMethod(repliqField.writeFunc);
            field.resetToCommit = constructMethod(repliqField.resetFunc);
            field.commit = constructMethod(repliqField.commitFunc);
            field.update = constructMethod(repliqField.updateFunc);
            fields.set(field.name, field);
        });
        (JSON.parse(repliqContainer.objectFields)).forEach((repliqField) => {
            let tentParsed = JSON.parse(repliqField.tentative);
            let comParsed = JSON.parse(repliqField.commited);
            let tentBase = {};
            Reflect.setPrototypeOf(tentBase, {});
            let comBase = {};
            Reflect.setPrototypeOf(comBase, {});
            let tentative = reconstructObject(tentBase, JSON.parse(tentParsed[0]), JSON.parse(tentParsed[1]), thisRef, promisePool, commMedium, objectPool, gspInstance, signalPool);
            let commited = reconstructObject(comBase, JSON.parse(comParsed[0]), JSON.parse(comParsed[1]), thisRef, promisePool, commMedium, objectPool, gspInstance, signalPool);
            let field = new RepliqObjectField_1.RepliqObjectField(repliqField.name, {});
            field.tentative = tentative;
            field.commited = commited;
            field.read = constructMethod(repliqField.readFunc);
            field.writeField = constructMethod(repliqField.writeFunc);
            field.resetToCommit = constructMethod(repliqField.resetFunc);
            field.commit = constructMethod(repliqField.commitFunc);
            field.update = constructMethod(repliqField.updateFunc);
            fields.set(field.name, field);
        });
        (JSON.parse(repliqContainer.innerRepFields)).forEach((innerRepliq) => {
            fields.set(innerRepliq.innerName, deserialise(thisRef, innerRepliq, promisePool, commMedium, objectPool, gspInstance, signalPool));
        });
        let methods = new Map();
        (JSON.parse(repliqContainer.methods)).forEach(([methodName, methodSource]) => {
            methods.set(methodName, constructMethod(methodSource));
        });
        let atomicMethods = new Map();
        (JSON.parse(repliqContainer.atomicMethods)).forEach(([methodName, methodSource]) => {
            atomicMethods.set(methodName, constructMethod(methodSource));
        });
        if (!repliqContainer.isClient && !commMedium.hasConnection(repliqContainer.masterOwnerId)) {
            commMedium.openConnection(repliqContainer.masterOwnerId, repliqContainer.ownerAddress, repliqContainer.ownerPort);
        }
        return blankRepliq.reconstruct(gspInstance, repliqContainer.repliqId, repliqContainer.masterOwnerId, fields, methods, atomicMethods, repliqContainer.isClient, repliqContainer.ownerAddress, repliqContainer.ownerPort, repliqContainer.lastConfirmedRound);
    }
    function deSerialiseRepliqDefinition(def) {
        let index = def.definition.indexOf("{");
        let start = def.definition.substring(0, index);
        let stop = def.definition.substring(index, def.definition.length);
        let Repliq = require("./Replication/Repliq").Repliq;
        var classObj = eval(start + " extends Repliq" + stop);
        return classObj;
    }
    function deSerialiseSignal(sigContainer) {
        if (!commMedium.hasConnection(sigContainer.ownerId)) {
            commMedium.openConnection(sigContainer.ownerId, sigContainer.ownerAddress, sigContainer.ownerPort);
        }
        let signalId = sigContainer.id;
        let currentVal;
        if (sigContainer.obectValue) {
            let infoArr = sigContainer.currentValue;
            currentVal = reconstructObject(new signal_1.SignalObject(), JSON.parse(infoArr[0]), JSON.parse(infoArr[1]), thisRef, promisePool, commMedium, objectPool, gspInstance, signalPool);
        }
        else {
            let dummyFunc = new signal_1.SignalFunction(() => { });
            dummyFunc.lastVal = sigContainer.currentValue;
            currentVal = dummyFunc;
        }
        let signalProxy = new Signal(currentVal);
        signalProxy.rateLowerBound = sigContainer.rateLowerBound;
        signalProxy.rateUpperBound = sigContainer.rateUpperBound;
        signalProxy.clock = sigContainer.clock;
        signalProxy.id = signalId;
        signalProxy.value.setHolder(signalProxy);
        signalProxy.strong = sigContainer.strong;
        let known = signalPool.knownSignal(signalId);
        if (!known) {
            signalPool.newSource(signalProxy);
            commMedium.sendMessage(sigContainer.ownerId, new messages_1.RegisterExternalSignalMessage(thisRef, thisRef.ownerId, signalId, thisRef.ownerAddress, thisRef.ownerPort));
        }
        return signalProxy.value;
    }
    function deSerialiseSignalDefinition(def) {
        let index = def.definition.indexOf("{");
        let start = def.definition.substring(0, index);
        let stop = def.definition.substring(index, def.definition.length);
        var classObj = eval(start + " extends Signal" + stop);
        return classObj;
    }
    switch (value.type) {
        case ValueContainer.nativeType:
            return value.value;
        case ValueContainer.promiseType:
            return deSerialisePromise(value);
        case ValueContainer.clientFarRefType:
            return deSerialiseClientFarRef(value);
        case ValueContainer.serverFarRefType:
            return deSerialiseServerFarRef(value);
        case ValueContainer.errorType:
            return deSerialiseError(value);
        case ValueContainer.arrayType:
            return deSerialiseArray(value);
        case ValueContainer.isolateType:
            return deSerialiseIsolate(value);
        case ValueContainer.isolateDefType:
            return deSerialiseIsolateDefinition(value);
        case ValueContainer.arrayIsolateType:
            return deSerialiseArrayIsolate(value);
        case ValueContainer.repliqType:
            return deSerialiseRepliq(value);
        case ValueContainer.repliqDefinition:
            return deSerialiseRepliqDefinition(value);
        case ValueContainer.signalType:
            return deSerialiseSignal(value);
        case ValueContainer.signalDefinition:
            return deSerialiseSignalDefinition(value);
        default:
            throw "Unknown value container type :  " + value.type;
    }
}
exports.deserialise = deserialise;

},{"./Reactivivity/signal":53,"./Replication/Repliq":56,"./Replication/RepliqObjectField":58,"./Replication/RepliqPrimitiveField":59,"./farRef":63,"./messages":65,"./spiders":69}],68:[function(require,module,exports){
Object.defineProperty(exports, "__esModule", { value: true });
const commMedium_1 = require("../src/CommMedium");
/**
 * Created by flo on 19/12/2016.
 */
class SocketHandler {
    constructor(owner) {
        this.owner = owner;
        this.disconnectedActors = [];
        this.pendingMessages = new Map();
        this.fuckUpMessage = new Map();
    }
    addDisconnected(actorId) {
        this.disconnectedActors.push(actorId);
        this.pendingMessages.set(actorId, []);
    }
    removeFromDisconnected(actorId, connection) {
        this.owner.connectedActors.set(actorId, connection);
        this.disconnectedActors = this.disconnectedActors.filter((id) => {
            id != actorId;
        });
        if (this.pendingMessages.has(actorId)) {
            var messages = this.pendingMessages.get(actorId);
            messages.forEach((msg) => {
                this.sendMessage(actorId, msg);
            });
        }
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId, actorAddress, actorPort) {
        var that = this;
        var connection = require('socket.io-client')('http://' + actorAddress + ":" + actorPort);
        this.addDisconnected(actorId);
        connection.on('connect', () => {
            that.removeFromDisconnected(actorId, connection);
            //TODO To remove once solution found
            if (that.fuckUpMessage.has(actorId)) {
                that.fuckUpMessage.get(actorId).forEach((msg) => {
                    that.sendMessage(actorId, msg);
                });
            }
        });
        connection.on('message', function (data) {
            that.messageHandler.dispatch(data);
        });
        connection.on('disconnect', function () {
            that.disconnectedActors.push(actorId);
        });
    }
    sendMessage(actorId, msg) {
        if (this.disconnectedActors.indexOf(actorId) != -1) {
            var msgs = this.pendingMessages.get(actorId);
            msgs.push(msg);
            this.pendingMessages.set(actorId, msgs);
        }
        else if (this.owner.connectedActors.has(actorId)) {
            var sock = this.owner.connectedActors.get(actorId);
            sock.emit('message', msg);
        }
        else {
            //TODO TEMP
            if (this.fuckUpMessage.has(actorId)) {
                this.fuckUpMessage.get(actorId).push(msg);
            }
            else {
                var q = [msg];
                this.fuckUpMessage.set(actorId, q);
            }
            //throw new Error("Unable to send message to unknown actor (socket handler) in " + msg.fieldName + " to : " + actorId + " in : " + this.messageHandler.thisRef.ownerId)
        }
    }
}
exports.SocketHandler = SocketHandler;
class ServerSocketManager extends commMedium_1.CommMedium {
    constructor(ip, socketPort) {
        super();
        //Again very dirty hack to satisfy react-native
        var io = eval("req" + "uire('socket.io')");
        this.socketIp = ip;
        this.socketPort = socketPort;
        this.socket = io(socketPort);
        this.connectedClients = new Map();
    }
    init(messageHandler) {
        super.init(messageHandler);
        this.socketHandler.messageHandler = messageHandler;
        this.socket.on('connection', (client) => {
            client.on('message', (data) => {
                messageHandler.dispatch(data, [], client);
            });
            client.on('close', () => {
                //TODO
            });
        });
    }
    //Open connection to Node.js instance owning the object to which the far reference refers to
    openConnection(actorId, actorAddress, actorPort) {
        this.socketHandler.openConnection(actorId, actorAddress, actorPort);
    }
    addNewClient(actorId, socket) {
        this.connectedClients.set(actorId, socket);
    }
    sendMessage(actorId, msg) {
        if (this.connectedClients.has(actorId)) {
            this.connectedClients.get(actorId).emit('message', JSON.stringify(msg));
        }
        else {
            this.socketHandler.sendMessage(actorId, msg);
        }
    }
    hasConnection(actorId) {
        return (this.socketHandler.disconnectedActors.indexOf(actorId) != -1) || this.connectedActors.has(actorId);
    }
    closeAll() {
        this.socket.close();
        this.connectedActors.forEach((sock) => {
            sock.close();
        });
    }
}
exports.ServerSocketManager = ServerSocketManager;

},{"./commMedium":62,"socket.io-client":25}],69:[function(require,module,exports){
(function (__dirname){
Object.defineProperty(exports, "__esModule", { value: true });
const sockets_1 = require("../src/Sockets");
const messageHandler_1 = require("./messageHandler");
const farRef_1 = require("../src/FarRef");
const PromisePool_1 = require("./PromisePool");
const objectPool_1 = require("../src/ObjectPool");
const serialisation_1 = require("./serialisation");
const ChannelManager_1 = require("./ChannelManager");
const messages_1 = require("../src/Message");
const GSP_1 = require("./Replication/GSP");
const Repliq_1 = require("./Replication/Repliq");
const RepliqPrimitiveField_1 = require("./Replication/RepliqPrimitiveField");
const RepliqField_1 = require("./Replication/RepliqField");
const RepliqObjectField_1 = require("./Replication/RepliqObjectField");
const signal_1 = require("./Reactivivity/signal");
const signalPool_1 = require("./Reactivivity/signalPool");
/**
 * Created by flo on 05/12/2016.
 */
var utils = require('./utils');
class Isolate {
    constructor() {
        this[serialisation_1.IsolateContainer.checkIsolateFuncKey] = true;
    }
}
exports.Isolate = Isolate;
class ArrayIsolate {
    constructor(array) {
        this[serialisation_1.ArrayIsolateContainer.checkArrayIsolateFuncKey] = true;
        this.array = array;
        for (var i = 0; i < array.length; i++) {
            this[i] = array[i];
        }
    }
    forEach(callback) {
        return this.array.forEach(callback);
    }
    filter(callback) {
        return this.array.filter(callback);
    }
}
exports.ArrayIsolate = ArrayIsolate;
function updateExistingChannels(mainRef, existingActors, newActorId) {
    var mappings = [[], []];
    existingActors.forEach((actorPair) => {
        var workerId = actorPair[0];
        var worker = actorPair[1];
        var channel = new MessageChannel();
        worker.postMessage(JSON.stringify(new messages_1.OpenPortMessage(mainRef, newActorId)), [channel.port1]);
        mappings[0].push(workerId);
        mappings[1].push(channel.port2);
    });
    return mappings;
}
class Actor {
}
class ClientActor extends Actor {
    spawn(app, thisClass) {
        var actorId = utils.generateId();
        var channelMappings = updateExistingChannels(app.mainRef, app.spawnedActors, actorId);
        var work = require('webworkify');
        var webWorker = work(require('../src/ActorProto'));
        webWorker.addEventListener('message', (event) => {
            app.mainMessageHandler.dispatch(event);
        });
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], app.mainRef, actorId, app.channelManager, app.mainPromisePool, app.mainObjectPool, app.gspInstance);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, app.mainRef, actorId, app.channelManager, app.mainPromisePool, app.mainObjectPool, app.gspInstance, []);
        var mainChannel = new MessageChannel();
        //For performance reasons, all messages sent between web workers are stringified (see https://nolanlawson.com/2016/02/29/high-performance-web-worker-messages/)
        var newActorChannels = [mainChannel.port1].concat(channelMappings[1]);
        var installMessage = new messages_1.InstallBehaviourMessage(app.mainRef, app.mainId, actorId, actorVariables, actorMethods, staticProperties, channelMappings[0]);
        webWorker.postMessage(JSON.stringify(installMessage), newActorChannels);
        var channelManager = app.mainCommMedium;
        channelManager.newConnection(actorId, mainChannel.port2);
        var ref = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainId, app.mainRef, app.channelManager, app.mainPromisePool, app.mainObjectPool, app.gspInstance);
        app.spawnedActors.push([actorId, webWorker]);
        return ref.proxyify();
    }
}
class ServerActor extends Actor {
    spawn(app, port, thisClass) {
        var socketManager = app.mainCommMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils.generateId();
        var decon = serialisation_1.deconstructBehaviour(this, 0, [], [], app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool, app.gspInstance);
        var actorVariables = decon[0];
        var actorMethods = decon[1];
        var staticProperties = serialisation_1.deconstructStatic(thisClass, app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool, app.gspInstance, []);
        //Uncomment to debug (huray for webstorms)
        //var actor           = fork(__dirname + '/actorProto.js',[app.mainIp,port,actorId,app.mainId,app.mainPort,JSON.stringify(actorVariables),JSON.stringify(actorMethods)],{execArgv: ['--debug-brk=8787']})
        var actor = fork(__dirname + '/actorProto.js', [false, app.mainIp, port, actorId, app.mainId, app.mainPort, JSON.stringify(actorVariables), JSON.stringify(actorMethods), JSON.stringify(staticProperties)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainRef, app.mainCommMedium, app.mainPromisePool, app.mainObjectPool, app.gspInstance);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    }
    static spawnFromFile(app, port, filePath, actorClassName, constructorArgs) {
        var socketManager = app.mainCommMedium;
        //Really ugly hack to satisfy React-native's "static analyser"
        var fork = eval("req" + "uire('child_process')").fork;
        var actorId = utils.generateId();
        let serialisedArgs = [];
        constructorArgs.forEach((constructorArg) => {
            serialisedArgs.push(serialisation_1.serialise(constructorArg, app.mainRef, actorId, socketManager, app.mainPromisePool, app.mainObjectPool, app.gspInstance));
        });
        var actor = fork(__dirname + '/actorProto.js', [true, app.mainIp, port, actorId, app.mainId, app.mainPort, filePath, actorClassName, JSON.stringify(serialisedArgs)]);
        app.spawnedActors.push(actor);
        var ref = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, actorId, app.mainIp, port, app.mainRef, app.mainCommMedium, app.mainPromisePool, app.mainObjectPool, app.gspInstance);
        socketManager.openConnection(ref.ownerId, ref.ownerAddress, ref.ownerPort);
        return ref.proxyify();
    }
}
class Application {
    constructor() {
        this.appActors = 0;
        if (this.appActors == 0) {
            this.mainId = utils.generateId();
            this.mainPromisePool = new PromisePool_1.PromisePool();
            this.mainObjectPool = new objectPool_1.ObjectPool(this);
        }
        else {
            throw new Error("Cannot create more than one application actor");
        }
    }
}
class ServerApplication extends Application {
    constructor(mainIp = "127.0.0.1", mainPort = 8000) {
        super();
        this.mainIp = mainIp;
        this.mainPort = mainPort;
        this.portCounter = 8001;
        this.spawnedActors = [];
        this.mainCommMedium = new sockets_1.ServerSocketManager(mainIp, mainPort);
        this.socketManager = this.mainCommMedium;
        this.mainRef = new farRef_1.ServerFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, this.mainId, this.mainIp, this.mainPort, null, this.mainCommMedium, this.mainPromisePool, this.mainObjectPool, this.gspInstance);
        this.mainSignalPool = new signalPool_1.SignalPool(this.mainCommMedium, this.mainRef, this.mainPromisePool, this.mainObjectPool);
        this.gspInstance = new GSP_1.GSP(this.socketManager, this.mainId, this.mainRef);
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.socketManager, this.mainPromisePool, this.mainObjectPool, this.gspInstance, this.mainSignalPool);
        this.socketManager.init(this.mainMessageHandler);
        utils.installSTDLib(true, this.mainRef, null, this, this.mainCommMedium, this.mainPromisePool, this.gspInstance, this.mainSignalPool);
    }
    spawnActor(actorClass, constructorArgs = [], port = -1) {
        var actorObject = new actorClass(...constructorArgs);
        if (port == -1) {
            port = this.portCounter++;
        }
        return actorObject.spawn(this, port, actorClass);
    }
    spawnActorFromFile(path, className, constructorArgs = [], port = -1) {
        if (port == -1) {
            port = this.portCounter++;
        }
        return ServerActor.spawnFromFile(this, port, path, className, constructorArgs);
    }
    kill() {
        this.socketManager.closeAll();
        this.spawnedActors.forEach((actor) => {
            actor.kill();
        });
    }
}
class ClientApplication extends Application {
    constructor() {
        super();
        this.mainCommMedium = new ChannelManager_1.ChannelManager();
        this.spawnedActors = [];
        this.channelManager = this.mainCommMedium;
        this.mainRef = new farRef_1.ClientFarReference(objectPool_1.ObjectPool._BEH_OBJ_ID, this.mainId, this.mainId, null, this.mainCommMedium, this.mainPromisePool, this.mainObjectPool, this.gspInstance);
        this.gspInstance = new GSP_1.GSP(this.channelManager, this.mainId, this.mainRef);
        this.mainSignalPool = new signalPool_1.SignalPool(this.channelManager, this.mainRef, this.mainPromisePool, this.mainObjectPool);
        this.mainMessageHandler = new messageHandler_1.MessageHandler(this.mainRef, this.channelManager, this.mainPromisePool, this.mainObjectPool, this.gspInstance, this.mainSignalPool);
        this.channelManager.init(this.mainMessageHandler);
        utils.installSTDLib(true, this.mainRef, null, this, this.mainCommMedium, this.mainPromisePool, this.gspInstance);
    }
    spawnActor(actorClass, constructorArgs = []) {
        var actorObject = new actorClass(...constructorArgs);
        return actorObject.spawn(this, actorClass);
    }
    kill() {
        this.spawnedActors.forEach((workerPair) => {
            workerPair[1].terminate();
            URL.revokeObjectURL(workerPair[1]);
        });
        this.spawnedActors = [];
    }
}
exports.Repliq = Repliq_1.Repliq;
exports.Signal = signal_1.SignalObject;
exports.mutator = signal_1.mutator;
exports.atomic = Repliq_1.atomic;
exports.lease = signal_1.lease;
exports.strong = signal_1.strong;
exports.weak = signal_1.weak;
exports.LWR = RepliqPrimitiveField_1.LWR;
exports.Count = RepliqPrimitiveField_1.Count;
exports.RepliqPrimitiveField = RepliqPrimitiveField_1.RepliqPrimitiveField;
exports.RepliqObjectField = RepliqObjectField_1.RepliqObjectField;
exports.makeAnnotation = RepliqPrimitiveField_1.makeAnnotation;
exports.FieldUpdate = RepliqField_1.FieldUpdate;
exports.Isolate = Isolate;
if (utils.isBrowser()) {
    exports.Application = ClientApplication;
    exports.Actor = ClientActor;
}
else {
    exports.Application = ServerApplication;
    exports.Actor = ServerActor;
}

}).call(this,"/src")
},{"./ChannelManager":51,"./PromisePool":52,"./Reactivivity/signal":53,"./Reactivivity/signalPool":54,"./Replication/GSP":55,"./Replication/Repliq":56,"./Replication/RepliqField":57,"./Replication/RepliqObjectField":58,"./Replication/RepliqPrimitiveField":59,"./actorProto":61,"./farRef":63,"./messageHandler":64,"./messages":65,"./objectPool":66,"./serialisation":67,"./sockets":68,"./utils":70,"webworkify":48}],70:[function(require,module,exports){
(function (process){
Object.defineProperty(exports, "__esModule", { value: true });
const spiders_1 = require("./spiders");
const signal_1 = require("./Reactivivity/signal");
/**
 * Created by flo on 05/12/2016.
 */
function isBrowser() {
    var isNode = false;
    if (typeof process === 'object') {
        if (typeof process.versions === 'object') {
            if (typeof process.versions.node !== 'undefined') {
                isNode = true;
            }
        }
    }
    return !(isNode);
}
exports.isBrowser = isBrowser;
function generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
exports.generateId = generateId;
//Clone function comes from stack overflow thread:
//http://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
function cloneDR(o) {
    const gdcc = "__getDeepCircularCopy__";
    if (o !== Object(o)) {
        return o; // primitive value
    }
    var set = gdcc in o, cache = o[gdcc], result;
    if (set && typeof cache == "function") {
        return cache();
    }
    // else
    o[gdcc] = function () { return result; }; // overwrite
    if (o instanceof Array) {
        result = [];
        for (var i = 0; i < o.length; i++) {
            result[i] = cloneDR(o[i]);
        }
    }
    else if (o instanceof Function) {
        result = o;
    }
    else {
        result = {};
        Reflect.ownKeys(o).forEach((k) => {
            if (k != gdcc) {
                result[k] = cloneDR(o[k]);
            }
            else if (set) {
                result[k] = cloneDR(cache);
            }
        });
    }
    /*for (var prop in o)
        if (prop != gdcc)
            result[prop] = cloneDR(o[prop]);
        else if (set)
            result[prop] = cloneDR(cache);
}*/
    if (set) {
        o[gdcc] = cache; // reset
    }
    else {
        delete o[gdcc]; // unset again
    }
    return result;
}
exports.cloneDR = cloneDR;
//REALLY ugly way of checking whether we have reached the end of the prototype chain while cloning
function isLastPrototype(object) {
    return object == null;
}
function clone(object) {
    let base = cloneDR(object);
    function walkProto(proto, last) {
        if (!(isLastPrototype(proto))) {
            let protoClone = cloneDR(proto);
            Reflect.setPrototypeOf(last, protoClone);
            walkProto(Reflect.getPrototypeOf(proto), protoClone);
        }
    }
    walkProto(Reflect.getPrototypeOf(object), base);
    return base;
}
exports.clone = clone;
function getInitChain(behaviourObject, result) {
    var properties = Reflect.ownKeys(behaviourObject);
    //Have reached base level object, end of prototype chain (ugly but works)
    if (properties.indexOf("init") != -1) {
        result.unshift(Reflect.get(behaviourObject, "init"));
    }
    if (properties.indexOf("valueOf") != -1) {
        return result;
    }
    else {
        return getInitChain(behaviourObject.__proto__, result);
    }
}
const CONSTRAINT_OK = "ok";
function checkRegularLiftConstraints(...liftArgs) {
    let someGarbage = false;
    liftArgs.forEach((a) => {
        if (a instanceof signal_1.SignalValue) {
            someGarbage = someGarbage || a.holder.isGarbage;
        }
    });
    if (someGarbage) {
        return "Cannot use regular lift (i.e. lift/liftStrong/liftStrong) on signal part of garbage dependency graph";
    }
    else {
        return CONSTRAINT_OK;
    }
}
function checkFailureLiftConstraints(...liftArgs) {
    let someStrong = false;
    liftArgs.forEach((a) => {
        if (a instanceof signal_1.SignalValue) {
            someStrong = someStrong || a.holder.strong;
        }
    });
    if (someStrong) {
        return "Calling failure lift on strong signal (which will never propagate garbage collection event";
    }
    else {
        return CONSTRAINT_OK;
    }
}
function checkStrongLiftConstraints(...liftArgs) {
    let allStrong = true;
    liftArgs.forEach((a) => {
        if (a instanceof signal_1.SignalValue) {
            allStrong = allStrong && a.holder.strong;
        }
    });
    if (allStrong) {
        return CONSTRAINT_OK;
    }
    else {
        return "Trying to create strong lifted signal with a weak dependency";
    }
}
function installSTDLib(appActor, thisRef, parentRef, behaviourObject, commMedium, promisePool, gspInstance, signalPool) {
    if (!appActor) {
        behaviourObject["parent"] = parentRef.proxyify();
    }
    behaviourObject["remote"] = (address, port) => {
        return commMedium.connectRemote(thisRef, address, port, promisePool);
    };
    behaviourObject["Isolate"] = spiders_1.Isolate;
    behaviourObject["ArrayIsolate"] = spiders_1.ArrayIsolate;
    behaviourObject["newRepliq"] = ((repliqClass, ...args) => {
        let repliqOb = new repliqClass(...args);
        return repliqOb.instantiate(gspInstance, thisRef.ownerId);
    });
    behaviourObject["newSignal"] = (signalClass, ...args) => {
        let sigVal = new signalClass(...args);
        let signal = new signal_1.Signal(sigVal);
        sigVal.setHolder(signal);
        sigVal.instantiateMeta();
        signalPool.newSource(signal);
        return signal.value;
    };
    //Automatically converts the resulting signal to weak if one of the dependencies is weak (leaves signal as strong otherwise)
    behaviourObject["lift"] = (func) => {
        let inner = signal_1.lift(func);
        return (...args) => {
            let constraintsOk = checkRegularLiftConstraints(...args);
            if (constraintsOk == CONSTRAINT_OK) {
                let sig = inner(...args);
                let allStrong = true;
                sig.signalDependencies.forEach((dep) => {
                    allStrong = allStrong && dep.signal.strong;
                });
                if (!allStrong) {
                    signalPool.newSignal(sig);
                    sig.value.setHolder(sig);
                    sig.makeWeak();
                    return sig.value;
                }
                else {
                    signalPool.newSignal(sig);
                    sig.value.setHolder(sig);
                    return sig.value;
                }
            }
            else {
                throw new Error(constraintsOk);
            }
        };
    };
    //Re-wrap the lift function to catch creation of new signals as the result of lifted function application
    behaviourObject["liftStrong"] = (func) => {
        let inner = signal_1.lift(func);
        return (...args) => {
            let regularConstraints = checkRegularLiftConstraints(...args);
            if (regularConstraints == CONSTRAINT_OK) {
                let sig = inner(...args);
                let constraint = checkStrongLiftConstraints(...args);
                if (constraint != CONSTRAINT_OK) {
                    throw new Error(constraint);
                }
                else {
                    signalPool.newSignal(sig);
                    sig.value.setHolder(sig);
                    return sig.value;
                }
            }
            else {
                throw new Error(regularConstraints);
            }
        };
    };
    behaviourObject["liftWeak"] = (func) => {
        let inner = signal_1.lift(func);
        return (...args) => {
            let constraints = checkRegularLiftConstraints(...args);
            if (constraints == CONSTRAINT_OK) {
                let sig = inner(...args);
                signalPool.newSignal(sig);
                sig.value.setHolder(sig);
                sig.makeWeak();
                return sig.value;
            }
            else {
                throw new Error(constraints);
            }
        };
    };
    behaviourObject["liftFailure"] = (func) => {
        let inner = signal_1.liftGarbage(func);
        return (...args) => {
            let constraint = checkFailureLiftConstraints(...args);
            if (constraint == CONSTRAINT_OK) {
                let sig = inner(...args);
                signalPool.newGarbageSignal(sig);
                args.forEach((a) => {
                    if (a instanceof signal_1.SignalValue) {
                        if (!a.holder.isGarbage) {
                            signalPool.addGarbageDependency(a.holder.id, sig.id);
                        }
                    }
                });
                sig.value.setHolder(sig);
                return sig.value;
            }
            else {
                throw new Error(constraint);
            }
        };
    };
    if (!appActor) {
        var initChain = getInitChain(behaviourObject, []);
        initChain.forEach((initFunc) => {
            initFunc.apply(behaviourObject, []);
        });
    }
}
exports.installSTDLib = installSTDLib;

}).call(this,require('_process'))
},{"./Reactivivity/signal":53,"./spiders":69,"_process":24}]},{},[1]);
