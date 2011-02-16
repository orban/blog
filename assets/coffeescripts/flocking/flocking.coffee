Flocks =
  #prettyDemo:
    #boids: 75
    #boid:
      #radius: 4
    #inspectOne: false
    #legend: false
    #startOnPageLoad: true

  #fullFlock:
    #boids: 75
    #boid:
      #radius: 4
    #inspectOne: true
    #inspectOneMagnification: true
    #legend: true

  cohesionDemo:
    startOnPageLoad: true
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
    startOnPageLoad: true
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
jQuery ->
  for name, options of Flocks
    div = $("##{name}")
    canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0]
    new Harry.Flock(canvas, options)
