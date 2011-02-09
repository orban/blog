(function() {
  var Flocks;
  Flocks = {
    fullFlock: function(processing) {
      var flock, i, runMode, start;
      start = new Harry.Vector(processing.width / 2, processing.height / 2);
      flock = (function() {
        var _results;
        _results = [];
        for (i = 0; i <= 100; i++) {
          _results.push(new Harry.Boid(start, 2, 0.05, processing));
        }
        return _results;
      })();
      processing.frameRate(20);
      runMode = true;
      processing.draw = function() {
        var boid, _i, _len;
        processing.background(255);
        Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY);
        for (_i = 0, _len = flock.length; _i < _len; _i++) {
          boid = flock[_i];
          if (runMode) {
            boid.step(flock);
          } else {
            boid.renderWithIndications(flock);
          }
        }
        return true;
      };
      return processing.mouseClicked = function() {
        return runMode = !runMode;
      };
    }
  };
  jQuery(function() {
    var canvas, div, f, name, processingInstance, _results;
    _results = [];
    for (name in Flocks) {
      f = Flocks[name];
      div = $("#" + name);
      canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0];
      _results.push(processingInstance = new Processing(canvas, f));
    }
    return _results;
  });
}).call(this);
