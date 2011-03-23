#puzzle = "..4.5..161....4.83.8..3..59..16.2...8...9....2.9..........8.....3.9........5.1..."
#puzzle = "164....79....3......9...6.53...2...1......432....6.....96.53.....7..4........9.5."
puzzle = ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7."
#puzzle = "8...37429743.92865952684371.85241793329876154174.59682217465938.36918247498723516"
class Harry.SudokuVisualizer
  @defaults:
    width: 500
    height: 500
    thickness: 70
    edgeOffset: 10
    thicknessScale: 30
    targetQuality: 135
    id: false
    maxExtraRows: 0
    startOnInit: true

  constructor: (options)->
    # Set up options
    @options = _.extend({}, SudokuVisualizer.defaults, options)

    # Set up elements
    @div = $("##{@options.id}").addClass("sudoku_vis")
    @visId = @options.id + "_vis"
    @div.append("<div id=\"#{@visId}\" class=\"wheel\"></div>")

    @game = $("<div class=\"game\"></div>").appendTo(@div)
    @info = $("<div class=\"info\"></div>").appendTo(@div)

    @startstop = $('<button class="awesome">Stop</button>').appendTo(@div).click =>
      if @running
        this.stop()
        @startstop.html("Start")
      else
        this.start()
        @startstop.html("Stop")

    startVis = () =>
      # Storage for harmonies on display and rows visible
      if @running?
        if Modernizr.webworkers
          @hive.terminate()
        else
          @search.stop()
        delete @best
        delete @bestViolations

      @harmonies = []
      @rows = 0
      this._initializeSearch()
      this._initializeMemoryVisualization()
      this.start() if @options.startOnInit

    @reset = $('<button class="awesome">Reset</button>').appendTo(@div).click ->
     startVis()
   
    startVis()

  addHarmony: (harmony) ->
    @creationAnnotation = harmony.creationAnnotation
    @harmonies.push harmony

    # Unseat the worst of the bunch to be replaced by this one
    if @rows > @options.maxRows
      minIndex = 0
      minQuality = @harmonies[0].quality
      for i, harmony of @harmonies
        if harmony.quality < minQuality
          minQuality = harmony.quality
          minIndex = i
      @harmonies.splice(minIndex, 1)
    else
      @rows++

    # Track the best harmonies quality wise and violations wise
    @best ?= harmony
    @bestViolations ?= harmony

    if @best.quality < harmony.quality
      @best = harmony
      this.showSolution(harmony)
    if @bestViolations.violations() > harmony.violations()
      @bestViolations = harmony
      
    @vis.render()

  stop: ->
    if Modernizr.webworkers
      @hive.send
        type: "stop"
    else
      @search.stop()
    @running = false
    true
  start: ->
    if Modernizr.webworkers
      @hive.send
        type: "start"
    else
      @search.search()
    @running = true
    true

  showSolution: (harmony) ->
    @showing = harmony
    @game.html(harmony.showGame())
    @vis.render()
  showInfo: (attrs) ->
    @info.html("Try #{attrs.tries}.
            Best: #{attrs.best.quality},
            Worst: #{attrs.worst.quality}.")

  _initializeSearch: ->
    # Set up search
    @puzzle = new Harry.SudokuPuzzle(puzzle)
    options =
      # Configure search for sudoku
      maxTries: 1000000
      targetQuality: 135
      harmonyMemoryConsiderationRate: .7
      pitchAdjustmentRate: .1
      notesGlobal: false
      notes: @puzzle.possibilities
      harmonyMemorySize: 20
      instruments: @puzzle.unsolvedCount
    @harmonyClass = @puzzle.harmonyClass()
    @options.maxRows = options.harmonyMemorySize
    if Modernizr.webworkers
      getHarmony = (data) =>
        harmony = new @harmonyClass(_.zip(data.notes, data.noteIndicies))
        harmony.quality = data.wire_quality
        harmony

      jQuery.Hive.create
        worker: '/js/harmonics/sudoku_worker.js'
        created: (hive) =>
          @hive = hive[0]
          @hive.send
            type: "init"
            options: _.extend(options,
              maxTries: 100000000
              puzzle: puzzle
              iterationMilestone: 1000
              popStack: 500
            )
        receive: (data) =>
          switch data.type
            when "init"
              true
            when "add_harmony", "init_harmony"
              harmony = getHarmony(data.harmony)
              this.addHarmony(harmony)
            when "milestone"
              attrs = data.attrs
              attrs.best = getHarmony(attrs.best)
              attrs.worst = getHarmony(attrs.worst)
              this.showInfo(data.attrs)
            when "console", "message"
              console.log(data)
            else
              console.error "Unrecognized message!"
              console.log(data)
    else
      @search = new Harry.HarmonySearch _.extend(options,
        harmonyClass: harmonyClass
        # Configure callbacks
        afterInit: (options) =>
        afterInitMemory: (harmonies, search) =>
          this.addHarmony(harmony) for harmony in harmonies
        afterNew: (harmony, search) =>
          this.addHarmony(harmony)
        afterMilestone: (attrs) =>
          this.showInfo(attrs)
        )

  _initializeMemoryVisualization: ->
    # Set up Protovis wedge display
    inner = @options.width/2 - @options.thickness - @options.edgeOffset
    minimum = @options.thickness - @options.thicknessScale
    @options.colorScale = pv.Scale.linear(@options.targetQuality/2, @options.targetQuality).range('white', 'red')

    @vis = new pv.Panel()
      .width(@options.width)
      .height(@options.height)
      .canvas(@visId)
    
    # Ring of wedges showing harmony memory
    @vis.add(pv.Wedge)
      .data(=> @harmonies)
      .left(@options.width/2)
      .bottom(@options.height/2)
      .innerRadius(inner)
      # Grow each wedge inversely proportional to the violations
      .outerRadius((d) =>
        return inner + @options.thickness if !@bestViolations? || d.violations() == 0
        size = @options.thicknessScale * (@bestViolations.violations() / d.violations())
        return inner + minimum + size
      )
      # Every wedge has the same angle
      .angle((d) => -2 * Math.PI / @harmonies.length)
      # Make the wedges get progressively more red as they grow in quality
      .fillStyle((d) =>
        if d.quality == @options.targetQuality
          "#A0FF8C"
        else
          @options.colorScale(d.quality)
      )
      # Highlight the best wedges
      .strokeStyle((d) =>
        if @best? and d.quality == @best.quality
          "green"
        else
          "white"
      )
      .lineWidth((d) =>
        if @best? and d.quality == @best.quality
          2
        else
          1
      )
      # Show a harmony's game when clicked
      .event("click", (x) => this.showSolution(x))
    .anchor("center").add(pv.Label)
      .font("8pt Droid Sans")
      .textAngle(0)
      .text((d) -> d.quality)
    
    # Wedge which points to solution, showing which one is currently displayed.
    @vis.add(pv.Wedge)
      .data(=> @harmonies)
      .left(@options.width/2)
      .bottom(@options.height/2)
      .outerRadius(inner-1)
      .innerRadius((d) =>
        if @showing? and d == @showing
          0
        else
          inner-1
      )
      .angle((d) => -2 * Math.PI / @harmonies.length)
      .fillStyle("#CCC")

  _renderCreationVisualization: () ->
    
