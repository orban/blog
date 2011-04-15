(function() {
  var n, x, y;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.Exam = {
    impl_mark: function(x, y) {
      var a;
      x = (x - 50) / 26;
      y = (y - 50) / 26;
      a = 3 * Math.cos(Math.pow(x - 1, 2) + Math.pow(y, 2));
      a += 2 * Math.cos(Math.pow(x - 3, 2) + Math.pow(y + 4, 2));
      a += 2 * Math.pow(Math.cos(x) + Math.cos(y + 1), 3);
      a += 2 * Math.pow(Math.abs(Math.cos(0.4 * x + 3) + Math.cos(0.6 * y - 2)), 1 / 2);
      a -= 3 * Math.pow(Math.pow(x + 2, 2) + Math.pow(y, 2), 1 / 2);
      a -= 3 * Math.pow(Math.pow(x, 2) + Math.pow(y - 1, 2), 1 / 2);
      return a;
    },
    impl_max: -Infinity,
    impl_min: Infinity,
    max: 100,
    min: 1,
    mark: function(x, y) {
      return ((Exam.impl_mark(x, y) - Exam.impl_min) / (Exam.impl_max - Exam.impl_min)) * Exam.max;
    }
  };
  for (x = 0; x <= 100; x++) {
    for (y = 0; y <= 100; y++) {
      if ((n = Exam.impl_mark(x, y)) > Exam.impl_max) {
        Exam.maxIndex = [x, y];
        Exam.impl_max = n;
      }
      if (n < Exam.impl_min) {
        Exam.impl_min = n;
        Exam.minIndex = [x, y];
      }
    }
  }
  Harry.HeatmapVisualizer = (function() {
    HeatmapVisualizer.prototype.w = 100;
    HeatmapVisualizer.prototype.h = 100;
    HeatmapVisualizer.prototype.max = Exam.max;
    HeatmapVisualizer.prototype.min = Exam.min + 10;
    HeatmapVisualizer.prototype.ratio = 4;
    HeatmapVisualizer.prototype.id = "sleepMap";
    function HeatmapVisualizer(options) {
      var k;
      if (options == null) {
        options = {};
      }
      this.options = _.extend(this, HeatmapVisualizer.defaults, options);
      this.x = pv.Scale.linear().domain(0, 10).range(0, this.w * this.ratio);
      this.y = pv.Scale.linear().domain(0, 10).range(0, this.h * this.ratio);
      k = this.max - this.min;
      this.heat = pv.Scale.linear().domain(this.min, this.min + k / 6, this.min + 2 * k / 6, this.min + 3 * k / 6, this.min + 4 * k / 6, this.min + 5 * k / 6, this.max).range("#000", "#0a0", "#6c0", "#ee0", "#eb4", "#eb9", "#fff").by(Exam.mark);
      this.heatmap = new pv.Panel().canvas(this.id).width(this.w * this.ratio).height(this.h * this.ratio).margin(32).top(16).strokeStyle("#aaa").lineWidth(2).antialias(false);
      this.heatmap.add(pv.Image).imageWidth(this.w).imageHeight(this.h).image(this.heat);
      this.heatmap.add(pv.Rule).data(this.x.ticks()).strokeStyle("").left(this.x).anchor("bottom").add(pv.Label).text(this.x.tickFormat).font("8pt Droid Sans");
      this.heatmap.add(pv.Rule).data(this.y.ticks()).strokeStyle("").bottom(this.y).anchor("left").add(pv.Label).text(this.y.tickFormat).font("8pt Droid Sans");
      this.heatmap.add(pv.Label).data(["Hours spent asleep"]).left(-15).bottom(this.h * this.ratio / 2).textAlign("center").textAngle(-Math.PI / 2).font("11pt Droid Sans");
      this.heatmap.add(pv.Label).data(["Hours spent studying"]).left(this.w * this.ratio / 2).bottom(-30).textAlign("center").font("11pt Droid Sans");
      this.heatmap.render();
      $("#" + this.id + " canvas").css({
        width: this.w * this.ratio,
        height: this.h * this.ratio
      });
    }
    return HeatmapVisualizer;
  })();
  Harry.ExamHarmony = (function() {
    function ExamHarmony() {
      ExamHarmony.__super__.constructor.apply(this, arguments);
    }
    __extends(ExamHarmony, Harry.Harmony);
    ExamHarmony.prototype.quality = function() {
      return Exam.mark(this.notes[0] * 10, this.notes[1] * 10);
    };
    return ExamHarmony;
  })();
  Harry.HeatmapSearchVisualizer = (function() {
    __extends(HeatmapSearchVisualizer, Harry.HarmonySearchVisualizer);
    HeatmapSearchVisualizer.defaults = {
      width: 500,
      height: 500,
      thickness: 70,
      edgeOffset: 10,
      thicknessScale: 30,
      targetQuality: 98,
      id: false,
      maxExtraRows: 0,
      startOnInit: false,
      creationVis: {
        height: 500,
        rowHeight: 28,
        cellWidth: 30,
        maxCols: 4,
        firstColWidth: 60
      }
    };
    function HeatmapSearchVisualizer(options) {
      this.options = _.extend({}, HeatmapSearchVisualizer.defaults, options);
      HeatmapSearchVisualizer.__super__.constructor.apply(this, arguments);
      this.start();
      if (!this.options.startOnInit) {
        this.stop();
      }
      true;
    }
    HeatmapSearchVisualizer.prototype.showSolution = function(harmony, forceRender) {
      if (forceRender == null) {
        forceRender = false;
      }
      this.showing = harmony;
      return console.log(harmony);
    };
    HeatmapSearchVisualizer.prototype._initializeSearch = function() {
      var fmtquality, i, notes, options;
      notes = (function() {
        var _results;
        _results = [];
        for (i = 0; i <= 100; i++) {
          _results.push(i / 10);
        }
        return _results;
      })();
      options = {
        maxTries: 10000,
        targetQuality: this.options.targetQuality,
        harmonyMemoryConsiderationRate: .7,
        pitchAdjustmentRate: .1,
        notesGlobal: true,
        notes: notes,
        harmonyMemorySize: 16,
        instruments: 2,
        timer: 300,
        iterationMilestone: 3
      };
      this.options.maxRows = options.harmonyMemorySize;
      fmtquality = function(h) {
        return (Math.round(h.quality() * 100) / 100).toFixed(2);
      };
      return this.search = new Harry.HarmonySearch(_.extend(options, {
        harmonyClass: Harry.ExamHarmony,
        afterInit: __bind(function(options) {}, this),
        afterInitMemory: __bind(function(harmonies, search) {
          var harmony, _i, _len, _results;
          _results = [];
          for (_i = 0, _len = harmonies.length; _i < _len; _i++) {
            harmony = harmonies[_i];
            harmony._quality = fmtquality(harmony);
            _results.push(this.addHarmony(harmony));
          }
          return _results;
        }, this),
        afterNew: __bind(function(harmony, search) {
          harmony._quality = fmtquality(harmony);
          return this.addHarmony(harmony);
        }, this),
        afterMilestone: __bind(function(attrs) {
          return this.showInfo(attrs);
        }, this)
      }));
    };
    return HeatmapSearchVisualizer;
  })();
}).call(this);
