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
<L> -> [<l>, ..]
<l> -> <function> or { pre: <L>, post: <L> }
```
* All functions on L and in 'pre' are executed parallelly,
* All functions on 'post' are executed after 'pre'

eg. 
```
_.crunch([cb1, cb2, cb3, {pre:[cb4], post:[cb5, cb6] }])
```
`cb1`, `cb2`, `cb3`, `cb4` run parallelly,

`cb5`, `cb6` executes after `cb4` is complete.

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