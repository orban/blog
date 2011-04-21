(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Harry.SudokuVisualizer = (function() {
    __extends(SudokuVisualizer, Harry.HarmonySearchVisualizer);
    SudokuVisualizer.computationModes = {
      "light": {
        workers: false,
        timer: 150,
        milestoneInterval: 10,
        enabled: true
      },
      "medium": {
        workers: false,
        timer: 40,
        milestoneInterval: 60,
        enabled: true
      },
      "heavy": {
        workers: false,
        timer: 0,
        milestoneInterval: 100,
        enabled: true
      },
      "poutine": {
        workers: true,
        milestoneInterval: 1000,
        enabled: Modernizr.webworkers
      }
    };
    SudokuVisualizer.defaults = {
      width: 500,
      height: 500,
      thickness: 70,
      edgeOffset: 10,
      thicknessScale: 30,
      targetQuality: 135,
      id: false,
      maxExtraRows: 0,
      startOnInit: false,
      computationMode: "light",
      puzzle: "geem",
      creationVis: {
        height: 500,
        rowHeight: 28,
        cellWidth: 12,
        maxCols: 33,
        firstColWidth: 30
      }
    };
    SudokuVisualizer.puzzles = {
      "stupid easy": "8...37429743.9286..52..4371.8524.7933..87615..74.5968...7465938.369..2474987..516",
      "easy": ".6...14.98......7...16.93..43...7..22..9....7.18......1...2........4..........8..",
      "geem": ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7.",
      "hard": "164....79....3......9...6.53...2...1......432....6.....96.53.....7..4........9.5.",
      "starburst": "9..1.4..2.8..6..7..........4.......1.7.....3.3.......7..........3..7..8.1..2.9..4"
    };
    function SudokuVisualizer(options) {
      var mode, name, puzzle, _ref, _ref2;
      this.options = _.extend({}, SudokuVisualizer.defaults, options);
      this.options.computationMode = SudokuVisualizer.computationModes[this.options.computationMode];
      this.options.puzzle = SudokuVisualizer.puzzles[this.options.puzzle];
      SudokuVisualizer.__super__.constructor.apply(this, arguments);
      this.controls.append("Computation Intensity: ");
      this.modeSelect = $('<select class="mode"></select>');
      _ref = SudokuVisualizer.computationModes;
      for (name in _ref) {
        mode = _ref[name];
        if (mode.enabled) {
          this.modeSelect.append("<option " + (mode === this.options.computationMode ? "selected" : "") + ">" + name + "</option>");
        }
      }
      this.modeSelect.appendTo(this.controls).change(__bind(function(e) {
        var before_restart;
        this.options.computationMode = SudokuVisualizer.computationModes[this.modeSelect.val()];
        before_restart = this.running;
        this.restartVis();
        if (before_restart) {
          this.start();
        }
        return true;
      }, this));
      this.controls.append("Puzzle: ");
      this.puzzleSelect = $('<select class="puzzle"></select>');
      _ref2 = SudokuVisualizer.puzzles;
      for (name in _ref2) {
        puzzle = _ref2[name];
        this.puzzleSelect.append("<option " + (puzzle === this.options.puzzle ? "selected" : "") + " value=\"" + puzzle + "\">" + name + "</option>");
      }
      this.puzzleSelect.appendTo(this.controls).change(__bind(function(e) {
        var before_restart;
        this.options.puzzle = this.puzzleSelect.val();
        before_restart = this.running;
        this.restartVis();
        if (before_restart) {
          this.start();
        }
        return true;
      }, this));
      if (this.options.startOnInit) {
        this.start();
      }
      true;
    }
    SudokuVisualizer.prototype.stop = function() {
      if (this.options.computationMode.workers) {
        this.hive.send({
          type: "stop"
        });
      } else {
        this.search.stop();
      }
      this.running = false;
      this.activityIndicator.hide();
      return true;
    };
    SudokuVisualizer.prototype.start = function() {
      if (this.options.computationMode.workers) {
        this.hive.send({
          type: "start"
        });
      } else {
        this.search.search();
      }
      this.running = true;
      this.activityIndicator.show();
      return true;
    };
    SudokuVisualizer.prototype.addHarmony = function(harmony) {
      var _ref;
      SudokuVisualizer.__super__.addHarmony.apply(this, arguments);
      (_ref = this.bestViolations) != null ? _ref : this.bestViolations = harmony;
      if (this.bestViolations.violations() > harmony.violations()) {
        return this.bestViolations = harmony;
      }
    };
    SudokuVisualizer.prototype.showSolution = function(harmony, forceRender) {
      if (forceRender == null) {
        forceRender = false;
      }
      this.showing = harmony;
      this.game.html(harmony.showGame());
      if (forceRender) {
        return this.render();
      }
    };
    SudokuVisualizer.prototype._initializeSearch = function() {
      var getHarmony, options;
      this.puzzle = new Harry.SudokuPuzzle(this.options.puzzle);
      options = {
        maxTries: 1000000,
        targetQuality: 135,
        harmonyMemoryConsiderationRate: .7,
        pitchAdjustmentRate: .1,
        notesGlobal: false,
        notes: this.puzzle.possibilities,
        harmonyMemorySize: 16,
        instruments: this.puzzle.unsolvedCount,
        timer: this.options.computationMode.timer || 0,
        iterationMilestone: this.options.computationMode.milestoneInterval
      };
      this.harmonyClass = this.puzzle.harmonyClass();
      this.options.maxRows = options.harmonyMemorySize;
      if (this.options.computationMode.workers) {
        getHarmony = __bind(function(data) {
          var harmony;
          harmony = new this.harmonyClass(_.zip(data.notes, data.noteIndicies));
          harmony._quality = data.wire_quality;
          harmony.creationAnnotations = data.creationAnnotations;
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
                puzzle: this.options.puzzle,
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
                return console.error(data);
            }
          }, this)
        });
      } else {
        return this.search = new Harry.HarmonySearch(_.extend(options, {
          harmonyClass: this.harmonyClass,
          afterInit: __bind(function(options) {}, this),
          afterInitMemory: __bind(function(harmonies, search) {
            var harmony, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = harmonies.length; _i < _len; _i++) {
              harmony = harmonies[_i];
              harmony._quality = harmony.quality();
              _results.push(this.addHarmony(harmony));
            }
            return _results;
          }, this),
          afterNew: __bind(function(harmony, search) {
            harmony._quality = harmony.quality();
            return this.addHarmony(harmony);
          }, this),
          afterMilestone: __bind(function(attrs) {
            return this.showInfo(attrs);
          }, this)
        }));
      }
    };
    return SudokuVisualizer;
  })();
}).call(this);
