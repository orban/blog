(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Harry.HarmonySearch = (function() {
    HarmonySearch.defaults = {
      maxTries: 100,
      iterationMilestone: 100,
      targetQuality: Infinity,
      harmonyMemorySize: false,
      harmonyMemoryConsiderationRate: .95,
      pitchAdjustmentRate: .1,
      randomAllocationMultiplier: 3,
      instruments: false,
      notes: false,
      notesGlobal: true,
      harmonyClass: false,
      harmonyMemorySize: 10,
      afterInit: function() {},
      afterInitMemory: function() {},
      afterNew: function() {},
      run: true
    };
    function HarmonySearch(options) {
      this.options = _.extend({}, HarmonySearch.defaults, options);
      this.options.notesLength = this.options.notes.length;
      this.pars = 0;
      this.hmcrs = 0;
      this.rands = 0;
      this.notes = 0;
      this.options.afterInit(this.options, this);
    }
    HarmonySearch.prototype.search = function(callback) {
      var bestIndex, bestQuality, i, iterate, randoms, ret, tries, worstIndex, worstQuality, _ref, _ref2;
      randoms = (function() {
        var _ref, _results;
        _results = [];
        for (i = 1, _ref = this.options.harmonyMemorySize * this.options.randomAllocationMultiplier; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
          _results.push(this.getRandomHarmony());
        }
        return _results;
      }).call(this);
      randoms.sort(function(a, b) {
        return b.quality() - a.quality();
      });
      this.harmonyMemory = randoms.slice(0, this.options.harmonyMemorySize);
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
      iterate = __bind(function() {
        var harmony, _ref, _ref2;
        if (tries > this.options.maxTries || bestQuality >= this.options.targetQuality || !this.options.run) {
          ret();
          return true;
        }
        if (tries % this.options.iterationMilestone === 0) {
          _ref = this._getBest(), bestQuality = _ref[0], bestIndex = _ref[1];
          this.options.afterMilestone({
            tries: tries,
            best: this.harmonyMemory[bestIndex],
            worst: this.harmonyMemory[worstIndex],
            pars: this.pars,
            hmcrs: this.hmcrs,
            rands: this.rands,
            notes: this.notes
          });
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
          _ref2 = this._getWorst(), worstQuality = _ref2[0], worstIndex = _ref2[1];
        }
        tries++;
        setTimeout(iterate, 0);
        return true;
      }, this);
      iterate();
      return true;
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
        for (i = 0, _ref = this.options.instruments - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          _results.push(this.options.notesGlobal ? (index = Math.floor(Math.random() * this.options.notesLength), [this.options.notes[index], index]) : (index = Math.floor(Math.random() * this.options.notes[i].length), [this.options.notes[i][index], index]));
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
        for (i = 0, _ref = this.options.instruments - 1; (0 <= _ref ? i <= _ref : i >= _ref); (0 <= _ref ? i += 1 : i -= 1)) {
          this.notes++;
          annotation = creationAnnotations[i] = {};
          if (Math.random() < this.options.harmonyMemoryConsiderationRate) {
            harmonyMemoryIndex = Math.floor(Math.random() * this.options.harmonyMemorySize);
            note = this.harmonyMemory[harmonyMemoryIndex].notes[i];
            noteIndex = this.harmonyMemory[harmonyMemoryIndex].noteIndicies[i];
            annotation.fromMemory = true;
            annotation.memoryIndex = harmonyMemoryIndex;
            this.hmcrs++;
            if (Math.random() < this.options.pitchAdjustmentRate) {
              annotation.pitchAdjusted = true;
              annotation.adjustment = Math.random() > 0.5 ? 1 : -1;
              annotation.oldNoteIndex = noteIndex;
              if (this.options.notesGlobal) {
                noteIndex = (noteIndex + annotation.adjustment + this.options.notesLength) % this.options.notesLength;
                note = this.options.notes[noteIndex];
              } else {
                noteIndex = (noteIndex + annotation.adjustment + this.options.notes[i].length) % this.options.notes[i].length;
                note = this.options.notes[i][noteIndex];
              }
              this.pars++;
            }
          } else {
            if (this.options.notesGlobal) {
              noteIndex = Math.floor(Math.random() * this.options.notesLength);
              note = this.options.notes[noteIndex];
            } else {
              noteIndex = Math.floor(Math.random() * this.options.notes[i].length);
              note = this.options.notes[i][noteIndex];
            }
            annotation.random = true;
            this.rands++;
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
