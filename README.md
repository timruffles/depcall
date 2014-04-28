# depcall

Functions depend on things like database connections. You might be tempted to get these dependencies to the function via modules, but this is inflexible (most obviously seen when testing). Better to provide the dependencies when the function is called.

This creates lots of boilerplate - `depcall` removes it. Store the run-time dependencies in object literals, or a `container` object, and the argument names of a function are looked up. Pass additional arguments in after that!

```javascript
// users.js
exports.find = function(db,id) { /* ... */ };

// bin/server.js

// here we're getting info from our environment to create our DB connection
var db = require("dblib").connect({
  /* ... */
});

var users = require("users.js");
var depcall = require("depcall");

app.get("/users/:id",function(req,res) {
  // which we pass into our code via depcalls. Notice we're still able to
  // pass in positional arguments - here an `id` and callback
  depcall({db: db},users.find,req.params.id,function(err,user) {
    /* ... */
  });
});
```

## Install

```sh
npm install --save depcall
```
