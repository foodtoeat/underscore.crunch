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

  // Crunch combines multiple callback functions with
  // {success:, error:, complete:} recursively into one function.
  // 
  // Syntax:
  // crunched = _.crunch(<L>)
  // 
  // Grammar: 
  // <L> = [<l>, ..]
  // <l> = function or { pre: <L>, post: <L> }
  // 
  // All functions on L and in 'pre' are executed parallelly,
  // All functions on 'post' are executed after 'pre'
  // 
  // eg. [cb1, cb2, cb3, {pre:[cb4], post:[cb5, cb6] }]
  // runs cb1, cb2, cb3, cb4 parallelly, 
  // cb5, cb6 executes after cb4 is complete.
  // 
  // You'll need to use proxy for backbone models.
  // eg. 
  // var crunched = _.crunch([
  //   $.proxy(model1.fetch, model1), 
  //   $.proxy(model2.fetch, model2)
  // ])
  // 
  // crunched({
  //   success: ...
  // })

  var crunch = _.crunch = function(calls) {
    return function(callbacks) {
      var _callbacks = {
        success: _.after(
          calls.length,
          _.isFunction(callbacks.success) ? callbacks.success : function() {}
        ),
        error: _.once(
          calls.error,
          _.isFunction(callbacks.error) ? callbacks.success : function() {}
        ),
        complete: _.after(
          calls.complete,
          _.isFunction(callbacks.complete) ? callbacks.complete : function() {}
        )
      };

      _.each(calls, function(c) {
        if (_.isFunction(c)) {
          c(_callbacks);
        } else if (_.isArray(c.pre) && _.isArray(c.post)) {
          var _chained_callbacks = _.extend({}, _callbacks, {
            complete: _.after(2, _callbacks.complete)
          });
          crunch(c.pre).call(undefined, _.extend({}, _chained_callbacks, {
              success: function() {
                crunch(c.post).call(undefined, _chained_callbacks);
              }
            })
          );
        } else {
          console.error('Invalid structure');
        }
      });
    };
  };

  return _;
}));