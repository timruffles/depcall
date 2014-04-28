var deps = require("../index.js");
var _ = require("lodash");
var assert = require("chai").assert;

function databaseAdd(database,id,number,cb) {
  database.get(id,function(err,row) {
    if(err) throw new Error(err);
    cb(null,row.value + number);
  })
}


describe("core API",function() {

  var container = {};
  container.database = {
    get: function(id,cb) {
      cb(null,{value: 10});
    }
  };

  describe("call",function() {

    it("allows a function to be run with deps from a container",function() {
      deps.call(container,databaseAdd,"a4gf",50,function(err,answer) {
        assert.equal(answer,60);
      });
    });

    it("doesn't allow a named argument to come before a positional one",function() {
      var withNumber = _.extend({number: 50},container);
      var exception = false;
      try {
        deps.call(withNumber,databaseAdd,"a4gf",function(err,answer) { })
      } catch(e) {
        exception = e;
      }

      assert(exception,"no exception");
      assert.match(exception.message,/named argument 'number' used after positional/);
    });

  });

  describe("apply",function() {
    it("allows a function to be run with deps from a container",function() {
      deps.apply(container,databaseAdd,["a4gf",50,function(err,answer) {
        assert.equal(answer,60);
      }]);
    });
  });

  describe("bind",function() {
    it("binds arguments from container to function for later execution",function() {
      var fn = deps.bind(container,databaseAdd,["a4gf",50,function(err,answer) {
        assert.equal(answer,60);
      }]);
      fn();
    });
  });

})

describe("container",function() {

  var container;
  var otherDb = {
    database: {
      get: function(id,cb) {
        cb(null,{value: 15});
      }
    }
  };
  beforeEach(function() {
    container = deps.container({
      database: {
        get: function(id,cb) {
          cb(null,{value: 10});
        }
      }
    });
  })

  it("can use call to run a fn",function() {
    container.call(databaseAdd,"a4gf",50,function(err,answer) {
      assert.equal(answer,60);
    });
  })

});
