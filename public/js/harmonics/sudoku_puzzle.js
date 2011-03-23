(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  Harry.SudokuPuzzle = (function() {
    function SudokuPuzzle(puzzle) {
      var char, col, row;
      this.puzzle = puzzle;
      this.unsolvedCount = 0;
      this.nums = [];
      for (row = 0; row <= 8; row++) {
        this.nums[row] = [];
        for (col = 0; col <= 8; col++) {
          char = this.puzzle.charAt(row * 9 + col);
          if (char === ".") {
            this.unsolvedCount++;
          } else {
            this.nums[row][col] = parseInt(char);
          }
        }
      }
      this.possibilities = this.getPossibilities();
    }
    SudokuPuzzle.prototype.harmonyClass = function() {
      var PuzzleSolver, c, n, p;
      c = this.unsolvedCount;
      n = this.nums;
      p = this.possibilities;
      PuzzleSolver = (function() {
        function PuzzleSolver() {
          PuzzleSolver.__super__.constructor.apply(this, arguments);
        }
        __extends(PuzzleSolver, Harry.SudokuHarmony);
        PuzzleSolver.unsolvedCount = c;
        PuzzleSolver.prototype.possibilities = p;
        PuzzleSolver.prototype.unsolved = n;
        return PuzzleSolver;
      })();
      return PuzzleSolver;
    };
    SudokuPuzzle.prototype.getPossibilities = function() {
      var acc, block_x, block_y, other_row_val, other_x, other_y, other_y_index, possibility, possible, possible_vals, row, valp, x, y, _ref, _ref2, _ref3, _ref4;
      acc = [];
      _ref = this.nums;
      for (y in _ref) {
        row = _ref[y];
        y = parseInt(y);
        for (x = 0; x <= 8; x++) {
          if (row[x] == null) {
            possible = [true, true, true, true, true, true, true, true, true];
            for (other_x in row) {
              other_row_val = row[other_x];
              if (other_x !== x) {
                possible[other_row_val - 1] = false;
              }
            }
            for (other_y_index = 0; other_y_index <= 8; other_y_index++) {
              if (other_y_index !== y && (((_ref2 = this.nums[other_y_index]) != null ? _ref2[x] : void 0) != null)) {
                possible[this.nums[other_y_index][x] - 1] = false;
              }
            }
            block_y = Math.floor(y / 3) * 3;
            block_x = Math.floor(x / 3) * 3;
            for (other_y = block_y, _ref3 = block_y + 2; (block_y <= _ref3 ? other_y <= _ref3 : other_y >= _ref3); (block_y <= _ref3 ? other_y += 1 : other_y -= 1)) {
              for (other_x = block_x, _ref4 = block_x + 2; (block_x <= _ref4 ? other_x <= _ref4 : other_x >= _ref4); (block_x <= _ref4 ? other_x += 1 : other_x -= 1)) {
                if (other_y !== y && other_x !== x) {
                  possible[this.nums[other_y][other_x] - 1] = false;
                }
              }
            }
            possible_vals = [];
            for (valp in possible) {
              possibility = possible[valp];
              if (possibility) {
                possible_vals.push(parseInt(valp) + 1);
              }
            }
            acc.push(possible_vals);
          }
        }
      }
      return acc;
    };
    return SudokuPuzzle;
  })();
}).call(this);
