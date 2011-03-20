(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Harry.HarmonySearch = (function() {
    HarmonySearch.defaults = {
      maxTries: 100,
      targetQuality: Infinity,
      harmonyMemorySize: false,
      harmonyMemoryConsiderationRate: .95,
      pitchAdjustmentRate: .1,
      instruments: false,
      notes: false,
      harmonyClass: false,
      harmonyMemorySize: 10,
      afterInit: function() {},
      afterInitMemory: function() {},
      afterNew: function() {}
    };
    function HarmonySearch(options) {
      this.options = _.extend({}, HarmonySearch.defaults, options);
      this.options.notesLength = this.options.notes.length;
      this.options.afterInit(this.options, this);
    }
    HarmonySearch.prototype.search = function(callback) {
      var bestIndex, bestQuality, i, iterate, ret, tries, worstIndex, worstQuality, _ref, _ref2;
      this.harmonyMemory = (function() {
        var _ref, _results;
        _results = [];
        for (i = 0, _ref = this.options.harmonyMemorySize; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          _results.push(this.getRandomHarmony());
        }
        return _results;
      }).call(this);
      _ref = this._getWorst(), worstQuality = _ref[0], worstIndex = _ref[1];
      _ref2 = this._getBest(), bestQuality = _ref2[0], bestIndex = _ref2[1];
      this.options.afterInitMemory(this.harmonyMemory, this);
      tries = 0;
      ret = __bind(function() {
        var _ref;
        return _ref = this._getBest(), bestQuality = _ref[0], bestIndex = _ref[1], _ref;
      }, this);
      callback({
        harmonies: this.harmonyMemory,
        bestQuality: bestQuality,
        best: this.harmonyMemory[bestIndex],
        worstQuality: worstQuality,
        worst: this.harmonyMemory[worstIndex],
        tries: tries
      });
      return iterate = function() {
        var harmony, _ref;
        if (tries > this.options.maxTries) {
          return;
        }
        if (bestQuality > this.options.targetQuality) {
          return;
        }
        harmony = this.getNextHarmony();
        if (harmony.quality() > worstQuality) {
          this.harmonyMemory.push(harmony);
          this.harmonyMemory.splice(worstIndex, 1);
          this.options.afterNew(harmony, this);
          delete harmony.creationAnnotations;
          if (harmony.quality() > bestQuality) {
            bestQuality = harmony.quality();
          }
          _ref = this._getWorst(), worstQuality = _ref[0], worstIndex = _ref[1];
        }
        tries++;
        setTimeout(iterate, 0);
        iterate();
        return true;
      };
    };
    HarmonySearch.prototype._getWorst = function() {
      return this._getComp((function(a, b) {
        return a < b;
      }), Infinity);
    };
    HarmonySearch.prototype._getBest = function() {
      return this._getComp((function(a, b) {
        return a > b;
      }), 0);
    };
    HarmonySearch.prototype.getRandomHarmony = function() {
      var chord, i, index;
      chord = (function() {
        var _ref, _results;
        _results = [];
        for (i = 1, _ref = this.options.instruments; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
          index = Math.floor(Math.random() * this.options.notesLength);
          _results.push([this.options.notes[index], index]);
        }
        return _results;
      }).call(this);
      return new this.options.harmonyClass(chord);
    };
    HarmonySearch.prototype.getNextHarmony = function() {
      var annotation, chord, creationAnnotations, harmony, harmonyMemoryIndex, i, note, noteIndex;
      creationAnnotations = [];
      chord = (function() {
        var _ref, _results;
        _results = [];
        for (i = 1, _ref = this.options.instruments; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
          annotation = creationAnnotations[i - 1] = {};
          if (Math.random() < this.options.harmonyMemoryConsiderationRate) {
            harmonyMemoryIndex = Math.floor(Math.random() * this.options.harmonyMemorySize);
            note = this.harmonyMemory[harmonyMemoryIndex].notes[i];
            noteIndex = this.harmonyMemory[harmonyMemoryIndex].noteIndicies[i];
            annotation.fromMemory = true;
            annotation.memoryIndex = harmonyMemoryIndex;
            if (Math.random() < this.options.pitchAdjustmentRate) {
              annotation.pitchAdjusted = true;
              noteIndex += Math.random() > 0.5 ? 1 : -1;
              note = this.options.notes[(noteIndex + this.options.notesLength) % this.options.notesLength];
            }
          } else {
            noteIndex = Math.floor(Math.random() * this.options.notesLength);
            note = this.options.notes[noteIndex];
            annotation.random = true;
          }
          _results.push([note, noteIndex]);
        }
        return _results;
      }).call(this);
      harmony = new this.options.harmonyClass(chord);
      harmony.creationAnnotations = creationAnnotations;
      return harmony;
    };
    HarmonySearch.prototype._getComp = function(comp, start) {
      var harmony, i, index, quality, _ref;
      quality = start;
      index = -1;
      _ref = this.harmonyMemory;
      for (i in _ref) {
        harmony = _ref[i];
        if (comp(harmony.quality(), quality)) {
          quality = harmony.quality();
          index = i;
        }
      }
      return [quality, index];
    };
    return HarmonySearch;
  })();
}).call(this);
