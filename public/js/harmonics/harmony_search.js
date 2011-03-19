(function() {
  Harry.HarmonySearch = (function() {
    HarmonySearch.defaults = {
      maxTries: 100,
      targetQuality: 0,
      endCondition: false,
      harmonyMemorySize: false,
      harmonyMemoryConsiderationRate: .95,
      pitchAdjustmentRate: .1
    };
    HarmonySearch.prototype.bestHarmony = false;
    HarmonySearch.prototype.worstHarmony = false;
    function HarmonySearch(options, harmonies) {
      this.harmonyMemory = harmonies;
      this.harmonyMemorySize = this.harmonyMemory.length;
      this.options = jQuery.extend({}, HarmonySearch.defaults, options);
    }
    HarmonySearch.prototype.search = function() {
      var harmony, index, tries, worstIndex, worstQuality, _ref, _results;
      worstQuality = 0;
      worstIndex = -1;
      _ref = this.harmonyMemory;
      for (index in _ref) {
        harmony = _ref[index];
        if (harmony.quality() < worstQuality()) {
          worstQuality = harmony.quality();
          worstIndex = index;
        }
      }
      tries = 0;
      _results = [];
      while (true) {
        if (tries > this.options.maxTries) {
          break;
        }
        if (bestHarmony.quality() < this.options.targetQuality) {
          break;
        }
        harmony = this.getNextHarmony();
        _results.push(harmony.quality() < harmonies[harmonyMemorySize - 1].quality() ? true : void 0);
      }
      return _results;
    };
    return HarmonySearch;
  })();
}).call(this);
