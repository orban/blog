Flocks =
  prettyDemo:
    boids: 120
    boid:
      radius: 4
    inspectOne: false
    legend: false
    startOnPageLoad: true

  fullFlock:
    startOnPageLoad: false
    boids: 75
    boid:
      radius: 4
    inspectOne: true
    inspectOneMagnification: true
    legend: true

  cohesionDemo:
    startOnPageLoad: false
    inspectOne: true
    boids: 15
    scale: 2.5
    boid:
      neighbourRadius: 35
      desiredSeparation: 5
      maxSpeed: 1
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
    new Harry.Flock(canvas, options)
