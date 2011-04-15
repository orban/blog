(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Harry.HarmonySearchVisualizer = (function() {
    HarmonySearchVisualizer.defaults = {};
    function HarmonySearchVisualizer(options) {
      var restartVis;
      this.options || (this.options = _.extend({}, HarmonySearchVisualizer.defaults, options));
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
        var _ref;
        if (this.running) {
          if ((_ref = this.options.computationMode) != null ? _ref.webworkers : void 0) {
            this.hive.terminate();
          } else {
            this.search.stop();
          }
        }
        delete this.best;
        delete this.worst;
        delete this.bestViolations;
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
      this.activityIndicator = $('<img class="working" src="/images/working.gif">').hide().appendTo(this.controls);
      restartVis();
    }
    HarmonySearchVisualizer.prototype.addHarmony = function(harmony) {
      var i, minIndex, minQuality, secondMinIndex, _ref, _ref2;
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
      if (this.best._quality < harmony._quality) {
        this.best = harmony;
        this.showSolution(harmony);
      }
      this.render();
      if (this.best._quality >= this.options.targetQuality) {
        return this.finished();
      }
    };
    HarmonySearchVisualizer.prototype.stop = function() {
      this.search.stop();
      this.running = false;
      this.activityIndicator.hide();
      return true;
    };
    HarmonySearchVisualizer.prototype.start = function() {
      this.search.search();
      this.running = true;
      this.activityIndicator.show();
      return true;
    };
    HarmonySearchVisualizer.prototype.finished = function() {
      return this.stop();
    };
    HarmonySearchVisualizer.prototype.showSolution = function(harmony, forceRender) {
      if (forceRender == null) {
        forceRender = false;
      }
      throw "Unimplemented";
    };
    HarmonySearchVisualizer.prototype.showInfo = function(attrs) {
      var s;
      s = "Try " + attrs.tries + ".";
      if (attrs.best != null) {
        s += "Best: " + attrs.best._quality + ".";
      }
      if (attrs.worst != null) {
        s += "Worst: " + attrs.worst._quality + ".";
      }
      return this.info.html(s);
    };
    HarmonySearchVisualizer.prototype.render = function() {
      this.vis.render();
      return this.vis2.render();
    };
    HarmonySearchVisualizer.prototype._initializeSearch = function() {
      throw "Unimplemented";
    };
    HarmonySearchVisualizer.prototype._initializeMemoryVisualization = function() {
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
        if (d._quality >= this.options.targetQuality) {
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
    HarmonySearchVisualizer.prototype._initializeCreationVisualization = function() {
      var boxPadding, cellWidth, colorScale, firstColWidth, height, i, maxCols, maxPossibilities, possibilities, proto, randoms, randomsRowHeight, row, rowHeight, rows, search, textColorScale;
      height = this.options.creationVis.height;
      rowHeight = this.options.creationVis.rowHeight;
      cellWidth = this.options.creationVis.cellWidth;
      maxCols = this.options.creationVis.maxCols;
      firstColWidth = this.options.creationVis.firstColWidth;
      randomsRowHeight = 20;
      possibilities = this.puzzle != null ? this.puzzle.possibilities : [
        (function() {
          var _i, _len, _ref, _results;
          _ref = this.search.options.instruments;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            i = _ref[_i];
            _results.push(this.search.options.notes);
          }
          return _results;
        }).call(this)
      ];
      maxPossibilities = _(possibilities.slice(0, (maxCols + 1) || 9e9)).chain().map(function(x) {
        return x.length;
      }).max().value();
      boxPadding = maxPossibilities * randomsRowHeight + 10;
      rows = Math.floor((height - boxPadding) / rowHeight);
      colorScale = pv.Scale.linear(0, rows - 1).range("#000", "#666");
      this.vis2 = new pv.Panel().width(450).height(height).canvas(this.vis2Id);
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
        return firstColWidth + this.index * cellWidth;
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
      randoms = this.vis2.add(pv.Panel).data(possibilities.slice(0, (maxCols + 1) || 9e9)).width(cellWidth).height(maxPossibilities * randomsRowHeight).top(0).left(function() {
        return firstColWidth + this.index * cellWidth;
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
        return firstColWidth + this.index * cellWidth + 7;
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
    return HarmonySearchVisualizer;
  })();
}).call(this);
