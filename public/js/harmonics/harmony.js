(function() {
  var Harmony;
  Harmony = (function() {
    function Harmony() {}
    Harmony.prototype.quality = function() {
      throw "Extend this class to define how a harmony's quality is evaluated";
    };
    return Harmony;
  })();
}).call(this);
