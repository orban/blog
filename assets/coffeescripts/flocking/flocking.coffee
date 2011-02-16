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
    boids: 10
    boid:
      radius: 10
      indicators:
        alignment: false
        separation: false
        cohesion: true
        cohesionMean: true

jQuery ->
  for name, options of Flocks
    div = $("##{name}")
    canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0]
    new Harry.Flock(canvas, options)
