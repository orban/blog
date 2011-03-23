#puzzle = "..4.5..161....4.83.8..3..59..16.2...8...9....2.9..........8.....3.9........5.1..."
#puzzle = "164....79....3......9...6.53...2...1......432....6.....96.53.....7..4........9.5."
puzzle = ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7."
#puzzle = "8.1537429743.92865952684371.85241793329876154174.59682217465938.36918247498723516"
class Harry.SudokuVisualizer
  @defaults:
    width: 500
    height: 500
    thickness: 70
    edgeOffset: 20
    thicknessScale: 30
    targetQuality: 135
    id: false
    maxExtraRows: 0

  constructor: (options)->
    # Set up options
    @options = _.extend({}, SudokuVisualizer.defaults, options)
    # Storage for harmonies on display and rows visible
    @harmonies = []
    @rows = 0
    # Set up elements
    @div = $("##{@options.id}").addClass("sudoku_vis")
    visId = @options.id + "_vis"
    @div.append("<div id=\"#{visId}\" class=\"wheel\"></div>")

    # Set up Protovis wedge
    inner = @options.width/2 - @options.thickness - @options.edgeOffset
    minimum = @options.thickness - @options.thicknessScale
    @options.colorScale = pv.Scale.linear(@options.targetQuality/2, @options.targetQuality).range('white', 'red')
    
    @vis = new pv.Panel()
        .width(@options.width)
        .height(@options.height)
        .canvas(visId)

    @vis.add(pv.Wedge)
        .data(=> @harmonies)
        .left(@options.width/2)
        .bottom(@options.height/2)
        .innerRadius(inner)
        .outerRadius((d) =>
          return inner + @options.thickness if !@best? || d.violations() == 0
          size = @options.thicknessScale * (@best.violations() / d.violations())
          return inner + minimum + size
        )
        .angle((d) => -2 * Math.PI / @harmonies.length)
        .fillStyle((d) =>
          if d.quality() == @options.targetQuality
            "green"
          else
            @options.colorScale(d.quality())
        )
        .event("click", (x) => this.showSolution(x))
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
    @worst ?= harmony
    if @best.quality() < harmony.quality()
      @best = harmony
      this.showSolution(harmony)

    if @worst.quality() > harmony.quality()
      @worst = harmony

  stop: =>
    @search.options.run = false

  start: ->
    @puzzle = new Harry.SudokuPuzzle(puzzle)
    @search = new Harry.HarmonySearch
      # Configure search for sudoku
      maxTries: 1000000
      targetQuality: 135
      harmonyMemoryConsiderationRate: .7
      pitchAdjustmentRate: .1
      notesGlobal: false
      notes: @puzzle.possibilities()
      harmonyMemorySize: 20
      harmonyClass: @puzzle.harmonyClass()
      instruments: @puzzle.unsolvedCount

      # Configure callbacks
      afterInit: (options) =>
      afterInitMemory: (harmonies, search) =>
        this.addHarmony(harmony) for harmony in harmonies
      afterNew: (harmony, search) =>
        this.addHarmony(harmony)
      afterMilestone: (attrs) =>
        @info.html("Try #{attrs.tries}. 
                    Best: #{attrs.best.quality()},
                    Worst: #{attrs.worst.quality()}.")

    @options.maxRows = @search.options.harmonyMemorySize
    # Start search
    @search.search((results) -> true)
    
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
