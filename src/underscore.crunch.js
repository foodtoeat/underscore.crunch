/*
    Underscore crunch
    Extention to underscore for handling callbacks
    (c) 2014 Ashwin Hamal, FoodtoEat

    Underscore Plus may be freely distributed under the MIT license
*/

(function (root, factory) {
  if (typeof define === 'function' && define.amd) { // requirejs
    define(['underscore'], factory);
  } else if (typeof exports === 'object') { // Node
    module.exports = factory(require('underscore'));
  } else { // Browser
    factory(root._);
  }
} (this, function(_) {
  // Calls callback's success method
  var succeed = _.succeed = function(callbacks, args) {
    if (callbacks && _.isFunction(callbacks.success) ) callbacks.success(args);
  };

  // Calls callback's complete method
  var complete = _.complete = function(callbacks, args) {
    if (callbacks && _.isFunction(callbacks.complete) ) callbacks.complete(args);
  };

  // Calls callback's complete method
  var error = _.error = function(callbacks, args) {
    if (callbacks && _.isFunction(callbacks.error) ) callbacks.error(args);
  };

  // Calls callback's success and complete
  var finish = _.finish = function(callbacks) {
    complete(callbacks);
    succeed(callbacks);
  };


  // Executes at the same time
  var parallel = _.parallel = function(x) {
    return function(callbacks) {
      if (!_.isArray(x))
        throw Error('Invalid structure for _.parallel');

      if (_.isEmpty(x))
        return _.finish(callbacks);

      var _callbacks = {
        success: _.after( x.length, callbacks.success || function(){} ),
        error: _.once( callbacks.error || function(){} ),
        complete: _.after( x.length, callbacks.complete || function(){} )
      };

      return _.map(x, function(_x) {
        return _x(_callbacks);
      });
    };
  };

  // x - list of functions. executes only on previous's success
  // persist - whether to persist to next one on error.
  var serial = _.serial = function(x, persist) {
    if (!_.isArray(x))
      throw Error('Invalid structure for _.serial');

    return function(callbacks) {
      var result = [];

      if (_.isEmpty(x))
        return _.finish(callbacks);

      var pre = x[0];
      var post = _.serial(x.slice(1), persist);

      var _callbacks = _.extend({}, callbacks, {
        complete: _.after(2, callbacks.complete || function(){})
      });

      result.push(
        pre({
          success: function() {
            _.each(post(_callbacks), function(_r) { result.push(_r); });
          },
          error: function() {
            if (persist)
              _.each(post(_callbacks), function(_r) { result.push(_r); });
            else
              _.complete(_callbacks);
            return _.error(_callbacks, arguments);
          },
          complete: function() {
            _.complete(_callbacks);
          }
        })
      );

      return result;
    };
  };

  // Combines multiple callback functions  recursively into one function.
  var crunch = _.crunch = function(x, persist) {
    return function(callbacks) {
      var _callbacks;

      if (_.isFunction(x)) return x(callbacks);

      if (_.isArray(x))
        return _.parallel( _.map(x, function(_x) { return crunch(_x, persist); }) ) (callbacks);

      if (x && x.pre && x.post) {
        var result = {};
        _.serial([
          function(cbs){ result.pre = crunch(x.pre) (cbs); },
          function(cbs){ result.post = crunch(x.post) (cbs); }
        ]) (callbacks);
        return result;
      }

      throw Error('Invalid structure for _.crunch');
    };
  };

  return _;
}));