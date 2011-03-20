this.Harry = {}
importScripts("/js/jquery.hive.pollen.js", "/js/underscore.js", "/js/harmonics/harmony.js", "/js/harmonics/harmony_search.js", "/js/harmonics/sudoku_harmony.js")

$ (data) ->
  $.send
    type: "message"
    message: "Starting."

  sudokuDefaults =
    maxTries: 1000000
    targetQuality: 135
    harmonyMemoryConsiderationRate: .7
    pitchAdjustmentRate: .1
    instruments: 9*9
    notes: i for i in [1..9]
    harmonyMemorySize: 50

    afterInit: (options) ->
      $.send
        type: "init"
        options: options

    afterInitMemory: (harmonies, search) ->
      for harmony in harmonies
        $.send
          type: "init_harmony"
          harmony: harmony

    afterNew: (harmony, search) ->
      $.send
        type: "harmony"
        harmony: harmony

  options = _.extend(sudokuDefaults, data.options)
  klass = Harry.SudokuHarmony.classForPuzzle(data.options.puzzle)
  options.harmonyClass = klass
  options.instruments = klass.unsolvedCount
  $.send
    type: "message"
    options: options
  SudokuSearch = new Harry.HarmonySearch(options)
  searchResults = SudokuSearch.search()
  searchResults.type = "done"
  $.send searchResults

