(function() {
  var A, x;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  A = (function() {
    function A() {
      this.meth = __bind(this.meth, this);;
    }
    A.prototype.meth = function(arg) {
      return console.log("Argument: " + arg + ", this: " + this + " that: " + (typeof that != "undefined" && that !== null ? that.something : "undefined"));
    };
    return A;
  })();
  x = new A;
  x.meth(1);
  x.meth.call({
    something: true
  }, 2);
}).call(this);
