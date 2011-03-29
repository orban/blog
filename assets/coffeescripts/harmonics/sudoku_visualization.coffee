#puzzle = "..4.5..161....4.83.8..3..59..16.2...8...9....2.9..........8.....3.9........5.1..."
#puzzle = "164....79....3......9...6.53...2...1......432....6.....96.53.....7..4........9.5."
puzzle = ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7."
#puzzle = "8...37429743.9286..52..4371.8524.7933..87615..74.5968...7465938.369..2474987..516"
class Harry.SudokuVisualizer
  @computationModes:
    "light":
      workers: false
      timer: 150
      milestoneInterval: 10
      enabled: true

    "medium":
      workers: false
      timer: 40
      milestoneInterval: 60
      enabled: true

    "heavy":
      workers: false
      timer: 0
      milestoneInterval: 100
      enabled: true

    "poutine":
      workers: true
      milestoneInterval: 1000
      enabled: Modernizr.webworkers

  @defaults:
    width: 500
    height: 500
    thickness: 70
    edgeOffset: 10
    thicknessScale: 30
    targetQuality: 135
    id: false
    maxExtraRows: 0
    startOnInit: false
    computationMode: "light"

  constructor: (options)->
    # Set up options
    @options = _.extend({}, SudokuVisualizer.defaults, options)
    @options.computationMode = SudokuVisualizer.computationModes[@options.computationMode]
    # Set up elements
    @div = $("##{@options.id}").addClass("sudoku_vis")
    @visId = @options.id + "_vis"
    @vis2Id = @options.id + "_vis2"
    @controls = $("<div class=\"controls\"></div>").appendTo(@div)
    @info = $("<div class=\"info\"></div>").appendTo(@controls)
    @div.append("<div id=\"#{@visId}\" class=\"wheel\"></div>")
    @game = $("<div class=\"game\"></div>").appendTo(@div)
    @div.append("<div id=\"#{@vis2Id}\" class=\"create\"></div>")

    # Create startstop button which pauses or resumes computation
    @startstop = $("<button class=\"awesome\">#{if @options.startOnInit then "Pause" else "Start"}</button>").appendTo(@controls).click =>
      if @running
        this.stop()
        @startstop.html("Start")
      else
        this.start()
        @startstop.html("Pause")

    # Starts and restarts the vis
    restartVis = () =>
      # Storage for harmonies on display and rows visible
      if @running
        if @options.computationMode.webworkers
          @hive.terminate()
        else
          @search.stop()
        delete @best
        delete @bestViolations

      @harmonies = []
      @rows = 0
      this._initializeSearch()
      this._initializeMemoryVisualization()
      this._initializeCreationVisualization()

    # Create reset button
    @reset = $('<button class="awesome">Reset</button>').appendTo(@controls).click =>
     restartVis()
     this.start()

    # Create mode select button and register change event
    @controls.append("Computation Intensity: ")
    @modeSelect = $('<select class="mode"></select>')
    for name, mode of SudokuVisualizer.computationModes
      if mode.enabled
        @modeSelect.append("<option #{if name == @options.computationMode then "selected" else ""}>#{name}</option>")

    @modeSelect.appendTo(@controls).change (e) =>
      @options.computationMode = SudokuVisualizer.computationModes[@modeSelect.val()]
      restartVis()
      this.start() if @running

      true
    # Activity Indicator
    @activityIndicator = $('<img class="working" src="/images/working.gif">').hide().appendTo(@controls)

    restartVis()

    # Start the algo so the vis shows up, but stop it right after
    this.start()
    unless @options.startOnInit
      this.stop()

  # Callback for the search class to add a harmony to the vis
  addHarmony: (harmony) ->
    @harmonies.push harmony

    # Unseat the worst of the bunch to be replaced by this one
    if @rows > @options.maxRows
      minIndex = 0
      secondMinIndex = 0
      minQuality = @harmonies[0]._quality

      for i, harmony of @harmonies
        if harmony._quality <= minQuality
          secondMinIndex = minIndex
          minQuality = harmony._quality
          minIndex = i

      @harmonies.splice(minIndex, 1)
      @worst = @harmonies[secondMinIndex] # Track the worst harmony quality wise
    else
      @rows++

    # Track the best harmonies quality wise and violations wise
    @best ?= harmony
    @bestViolations ?= harmony

    if @best._quality < harmony._quality
      @best = harmony
      this.showSolution(harmony)

    if @bestViolations.violations() > harmony.violations()
      @bestViolations = harmony
    this.render()

    if @best._quality == @options.targetQuality
      this.finished()

  stop: ->
    if @options.computationMode.workers
      @hive.send
        type: "stop"
    else
      @search.stop()
    @running = false
    @activityIndicator.hide()
    true

  start: ->
    if @options.computationMode.workers
      @hive.send
        type: "start"
    else
      @search.search()
    @running = true
    @activityIndicator.show()
    true
  
  finished: ->
    this.stop()

  showSolution: (harmony, forceRender = false) ->
    @showing = harmony
    @game.html(harmony.showGame())
    this.render() if forceRender

  showInfo: (attrs) ->
    @info.html("Try #{attrs.tries}.
            Best: #{attrs.best._quality},
            Worst: #{attrs.worst._quality}.")

  render: () ->
    @vis.render()
    @vis2.render()

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
      harmonyMemorySize: 16
      instruments: @puzzle.unsolvedCount
      # Pull out the user selected values
      timer: @options.computationMode.timer || 0
      iterationMilestone: @options.computationMode.milestoneInterval

    @harmonyClass = @puzzle.harmonyClass()
    @options.maxRows = options.harmonyMemorySize

    # Set up the jQuery.Hive webworker messaging bus if supported
    if @options.computationMode.workers
      getHarmony = (data) =>
        harmony = new @harmonyClass(_.zip(data.notes, data.noteIndicies))
        harmony._quality = data.wire_quality
        harmony.creationAnnotations = data.creationAnnotations
        harmony

      jQuery.Hive.create
        worker: '/js/harmonics/sudoku_worker.js'
        created: (hive) =>
          @hive = hive[0]
          @hive.send
            type: "init"
            options: _.extend(options,
              maxTries: 100000000 # wooohoooo
              puzzle: puzzle # raw text that the worker parses into its own Harry.Puzzle
              iterationMilestone: 1000
              popStack: 500
            )
        receive: (data) =>
          switch data.type
            when "init"
              true
            when "add_harmony", "init_harmony"
              harmony = getHarmony(data.harmony) # Massage wire data
              this.addHarmony(harmony)
            when "milestone"
              attrs = data.attrs
              attrs.best = getHarmony(attrs.best) # Massage wire data
              attrs.worst = getHarmony(attrs.worst) # Massage wire data
              this.showInfo(data.attrs)
            when "console", "message"
              console.log(data)
            else
              console.error "Unrecognized message!"
              console.error(data)
    else
      # No webworker support, run the search in this thread with deferring of the iterations
      @search = new Harry.HarmonySearch _.extend(options,
        harmonyClass: @harmonyClass
        # Configure callbacks
        afterInit: (options) =>
        afterInitMemory: (harmonies, search) =>
          for harmony in harmonies
            harmony._quality = harmony.quality()
            this.addHarmony(harmony)
        afterNew: (harmony, search) =>
          harmony._quality = harmony.quality()
          this.addHarmony(harmony)
        afterMilestone: (attrs) =>
          this.showInfo(attrs)
        )

  _initializeMemoryVisualization: ->
    # Set up Protovis wedge display
    inner = @options.width/2 - @options.thickness - @options.edgeOffset
    minimum = @options.thickness - @options.thicknessScale
    @options.colorScale = pv.Scale.linear(2*@options.targetQuality/3, @options.targetQuality).range('white', 'purple')

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
        if d._quality == @options.targetQuality
          "#A0FF8C"
        else
          @options.colorScale(d._quality)
      )
      .strokeStyle("white")
      .lineWidth(1)
      # Show a harmony's game when clicked
      .event("click", (x) => this.showSolution(x, true))
    .anchor("center").add(pv.Label)
      .font("8pt Droid Sans")
      .textAngle(0)
      .text((d) -> d._quality)

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

    # Wedge which shows the current best and worst
    # Ring of wedges showing harmony memory
    @vis.add(pv.Wedge)
      .data(=> @harmonies)
      .left(@options.width/2)
      .bottom(@options.height/2)
      .angle((d) => -2 * Math.PI / @harmonies.length)
      .outerRadius(inner-1)
      .innerRadius((d) =>
        if (@best? and d._quality == @best._quality) or (@worst? and d._quality == @worst._quality)
          inner-5
        else
          inner-1
      )
      # Highlight the best wedges
      .fillStyle((d) =>
        if @best? and d._quality == @best._quality
          "green"
        else if @worst? and d._quality == @worst._quality
          "red"
        else
          "white"
      )

  _initializeCreationVisualization: () ->
    # Each row has a height
    rowHeight = 28
    # Each column has a width
    cellWidth = 12
    # The table is only so wide
    maxCols = 33
    
    # The rows start far enough down for the random selections at the top to fit
    randomsRowHeight = 20
    maxPossibilities = _(@puzzle.possibilities[0..maxCols]).chain().map((x) -> x.length).max().value()
    boxPadding = maxPossibilities * randomsRowHeight + 10
    rows = 14
    colorScale = pv.Scale.linear(0, rows-1).range("#000", "#666")

    @vis2 = new pv.Panel()
      .width(450)
      .height(500)
      .canvas(@vis2Id)

    # Add rows for each harmony in the memory
    row = @vis2.add(pv.Panel)
          .data(=> @harmonies.slice().reverse()[0..rows-1])
          .height(rowHeight - 3)
          .top(-> this.index * (rowHeight) + boxPadding)
          .strokeStyle("#CCC")
          .lineWidth(1)

    proto = new pv.Label()
      .top(6)
      .font("10pt Droid Sans")
      .textBaseline("top")
      .textStyle("#000")

    # Labels at the start of each row for the quality
    row.add(pv.Label)
      .extend(proto)
      .data((harmony) -> [harmony._quality])
      .left(0)
      .text((d) -> "#{d}:")

    # Labels in the row for the value of each note
    search = this
    textColorScale = pv.Scale.linear(0, rows).range("#000", "#AAA")
    row.add(pv.Label)
      .extend(proto)
      .data((harmony) -> harmony.notes[0..maxCols])
      .left(-> 30 + this.index * cellWidth)
      .font((d) ->
        extra = ""
        if x = search.harmonies[search.harmonies.length-1].creationAnnotations
          if x[this.index].fromMemory && x[this.index].memoryIndex == this.parent.index - 1
            extra = "bold "
        if this.parent.index == 0
          extra = "bold "
        "#{extra}10pt Droid Sans"
      ).textStyle((d) ->
        if x = search.harmonies[search.harmonies.length-1].creationAnnotations
          if x[this.index].fromMemory && x[this.index].memoryIndex == this.parent.index - 1
            return "#000"
        if this.parent.index == 0
          return "#000"
        return textColorScale(this.parent.index)
      )

    # Fixed labels at the top for the random lines to point to
    randoms = @vis2.add(pv.Panel)
      .data(@puzzle.possibilities[0..maxCols])
      .width(cellWidth)
      .height(maxPossibilities * randomsRowHeight)
      .top(0)
      .left(-> 30 + this.index * cellWidth)

    randoms.add(pv.Label)
      .data((possibilities) -> possibilities)
      .font((d) ->
        extra = ""
        if x = search.harmonies[search.harmonies.length-1].creationAnnotations
          if x[this.parent.index].random && x[this.parent.index].noteIndex == this.index
            extra = "bold "
        "#{extra}10pt Droid Sans"
      )
      .textStyle("#000")
      .left(0)
      .height(rowHeight)
      .bottom((d) -> this.index * randomsRowHeight)


    # Lines pointing from the first row's notes to the (pitch adjusted) notes they came from or the random one that was picked
    @vis2.add(pv.Panel)
      .data(=>
        if (x = @harmonies[@harmonies.length-1].creationAnnotations)
          x[0..33]
        else
          []
      )
      .left(-> 30 + this.index * cellWidth + 7)
      .add(pv.Wedge)
        .strokeStyle( (d) ->
          if d.fromMemory
            if d.pitchAdjusted
              "rgba(0,0,255,0.5)"
            else
              "rgba(0,0,0,0.5)"
          else
            "rgba(155,0,155,0.5)"
        )
        .outerRadius((d) ->
          if d.fromMemory
            d.memoryIndex * rowHeight + 14
          else
            d.noteIndex * randomsRowHeight + 16
        )
        .startAngle((d) ->
          unless d.fromMemory
            Math.PI/-2
          else
            Math.PI/2
        )
        .angle(0)
        .top((d) ->
          if d.fromMemory
            boxPadding + rowHeight - 8
          else
            boxPadding + 6
        )
