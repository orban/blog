window.Harry = {}
require "/js/underscore.js", "/js/protovis-d3.2.js", "/js/harmonics/harmony.js", "/js/harmonics/harmony_search.js", "/js/harmonics/sudoku_puzzle.js", "/js/harmonics/sudoku_harmony.js", "/js/harmonics/sudoku_visualization.js", ->
  
  solved = new Harry.SudokuPuzzle "164582379725936148839147625378425961651798432942361587296853714587614293413279856"
  almostSolved = new Harry.SudokuPuzzle "16458237972593614883914762537842596165179843294236158729685371458761429341327985." # missing is 6
  geem = new Harry.SudokuPuzzle "254316897763985124198427653981753246632849512547261938475692381316578492829134576"
  geem2 = new Harry.SudokuPuzzle "254316897763985124198427653981743246632859715547261938475692381319578462826134579"
  
  describe "possibilities finding", ->
    it "should find no possibilities for a solved game", ->
      expect(solved.possibilities()).toEqual([])
    
    it "should only find one possibility if there is only one", ->
      expect(almostSolved.possibilities()).toEqual([[6]])

  describe "sum scoring", ->
    it "should score a complete game properly", ->
      klass = solved.harmonyClass()
      expect(klass.unsolvedCount).toEqual(0)

      harmony = new klass([])
      expect(harmony.calculateQualitySum()).toEqual(135)

    it "should score an almost complete game properly", ->
      klass = almostSolved.harmonyClass()
      expect(klass.unsolvedCount).toEqual(1)

      harmony = new klass([[1,1]])
      expect(harmony.calculateQualitySum()).not.toEqual(135)

      harmony = new klass([[6,1]])
      expect(harmony.calculateQualitySum()).toEqual(135)

    it "should score with the same ability as Zeem", ->
      klass = geem.harmonyClass()
      harmony = new klass([])
      expect(harmony.calculateQualitySum()).toEqual(135-21)

      klass = geem2.harmonyClass()
      harmony = new klass([])
      expect(harmony.calculateQualitySum()).toEqual(135-2)

  describe "uniq scoring", ->
    it "should score a complete game properly", ->
      klass = solved.harmonyClass()
      expect(klass.unsolvedCount).toEqual(0)

      harmony = new klass([])
      expect(harmony.calculateQualityUniq()).toEqual(135)

    it "should score an almost complete game properly", ->
      klass = almostSolved.harmonyClass()
      expect(klass.unsolvedCount).toEqual(1)

      harmony = new klass([[1,1]])
      expect(harmony.calculateQualityUniq()).not.toEqual(135)

      harmony = new klass([[6,1]])
      expect(harmony.calculateQualityUniq()).toEqual(135)

  describe "searching", ->

  klass = false
  describe "visualizing games", ->
    beforeEach ->
      klass = almostSolved.harmonyClass()

    it "should render violations", ->
      wrong = new klass([[1,1]])
      expect(wrong.showGame()).toMatch("violated")

    it "should render correct blocks", ->
      right = new klass([[6,1]])
      expect(right.showGame()).toMatch("good")

      
   
  describe "searching", ->
    it "should properly generate new harmonies", ->
      notes = [1,2,3,4,5]

      search = new Harry.HarmonySearch
        notes: notes
        instruments: 4
        harmonyMemoryConsiderationRate: 0.5
        pitchAdjustmentRate: 0.5
        harmonyMemorySize: 2
        harmonyClass: Harry.Harmony

      search.harmonyMemory = [search.getRandomHarmony(), search.getRandomHarmony()]
      hmcr = false
      par = false
      par1 = false
      par2 = false
      rand = false
      count = 0
      until hmcr && par && par1 && par2 && rand
        if count++ > 100
          expect(count).toBeLessThan(100)
          break
        harmony = search.getNextHarmony()
        for i, annotation of harmony.creationAnnotations
          note = harmony.notes[i]
          expect(notes).toContain(note)

          if annotation.random
            rand = true

          if annotation.fromMemory
            if annotation.pitchAdjusted
              index = annotation.oldNoteIndex + annotation.adjustment
              if index > 4
                par1 = true
                index = 0
              if index < 0
                par2 = true
                index = 4
              expect(note).toEqual(search.options.notes[index])
              par = true
            else
              expect(note).toEqual(search.harmonyMemory[annotation.memoryIndex].notes[i])
              hmcr = true
        true
      true
