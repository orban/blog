Flocks =
  prettyDemo:
    boids: 120
    boid:
      radius: 4
    inspectOne: true
    legend: true
    startOnPageLoad: true

  cohesionDemo:
    startOnPageLoad: false
    inspectOne: true
    boids: 15
    scale: 2.5
    boid:
      neighbourRadius: 35
      desiredSeparation: 5
      maxSpeed: 1
      wrapFactor: 0.5
      indicators:
        alignment: false
        separation: false
        neighbourRadius: true
        neighbours: true
        cohesion: true
        cohesionMean: true
        cohesionNeighbours: true

  alignmentDemo:
    startOnPageLoad: false
    inspectOne: true
    boids: 15
    scale: 2.5
    boid:
      neighbourRadius: 35
      desiredSeparation: 5
      maxSpeed: 1
      wrapFactor: 0.5
      indicators:
        alignment: true
        alignmentNeighbours: true
        velocity: true
        separation: false
        neighbourRadius: true
        neighbours: true
        cohesion: false

  separationDemo:
    startOnPageLoad: false
    inspectOne: true
    boids: 15
    scale: 2.5
    boid:
      neighbourRadius: 35
      desiredSeparation: 5
      maxSpeed: 1
      wrapFactor: 0.5
      indicators:
        alignment: false
        velocity: false
        separation: true
        separationRadius: true
        neighbourRadius: true
        neighbours: true

jQuery ->
  for name, options of Flocks
    div = $("##{name}")
    canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0]
    options.flock = new Harry.Flock(canvas, options)

  options = Flocks.prettyDemo.flock.options
  decorations = true
  $('#decorateDemo').click((e) ->
    if decorations
      e.target.innerHTML = "Decorate"
    else
      e.target.innerHTML = "Undecorate"

    decorations = !decorations

    for name in ['legend', 'inspectOne', 'inspectOneMagnification']
      options[name] = decorations

  ).trigger('click')
