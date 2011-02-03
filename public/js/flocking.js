(function() {
  var canvas, processingInstance, swarm;
  swarm = function(processing) {
    var flock, i, start;
    start = new Harry.Vector(processing.width / 2, processing.height / 2);
    flock = (function() {
      var _results;
      _results = [];
      for (i = 0; i <= 50; i++) {
        _results.push(new Harry.Boid(start, 2, 0.05, processing));
      }
      return _results;
    })();
    return processing.draw = function() {
      var boid, _i, _len;
      processing.background(255);
      Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY);
      console.log(processing.mouseX, processing.mouseY);
      for (_i = 0, _len = flock.length; _i < _len; _i++) {
        boid = flock[_i];
        boid.step(flock);
      }
      processing.stroke(126);
      return true;
    };
  };
  canvas = $('<canvas class="swarm" width="550" height="550"></canvas>').appendTo($('#header'))[0];
  processingInstance = new Processing(canvas, swarm);
}).call(this);
