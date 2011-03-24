(function() {
  var puzzle;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  puzzle = "164....79....3......9...6.53...2...1......432....6.....96.53.....7..4........9.5.";
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
      this.vis2Id = this.options.id + "_vis2";
      this.div.append("<div id=\"" + this.visId + "\" class=\"wheel\"></div>");
      this.game = $("<div class=\"game\"></div>").appendTo(this.div);
      this.div.append("<div id=\"" + this.vis2Id + "\" class=\"create\"></div>");
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
        this._initializeCreationVisualization();
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
      this.harmonies.push(harmony);
      if (this.rows > this.options.maxRows) {
        minIndex = 0;
        minQuality = this.harmonies[0]._quality;
        _ref = this.harmonies;
        for (i in _ref) {
          harmony = _ref[i];
          if (harmony._quality < minQuality) {
            minQuality = harmony._quality;
            minIndex = i;
          }
        }
        this.harmonies.splice(minIndex, 1);
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
      return this.render();
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
      return this.game.html(harmony.showGame());
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
        instruments: this.puzzle.unsolvedCount
      };
      this.harmonyClass = this.puzzle.harmonyClass();
      this.options.maxRows = options.harmonyMemorySize;
      if (Modernizr.webworkers) {
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
        if (d._quality === this.options.targetQuality) {
          return "#A0FF8C";
        } else {
          return this.options.colorScale(d._quality);
        }
      }, this)).strokeStyle(__bind(function(d) {
        if ((this.best != null) && d._quality === this.best._quality) {
          return "green";
        } else {
          return "white";
        }
      }, this)).lineWidth(__bind(function(d) {
        if ((this.best != null) && d._quality === this.best._quality) {
          return 2;
        } else {
          return 1;
        }
      }, this)).event("click", __bind(function(x) {
        return this.showSolution(x);
      }, this)).anchor("center").add(pv.Label).font("8pt Droid Sans").textAngle(0).text(function(d) {
        return d._quality;
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
    SudokuVisualizer.prototype._initializeCreationVisualization = function() {
      var boxPadding, cellWidth, colorScale, i, proto, row, rowHeight, rows, search;
      rowHeight = 28;
      cellWidth = 12;
      boxPadding = 40;
      rows = 16;
      colorScale = pv.Scale.linear(0, rows - 1).range("#000", "#666");
      this.vis2 = new pv.Panel().width(450).height(500).canvas(this.vis2Id);
      row = this.vis2.add(pv.Panel).data(__bind(function() {
        return this.harmonies.slice().reverse().slice(0, (rows - 1 + 1) || 9e9);
      }, this)).height(rowHeight - 3).top(function() {
        return this.index * rowHeight + boxPadding;
      }).strokeStyle("#CCC").lineWidth(1);
      proto = new pv.Label().font("10pt Droid Sans").textBaseline("top").textStyle("#000").top(6);
      row.add(pv.Label).extend(proto).data(function(harmony) {
        return [harmony._quality];
      }).left(0).text(function(d) {
        return "" + d + ":";
      });
      search = this;
      row.add(pv.Label).extend(proto).data(function(harmony) {
        return harmony.notes.slice(0, 34);
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
      });
      this.vis2.add(pv.Label).extend(proto).data((function() {
        var _results;
        _results = [];
        for (i = 1; i <= 9; i++) {
          _results.push(i);
        }
        return _results;
      })()).left(function() {
        return 80 + this.index * cellWidth * 3;
      }).top(4);
      return this.vis2.add(pv.Panel).data(__bind(function() {
        var x;
        if ((x = this.harmonies[this.harmonies.length - 1].creationAnnotations)) {
          return x.slice(0, 34);
        } else {
          return [];
        }
      }, this)).left(function() {
        return 30 + this.index * cellWidth + 7;
      }).add(pv.Wedge).def("pointx", function(d) {
        return 80 + (d.pick - 1) * cellWidth * 3 - this.parent.left() + 7;
      }).def("pointy", function(d) {
        return boxPadding + 4 - 18;
      }).strokeStyle(function(d) {
        if (d.fromMemory) {
          if (d.pitchAdjusted) {
            return "rgba(0,0,255,0.5)";
          } else {
            return "rgba(0,0,0,0.5)";
          }
        } else {
          return "rgba(0,255,0,0.5)";
        }
      }).outerRadius(function(d) {
        if (d.fromMemory) {
          return d.memoryIndex * rowHeight + 14;
        } else {
          return Math.sqrt(Math.pow(this.pointx(), 2) + Math.pow(this.pointy(), 2));
        }
      }).startAngle(function(d) {
        var angle;
        if (!d.fromMemory) {
          angle = Math.atan(this.pointy() / this.pointx());
          if (angle < 0) {
            angle += Math.PI;
          }
          return -1 * angle;
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
