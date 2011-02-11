(function() {
  var Flock, Flocks;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Flock = (function() {
    Flock.defaults = {
      boids: 100,
      clickToStop: true,
      startPosition: new Harry.Vector(0.5, 0.5),
      maxSpeed: 2,
      maximumForce: 0.05,
      frameRate: 20,
      radius: 3
    };
    function Flock(canvas, options) {
      this.run = __bind(this.run, this);;      this.options = jQuery.extend({}, Flock.defaults, options);
      this.processing = new Processing(canvas, this.run);
    }
    Flock.prototype.run = function(processing) {
      var boids, i, start, timeRunning;
      start = new Harry.Vector(processing.width, processing.height).projectOnto(this.options.startPosition);
      boids = (function() {
        var _ref, _results;
        _results = [];
        for (i = 1, _ref = this.options.boids; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
          _results.push(new Harry.Boid(start, this.options.maxSpeed, this.options.maximumForce, this.options.radius, processing));
        }
        return _results;
      }).call(this);
      processing.frameRate(this.options.frameRate);
      timeRunning = true;
      processing.draw = function() {
        var boid, _i, _j, _len, _len2;
        processing.background(255);
        Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY);
        for (_i = 0, _len = boids.length; _i < _len; _i++) {
          boid = boids[_i];
          boid.renderedThisStep = false;
        }
        for (_j = 0, _len2 = boids.length; _j < _len2; _j++) {
          boid = boids[_j];
          if (timeRunning) {
            boid.step(boids);
          } else {
            boid.renderWithIndications(boids);
          }
        }
        return true;
      };
      if (this.options.clickToStop) {
        return processing.mouseClicked = function() {
          return timeRunning = !timeRunning;
        };
      }
    };
    return Flock;
  })();
  Flocks = {
    fullFlock: {
      boids: 100,
      radius: 4
    }
  };
  jQuery(function() {
    var canvas, div, name, options, _results;
    _results = [];
    for (name in Flocks) {
      options = Flocks[name];
      div = $("#" + name);
      canvas = $('<canvas></canvas>').attr('width', div.width()).attr('height', div.height()).appendTo(div)[0];
      _results.push(new Flock(canvas, options));
    }
    return _results;
  });
}).call(this);
