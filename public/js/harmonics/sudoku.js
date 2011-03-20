(function() {
  var SudokuVisualizer, notesRow, puzzle;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  notesRow = _.template("<tr>  <td><b><%= _quality %></b></td>  <% _.each(notes, function(note) { %>  <td><%= note %></td>  <% }); %></tr>");
  puzzle = "..4.5..161....4.83.8..3..59..16.2...8...9....2.9..........8.....3.9........5.1...";
  SudokuVisualizer = (function() {
    SudokuVisualizer.defaults = {
      width: 500,
      height: 500,
      thickness: 70,
      edgeOffset: 10,
      thicknessScale: 20,
      id: false,
      maxRows: 60,
      colorScale: pv.Scale.linear(0, 125).range('white', 'red')
    };
    function SudokuVisualizer(options) {
      this.options = _.extend({}, SudokuVisualizer.defaults, options);
      this.harmonies = [];
      this.rows = 0;
      this.table = $('table#searchResults');
      this.image = $("img#status");
      this.vis = new pv.Panel().width(this.options.width).height(this.options.height).canvas(this.options.id);
      this.vis.add(pv.Wedge).data(__bind(function() {
        return this.harmonies;
      }, this)).left(this.options.width / 2).bottom(this.options.height / 2).innerRadius(this.options.width / 2 - this.options.thickness - this.options.edgeOffset).outerRadius(__bind(function(d) {
        return this.options.width / 2 - this.options.edgeOffset - this.options.thicknessScale + (d.quality / 125 * this.options.thicknessScale);
      }, this)).angle(__bind(function(d) {
        return -2 * Math.PI / this.harmonies.length;
      }, this)).fillStyle(__bind(function(d) {
        return this.options.colorScale(d.quality);
      }, this)).anchor("center").add(pv.Label).textAngle(0).text(function(d) {
        return d.quality;
      });
      this.start();
    }
    SudokuVisualizer.prototype.addHarmony = function(harmony) {
      var i, minIndex, minQuality, _ref;
      this.creationAnnotation = harmony.creationAnnotation;
      this.harmonies.push({
        quality: harmony._quality,
        notes: harmony.notes
      });
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
      return this.vis.render();
    };
    SudokuVisualizer.prototype.start = function() {
      var SudokuSearch, i, klass, options, sudokuDefaults;
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
        }, this)
      };
      options = _.extend(sudokuDefaults, {});
      klass = Harry.SudokuHarmony.classForPuzzle(puzzle);
      options.harmonyClass = klass;
      options.instruments = klass.unsolvedCount;
      SudokuSearch = new Harry.HarmonySearch(options);
      return SudokuSearch.search(function(results) {});
    };
    return SudokuVisualizer;
  })();
  new SudokuVisualizer({
    id: 'searchVis'
  });
}).call(this);
