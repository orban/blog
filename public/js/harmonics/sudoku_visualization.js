(function() {
  var puzzle;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  puzzle = ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7.";
  Harry.SudokuVisualizer = (function() {
    SudokuVisualizer.defaults = {
      width: 500,
      height: 500,
      thickness: 70,
      edgeOffset: 20,
      thicknessScale: 30,
      targetQuality: 135,
      id: false,
      maxExtraRows: 0
    };
    function SudokuVisualizer(options) {
      this.stop = __bind(this.stop, this);;      var inner, minimum, visId;
      this.options = _.extend({}, SudokuVisualizer.defaults, options);
      this.harmonies = [];
      this.rows = 0;
      this.div = $("#" + this.options.id).addClass("sudoku_vis");
      visId = this.options.id + "_vis";
      this.div.append("<div id=\"" + visId + "\" class=\"wheel\"></div>");
      inner = this.options.width / 2 - this.options.thickness - this.options.edgeOffset;
      minimum = this.options.thickness - this.options.thicknessScale;
      this.options.colorScale = pv.Scale.linear(this.options.targetQuality / 2, this.options.targetQuality).range('white', 'red');
      this.vis = new pv.Panel().width(this.options.width).height(this.options.height).canvas(visId);
      this.vis.add(pv.Wedge).data(__bind(function() {
        return this.harmonies;
      }, this)).left(this.options.width / 2).bottom(this.options.height / 2).innerRadius(inner).outerRadius(__bind(function(d) {
        var size;
        if (!(this.best != null) || d.violations() === 0) {
          return inner + this.options.thickness;
        }
        size = this.options.thicknessScale * (this.best.violations() / d.violations());
        return inner + minimum + size;
      }, this)).angle(__bind(function(d) {
        return -2 * Math.PI / this.harmonies.length;
      }, this)).fillStyle(__bind(function(d) {
        if (d.quality() === this.options.targetQuality) {
          return "green";
        } else {
          return this.options.colorScale(d.quality());
        }
      }, this)).event("click", __bind(function(x) {
        return this.showSolution(x);
      }, this)).anchor("center").add(pv.Label).textAngle(0).text(function(d) {
        return d.quality();
      });
      this.game = $("<div class=\"game\"></div>").appendTo(this.div);
      this.info = $("<div class=\"info\"></div>").appendTo(this.div);
      this.button = $("<button>Stop</button>").click(this.stop).appendTo(this.div);
      this.start();
    }
    SudokuVisualizer.prototype.addHarmony = function(harmony) {
      var i, minIndex, minQuality, _ref, _ref2, _ref3;
      this.creationAnnotation = harmony.creationAnnotation;
      this.harmonies.push(harmony);
      if (this.rows > this.options.maxRows) {
        minIndex = 0;
        minQuality = this.harmonies[0].quality();
        _ref = this.harmonies;
        for (i in _ref) {
          harmony = _ref[i];
          if (harmony.quality() < minQuality) {
            minQuality = harmony.quality();
            minIndex = i;
          }
        }
        this.harmonies.splice(minIndex, 1);
      } else {
        this.rows++;
      }
      this.vis.render();
      (_ref2 = this.best) != null ? _ref2 : this.best = harmony;
      (_ref3 = this.worst) != null ? _ref3 : this.worst = harmony;
      if (this.best.quality() < harmony.quality()) {
        this.best = harmony;
        this.showSolution(harmony);
      }
      if (this.worst.quality() > harmony.quality()) {
        return this.worst = harmony;
      }
    };
    SudokuVisualizer.prototype.stop = function() {
      return this.search.options.run = false;
    };
    SudokuVisualizer.prototype.start = function() {
      this.puzzle = new Harry.SudokuPuzzle(puzzle);
      this.search = new Harry.HarmonySearch({
        maxTries: 1000000,
        targetQuality: 135,
        harmonyMemoryConsiderationRate: .7,
        pitchAdjustmentRate: .1,
        notesGlobal: false,
        notes: this.puzzle.possibilities(),
        harmonyMemorySize: 20,
        harmonyClass: this.puzzle.harmonyClass(),
        instruments: this.puzzle.unsolvedCount,
        afterInit: __bind(function(options) {}, this),
        afterInitMemory: __bind(function(harmonies, search) {
          var harmony, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = harmonies.length; _i < _len; _i++) {
            harmony = harmonies[_i];
            _results.push(this.addHarmony(harmony));
          }
          return _results;
        }, this),
        afterNew: __bind(function(harmony, search) {
          return this.addHarmony(harmony);
        }, this),
        afterMilestone: __bind(function(attrs) {
          return this.info.html("Try " + attrs.tries + ".                     Best: " + (attrs.best.quality()) + ",                    Worst: " + (attrs.worst.quality()) + ".");
        }, this)
      });
      this.options.maxRows = this.search.options.harmonyMemorySize;
      return this.search.search(function(results) {
        return true;
      });
    };
    SudokuVisualizer.prototype.showSolution = function(harmony) {
      return this.game.html(harmony.showGame());
    };
    return SudokuVisualizer;
  })();
}).call(this);
