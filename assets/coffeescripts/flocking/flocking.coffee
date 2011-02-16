class Flock
  @defaults:
    boids: 100
    clickToStop: true
    startPosition: new Harry.Vector(0.5,0.5)
    maxSpeed: 2
    maximumForce: 0.05
    frameRate: 20
    radius: 3
    mousePhobic: false
    inspectOne: false
    inspectOneMagnification: false
    legend: false
    startOnPageLoad: false

  constructor: (canvas, options) ->
    @options = jQuery.extend {}, Flock.defaults, options
    @processing = new Processing(canvas, this.run)

  run: (processing) =>
    # Figure out the initial position
    start = new Harry.Vector(processing.width,processing.height).projectOnto(@options.startPosition)
    # Fill an array with all the boid instances
    boids = for i in [1..@options.boids]
      new Harry.Boid(start, @options.maxSpeed, @options.maximumForce, @options.radius, @options.mousePhobic, processing)

    # inspectOne option allows to force one boid to always show its component vectors.
    # Pick the last one so it always renders on top
    if @options.inspectOne
      inspectorGadget = boids[boids.length-1]
      inspectorGadget.forceInspection = true

    processing.frameRate(@options.frameRate)

    timeRunning = @options.startOnPageLoad # closed over variable for tracking if "time" is paused or running

    if @options.legend
      font = processing.loadFont('/fonts/aller_rg-webfont')

    processing.draw = =>
      processing.background(255)
      # Update mouse location for the boids to look at
      Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY)

      # Reset the rendered flag for all boids for this frame. Some boids will force
      # rendering of other ones to show the indications in different colors, so this
      # flag is set to true and they don't re-render themselves using the normal colors
      for boid in boids
        boid.renderedThisStep = false

      # Step each boid
      if timeRunning
        for boid in boids
          boid.step(boids)

      for boid in boids
        boid.render(boids)

      # Draw lines to prevent flickering at the edges when wrapping
      processing.stroke(255)
      processing.strokeWeight(@options.radius+1)
      processing.noFill()
      processing.rect(@options.radius/2-1,@options.radius/2-1, processing.width-@options.radius+1,processing.height-@options.radius+1)

      # Draw our friend the inspected boid
      if @options.inspectOneMagnification and @options.inspectOne
        processing.stroke(0)
        processing.strokeWeight(1)
        processing.fill(255)
        processing.rect(0,0, 100, 100)
        processing.pushMatrix()
        processing.translate(50,50)
        processing.scale(2)
        inspectorGadget._renderSelfWithIndicators(false) # dont let it translate itself to its location
        processing.popMatrix()

      # Draw legend
      if @options.legend
        processing.fill(255)
        processing.stroke(0)
        processing.strokeWeight(1)
        processing.pushMatrix()
        processing.translate(0,processing.height-101)
        processing.rect(0,0, 100, 100)
        processing.textFont(font, 14)
        processing.fill(0)
        processing.text("Legend",24,15)

        processing.translate(10,16)

        demo = new Harry.Vector(0,-12)
        ctx = {p:processing}
        legends = [
          {name:"Velocity", r:0,g:0,b:0}
          {name:"Separation", r:250,g:0,b:0}
          {name:"Alignment", r:0,g:250,b:0}
          {name:"Cohesion", r:0,g:0,b:250}
        ]

        processing.pushMatrix()
        processing.strokeWeight(2)
        processing.textFont(font, 12)

        for l in legends
          processing.translate(0,20)

          #Velocity - black
          processing.stroke(l.r,l.g,l.b)
          processing.fill(l.r,l.g,l.b)
          Harry.Boid::_renderVector.call(ctx, demo,1)
          processing.text(l.name,8,-2)

        processing.popMatrix()

      return true

    setInspectable = (what) ->
      boid.inspectable = what for boid in boids

    if @options.clickToStop
      processing.mouseClicked = ->
        setInspectable(timeRunning)
        timeRunning = !timeRunning

Flocks =
  prettyDemo:
    boids: 75
    radius: 4
    inspectOne: false
    legend: false
    startOnPageLoad: true

  fullFlock:
    boids: 75
    radius: 4
    inspectOne: true
    inspectOneMagnification: true
    legend: true

jQuery ->
  for name, options of Flocks
    div = $("##{name}")
    canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0]
    new Flock(canvas, options)
