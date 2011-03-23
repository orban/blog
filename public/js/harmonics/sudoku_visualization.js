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
      thicknessScale: 30,
      targetQuality: 135,
      id: false,
      maxExtraRows: 0,
      startOnInit: true
    };
    function SudokuVisualizer(options) {
      var startVis;
      this.options = _.extend({}, SudokuVisualizer.defaults, options);
      this.div = $("#" + this.options.id).addClass("sudoku_vis");
      this.visId = this.options.id + "_vis";
      this.div.append("<div id=\"" + this.visId + "\" class=\"wheel\"></div>");
      this.game = $("<div class=\"game\"></div>").appendTo(this.div);
      this.info = $("<div class=\"info\"></div>").appendTo(this.div);
      this.startstop = $('<button class="awesome">Stop</button>').appendTo(this.div).click(__bind(function() {
        if (this.running) {
          this.stop();
          return this.startstop.html("Start");
        } else {
          this.start();
          return this.startstop.html("Stop");
        }
      }, this));
      startVis = __bind(function() {
        if (this.running != null) {
          if (Modernizr.webworkers) {
            this.hive.terminate();
          } else {
            this.search.stop();
          }
          delete this.best;
          delete this.bestViolations;
        }
        this.harmonies = [];
        this.rows = 0;
        this._initializeSearch();
        this._initializeMemoryVisualization();
        if (this.options.startOnInit) {
          return this.start();
        }
      }, this);
      this.reset = $('<button class="awesome">Reset</button>').appendTo(this.div).click(function() {
        return startVis();
      });
      startVis();
    }
    SudokuVisualizer.prototype.addHarmony = function(harmony) {
      var i, minIndex, minQuality, _ref, _ref2, _ref3;
      this.creationAnnotation = harmony.creationAnnotation;
      this.harmonies.push(harmony);
      if (this.rows > this.options.maxRows) {
        minIndex = 0;
        minQuality = this.harmonies[0].quality;
        _ref = this.harmonies;
        for (i in _ref) {
          harmony = _ref[i];
          if (harmony.quality < minQuality) {
            minQuality = harmony.quality;
            minIndex = i;
          }
        }
        this.harmonies.splice(minIndex, 1);
      } else {
        this.rows++;
      }
      (_ref2 = this.best) != null ? _ref2 : this.best = harmony;
      (_ref3 = this.bestViolations) != null ? _ref3 : this.bestViolations = harmony;
      if (this.best.quality < harmony.quality) {
        this.best = harmony;
        this.showSolution(harmony);
      }
      if (this.bestViolations.violations() > harmony.violations()) {
        this.bestViolations = harmony;
      }
      return this.vis.render();
    };
    SudokuVisualizer.prototype.stop = function() {
      if (Modernizr.webworkers) {
        this.hive.send({
          type: "stop"
        });
      } else {
        this.search.stop();
      }
      this.running = false;
      return true;
    };
    SudokuVisualizer.prototype.start = function() {
      if (Modernizr.webworkers) {
        this.hive.send({
          type: "start"
        });
      } else {
        this.search.search();
      }
      this.running = true;
      return true;
    };
    SudokuVisualizer.prototype.showSolution = function(harmony) {
      this.showing = harmony;
      this.game.html(harmony.showGame());
      return this.vis.render();
    };
    SudokuVisualizer.prototype.showInfo = function(attrs) {
      return this.info.html("Try " + attrs.tries + ".            Best: " + attrs.best.quality + ",            Worst: " + attrs.worst.quality + ".");
    };
    SudokuVisualizer.prototype._initializeSearch = function() {
      var getHarmony, options;
      this.puzzle = new Harry.SudokuPuzzle(puzzle);
      options = {
        maxTries: 1000000,
        targetQuality: 135,
        harmonyMemoryConsiderationRate: .7,
        pitchAdjustmentRate: .1,
        notesGlobal: false,
        notes: this.puzzle.possibilities,
        harmonyMemorySize: 20,
        instruments: this.puzzle.unsolvedCount
      };
      this.harmonyClass = this.puzzle.harmonyClass();
      this.options.maxRows = options.harmonyMemorySize;
      if (Modernizr.webworkers) {
        getHarmony = __bind(function(data) {
          var harmony;
          harmony = new this.harmonyClass(_.zip(data.notes, data.noteIndicies));
          harmony.quality = data.wire_quality;
          return harmony;
        }, this);
        return jQuery.Hive.create({
          worker: '/js/harmonics/sudoku_worker.js',
          created: __bind(function(hive) {
            this.hive = hive[0];
            return this.hive.send({
              type: "init",
              options: _.extend(options, {
                maxTries: 100000000,
                puzzle: puzzle,
                iterationMilestone: 1000,
                popStack: 500
              })
            });
          }, this),
          receive: __bind(function(data) {
            var attrs, harmony;
            switch (data.type) {
              case "init":
                return true;
              case "add_harmony":
              case "init_harmony":
                harmony = getHarmony(data.harmony);
                return this.addHarmony(harmony);
              case "milestone":
                attrs = data.attrs;
                attrs.best = getHarmony(attrs.best);
                attrs.worst = getHarmony(attrs.worst);
                return this.showInfo(data.attrs);
              case "console":
              case "message":
                return console.log(data);
              default:
                console.error("Unrecognized message!");
                return console.log(data);
            }
          }, this)
        });
      } else {
        return this.search = new Harry.HarmonySearch(_.extend(options, {
          harmonyClass: harmonyClass,
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
            return this.showInfo(attrs);
          }, this)
        }));
      }
    };
    SudokuVisualizer.prototype._initializeMemoryVisualization = function() {
      var inner, minimum;
      inner = this.options.width / 2 - this.options.thickness - this.options.edgeOffset;
      minimum = this.options.thickness - this.options.thicknessScale;
      this.options.colorScale = pv.Scale.linear(this.options.targetQuality / 2, this.options.targetQuality).range('white', 'red');
      this.vis = new pv.Panel().width(this.options.width).height(this.options.height).canvas(this.visId);
      this.vis.add(pv.Wedge).data(__bind(function() {
        return this.harmonies;
      }, this)).left(this.options.width / 2).bottom(this.options.height / 2).innerRadius(inner).outerRadius(__bind(function(d) {
        var size;
        if (!(this.bestViolations != null) || d.violations() === 0) {
          return inner + this.options.thickness;
        }
        size = this.options.thicknessScale * (this.bestViolations.violations() / d.violations());
        return inner + minimum + size;
      }, this)).angle(__bind(function(d) {
        return -2 * Math.PI / this.harmonies.length;
      }, this)).fillStyle(__bind(function(d) {
        if (d.quality === this.options.targetQuality) {
          return "#A0FF8C";
        } else {
          return this.options.colorScale(d.quality);
        }
      }, this)).strokeStyle(__bind(function(d) {
        if ((this.best != null) && d.quality === this.best.quality) {
          return "green";
        } else {
          return "white";
        }
      }, this)).lineWidth(__bind(function(d) {
        if ((this.best != null) && d.quality === this.best.quality) {
          return 2;
        } else {
          return 1;
        }
      }, this)).event("click", __bind(function(x) {
        return this.showSolution(x);
      }, this)).anchor("center").add(pv.Label).font("8pt Droid Sans").textAngle(0).text(function(d) {
        return d.quality;
      });
      return this.vis.add(pv.Wedge).data(__bind(function() {
        return this.harmonies;
      }, this)).left(this.options.width / 2).bottom(this.options.height / 2).outerRadius(inner - 1).innerRadius(__bind(function(d) {
        if ((this.showing != null) && d === this.showing) {
          return 0;
        } else {
          return inner - 1;
        }
      }, this)).angle(__bind(function(d) {
        return -2 * Math.PI / this.harmonies.length;
      }, this)).fillStyle("#CCC");
    };
    SudokuVisualizer.prototype._renderCreationVisualization = function() {};
    return SudokuVisualizer;
  })();
}).call(this);
