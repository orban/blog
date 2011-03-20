(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Harry.SudokuHarmony = (function() {
    var i;
    __extends(SudokuHarmony, Harry.Harmony);
    SudokuHarmony.classForPuzzle = function(puzzle) {
      var PuzzleSolver, char, col, nums, row, unsolvedCount;
      unsolvedCount = 0;
      nums = [];
      for (row = 0; row <= 8; row++) {
        nums[row] = [];
        for (col = 0; col <= 8; col++) {
          char = puzzle.charAt(row * 9 + col);
          if (char === ".") {
            unsolvedCount++;
          } else {
            nums[row][col] = parseInt(char);
          }
        }
      }
      PuzzleSolver = (function() {
        function PuzzleSolver() {
          PuzzleSolver.__super__.constructor.apply(this, arguments);
        }
        __extends(PuzzleSolver, Harry.SudokuHarmony);
        PuzzleSolver.unsolvedCount = unsolvedCount;
        PuzzleSolver.prototype.unsolved = nums;
        return PuzzleSolver;
      })();
      return PuzzleSolver;
    };
    SudokuHarmony.prototype.unsolved = (function() {
      var _results;
      _results = [];
      for (i = 0; i <= 8; i++) {
        _results.push([]);
      }
      return _results;
    })();
    function SudokuHarmony() {
      var col, k, row;
      SudokuHarmony.__super__.constructor.apply(this, arguments);
      k = 0;
      this.nums = [];
      for (row = 0; row <= 8; row++) {
        this.nums[row] = [];
        for (col = 0; col <= 8; col++) {
          this.nums[row][col] = this.unsolved[row][col] != null ? this.unsolved[row][col] : this.notes[k++];
        }
      }
    }
    SudokuHarmony.prototype.calculateQuality = function() {
      var box, box_x, box_y, boxes, c, col, horiz, r, row, sum, vert;
      sum = function(ar) {
        var l, t, x, _results;
        l = ar.length - 1;
        t = 0;
        _results = [];
        for (x = 0; (0 <= l ? x <= l : x >= l); (0 <= l ? x += 1 : x -= 1)) {
          _results.push(t = ar[x]);
        }
        return _results;
      };
      horiz = 0;
      for (row = 0; row <= 8; row++) {
        r = -45;
        for (col = 0; col <= 8; col++) {
          r += this.nums[row][col];
        }
        horiz += Math.abs(r);
      }
      vert = 0;
      for (col = 0; col <= 8; col++) {
        c = -45;
        for (row = 0; row <= 8; row++) {
          c += this.nums[row][col];
        }
        vert += Math.abs(c);
      }
      boxes = 0;
      for (box_x = 0; box_x <= 8; box_x += 3) {
        for (box_y = 0; box_y <= 8; box_y += 3) {
          box = -45;
          for (row = 0; row <= 2; row++) {
            for (col = 0; col <= 2; col++) {
              box += this.nums[box_y + row][box_x + col];
            }
          }
          boxes += Math.abs(box);
        }
      }
      return 135 - vert - horiz - boxes;
    };
    return SudokuHarmony;
  })();
}).call(this);
