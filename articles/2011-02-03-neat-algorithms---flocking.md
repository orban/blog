--- 
title: Neat Algorithms - Flocking
date: 03/02/2011

In this post I'll explain a neat and relatively well known algorithm that simulates a group of entities grouping together, illustrating something called "flocking". I think it's quite neat because the application of just a few simple governing rules to each entity results in a group which exhibits some collective intelligence, as well as complex and neat looking behaviour. The [original flocking algorithm][2] was developed by [Craig Reynolds][1] in 1986.

Flocking algorithms have some really neat real world applications:

 * Computer animation. [Batman Returns (1992)][3] is widely quoted as having been nominated for an Oscar for its bat swarms which were procedurally generated using algorithms similar to these.
 * Social network simulation and modeling opinion flow. After choosing humans as the entities in the flock, the overall direction of the flock can be estimated using the rules that apply to the simple flock model, and people's future opinions can be predicted. See [Gamasutra][4]'s stupendous article on the subject.
 * Aerospace engineering. By sending [UAV](http://en.wikipedia.org/wiki/Unmanned_aerial_vehicle)s on missions in flocks they are able to more effectively complete their missions and react to enemy events. See [one paper][5] and [another][6] on the subject.
 * Distributed systems analysis, search, and optimization. By modeling things like spacial data, network traffic, or solutions to an optimization problem as entities, the direction of the flock can be used to find [clusters][7], where to push traffic, or [optimal solutions](8).


## How it Works

Each entity on the map, which we'll now refer to as a "boid", is governed by a few simple rules. Each boid starts out at the center of the map with a random velocity, and for each frame of the simulation, a new velocity is calculated. The new velocity depends on the boid's current velocity, its neighbours' velocities, and its position relative to its neighbours. There are three components of the new velocity, which in combination simulate the full blown flocking behaviour.

### Cohesion

<div class="flock" id="cohesionDemo"></div>

Each boid "wants" to be in a flock with its neighbors, and the _cohesion_ component of the algorithm is mainly responsible for this. Each boid looks at the position of each other boid to see if it is within a specified `neighbour_radius`, that is, it checks to see which other boids are close enough to be considered flockmates. The positions of the qualifying neighbours are averaged and the boid steers to towards that position. This way, each boid is trying to steer towards the center of the flock, resulting in them all staying close together. 

### Alignment

### Separation

Heres the essence of the Coffeescript class for the 
    :::coffeescript
    # Ported almost directly from http://processingjs.org/learning/topic/flocking
    # thanks to Craig Reynolds and Daniel Shiffman
    # 
    SEPARATION_WEIGHT = 2
    ALIGNMENT_WEIGHT = 1
    COHESION_WEIGHT = 1

    DESIRED_SEPARATION = 18
    NEIGHBOUR_RADIUS = 50

    class Harry.Boid
        location: false
        velocity: false
        r: 3
        maxSpeed: 0
        maxForce: 0
        
        constructor: (loc, maxSpeed, maxForce) ->
          @velocity = new Vector(Math.random()*2-1,Math.random()*2-1)
          @location = loc.copy()
          [@maxSpeed, @maxForce] = [maxSpeed, maxForce]



Here's the full algorithm in action:
<div class="flock" id="prettyDemo"></div>

Here's some indicators: 
<div class="flock" id="fullFlock"></div>

<script type="text/javascript">
  var Harry = {};
</script>

<script src="/js/processing.js" type="text/javascript"></script>
<script src="/js/flocking/vector.js" type="text/javascript"></script>
<script src="/js/flocking/boid.js" type="text/javascript"></script>
<script src="/js/flocking/flock.js" type="text/javascript"></script>
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
