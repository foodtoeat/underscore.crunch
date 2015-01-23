Underscore +
===============
Extensions for Underscore.js


## _.crunch
Crunch combines multiple callback functions with
{success:, error:, complete:} recursively into one function.

Syntax:
```javascript
crunched = _.crunch(<x>, ignore_fail)
```

Grammar: 
```
<x> -> <function> or { pre: <X>, post: <X> } or <x>
<X> -> [<x>, ..]
```
* All functions on X and in 'pre' are executed parallelly,
* All functions on 'post' are executed after 'pre'

Example 1: How to user Crunch
```
_.crunch(
  [
    callbacks1,
    callbacks2,
    callbacks3,
    {
       pre: callbacks4, 
       post:[callbacks5, callbacks6] 
    }
  ]
)
```
Where each callback has `success`, `fail`, and `complete`

`callbacks1`, `callbacks2`, `callbacks3`, `callbacks4` run parallelly,

`callbacks5`, `callbacks6` executes after `callbacks4` is complete.

**Note** If you're using it for backbone.js models, You'll need `$.proxy`. eg.
```javascript
var crunched = _.crunch([
  $.proxy(model1.fetch, model1), 
  $.proxy(model2.fetch, model2)
])
crunched({
  success: ...
})
```

Example 2: How to use crunch to simplify loading multiple models and views, consolidate callbacks, and organize dependencies/flow.

```
View = Backbone.Views.extend({
  load: function(callbacks) {
    view = this;
    this.fetch($.extend({}, callbacks, {
      success: function(callbacks) {
        view.render();
        _.succeed(callbacks); // Since we're overriding success
      }
    }));
  },

  // Consolidating multplie models/collections fetche for this view
  fetch: function(callbacks) {
    return _.crunch([
      $.proxy(this.model1.fetch, this.model1),
      $.proxy(this.collection2.fetch, this.collection2)
    ]) (callbacks);
  },

  render: function() {
    this.makeFunStuffHappen();
  }
});

var view1 = new View({ title: 'I am Important'});
var view2 = new View({ title: 'I am not that important'});
var view3 = new View({ title: 'I can be later'});

_.crunch({
  pre: $.proxy(view1.load, view1),
  post: [
    function(callbacks) {
      alert('Important stuff loaded!');
      _.finish(callbacks); // Finish callbacks
    },
    $.proxy(view2.load, view2),
    $.proxy(view3.load, view3)
  ]
}) ({
  success: function() {
    alert('All loaded. Yay!');
  },
  error: function(err) {
    console.log(err);
    alert('Error :[' );
  }
});
```

See for yourself!