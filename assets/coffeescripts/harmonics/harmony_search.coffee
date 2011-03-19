class Harry.HarmonySearch
  @defaults:
    maxTries: 100
    targetQuality: 0
    endCondition: false
    harmonyMemorySize: false
    harmonyMemoryConsiderationRate: .95
    pitchAdjustmentRate: .1

  bestHarmony: false
  worstHarmony: false

  constructor: (options, harmonies) ->
    @harmonyMemory = harmonies
    @harmonyMemorySize = @harmonyMemory.length
    @options = jQuery.extend {}, HarmonySearch.defaults, options
    
  search: ->
    # Find best and worse index
    worstQuality = 0
    worstIndex = -1
    for index, harmony of @harmonyMemory
      if harmony.quality() < worstQuality()
        worstQuality = harmony.quality()
        worstIndex = index

    tries = 0
    while true
      break if tries > @options.maxTries
      break if bestHarmony.quality() < @options.targetQuality
      harmony = this.getNextHarmony()
      if harmony.quality() < harmonies[harmonyMemorySize-1].quality()
        # Better than worst harmony. Swap out
        true
        
    
