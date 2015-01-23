/*
    Underscore Plus
    Extension tols for underscore
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
}(this, function(_) {

  // Calls callback's success method
  var succeed = _.succeed = function(callbacks) {
    if (callbacks && _.isFunction(callbacks.success) ) callbacks.success();
  };

  // Calls callback's complete method
  var complete = _.complete = function(callbacks) {
    if (callbacks && _.isFunction(callbacks.complete) ) callbacks.complete();
  };

  // Calls callback's success and complete
  var finish = _.finish = function(callbacks) {
    complete(callbacks);
    succeed(callbacks);
  };

  // Combines multiple callback functions  recursively into one function.
  var crunch = _.crunch = function(x, ignore_fail) {
    return function(callbacks) {
      var _callbacks;
      if (_.isFunction(x)) return x(callbacks);

      if (_.isArray(x) && !_.isEmpty(x)) {
        _callbacks = {
          success: _.after( x.length, callbacks.success || function() {} ),
          error: _.once( callbacks.error || function() {} ),
          complete: _.after( x.length, callbacks.complete || function() {} )
        };

        return _.map(x, function(_x) {
          return crunch(_x, ignore_fail) (_callbacks);
        });
      }

      if (x && x.pre && x.post) {
        var result = {};

        _callbacks = _.extend({}, callbacks, {
          complete: _.after(2, callbacks.success || function() {})
        });

        result.pre = crunch(x.pre).call(undefined, {
          success: function() {
            result.post = crunch(x.post, ignore_fail).call(undefined, _callbacks);
          },
          error: function() {
            _callbacks.error.apply(undefined, arguments);

            if (ignore_fail){
              result.post = crunch(x.post, ignore_fail).call(undefined, _callbacks);
            } else {
              _.complete(_callbacks);
            } 
          },
          complete: function() {
            _.complete(_callbacks);
          }
        });

        return result;
      }
      throw 'Invalid structure for _.crunch';
    };
  };

  return _;
}));