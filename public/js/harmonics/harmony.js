(function() {
  Harry.Harmony = (function() {
    function Harmony(chord) {
      var i, info;
      this.notes = [];
      this.noteIndicies = [];
      for (i in chord) {
        info = chord[i];
        this.notes[i] = info[0];
        this.noteIndicies[i] = info[1];
      }
    }
    Harmony.prototype.quality = function() {
      this._quality || (this._quality = this.calculateQuality());
      return this._quality;
    };
    Harmony.prototype.calculateQuality = function() {
      throw "Extend this class to define how a harmony's quality is evaluated";
    };
    return Harmony;
  })();
}).call(this);
