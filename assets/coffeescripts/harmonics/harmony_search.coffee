class Harry.HarmonySearch
  @defaults:
    maxTries: 100
    targetQuality: Infinity
    harmonyMemorySize: false
    harmonyMemoryConsiderationRate: .95
    pitchAdjustmentRate: .1
    instruments: false
    notes: false
    harmonyClass: false
    harmonyMemorySize: 10
    afterInit: ->
    afterInitMemory: ->
    afterNew: ->
  
  constructor: (options) ->
    @options = _.extend {}, HarmonySearch.defaults, options
    @options.notesLength = @options.notes.length
    this.options.afterInit(@options, this)
    
  search: (callback) ->
    # Initialize harmony memory
    @harmonyMemory = for i in [0..@options.harmonyMemorySize]
      this.getRandomHarmony()

    [worstQuality, worstIndex] = this._getWorst()
    [bestQuality, bestIndex] = this._getBest()
    
    @options.afterInitMemory(@harmonyMemory, this)
    tries = 0
    ret = =>
       [bestQuality, bestIndex] = this._getBest()

      callback
        harmonies: @harmonyMemory
        bestQuality: bestQuality
        best: @harmonyMemory[bestIndex]
        worstQuality: worstQuality
        worst: @harmonyMemory[worstIndex]
        tries: tries

    # Iterate over the search until either the target quality is hit, 
    # or the max iterations condition is passed.
    iterate = ->
      ret() and return if tries > @options.maxTries
      ret() and return if bestQuality > @options.targetQuality
      harmony = this.getNextHarmony()
      if harmony.quality() > worstQuality
        # Better than worst harmony. Swap out.
        @harmonyMemory.push(harmony)
        @harmonyMemory.splice(worstIndex, 1)
        @options.afterNew(harmony, this)
        delete harmony.creationAnnotations
        if harmony.quality() > bestQuality
          bestQuality = harmony.quality()

        [worstQuality, worstIndex] = this._getWorst()
      tries++
      setTimeout(iterate, 0)
      true

    iterate()
    true

  # Get the quality and index of the worst harmony in the memory
  _getWorst: ->
    this._getComp(((a,b) -> a < b ), Infinity)

  _getBest: ->
    this._getComp(((a,b) -> a > b ), 0)
        
  # Generate a totally random harmony
  getRandomHarmony: ->
    chord = for i in [1..@options.instruments]
      index = Math.floor(Math.random() * @options.notesLength)
      [@options.notes[index], index]

    new @options.harmonyClass(chord)
    
  # Generate a new harmony based on the HMCR and the PAR
  getNextHarmony: ->
    creationAnnotations = []
    chord = for i in [1..@options.instruments]
      annotation = creationAnnotations[i-1] = {}
      if Math.random() < @options.harmonyMemoryConsiderationRate
        # Consider HM. Pick a random harmony, and sample the note at this position in the chord
        harmonyMemoryIndex = Math.floor(Math.random()*@options.harmonyMemorySize)
        note = @harmonyMemory[harmonyMemoryIndex].notes[i]
        noteIndex = @harmonyMemory[harmonyMemoryIndex].noteIndicies[i]
        annotation.fromMemory = true
        annotation.memoryIndex = harmonyMemoryIndex

        if Math.random() < @options.pitchAdjustmentRate
          # Adjust the pitch up or down one
          annotation.pitchAdjusted = true
          noteIndex += if Math.random() > 0.5 then 1 else -1
          note = @options.notes[(noteIndex+@options.notesLength)  % @options.notesLength]
      else
        # Don't consider the HM. Pick a random note from all possible values.
        noteIndex = Math.floor(Math.random()*@options.notesLength)
        note = @options.notes[noteIndex]
        annotation.random = true

      # Return chosen note for the chord
      [note, noteIndex]

    harmony = new @options.harmonyClass(chord)
    harmony.creationAnnotations = creationAnnotations
    harmony

  _getComp: (comp, start) ->
    quality = start
    index = -1
    for i, harmony of @harmonyMemory
      if comp(harmony.quality(), quality)
        quality = harmony.quality()
        index = i

    [quality, index]
