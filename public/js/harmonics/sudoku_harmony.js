(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Harry.SudokuHarmony = (function() {
    var i;
    __extends(SudokuHarmony, Harry.Harmony);
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
    SudokuHarmony.prototype.violations = function() {
      this._violations || (this._violations = 135 - this.calculateQualityViolations());
      return this._violations;
    };
    SudokuHarmony.prototype.calculateQuality = function() {
      return this.calculateQualityUniq();
    };
    SudokuHarmony.prototype.calculateQualityViolations = function() {
      return 135 - _.reduce(this.getViolations(), function(acc, row) {
        return acc + _.reduce(row, function(count, v) {
          return count + (v ? 1 : 0);
        }, 0);
      }, 0);
    };
    SudokuHarmony.prototype.calculateQualitySum = function() {
      var box, box_x, box_y, boxes, c, col, horiz, r, row, vert, x;
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
      x = 135 - vert - horiz - boxes;
      return x;
    };
    SudokuHarmony.prototype.calculateQualityUniq = function() {
      var box, box_x, box_y, boxes, col, horiz, row, vert;
      horiz = 0;
      for (row = 0; row <= 8; row++) {
        horiz += 9 - _.uniq(this.nums[row]).length;
      }
      vert = 0;
      for (col = 0; col <= 8; col++) {
        vert += 9 - _.uniq((function() {
          var _results;
          _results = [];
          for (row = 0; row <= 8; row++) {
            _results.push(this.nums[row][col]);
          }
          return _results;
        }).call(this)).length;
      }
      boxes = 0;
      for (box_x = 0; box_x <= 8; box_x += 3) {
        for (box_y = 0; box_y <= 8; box_y += 3) {
          box = [];
          for (row = 0; row <= 2; row++) {
            for (col = 0; col <= 2; col++) {
              box.push(this.nums[box_y + row][box_x + col]);
            }
          }
          boxes += 9 - _.uniq(box).length;
        }
      }
      return 135 - vert - horiz - boxes;
    };
    SudokuHarmony.prototype.getViolations = function() {
      var block_violation, col_violation, other_x, other_y, row, row_violation, val, violations, x, y, _ref;
      violations = [];
      _ref = this.nums;
      for (y in _ref) {
        row = _ref[y];
        y = parseInt(y);
        violations[y] = [];
        for (x in row) {
          val = row[x];
          x = parseInt(x);
          if (this.unsolved[y][x] == null) {
            row_violation = false;
            for (other_x = 0; other_x <= 8; other_x++) {
              if (other_x !== x) {
                if (this.nums[y][other_x] === val) {
                  row_violation = true;
                  break;
                }
              }
            }
            col_violation = false;
            for (other_y = 0; other_y <= 8; other_y++) {
              if (other_y !== y) {
                if (this.nums[other_y][x] === val) {
                  col_violation = true;
                  break;
                }
              }
            }
            block_violation = __bind(function() {
              var block_x, block_y, other_x, other_y, _ref, _ref2;
              block_y = Math.floor(y / 3) * 3;
              block_x = Math.floor(x / 3) * 3;
              for (other_y = block_y, _ref = block_y + 2; (block_y <= _ref ? other_y <= _ref : other_y >= _ref); (block_y <= _ref ? other_y += 1 : other_y -= 1)) {
                for (other_x = block_x, _ref2 = block_x + 2; (block_x <= _ref2 ? other_x <= _ref2 : other_x >= _ref2); (block_x <= _ref2 ? other_x += 1 : other_x -= 1)) {
                  if (other_y !== y && other_x !== x) {
                    if (this.nums[other_y][other_x] === val) {
                      return true;
                    }
                  }
                }
              }
              return false;
            }, this)();
            violations[y][x] = row_violation || col_violation || block_violation;
          }
        }
      }
      return violations;
    };
    SudokuHarmony.prototype.showGame = function() {
      var cssClass, row, s, unsolvedCount, val, violations, violationsCount, x, y, _ref;
      unsolvedCount = 0;
      violationsCount = 0;
      violations = this.getViolations();
      s = "<table class=\"sudoku_game\">";
      _ref = this.nums;
      for (y in _ref) {
        row = _ref[y];
        y = parseInt(y);
        s += "<tr>";
        for (x in row) {
          val = row[x];
          x = parseInt(x);
          if (this.unsolved[y][x] == null) {
            if (this.possibilities[unsolvedCount].length > 1) {
              if (violations[y][x]) {
                violationsCount++;
                cssClass = "violated";
              } else {
                cssClass = "good";
              }
            } else {
              cssClass = "boring";
            }
            unsolvedCount++;
          } else {
            cssClass = "fixed";
          }
          s += "<td class=\"" + cssClass + "\">" + val + "</td>";
        }
        s += "</tr>";
      }
      s += "</table>";
      s += "Violations: " + violationsCount + "/" + unsolvedCount + ". Quality: " + (_.isFunction(this.quality) ? this.quality() : this.quality);
      return s;
    };
    return SudokuHarmony;
  })();
}).call(this);
