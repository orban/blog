(function() {
  var puzzle;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  puzzle = ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7.";
  Harry.SudokuVisualizer = (function() {
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
      computationMode: "light"
    };
    function SudokuVisualizer(options) {
      var mode, name, restartVis, _ref;
      this.options = _.extend({}, SudokuVisualizer.defaults, options);
      this.options.computationMode = SudokuVisualizer.computationModes[this.options.computationMode];
      this.div = $("#" + this.options.id).addClass("sudoku_vis");
      this.visId = this.options.id + "_vis";
      this.vis2Id = this.options.id + "_vis2";
      this.controls = $("<div class=\"controls\"></div>").appendTo(this.div);
      this.info = $("<div class=\"info\"></div>").appendTo(this.controls);
      this.div.append("<div id=\"" + this.visId + "\" class=\"wheel\"></div>");
      this.game = $("<div class=\"game\"></div>").appendTo(this.div);
      this.div.append("<div id=\"" + this.vis2Id + "\" class=\"create\"></div>");
      this.startstop = $("<button class=\"awesome\">" + (this.options.startOnInit ? "Pause" : "Start") + "</button>").appendTo(this.controls).click(__bind(function() {
        if (this.running) {
          this.stop();
          return this.startstop.html("Start");
        } else {
          this.start();
          return this.startstop.html("Pause");
        }
      }, this));
      restartVis = __bind(function() {
        if (this.running) {
          if (this.options.computationMode.webworkers) {
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
        return this._initializeCreationVisualization();
      }, this);
      this.reset = $('<button class="awesome">Reset</button>').appendTo(this.controls).click(__bind(function() {
        restartVis();
        return this.start();
      }, this));
      this.controls.append("Computation Intensity: ");
      this.modeSelect = $('<select class="mode"></select>');
      _ref = SudokuVisualizer.computationModes;
      for (name in _ref) {
        mode = _ref[name];
        if (mode.enabled) {
          this.modeSelect.append("<option " + (name === this.options.computationMode ? "selected" : "") + ">" + name + "</option>");
        }
      }
      this.modeSelect.appendTo(this.controls).change(__bind(function(e) {
        this.options.computationMode = SudokuVisualizer.computationModes[this.modeSelect.val()];
        restartVis();
        if (this.running) {
          this.start();
        }
        return true;
      }, this));
      this.activityIndicator = $('<img class="working" src="/images/working.gif">').hide().appendTo(this.controls);
      restartVis();
      this.start();
      if (!this.options.startOnInit) {
        this.stop();
      }
    }
    SudokuVisualizer.prototype.addHarmony = function(harmony) {
      var i, minIndex, minQuality, secondMinIndex, _ref, _ref2, _ref3;
      this.harmonies.push(harmony);
      if (this.rows > this.options.maxRows) {
        minIndex = 0;
        secondMinIndex = 0;
        minQuality = this.harmonies[0]._quality;
        _ref = this.harmonies;
        for (i in _ref) {
          harmony = _ref[i];
          if (harmony._quality <= minQuality) {
            secondMinIndex = minIndex;
            minQuality = harmony._quality;
            minIndex = i;
          }
        }
        this.harmonies.splice(minIndex, 1);
        this.worst = this.harmonies[secondMinIndex];
      } else {
        this.rows++;
      }
      (_ref2 = this.best) != null ? _ref2 : this.best = harmony;
      (_ref3 = this.bestViolations) != null ? _ref3 : this.bestViolations = harmony;
      if (this.best._quality < harmony._quality) {
        this.best = harmony;
        this.showSolution(harmony);
      }
      if (this.bestViolations.violations() > harmony.violations()) {
        this.bestViolations = harmony;
      }
      this.render();
      if (this.best._quality === this.options.targetQuality) {
        return this.finished();
      }
    };
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
    SudokuVisualizer.prototype.finished = function() {
      return this.stop();
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
    SudokuVisualizer.prototype.showInfo = function(attrs) {
      return this.info.html("Try " + attrs.tries + ".            Best: " + attrs.best._quality + ",            Worst: " + attrs.worst._quality + ".");
    };
    SudokuVisualizer.prototype.render = function() {
      this.vis.render();
      return this.vis2.render();
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
    SudokuVisualizer.prototype._initializeMemoryVisualization = function() {
      var inner, minimum;
      inner = this.options.width / 2 - this.options.thickness - this.options.edgeOffset;
      minimum = this.options.thickness - this.options.thicknessScale;
      this.options.colorScale = pv.Scale.linear(2 * this.options.targetQuality / 3, this.options.targetQuality).range('white', 'purple');
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
        if (d._quality === this.options.targetQuality) {
          return "#A0FF8C";
        } else {
          return this.options.colorScale(d._quality);
        }
      }, this)).strokeStyle("white").lineWidth(1).event("click", __bind(function(x) {
        return this.showSolution(x, true);
      }, this)).anchor("center").add(pv.Label).font("8pt Droid Sans").textAngle(0).text(function(d) {
        return d._quality;
      });
      this.vis.add(pv.Wedge).data(__bind(function() {
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
      return this.vis.add(pv.Wedge).data(__bind(function() {
        return this.harmonies;
      }, this)).left(this.options.width / 2).bottom(this.options.height / 2).angle(__bind(function(d) {
        return -2 * Math.PI / this.harmonies.length;
      }, this)).outerRadius(inner - 1).innerRadius(__bind(function(d) {
        if (((this.best != null) && d._quality === this.best._quality) || ((this.worst != null) && d._quality === this.worst._quality)) {
          return inner - 5;
        } else {
          return inner - 1;
        }
      }, this)).fillStyle(__bind(function(d) {
        if ((this.best != null) && d._quality === this.best._quality) {
          return "green";
        } else if ((this.worst != null) && d._quality === this.worst._quality) {
          return "red";
        } else {
          return "white";
        }
      }, this));
    };
    SudokuVisualizer.prototype._initializeCreationVisualization = function() {
      var boxPadding, cellWidth, colorScale, maxCols, maxPossibilities, proto, randoms, randomsRowHeight, row, rowHeight, rows, search, textColorScale;
      rowHeight = 28;
      cellWidth = 12;
      maxCols = 33;
      randomsRowHeight = 20;
      maxPossibilities = _(this.puzzle.possibilities.slice(0, (maxCols + 1) || 9e9)).chain().map(function(x) {
        return x.length;
      }).max().value();
      boxPadding = maxPossibilities * randomsRowHeight + 10;
      rows = 14;
      colorScale = pv.Scale.linear(0, rows - 1).range("#000", "#666");
      this.vis2 = new pv.Panel().width(450).height(500).canvas(this.vis2Id);
      row = this.vis2.add(pv.Panel).data(__bind(function() {
        return this.harmonies.slice().reverse().slice(0, (rows - 1 + 1) || 9e9);
      }, this)).height(rowHeight - 3).top(function() {
        return this.index * rowHeight + boxPadding;
      }).strokeStyle("#CCC").lineWidth(1);
      proto = new pv.Label().top(6).font("10pt Droid Sans").textBaseline("top").textStyle("#000");
      row.add(pv.Label).extend(proto).data(function(harmony) {
        return [harmony._quality];
      }).left(0).text(function(d) {
        return "" + d + ":";
      });
      search = this;
      textColorScale = pv.Scale.linear(0, rows).range("#000", "#AAA");
      row.add(pv.Label).extend(proto).data(function(harmony) {
        return harmony.notes.slice(0, (maxCols + 1) || 9e9);
      }).left(function() {
        return 30 + this.index * cellWidth;
      }).font(function(d) {
        var extra, x;
        extra = "";
        if (x = search.harmonies[search.harmonies.length - 1].creationAnnotations) {
          if (x[this.index].fromMemory && x[this.index].memoryIndex === this.parent.index - 1) {
            extra = "bold ";
          }
        }
        if (this.parent.index === 0) {
          extra = "bold ";
        }
        return "" + extra + "10pt Droid Sans";
      }).textStyle(function(d) {
        var x;
        if (x = search.harmonies[search.harmonies.length - 1].creationAnnotations) {
          if (x[this.index].fromMemory && x[this.index].memoryIndex === this.parent.index - 1) {
            return "#000";
          }
        }
        if (this.parent.index === 0) {
          return "#000";
        }
        return textColorScale(this.parent.index);
      });
      randoms = this.vis2.add(pv.Panel).data(this.puzzle.possibilities.slice(0, (maxCols + 1) || 9e9)).width(cellWidth).height(maxPossibilities * randomsRowHeight).top(0).left(function() {
        return 30 + this.index * cellWidth;
      });
      randoms.add(pv.Label).data(function(possibilities) {
        return possibilities;
      }).font(function(d) {
        var extra, x;
        extra = "";
        if (x = search.harmonies[search.harmonies.length - 1].creationAnnotations) {
          if (x[this.parent.index].random && x[this.parent.index].noteIndex === this.index) {
            extra = "bold ";
          }
        }
        return "" + extra + "10pt Droid Sans";
      }).textStyle("#000").left(0).height(rowHeight).bottom(function(d) {
        return this.index * randomsRowHeight;
      });
      return this.vis2.add(pv.Panel).data(__bind(function() {
        var x;
        if ((x = this.harmonies[this.harmonies.length - 1].creationAnnotations)) {
          return x.slice(0, 34);
        } else {
          return [];
        }
      }, this)).left(function() {
        return 30 + this.index * cellWidth + 7;
      }).add(pv.Wedge).strokeStyle(function(d) {
        if (d.fromMemory) {
          if (d.pitchAdjusted) {
            return "rgba(0,0,255,0.5)";
          } else {
            return "rgba(0,0,0,0.5)";
          }
        } else {
          return "rgba(155,0,155,0.5)";
        }
      }).outerRadius(function(d) {
        if (d.fromMemory) {
          return d.memoryIndex * rowHeight + 14;
        } else {
          return d.noteIndex * randomsRowHeight + 16;
        }
      }).startAngle(function(d) {
        if (!d.fromMemory) {
          return Math.PI / -2;
        } else {
          return Math.PI / 2;
        }
      }).angle(0).top(function(d) {
        if (d.fromMemory) {
          return boxPadding + rowHeight - 8;
        } else {
          return boxPadding + 6;
        }
      });
    };
    return SudokuVisualizer;
  })();
}).call(this);
