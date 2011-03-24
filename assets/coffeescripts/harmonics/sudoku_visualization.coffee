#puzzle = "..4.5..161....4.83.8..3..59..16.2...8...9....2.9..........8.....3.9........5.1..."
puzzle = "164....79....3......9...6.53...2...1......432....6.....96.53.....7..4........9.5."
#puzzle = ".5.3.6..7....85.24.9842.6.39.1..32.6.3.....1.5.726.9.84.5.9.38..1.57...28..1.4.7."
#puzzle = "8...37429743.9286..52..4371.8524.7933..87615..74.5968...7465938.369..2474987..516"
#Modernizr.webworkers = false
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
    @vis2Id = @options.id + "_vis2"
    @div.append("<div id=\"#{@visId}\" class=\"wheel\"></div>")
    @game = $("<div class=\"game\"></div>").appendTo(@div)
    @div.append("<div id=\"#{@vis2Id}\" class=\"create\"></div>")
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
      this._initializeCreationVisualization()
      this.start() if @options.startOnInit

    @reset = $('<button class="awesome">Reset</button>').appendTo(@div).click ->
     startVis()

    startVis()

  addHarmony: (harmony) ->
    @harmonies.push harmony

    # Unseat the worst of the bunch to be replaced by this one
    if @rows > @options.maxRows
      minIndex = 0
      minQuality = @harmonies[0]._quality
      for i, harmony of @harmonies
        if harmony._quality < minQuality
          minQuality = harmony._quality
          minIndex = i
      @harmonies.splice(minIndex, 1)
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
    @harmonyClass = @puzzle.harmonyClass()
    @options.maxRows = options.harmonyMemorySize

    # Set up the jQuery.Hive webworker messaging bus if supported
    if Modernizr.webworkers
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
        if d._quality == @options.targetQuality
          "#A0FF8C"
        else
          @options.colorScale(d._quality)
      )
      # Highlight the best wedges
      .strokeStyle((d) =>
        if @best? and d._quality == @best._quality
          "green"
        else
          "white"
      )
      .lineWidth((d) =>
        if @best? and d._quality == @best._quality
          2
        else
          1
      )
      # Show a harmony's game when clicked
      .event("click", (x) => this.showSolution(x))
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

  _initializeCreationVisualization: () ->
    rowHeight = 28
    cellWidth = 12
    boxPadding = 40
    rows = 16
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
      .font("10pt Droid Sans")
      .textBaseline("top")
      .textStyle("#000")
      .top(6)

    # Labels at the start of each row for the quality
    row.add(pv.Label)
      .extend(proto)
      .data((harmony) -> [harmony._quality])
      .left(0)
      .text((d) -> "#{d}:")
    
    # Labels in the row for the value of each note
    search = this
    row.add(pv.Label)
      .extend(proto)
      .data((harmony) -> harmony.notes[0..33])
      .left(-> 30 + this.index * cellWidth)
      .font((d) ->
        extra = ""
        if x = search.harmonies[search.harmonies.length-1].creationAnnotations
          if x[this.index].fromMemory && x[this.index].memoryIndex == this.parent.index - 1
            extra = "bold "
        if this.parent.index == 0
          extra = "bold "
        "#{extra}10pt Droid Sans"
      )

    # Fixed labels at the top for the random lines to point to
    @vis2.add(pv.Label)
      .extend(proto)
      .data(i for i in [1..9])
      .left(-> 80 + this.index*cellWidth*3)
      .top(4)
    
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
        .def("pointx", (d) -> 80 + (d.pick-1) * cellWidth * 3 - this.parent.left()+7)
        .def("pointy", (d) -> boxPadding+4-18)
        .strokeStyle( (d) ->
          if d.fromMemory
            if d.pitchAdjusted
              "rgba(0,0,255,0.5)"
            else
              "rgba(0,0,0,0.5)"
          else
            "rgba(0,255,0,0.5)"
        )
        .outerRadius((d) ->
          if d.fromMemory
            d.memoryIndex * rowHeight + 14
          else
            Math.sqrt(Math.pow(this.pointx(), 2) + Math.pow(this.pointy(), 2))
        )
        .startAngle((d) ->
          unless d.fromMemory
            angle = Math.atan(this.pointy()/this.pointx())
            if angle < 0
              angle += Math.PI
            -1 * angle
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
