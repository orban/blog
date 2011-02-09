--- 
title: Neat Algorithms - Flocking
date: 03/02/2011

In this post I'll explain a neat and relatively well known algorithm that simulates a group of entities grouping together, illustrating something called "flocking". I think it's quite neat because the application of just a few simple governing rules to each entity results in a group which exhibits some collective intelligence, as well as complex and neat looking behaviour. The original flocking algorithm was developed by [Craig Reynolds][1] in [1986][2]. His page on flocking can be found [here][2].

Flocking algorithms have some really neat real world applications:

 * Computer animation. [Batman Returns (1992)][3] is widely quoted as having been nominated for an Oscar for its bat swarms which were procedurally generated using algorithms similar to these.
 * Social network simulation and modeling opinion flow. After choosing humans as the entities in the flock, the overall direction of the flock can be estimated using the rules that apply to the simple flock model, and people's future opinions can be predicted. See [Gamasutra][4]'s stupendous article on the subject.
 * Aerospace AI. By sending [UAV](http://en.wikipedia.org/wiki/Unmanned_aerial_vehicle)s on missions in flocks they are able to more effectively complete their missions and react to enemy events. See [one paper][5] and [another][6] on the subject.
 * Distributed systems analysis, search, and optimization. By modeling things like spacial data, network traffic, or solutions to an optimization problem as entities, the direction of the flock can be used to find [clusters][7], where to push traffic, or [optimal solutions](8).
 
 Here's the full algorithm in action:
<div class="flock" id="fullFlock"></div>
some other stuff
<script type="text/javascript">
  var Harry = {};
</script>

<script src="/js/processing.js" type="text/javascript"></script>
<script src="/js/flocking/vector.js" type="text/javascript"></script>
<script src="/js/flocking/boid.js" type="text/javascript"></script>
<script src="/js/flocking/flocking.js" type="text/javascript"></script>
<link href='/css/flocking.css' rel='stylesheet' type='text/css' /> 

[1]: http://www.red3d.com/cwr/index.html "Craig Reynold's personal site"
[2]: http://www.red3d.com/cwr/boids/ "Craig Reynold's site on Boids & Flocking"
[3]: http://www.imdb.com/title/tt0103776/awards "Batman Returns (1992) Awards list"
[4]: http://www.gamasutra.com/view/feature/1815/modeling_opinion_flow_in_humans_.php "Modeling opinion flow using Boid algorithms at Gamasutra"
[5]: http://ieeexplore.ieee.org/xpl/freeabs_all.jsp?arnumber=1470734 "Paper from the ACC in 2005 describing the performance of UAV flock missions"
[6]: http://ieeexplore.ieee.org/Xplore/login.jsp?url=http://ieeexplore.ieee.org/iel5/5351161/5356514/05356552.pdf%3Farnumber%3D5356552&authDecision=-203 "Paper from the ACC in 2005 describing the performance of UAV flock missions"
[7]: http://www.springerlink.com/content/c7t0fb6a54flkrw8/ "Paper on performant parallel spacial clustering from 2002"
[8]: http://www.engr.iupui.edu/~shi/pso.html "Page on particle swarm optimization with references."
