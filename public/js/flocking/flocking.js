(function() {
  var Flocks;
  Flocks = {
    cohesionDemo: {
      startOnPageLoad: true,
      inspectOne: true,
      boids: 10,
      boid: {
        radius: 10,
        indicators: {
          alignment: false,
          separation: false,
          cohesion: true,
          cohesionMean: true
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
