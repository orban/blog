(function() {
  var almostSolved, geem, geem2, solved;
  window.Harry = {};
  solved = "164582379725936148839147625378425961651798432942361587296853714587614293413279856";
  almostSolved = "16458237972593614883914762537842596165179843294236158729685371458761429341327985.";
  geem = "254316897763985124198427653981753246632849512547261938475692381316578492829134576";
  geem2 = "254316897763985124198427653981743246632859715547261938475692381319578462826134579";
  require("/js/underscore.js", "/js/protovis-d3.2.js", "/js/harmonics/harmony.js", "/js/harmonics/harmony_search.js", "/js/harmonics/sudoku_harmony.js", "/js/harmonics/sudoku_visualization.js", function() {
    var klass;
    describe("sum scoring", function() {
      it("should score a complete game properly", function() {
        var harmony, klass;
        klass = Harry.SudokuHarmony.classForPuzzle(solved);
        expect(klass.unsolvedCount).toEqual(0);
        harmony = new klass([]);
        return expect(harmony.calculateQualitySum()).toEqual(135);
      });
      it("should score an almost complete game properly", function() {
        var harmony, klass;
        klass = Harry.SudokuHarmony.classForPuzzle(almostSolved);
        expect(klass.unsolvedCount).toEqual(1);
        harmony = new klass([[1, 1]]);
        expect(harmony.calculateQualitySum()).not.toEqual(135);
        harmony = new klass([[6, 1]]);
        return expect(harmony.calculateQualitySum()).toEqual(135);
      });
      return it("should score with the same ability as Zeem", function() {
        var harmony, klass;
        klass = Harry.SudokuHarmony.classForPuzzle(geem);
        harmony = new klass([]);
        expect(harmony.calculateQualitySum()).toEqual(135 - 21);
        klass = Harry.SudokuHarmony.classForPuzzle(geem2);
        harmony = new klass([]);
        return expect(harmony.calculateQualitySum()).toEqual(135 - 2);
      });
    });
    describe("uniq scoring", function() {
      it("should score a complete game properly", function() {
        var harmony, klass;
        klass = Harry.SudokuHarmony.classForPuzzle(solved);
        expect(klass.unsolvedCount).toEqual(0);
        harmony = new klass([]);
        return expect(harmony.calculateQualityUniq()).toEqual(135);
      });
      return it("should score an almost complete game properly", function() {
        var harmony, klass;
        klass = Harry.SudokuHarmony.classForPuzzle(almostSolved);
        expect(klass.unsolvedCount).toEqual(1);
        harmony = new klass([[1, 1]]);
        expect(harmony.calculateQualityUniq()).not.toEqual(135);
        harmony = new klass([[6, 1]]);
        return expect(harmony.calculateQualityUniq()).toEqual(135);
      });
    });
    describe("searching", function() {});
    klass = false;
    describe("visualizing games", function() {
      beforeEach(function() {
        return klass = Harry.SudokuHarmony.classForPuzzle(almostSolved);
      });
      it("should render violations", function() {
        var wrong;
        wrong = new klass([[1, 1]]);
        return expect(wrong.showGame()).toMatch("violated");
      });
      return it("should render correct blocks", function() {
        var right;
        right = new klass([[6, 1]]);
        return expect(right.showGame()).toMatch("good");
      });
    });
    return describe("searching", function() {
      return it("should properly generate new harmonies", function() {
        var annotation, count, harmony, hmcr, i, index, note, notes, par, par1, par2, rand, search, _ref;
        notes = [1, 2, 3, 4, 5];
        search = new Harry.HarmonySearch({
          notes: notes,
          instruments: 4,
          harmonyMemoryConsiderationRate: 0.5,
          pitchAdjustmentRate: 0.5,
          harmonyMemorySize: 2,
          harmonyClass: Harry.Harmony
        });
        search.harmonyMemory = [search.getRandomHarmony(), search.getRandomHarmony()];
        hmcr = false;
        par = false;
        par1 = false;
        par2 = false;
        rand = false;
        count = 0;
        while (!(hmcr && par && par1 && par2 && rand)) {
          if (count++ > 100) {
            expect(count).toBeLessThan(100);
            break;
          }
          harmony = search.getNextHarmony();
          _ref = harmony.creationAnnotations;
          for (i in _ref) {
            annotation = _ref[i];
            note = harmony.notes[i];
            expect(notes).toContain(note);
            if (annotation.random) {
              rand = true;
            }
            if (annotation.fromMemory) {
              if (annotation.pitchAdjusted) {
                index = annotation.oldNoteIndex + annotation.adjustment;
                if (index > 4) {
                  par1 = true;
                  index = 0;
                }
                if (index < 0) {
                  par2 = true;
                  index = 4;
                }
                expect(note).toEqual(search.options.notes[index]);
                par = true;
              } else {
                expect(note).toEqual(search.harmonyMemory[annotation.memoryIndex].notes[i]);
                hmcr = true;
              }
            }
          }
          true;
        }
        return true;
      });
    });
  });
}).call(this);
