(function() {
  var prepareHarmony, puzzle, sudokuSearch;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  this.Harry = {};
  importScripts("/js/jquery.hive.pollen.js", "/js/underscore.js", "/js/harmonics/harmony.js", "/js/harmonics/harmony_search.js", "/js/harmonics/sudoku_puzzle.js", "/js/harmonics/sudoku_harmony.js");
  puzzle = false;
  sudokuSearch = false;
  prepareHarmony = function(harmony) {
    harmony.wire_quality = harmony.quality();
    return harmony;
  };
  $(function(data) {
    var options;
    switch (data.type) {
      case "init":
        puzzle = new Harry.SudokuPuzzle(data.options.puzzle);
        options = _.extend(data.options, {
          popStack: 100,
          harmonyClass: puzzle.harmonyClass(),
          afterInitMemory: __bind(function(harmonies, search) {
            var harmony, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = harmonies.length; _i < _len; _i++) {
              harmony = harmonies[_i];
              _results.push($.send({
                type: "init_harmony",
                harmony: prepareHarmony(harmony)
              }));
            }
            return _results;
          }, this),
          afterNew: __bind(function(harmony, search) {
            return $.send({
              type: "add_harmony",
              harmony: prepareHarmony(harmony)
            });
          }, this),
          afterMilestone: __bind(function(attrs) {
            attrs.worst = prepareHarmony(attrs.worst);
            attrs.best = prepareHarmony(attrs.best);
            return $.send({
              type: "milestone",
              attrs: attrs
            });
          }, this)
        });
        return sudokuSearch = new Harry.HarmonySearch(options);
      case "start":
        return sudokuSearch.search();
      case "stop":
        return sudokuSearch.stop();
    }
  });
}).call(this);
