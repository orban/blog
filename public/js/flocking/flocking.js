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
      radius: 3,
      mousePhobic: false,
      inspectOne: false,
      inspectOneMagnification: false,
      legend: false
    };
    function Flock(canvas, options) {
      this.run = __bind(this.run, this);;      this.options = jQuery.extend({}, Flock.defaults, options);
      this.processing = new Processing(canvas, this.run);
    }
    Flock.prototype.run = function(processing) {
      var boids, font, i, inspectorGadget, setInspectable, start, timeRunning;
      start = new Harry.Vector(processing.width, processing.height).projectOnto(this.options.startPosition);
      boids = (function() {
        var _ref, _results;
        _results = [];
        for (i = 1, _ref = this.options.boids; (1 <= _ref ? i <= _ref : i >= _ref); (1 <= _ref ? i += 1 : i -= 1)) {
          _results.push(new Harry.Boid(start, this.options.maxSpeed, this.options.maximumForce, this.options.radius, this.options.mousePhobic, processing));
        }
        return _results;
      }).call(this);
      if (this.options.inspectOne) {
        inspectorGadget = boids[boids.length - 1];
        inspectorGadget.forceInspection = true;
      }
      processing.frameRate(this.options.frameRate);
      timeRunning = true;
      if (this.options.legend) {
        font = processing.loadFont('/fonts/aller_rg-webfont');
      }
      processing.draw = __bind(function() {
        var boid, ctx, demo, l, legends, _i, _j, _k, _l, _len, _len2, _len3, _len4;
        processing.background(255);
        Harry.Mouse = new Harry.Vector(processing.mouseX, processing.mouseY);
        for (_i = 0, _len = boids.length; _i < _len; _i++) {
          boid = boids[_i];
          boid.renderedThisStep = false;
        }
        if (timeRunning) {
          for (_j = 0, _len2 = boids.length; _j < _len2; _j++) {
            boid = boids[_j];
            boid.step(boids);
          }
        }
        for (_k = 0, _len3 = boids.length; _k < _len3; _k++) {
          boid = boids[_k];
          boid.render(boids);
        }
        if (this.options.inspectOneMagnification && this.options.inspectOne) {
          processing.stroke(0);
          processing.fill(255);
          processing.rect(0, 0, 100, 100);
          processing.pushMatrix();
          processing.translate(50, 50);
          processing.scale(2);
          inspectorGadget._renderSelfWithIndicators(false);
          processing.popMatrix();
        }
        if (this.options.legend) {
          processing.fill(255);
          processing.stroke(0);
          processing.pushMatrix();
          processing.translate(0, processing.height - 101);
          processing.rect(0, 0, 100, 100);
          processing.textFont(font, 14);
          processing.fill(0);
          processing.text("Legend", 24, 15);
          processing.translate(10, 16);
          demo = new Harry.Vector(0, -12);
          ctx = {
            p: processing
          };
          legends = [
            {
              name: "Velocity",
              r: 0,
              g: 0,
              b: 0
            }, {
              name: "Separation",
              r: 250,
              g: 0,
              b: 0
            }, {
              name: "Alignment",
              r: 0,
              g: 250,
              b: 0
            }, {
              name: "Cohesion",
              r: 0,
              g: 0,
              b: 250
            }
          ];
          processing.pushMatrix();
          processing.strokeWeight(2);
          processing.textFont(font, 12);
          for (_l = 0, _len4 = legends.length; _l < _len4; _l++) {
            l = legends[_l];
            processing.translate(0, 20);
            processing.stroke(l.r, l.g, l.b);
            processing.fill(l.r, l.g, l.b);
            Harry.Boid.prototype._renderVector.call(ctx, demo, 1);
            processing.text(l.name, 8, -2);
          }
          processing.popMatrix();
        }
        return true;
      }, this);
      setInspectable = function(what) {
        var boid, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = boids.length; _i < _len; _i++) {
          boid = boids[_i];
          _results.push(boid.inspectable = what);
        }
        return _results;
      };
      if (this.options.clickToStop) {
        return processing.mouseClicked = function() {
          setInspectable(timeRunning);
          return timeRunning = !timeRunning;
        };
      }
    };
    return Flock;
  })();
  Flocks = {
    fullFlock: {
      boids: 100,
      radius: 4,
      inspectOne: true,
      inspectOneMagnification: true,
      legend: true
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
