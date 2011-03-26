--- 
title: Neat Algorithms - Harmony Search
date: 12/03/2011

Here I'll try and demonstrate a neat optimization algorithm based on the principles of performing jazz musicians. 

Harmony Search (often abbreviated HS) is a [metaheuristic optimization](http://en.wikipedia.org/wiki/Metaheuristic) algorithm. Such algorithms use some sort of strategy to find the optimal input to a problem which minimizes or maximizes some measure of quality. Other metaheuristic algorithms include random search, simulated annealing, genetic algorithms, and tabu search. 

See the algorithm in action:
<div id="searchVis"></div>

# About this page

This page features interactive demos and code examples, all written in [Coffeescript](http://coffeescript.org/). If you haven't seen it before, it shouldn't be too hard to pick up, but visit that page if you want a quick primer on the syntax. The example code you see in the post is also a distilled, unoptimized, nuance-lacking version which gets rid of the boring stuff for your benefit, so don't make fun if it seems slow.

Also, the computationally intense demos have an intensity setting you can pick. Pick `poutine` mode only if you run Chrome or want to watch your browser get crushed. The first three settings defer to the UI thread often enough to stay responsive, but `poutine` mode uses WebWorkers to their fullest advantage and destroys FF3, FF4, and Opera on my machine faster than you can say "higgitus figgitus". `Poutine` mode is called as such because the browser gobbles up CPU power like I gobble up the aforementioned artery clogger at 3 AM on a Saturday night. Very quickly.

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

The task of an optimization algorithm is to do exactly what we do with our eyes on the heat map, but for non differentiable functions, and for functions for which few assumptions can be made. Also note that the exam example is a tad silly, because every input combination is represented in that heat map, so we could write a brute force program to just try them all and find the max pretty easily and quickly. To make it even worse, the source code for the relatively simple quality function is also in this page, so we could apply some first year calculus to find the global optimum just by fidgeting with the function and its derivatives. For computationally complex functions of many more variables, or non differentiable functions, the brute force and calculus approaches aren't feasible, and we are left to find a better strategy to find an optimal solution.

# Enter Harmony Search

Harmony search is one such strategy for finding an optimal set of inputs to an often complicated quality function. It works by imitating the activity of musicians while improvising. The choice of which note to play next while playing as part of a trio or quartet is something which takes years to learn to do effectively, because its hard to know what notes your accompaniment might play, and its hard to know what notes might sound good or great in tandem with the others. Musicians can be seen as trying to play some set of notes simultaneously to produce a _fantastic harmony_, although this is a somewhat naive take on the whole thing, so don't let me ruin the magic for you.

Each musician in the ensemble is often faced with the problem of picking the next note. To do so they can reference their knowledge of the notes in the key they are playing in (what notes sound good in the context of the song), as well as the notes they've played previously (what notes sound good in the recent context). The notes they played recently most likely sounded alright, so often these are a good choice. Also, it can be wise to pick a particular note that the audience might expect and adjust the pitch of it away from the expected note to create an artistic effect and a new, potentially better, harmony.

These decisions that said bland hypothetical musician makes correspond exactly to how harmony search works. Harmony search seeks an optimal combination of inputs, just as a musician seeks a fantastic harmony. Harmony search generates "harmonies" of inputs which it then evaluates for quality, and iterates this process until it finds the best one possible. The quality of a musical harmony is analogous to the quality of a particular solution, so you might say that harmony search is trying to achieve a _fantastic_ combination of inputs, or that musicians are trying to _optimize_ the note selection problem using their own heuristics.

Each input to the problem is seen as a different instrument in an ensemble, each potential note one of those instruments could play corresponds to each potential value on of the inputs of the function might adopt. The musical harmony of notes is modeled as a programmatic harmony of values. We evaluate the former's quality using our ears, and the latter's using a quality function describing the problem.

## Improvising New Solutions

Harmony search continues to use the musician metaphor to iteratively improve its solution. Each search iteration of the algorithm generates a new harmony to evaluate for quality. Using the note selection strategies mentioned previously, notes for each instrument, or values for each input, are selected. These inputs are fed to the quality function to determine the harmony's quality. The notes are selected for each instrument by either randomly selecting a note from the range of playable notes, selecting a note from the set of recently played ones, and/or occasionally adjusting the pitch of a note up or down.

## Getting better

Each iteration a new harmony is generated, its quality is calculated, and if it makes the cut it's "included" in the musician's memory. This way, iteration by iteration, old, poor quality harmonies are kicked out and replaced by better ones. The average quality of the set of harmonies in this memory as a whole gradually increases as these new harmonies replace poor ones. The brilliance of the algorithm comes from this: the new harmonies that are generated, which you may recall often reference notes from the memory, start to use notes belonging to known high-quality harmonies. Thus, the newly generated harmonies use good notes, and often have higher qualities because of it. This process repeats, where the increasing the quality of individual harmonies generated increases the average quality of the memory, which increases the quality of the individual generated harmonies, and so on and so forth. At some point (it is hoped), the algorithm generates a harmony which meets the "fantastic" quality hoped for.


Thats it! Harmony search isn't too complicated, but its a neat algorithm inspired by some everyday natural phenomena. Read on for the code and an example application. 

# The Code

First, lets more formally define some terms.

 + __Instrument__: One of the inputs to the quality function.
 + __Note__: One of the possible values of an input.
 + __Harmony__: A combination of each instrument playing a particular note, or in reality the set of chosen inputs for each argument to the quality function.
 + __Quality__: A quantitative measure of a harmony's desirability, how close or far it is from the _fantastic_ harmony, or optimal solution.
 + __Harmony Memory__: The collection of good harmonies, stored in memory for examination by the harmony generation algorithm.
 + __Harmony Memory Consideration__: The process of generating a new harmony using random notes from the harmony memory.
 + __Pitch Adjustment__: The process of moving a particular instrument's note up or down

## Pseudo code for the actual algorithm

 1. Initialize the Parameters for Problem and Algorithm. 
 2. Initialize the Harmony Memory (HM). 
 3. Improvise a New Harmony. 
 4. Update the Harmony Memory.
 5. Check the stopping criterion.

## The Parts

The algorithm, once applied to a problem, is composed of 3 main parts:

 1. __The harmony generator__, which spits out new, potentially good harmonies based on the contents of the harmony memory and the set of possible notes
 2. __The quality function__, which evaluates a particular harmony for its quality.
 3. __The search algorithm__, which moves harmonies in and out of the memory based on their quality.

I chose to encapsulate the generator and the search algorithm into a `HarmonySearch` class, and to make the whole thing reusable by making a `Harmony` class which in a particular problem would be extended to implement the quality function.

Next, we'll define the formal parameters for the algorithm:

 + __Harmony Memory Consideration Rate__ or HMCR: the probability that when generating a new harmony, a note from the harmony memory will be picked
 + __Pitch Adjustment Rate__ or PAR: the probability of randomly shifting a chosen note up or down

## The skeleton

Here's the skeleton for the `HarmonySearch` class:

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

Here's the basic, extendable `Harmony` class:

    :::coffeescript
    class Harmony
      # Pull out the note and index of the note from the chord, passed in
      # in the [[note_1, index_1], [note_2, index_2], ...] format
      constructor: (chord) ->
        @notes = []
        @noteIndicies = []
        for i, info of chord
          @notes[i] = info[0]
          @noteIndicies[i] = info[1]
     
      # Cache the quality calculation
      quality: ->
        @_quality ?= this.calculateQuality()
        @_quality

      calculateQuality: ->
        throw "Extend this class to define how a harmony's quality is evaluated"

Again, the above class manages the generic parts of the search, but requires a use to define a quality calculation which suits the problem at hand. Below we'll apply it to the exam mark problem mentioned above, and then a less trivial sudoku problem at the end.

## The Harmony Generator

This is the first component of the `HarmonySearch` class, responsible for spitting out new harmonies based upon those stored in the harmony memory.

    :::coffeescript
    class HarmonySearch
      # Generate a totally random harmony
      getRandomHarmony: ->
        chord = for i in [0..@options.instruments-1]
            index = Math.floor(Math.random() * @options.notesLength)
            [@options.notes[index], index]

        new @options.harmonyClass(chord)

      # Generate a new harmony based on the HMCR and the PAR
      getNextHarmony: ->
        chord = for i in [0..@options.instruments-1]

          if Math.random() < @options.harmonyMemoryConsiderationRate
            # Consider HM. Pick a random harmony, and sample the note at this position in the chord
            harmonyMemoryIndex = Math.floor(Math.random()*@options.harmonyMemorySize) 
            note = @harmonyMemory[harmonyMemoryIndex].notes[i] # Grab note for this instrument
            noteIndex = @harmonyMemory[harmonyMemoryIndex].noteIndicies[i]
            
            # Do pitch adjustment
            if Math.random() < @options.pitchAdjustmentRate
              # Adjust the pitch up or down one
              adjustment = if Math.random() > 0.5 then 1 else -1         
              noteIndex = (noteIndex + adjustment + @options.notesLength) % @options.notesLength
              note = @options.notes[noteIndex]

          else
            # Don't consider the HM. Pick a random note from all possible values.
            noteIndex = Math.floor(Math.random() * @options.notesLength)
            note = @options.notes[noteIndex]

          # Return chosen note for the chord
          [note, noteIndex]

        new @options.harmonyClass(chord)

Hopefully all this other, secondary stuff isn't too confusing, but if it is, the next section brings it all together and will hopefully make it all clear.

Also note that each `Harmony` class stores both an array of notes and an array of note indices, which seems a tad odd. This is because in the above code the pitch adjustment portion needs access to the original index of the note in the array of possible notes, so it can find the next or previous index to adjust to. Thats why the `Harmony` class constructor accepts the `[[note, index], [note2, index2], ...]` style arguments, and the above accumulator returns `[note, noteIndex]`, instead of just doing arrays of notes.

## The Core

Below is the core of the search algorithm, which actually executes the whole search process by generating new harmonies and moving them into the harmony memory if they are better than the current worst.

    :::coffeescript
    class HarmonySearch
      
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
          @tries++ # Increment tries counter each loop for end condition check

          # Check end condition
          if @tries > @options.maxTries || bestQuality >= @options.targetQuality
            break # We either found it or exhausted the alloted time

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

Thats about it! Feeling ok? Read on for a couple examples.

# Exam Mark Example

Consider the exam mark problem shown above. Suppose the mysterious exam mark equation has been implemented in a Javascript function called `Exam.mark(timeSleeping, timeStudying)`. 

    :::coffeescript
    $ Exam.mark
    # => function(timeSleeping, timeStudying) { ... }
    $ Exam.mark(0, 0)
    # => 30
    $ Exam.mark(10,10)
    # => 50

We're trying to find the global optimum to this equation. To model this in harmony search, we ask how many instruments there are, what notes each of them can play, and how to determine the quality of the harmony produced. 

In this case, the `Exam.mark` equation is the one we are trying to optimize, so we model its input arguments as notes, and use harmonies composed of different combinations in the algorithm. There are two instruments, one for each argument to the function, and each instrument can "play" any number between 0 and 10, which are the bounds as outlined in the problem. A harmony's quality is the mark achieved using it's two notes, so just the evaluation of the `Exam.mark` function.

The harmony class we'd use for this problem would look like this:

    :::coffeescript
    class ExamHarmony extends Harmony
      
      quality: -> Exam.mark[@notes[0], @notes[1]]

That's not so bad right?

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
