(function() {
  this.Harry = {};
  importScripts("/js/jquery.hive.pollen.js", "/js/underscore.js", "/js/harmonics/harmony.js", "/js/harmonics/harmony_search.js", "/js/harmonics/sudoku_harmony.js");
  $(function(data) {
    var SudokuSearch, i, klass, options, searchResults, sudokuDefaults;
    $.send({
      type: "message",
      message: "Starting."
    });
    sudokuDefaults = {
      maxTries: 1000000,
      targetQuality: 135,
      harmonyMemoryConsiderationRate: .7,
      pitchAdjustmentRate: .1,
      instruments: 9 * 9,
      notes: (function() {
        var _results;
        _results = [];
        for (i = 1; i <= 9; i++) {
          _results.push(i);
        }
        return _results;
      })(),
      harmonyMemorySize: 50,
      afterInit: function(options) {
        return $.send({
          type: "init",
          options: options
        });
      },
      afterInitMemory: function(harmonies, search) {
        var harmony, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = harmonies.length; _i < _len; _i++) {
          harmony = harmonies[_i];
          _results.push($.send({
            type: "init_harmony",
            harmony: harmony
          }));
        }
        return _results;
      },
      afterNew: function(harmony, search) {
        return $.send({
          type: "harmony",
          harmony: harmony
        });
      }
    };
    options = _.extend(sudokuDefaults, data.options);
    klass = Harry.SudokuHarmony.classForPuzzle(data.options.puzzle);
    options.harmonyClass = klass;
    options.instruments = klass.unsolvedCount;
    $.send({
      type: "message",
      options: options
    });
    SudokuSearch = new Harry.HarmonySearch(options);
    searchResults = SudokuSearch.search();
    searchResults.type = "done";
    return $.send(searchResults);
  });
}).call(this);
