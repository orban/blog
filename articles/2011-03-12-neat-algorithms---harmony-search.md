--- 
title: Neat Algorithms - Harmony Search
date: 12/03/2011

Here I'll try and demonstrate a neat optimization algorithm based on the principles of performing jazz musicians. 

Harmony Search (often abbreviated HS) is a [metaheuristic optimization](http://en.wikipedia.org/wiki/Metaheuristic) algorithm. Such algorithms use some sort of strategy to find the optimal input to a problem which minimizes or maximizes some measure of quality. Other metaheuristic algorithms include random search, simulated annealing, genetic algorithms, and tabu search. 

# Heuristics and Fitness

Harmony search as well as the above mentioned algorithms are useful for solving a very wide class of problems. Below we'll apply it to one problem in particular, but first lets examine the role of a metaheuristic algorithm.

The central idea is that when trying to solve some given optimization problem, you have some set of input variables that can be evaluated for their quality. Metaheuristic algorithms try to find the exact set of inputs which give the highest quality solution possible. For problems where the quality of a potential solution is not obvious, these algorithms are extremely useful. Harmony search and its siblings in this category do not guarantee that the globally optimal solution will be found, but often they do find it, and they are often much more efficient than an exhaustive brute force search of all input combinations.

Lets look at an example. Say I have a killer exam tomorrow, and I have function which represents how well I'll do on a final exam tomorrow depending on how much time I spend studying and how much time I spend sleeping. The problem is I'll get burned out if I study too much, won't pass if I don't study enough, will be groggy if I sleep too much, or be weary if I don't sleep enough. How do I balance the time before the exam appropriately? 

<figure class="big">
  <div id="sleepMap"></div>
  <figcaption>The problem space</figcaption>
</figure>

See the algorithm in action:
<div id="searchVis"></div>
<table id="searchResults">
  <tr class="out">
    <th>Quality</th>
  </tr>
</table>
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
