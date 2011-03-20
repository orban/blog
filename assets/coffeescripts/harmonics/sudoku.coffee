notesRow = _.template("
<tr>
  <td><b><%= _quality %></b></td>
  <% _.each(notes, function(note) { %>
  <td><%= note %></td>
  <% }); %>
</tr>")

puzzle = "..4.5..161....4.83.8..3..59..16.2...8...9....2.9..........8.....3.9........5.1..."

class SudokuVisualizer
  @defaults:
    width: 500
    height: 500
    thickness: 70
    edgeOffset: 10
    thicknessScale: 20
    id: false
    maxRows: 60
    colorScale: pv.Scale.linear(0, 125).range('white', 'red')

  constructor: (options)->
    @options = _.extend({}, SudokuVisualizer.defaults, options)
    @harmonies = []
    @rows = 0
    @table = $('table#searchResults')
    @image = $("img#status")

    @vis = new pv.Panel()
        .width(@options.width)
        .height(@options.height)
        .canvas(@options.id)

    @vis.add(pv.Wedge)
        .data(=> @harmonies)
        .left(@options.width/2)
        .bottom(@options.height/2)
        .innerRadius(@options.width/2-@options.thickness-@options.edgeOffset)
        .outerRadius((d) => @options.width/2-@options.edgeOffset-@options.thicknessScale+(d.quality/125*@options.thicknessScale))
        .angle((d) => -2 * Math.PI / @harmonies.length)
        .fillStyle((d) => @options.colorScale(d.quality))
      .anchor("center").add(pv.Label)
        .textAngle(0)
        .text((d) -> d.quality)
     
    this.start()
  
  addHarmony: (harmony) ->
    @creationAnnotation = harmony.creationAnnotation
    @harmonies.push
      quality: harmony._quality
      notes: harmony.notes

    #@table.append notesRow(harmony)
    if @rows > @options.maxRows
      #$("tr:first", @table).remove()
      minIndex = 0
      minQuality = @harmonies[0].quality
      for i, harmony of @harmonies
        if harmony.quality < minQuality
          minQuality = harmony.quality
          minIndex = i
      @harmonies.splice(minIndex, 1)
    else
      @rows++
       
    @vis.render()

  start: ->
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

    options = _.extend(sudokuDefaults, {})
    klass = Harry.SudokuHarmony.classForPuzzle(puzzle)
    options.harmonyClass = klass
    options.instruments = klass.unsolvedCount
    SudokuSearch = new Harry.HarmonySearch(options)
    SudokuSearch.search((results) ->)

new SudokuVisualizer
  id: 'searchVis'

#button = $("<button>Stop</button>").click(->
  #jQuery.Hive.get()
  #jQuery.Hive.destroy()
  #image.hide()
#).insertAfter(table)
#sudokuDefaults =
  #maxTries: 100
  #targetQuality: 135
  #harmonyMemoryConsiderationRate: .95
  #pitchAdjustmentRate: .1
  #instruments: 9*9
  #notes: i for i in [1..9]
  #harmonyMemorySize: 50

  ##afterInit: (options) ->
    ##$.send
      ##type: "init"
      ##options: options

  ##afterInitMemory: (harmonies, search) ->
    ##for harmony in harmonies
      ##$.send
        ##type: "init_harmony"
        ##harmony: harmony

  ##afterNew: (harmony, search) ->
    ##$.send
      ##type: "harmony"
      ##harmony: harmony

#options = _.extend(sudokuDefaults, {})
#klass = Harry.SudokuHarmony.classForPuzzle(puzzle)
#options.harmonyClass = klass
#options.instruments = klass.unsolvedCount
##$.send
  ##type: "message"
  ##options: options
#SudokuSearch = new Harry.HarmonySearch(options)
#searchResults = SudokuSearch.search()
#searchResults.type = "done"
#debugger
#$.send searchResults

