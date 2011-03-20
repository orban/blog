#puzzle = "..4.5..161....4.83.8..3..59..16.2...8...9....2.9..........8.....3.9........5.1..."
#puzzle = "164....79....3......9...6.53...2...1......432....6.....96.53.....7..4........9.5."
puzzle = ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7."
class Harry.SudokuVisualizer
  @defaults:
    width: 500
    height: 500
    thickness: 70
    edgeOffset: 10
    thicknessScale: 20
    id: false
    maxExtraRows: 0
    colorScale: pv.Scale.linear(0, 125).range('white', 'red')

  constructor: (options)->
    @options = _.extend({}, SudokuVisualizer.defaults, options)
    @harmonies = []
    @rows = 0
    @table = $('table#searchResults')
    @image = $("img#status")
    @div = $("##{@options.id}").addClass("sudoku_vis")
    visId = @options.id + "_vis"
    @div.append("<div id=\"#{visId}\" class=\"wheel\"></div>")
    me = this
    @vis = new pv.Panel()
        .width(@options.width)
        .height(@options.height)
        .canvas(visId)

    @vis.add(pv.Wedge)
        .data(=> @harmonies)
        .left(@options.width/2)
        .bottom(@options.height/2)
        .innerRadius(@options.width/2-@options.thickness-@options.edgeOffset)
        .outerRadius((d) => @options.width/2-@options.edgeOffset-@options.thicknessScale+(d.quality()/125*@options.thicknessScale))
        .angle((d) => -2 * Math.PI / @harmonies.length)
        .fillStyle((d) => @options.colorScale(d.quality()))
        .event("mouseover", (x) => this.showSolution(x))
      .anchor("center").add(pv.Label)
        .textAngle(0)
        .text((d) -> d.quality())
     
    @game = $("<div class=\"game\"></div>").appendTo(@div)
    @info = $("<div class=\"info\"></div>").appendTo(@div)
    @button = $("<button>Stop</button>").click(this.stop).appendTo(@div)
    
    this.start()
  
  addHarmony: (harmony) ->
    @creationAnnotation = harmony.creationAnnotation
    @harmonies.push harmony

    if @rows > @options.maxRows
      minIndex = 0
      minQuality = @harmonies[0].quality()
      for i, harmony of @harmonies
        if harmony.quality() < minQuality
          minQuality = harmony.quality()
          minIndex = i
      @harmonies.splice(minIndex, 1)
    else
      @rows++
       
    @vis.render()
    @best ?= harmony
    if @best.quality() < harmony.quality()
      @best = harmony
      this.showSolution(harmony)

  stop: =>
    @search.options.run = false

  start: ->
    sudokuDefaults =
      maxTries: 1000000
      targetQuality: 135
      harmonyMemoryConsiderationRate: .7
      pitchAdjustmentRate: .1
      instruments: 9*9
      notes: i for i in [1..9]
      harmonyMemorySize: 50

      afterInit: (options) =>

      afterInitMemory: (harmonies, search) =>
        this.addHarmony(harmony) for harmony in harmonies
      afterNew: (harmony, search) =>
        this.addHarmony(harmony)
      afterMilestone: (attrs) =>
        @info.html("Try #{attrs.tries}. Best: #{attrs.best.quality()}, Worst: #{attrs.worst.quality()}. HMCRS: #{attrs.hmcrs}, PARS: #{attrs.pars}, RANDS: #{attrs.rands}. HMCRS/TOT: #{attrs.hmcrs/attrs.notes}, RANDS/TOT: #{attrs.rands/attrs.notes}, PARS/HMCRS: #{attrs.pars/attrs.hmcrs}")

    options = _.extend(sudokuDefaults, {})
    klass = Harry.SudokuHarmony.classForPuzzle(puzzle)
    options.harmonyClass = klass
    options.instruments = klass.unsolvedCount
    @options.maxRows = options.harmonyMemorySize + @options.maxExtraRows
    @search = new Harry.HarmonySearch(options)
    @search.search((results) ->)
    
  showSolution: (harmony) ->
    @game.html(harmony.showGame())

    #$.Hive.create
      #worker: '/js/harmonics/sudoku_search.js'
      #created: (hive) =>
        #@hive = hive[0]
        #@hive.send
          #options:
            #puzzle: puzzle
      #receive: (data) =>
        #switch data.type
          #when "init"
            #true
          #when "harmony", "init_harmony"
            #this.addHarmony(data.harmony)
          #when "done"
            #@image.hide()
          #when "console", "message"
            #console.log(data)
          #else
            #console.error "Unrecognized message!"
