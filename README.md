Underscore +
===============
Extensions for Underscore.js


## _.crunch
Crunch combines multiple callback functions with
{success:, error:, complete:} recursively into one function.

Syntax:
```javascript
crunched = _.crunch(<L>)
```

Grammar: 
```
<L> = [<l>, ..]
<l> = function or { pre: <L>, post: <L> }
```

All functions on L and in 'pre' are executed parallelly,
All functions on 'post' are executed after 'pre'

eg. [cb1, cb2, cb3, {pre:[cb4], post:[cb5, cb6] }]
runs cb1, cb2, cb3, cb4 parallelly, 
cb5, cb6 executes after cb4 is complete.

You'll need to use proxy for backbone models. eg. 
```javascript
var crunched = _.crunch([
  $.proxy(model1.fetch, model1), 
  $.proxy(model2.fetch, model2)
])
crunched({
  success: ...
})
```