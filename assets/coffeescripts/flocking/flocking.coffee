class Flock
  @defaults:
    boids: 100
    clickToStop: true
    startPosition: new Harry.Vector(0.5,0.5)
    maxSpeed: 2
    maximumForce: 0.05
    frameRate: 20
    radius: 3

  constructor: (canvas, options) ->
    @options = jQuery.extend {}, Flock.defaults, options
    @processing = new Processing(canvas, this.run)

  run: (processing) =>
    start = new Harry.Vector(processing.width,processing.height).projectOnto(@options.startPosition)
    boids = for i in [1..@options.boids]
      new Harry.Boid(start, @options.maxSpeed, @options.maximumForce, @options.radius, processing)
 
    processing.frameRate(@options.frameRate)

    timeRunning = true
    processing.draw = ->
      processing.background(255)
      Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY)
      # Reset the rendered flag for all boids for this frame. Some boids will force
      # rendering of other ones to show the indications in different colors, so this 
      # flag is set to true and they don't re-render themselves using the normal colors
      for boid in boids
         boid.renderedThisStep = false
      for boid in boids
        if timeRunning
          boid.step(boids)
        else
          boid.renderWithIndications(boids)
      true

    if @options.clickToStop
      processing.mouseClicked = ->
        timeRunning = !timeRunning

Flocks =
  fullFlock:
    boids: 100
    radius: 4
    
   
jQuery ->
  for name, options of Flocks
    div = $("##{name}")
    canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0]
    new Flock(canvas, options)
