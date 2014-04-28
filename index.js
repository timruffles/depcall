function Container() {
  this.call = depcall.bind(null,this);
  this._deps = {};
}
Container.prototype = {
  get: function(dep) {
    return this._deps[dep];
  },
  put: function(name,thing) {
    if(typeof name === "object") {
      var deps = name;
      for(var prop in deps) {
        var dep  = deps[prop];
        this.put(prop,dep)
      }
      return this;
    }
    this._deps[name] = thing;
    return this;
  },
  with: function(extras) {
    var newContainer = new Container;
    if(extras._deps) extras = extras._deps;
    for(var prop in this._deps) {
      newContainer[prop] = this._deps[prop];
    }
    for(var prop in extras) {
      newContainer[prop] = extras[prop];
    }
    return newContainer;
  }
}

function fulfil(from,dep) {
  return typeof from.get === "function" ? from.get(dep) : from[dep];
}

var argsRe = /^function[^\(]*\(([^\)]*)/;

function depcall(container,fun) {
  if(typeof fun != "function") {
    throw new Error("can't call non-function");
  }
  if(typeof container == null) {
    throw new Error("Missing container!");
  }
  var fs = fun + "";

  var match = argsRe.exec(fs);
  var argNames = match[1].split(",").map("".trim.call.bind("".trim));
  if(argNames.length === 1 && argNames[0] === "") {
    return fun();
  }

  var positional = [].slice.call(arguments,2);

  var positionalArgsUsed = [];

  var args = argNames.map(function(name,index) {
    var dep = fulfil(container,name);
    if(dep != null) {
      if(positionalArgsUsed.length > 0) {
        throw new Error(
          "Conflict: named argument '" + name + "' used after positional arguments (used for " + positionalArgsUsed.join(", ") + "). Either add missing deps, or design APIs to take dependenices first, then function arguments"
        );
      }
    } else {
      if(positional.length === 0) {
        throw new Error("Missing dependencies: " + argNames.slice(index).join(", "));
      }
      positionalArgsUsed.push(name);
      dep = positional.shift();
    }
    return dep;
  });
  return fun.apply(null,args);
}

module.exports = depcall;
depcall.call = depcall;
depcall._fulfil = fulfil;
depcall.container = function(deps) {
  var cont = new Container;
  return deps ? cont.put(deps) : cont;
};

