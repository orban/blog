--- 
title: Neat Algorithms - Harmony Search
date: 12/03/2011

Here I'll try and demonstrate a neat optimization algorithm based on the principles of performing jazz musicians. 

Harmony Search (often abbreviated HS) is a [metaheuristic optimization](http://en.wikipedia.org/wiki/Metaheuristic) algorithm. Such algorithms use some sort of strategy to find the optimal input to a problem which minimizes or maximizes some measure of quality. Other metaheuristic algorithms include random search, simulated annealing, genetic algorithms, and tabu search. 

See the algorithm in action:
<div id="searchVis"></div>

# Heuristics and Fitness

Harmony search as well as the above mentioned algorithms are useful for solving a very wide class of problems. Below we'll apply it to one problem in particular, but first lets examine the role of a metaheuristic algorithm.

The central idea is that when trying to solve some given optimization problem, you have some set of input variables that can be evaluated for their quality, and you want to know what inputs produce the best quality. Metaheuristic algorithms try to find this global optimum using some strategy which is better than brute force. For problems where it is hard to decipher why changing an input changes the quality (and thus the optimal solution isn't very obvious), these algorithms are extremely useful. Harmony search and its siblings in this category do not guarantee that the globally optimal solution will be found, but often they do find it, and they are often much more efficient than an exhaustive brute force search of all input combinations.

## A Basic Example

Say I have a killer exam tomorrow, and I have function which represents what mark I'll get depending on how much time I spend studying and how much time I spend sleeping. The problem is I get burned out if I study too much, but I won't pass if I don't study enough. I'll be groggy during the exam I sleep too much, or be slow and weary if I don't sleep enough. How do I balance the time before the exam appropriately? 

<figure class="big">
  <figcaption>The problem space shown as a heat map.</figcaption>
  <div id="sleepMap"></div>
</figure>

To the left is a heat map showing where the best marks are earned. You'll find the hours spent studying on the X axis and the hours spent sleeping on the Y axis, and the mark achieved encoded in the color at that point on the map. A white color represents 100%, and a black color represents a failing grade. You can see that around the edges of the map the colors are darker, indicating a worse mark. There also appears to be a hotspot right in the middle at about 5 hours spent studying and 8 hours spent sleeping. This is easy for us to see because the data is laid out in such a way we can see the whole problem space at once, and see the exact range of marks earned just by looking at the colors. Us humans can identify a pattern of increasing marks by watching the colors get closer to white as the inputs approach that sweet spot.

The task of an optimization algorithm is to do exactly what we do with our eyes on the heat map, but for non differentiable functions, and for functions for which few assumptions can be made. Also note that the exam example is a tad silly, because every input combination is represented in that heat map, so we could write a brute force program to just try them all and find the max pretty easily and quickly. To make it even worse, the source code for the relatively simple quality function is also in this page, so we could apply some first year calculus to find the global optimum just by fidgeting with the function and its derivatives. For computationally complex functions of many more variables, or non differentiable functions, the brute force and calculus approaches are rarely feasible, and we are left to find a better strategy to find an optimal solution.

# Enter Harmony Search

Harmony search is one such strategy for finding an optimal set of inputs to an often complicated quality function. It works by imitating the activity of musicians while improvising. The choice of which note to play next while playing as part of a trio or quartet is something which takes years to learn to do effectively, because its hard to know what notes your accompaniment might play, and its hard to know what notes might sound good or great in tandem with the others. Musicians can be seen as trying to play some set of notes simultaneously to produce a _fantastic harmony_, although this is a somewhat naive take on the whole thing, so don't let me ruin the magic for you.

Each musician in the ensemble is often faced with the problem of picking the next note. To do so they can reference their knowledge of the notes in the key they are playing in (what notes sound good in the context of the song), as well as the notes they've played previously (what notes sound good in the recent context). The notes they played recently most likely sounded alright, so often these are a good choice. Also, it can be wise to pick a particular note that the audience might expect and adjust the pitch of it away from the expected note to create an artistic effect and a new, potentially better, harmony.

These decisions that said bland hypothetical musician makes correspond exactly to how harmony search works. Harmony search seeks an optimal combination of inputs, just as a musician seeks a fantastic harmony. Harmony search generates "harmonies" of inputs which it then evaluates for quality, and iterates this process until it finds the best one possible. The quality of a musical harmony is analogous to the quality of a particular solution, so you might say that harmony search is trying to achieve a _fantastic_ combination of inputs, or that musicians are trying to _optimize_ the note selection problem using their own metaheuristics.

Each input to the problem is seen as a different instrument in an ensemble, each potential note one of those instruments could play corresponds to each potential value on of the inputs of the function might adopt. The musical harmony of notes is modeled as a programmatic harmony of values. We evaluate the former's quality using our ears, and the latter's using a quality function describing the problem.

## Improvising New Solutions

Harmony search continues to use the musician metaphor to iteratively improve its solution. Each search iteration of the algorithm generates a new harmony to evaluate for quality. Using the note selection strategies mentioned previously, notes for each instrument, or values for each input, are selected. These inputs are fed to the quality function to determine the harmony's quality. The notes are selected for each instrument by either randomly selecting a note from the range of playable notes, selecting a note from the set of recently played ones, and/or occasionally adjusting the pitch of a note up or down.

## Getting better

Each iteration a new harmony is generated, its quality is calculated, and if it makes the cut it's "included" in the musician's memory. This way, iteration by iteration, old, poor quality harmonies are kicked out and replaced by better ones. The average quality of the set of harmonies in this memory as a whole gradually increases as these new harmonies replace poor ones. The brilliance of the algorithm comes from this: the new harmonies that are generated, which if you recall often reference notes from the memory, start to use notes belonging to known high-quality harmonies. Thus, the newly generated harmonies use good notes, and often have higher qualities because of it. This process repeats, where the increasing the quality of individual harmonies generated increases the average quality of the memory, which increases the quality of the individual generated harmonies, and so on and so forth. At some point (it is hoped), the algorithm generates a harmony which meets the "fantastic" quality hoped for.


Thats it! Harmony search isn't too complicated, but its a neat algorithm inspired by some everyday natural phenomena. Read on for the code and an example application. 

# The Code

First, lets more formally define some terms.

 + __Instrument__: One of the inputs to the quality function.
 + __Note__: One of the possible values of an input.
 + __Harmony__: A combination of each instrument playing a particular note, or in reality the set of chosen inputs for each argumentto the quality function.
 + __Quality__: A quantitative measure of a harmony's desirability, how close or far it is from the _fantastic_ harmony, or optimal solution.
 + __Harmony Memory__: The collection of good harmonies, stored in memory for examination by the harmony generation algorithm.
 + __Harmony Memory Consideration__: The process of generating a new harmony using random notes from the harmony memory.
 + __Pitch Adjustment__: The process of moving a particular instrument's note up or down

Lets have a look at the core of the algorithm.

    :::coffeescript
    class HarmonySearch
      @defaults:
        maxTries: 100
        targetQuality: Infinity
        harmonyMemorySize: false
        harmonyMemoryConsiderationRate: .95
        pitchAdjustmentRate: .1
        instruments: 10
        notes: [1,2,3,4,5,6,7,8,9]
        harmonyMemorySize: 10

      constructor: (options) ->
        @options = _.extend {}, HarmonySearch.defaults, options

      search: (callback) ->
        # Initialize harmony memory
        @running = true
        @harmonyMemory = for i in [1..@options.harmonyMemorySize]
          this.getRandomHarmony()

        # Initialize tracker variables for the loop
        @tries = 0
        [worstQuality, worstIndex] = this._getWorst()
        [bestQuality, bestIndex] = this._getBest()

        # Iterate over the search until either the target quality is hit,
        # or the max iterations condition is passed.
        while true
          # Increment tries counter each loop
          @tries++

          # Check end condition
          if @tries > @options.maxTries || bestQuality >= @options.targetQuality
            # We either found it or exhausted the alloted time
            break

          # Otherwise, generate another harmony
          harmony = this.getNextHarmony()
          if harmony.quality() > worstQuality
            # Better than worst harmony. Add this harmony to the memory and delete the worst.
            @harmonyMemory.push(harmony)
            @harmonyMemory.splice(worstIndex, 1) # Javascript for Array#delete

            # Update the worst quality for the next loop iteration
            [worstQuality, worstIndex] = this._getWorst()
            
            # Track the best quality to see if we've met the target quality
            if harmony.quality() > bestQuality
              bestQuality = harmony.quality()
 
        [bestQuality, bestIndex] = this._getBest()
        return @harmonyMemory[bestIndex]

<img src="/images/working.gif" id="status" style="display:none;">
<script type="text/javascript">
  var Harry = {};
</script>

<script src="/js/jquery.hive.js" type="text/javascript"></script>
<script src="/js/underscore.js" type="text/javascript"></script>
<script src="/js/protovis-d3.2.js" type="text/javascript"></script>
<script src="/js/harmonics/harmony.js" type="text/javascript"></script>
<script src="/js/harmonics/harmony_search.js" type="text/javascript"></script>
<script src="/js/harmonics/sudoku_puzzle.js" type="text/javascript"></script>
<script src="/js/harmonics/sudoku_harmony.js" type="text/javascript"></script>
<script src="/js/harmonics/sudoku_visualization.js" type="text/javascript"></script>
<script src="/js/harmonics/sudoku.js" type="text/javascript"></script>
<link href='/css/harmonics.css' rel='stylesheet' type='text/css' /> 
