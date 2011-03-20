(function() {
  var puzzle;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  puzzle = ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7.";
  Harry.SudokuVisualizer = (function() {
    SudokuVisualizer.defaults = {
      width: 500,
      height: 500,
      thickness: 70,
      edgeOffset: 10,
      thicknessScale: 20,
      id: false,
      maxExtraRows: 0,
      colorScale: pv.Scale.linear(0, 125).range('white', 'red')
    };
    function SudokuVisualizer(options) {
      this.stop = __bind(this.stop, this);;      var me, visId;
      this.options = _.extend({}, SudokuVisualizer.defaults, options);
      this.harmonies = [];
      this.rows = 0;
      this.table = $('table#searchResults');
      this.image = $("img#status");
      this.div = $("#" + this.options.id).addClass("sudoku_vis");
      visId = this.options.id + "_vis";
      this.div.append("<div id=\"" + visId + "\" class=\"wheel\"></div>");
      me = this;
      this.vis = new pv.Panel().width(this.options.width).height(this.options.height).canvas(visId);
      this.vis.add(pv.Wedge).data(__bind(function() {
        return this.harmonies;
      }, this)).left(this.options.width / 2).bottom(this.options.height / 2).innerRadius(this.options.width / 2 - this.options.thickness - this.options.edgeOffset).outerRadius(__bind(function(d) {
        return this.options.width / 2 - this.options.edgeOffset - this.options.thicknessScale + (d.quality() / 125 * this.options.thicknessScale);
      }, this)).angle(__bind(function(d) {
        return -2 * Math.PI / this.harmonies.length;
      }, this)).fillStyle(__bind(function(d) {
        return this.options.colorScale(d.quality());
      }, this)).event("mouseover", __bind(function(x) {
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
      var i, minIndex, minQuality, _ref, _ref2;
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
      if (this.best.quality() < harmony.quality()) {
        this.best = harmony;
        return this.showSolution(harmony);
      }
    };
    SudokuVisualizer.prototype.stop = function() {
      return this.search.options.run = false;
    };
    SudokuVisualizer.prototype.start = function() {
      var i, klass, options, sudokuDefaults;
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
          return this.info.html("Try " + attrs.tries + ". Best: " + (attrs.best.quality()) + ", Worst: " + (attrs.worst.quality()) + ". HMCRS: " + attrs.hmcrs + ", PARS: " + attrs.pars + ", RANDS: " + attrs.rands + ". HMCRS/TOT: " + (attrs.hmcrs / attrs.notes) + ", RANDS/TOT: " + (attrs.rands / attrs.notes) + ", PARS/HMCRS: " + (attrs.pars / attrs.hmcrs));
        }, this)
      };
      options = _.extend(sudokuDefaults, {});
      klass = Harry.SudokuHarmony.classForPuzzle(puzzle);
      options.harmonyClass = klass;
      options.instruments = klass.unsolvedCount;
      this.options.maxRows = options.harmonyMemorySize + this.options.maxExtraRows;
      this.search = new Harry.HarmonySearch(options);
      return this.search.search(function(results) {});
    };
    SudokuVisualizer.prototype.showSolution = function(harmony) {
      return this.game.html(harmony.showGame());
    };
    return SudokuVisualizer;
  })();
}).call(this);
