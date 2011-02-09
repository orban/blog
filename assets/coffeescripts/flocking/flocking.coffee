Flocks =
  fullFlock: (processing) ->
    start = new Harry.Vector(processing.width/2,processing.height/2)
   
    flock = for i in [0..100]
      new Harry.Boid(start, 2, 0.05, processing)
 
    processing.frameRate(20)
    
    runMode = true

    processing.draw = ->
      processing.background(255)
      Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY)
      for boid in flock
        if runMode
          boid.step(flock)
        else
          boid.renderWithIndications(flock)
      true

    processing.mouseClicked = ->
      runMode = !runMode

jQuery ->
  for name, f of Flocks
    div = $("##{name}")
    canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0]
    processingInstance = new Processing(canvas, f)
