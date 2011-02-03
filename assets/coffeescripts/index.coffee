swarm = (processing) ->
  start = new Harry.Vector(processing.width/2,processing.height/2)
 
  flock = for i in [0..100]
    new Harry.Boid(start, 2, 0.05, processing)

  processing.draw = ->
    processing.background(255)
    Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY)
    for boid in flock
      boid.step(flock)
    processing.stroke(126)
    #processing.line(processing.mouseX, 20, processing.mouseX, 80)
    true

canvas = $('<canvas class="swarm" width="550" height="550"></canvas>').appendTo($('#header'))[0]
processingInstance = new Processing(canvas, swarm)
