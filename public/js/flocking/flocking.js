(function() {
  var Flocks;
  Flocks = {
    cohesionDemo: {
      startOnPageLoad: true,
      inspectOne: true,
      boids: 15,
      scale: 2.5,
      boid: {
        neighbourRadius: 35,
        desiredSeparation: 5,
        maxSpeed: 1,
        indicators: {
          alignment: false,
          separation: false,
          neighbourRadius: true,
          neighbours: true,
          cohesion: true,
          cohesionMean: true,
          cohesionNeighbours: true
        }
      }
    },
    alignmentDemo: {
      startOnPageLoad: true,
      inspectOne: true,
      boids: 15,
      scale: 2.5,
      boid: {
        neighbourRadius: 35,
        desiredSeparation: 5,
        maxSpeed: 1,
        indicators: {
          alignment: true,
          alignmentNeighbours: true,
          velocity: true,
          separation: false,
          neighbourRadius: true,
          neighbours: true,
          cohesion: false
        }
      }
    }
  };
  jQuery(function() {
    var canvas, div, name, options, _results;
    _results = [];
    for (name in Flocks) {
      options = Flocks[name];
      div = $("#" + name);
      canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0];
      _results.push(new Harry.Flock(canvas, options));
    }
    return _results;
  });
}).call(this);
