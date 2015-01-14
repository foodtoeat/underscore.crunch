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

  // Combines multiple callback functions  recursively into one function. 
  var crunch = _.crunch = function(calls) {
    return function(callbacks) {
      var _callbacks = {
        success: _.after(
          calls.length,
          _.isFunction(callbacks.success) ? callbacks.success : function() {}
        ),
        error: _.once(
          _.isFunction(callbacks.error) ? callbacks.error : function() {}
        ),
        complete: _.after(
          calls.length,
          _.isFunction(callbacks.complete) ? callbacks.complete : function() {}
        )
      };

      _.each(calls, function(c) {
        if (_.isFunction(c)) {
          c(_callbacks);
        } else if (_.isArray(c.pre) && _.isArray(c.post)) {
          _callbacks.complete = _.after(2, _callbacks.complete);
          crunch(c.pre).call(undefined, _.extend({}, _callbacks, {
              success: function() {
                crunch(c.post).call(undefined, _callbacks);
              },
              error: function() {
                _callbacks.error.apply(undefined, arguments);
                _callbacks.complete();
              },
              complete: function() {
                _callbacks.complete();
              }
            })
          );
        } else {
          throw 'Invalid structure';
        }
      });
    };
  };

  var finish = _.finish = function(callbacks) {
    if (_.isFunction(callbacks.success) ) callbacks.success();
    if (_.isFunction(callbacks.complete) ) callbacks.complete();
  }

  return _;
}));