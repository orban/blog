(function() {
  Harry.Boid = (function() {
    Boid.prototype.location = false;
    Boid.prototype.velocity = false;
    Boid.prototype.renderedThisStep = false;
    Boid.prototype.p = false;
    Boid.prototype.r = 3;
    Boid.prototype.maxSpeed = 2;
    Boid.prototype.maxForce = 0.05;
    Boid.prototype.mousePhobic = true;
    Boid.prototype.forceInspection = false;
    Boid.prototype.inspectable = false;
    Boid.prototype.weights = {
      separation: 2,
      alignment: 1,
      cohesion: 1,
      gravity: 6
    };
    Boid.prototype.indicators = {
      separation: true,
      alignment: true,
      cohesion: true,
      cohesionMean: false,
      velocity: true,
      neighbours: true,
      neighbourRadius: true
    };
    Boid.prototype.desiredSeparation = 6;
    Boid.prototype.neighbourRadius = 50;
    Boid.prototype.mouseRepulsion = 1;
    Boid.prototype.mouseRadius = 5;
    Boid.prototype._separation = new Harry.Vector;
    Boid.prototype._alignment = new Harry.Vector;
    Boid.prototype._cohesion = new Harry.Vector;
    Boid.prototype._cohesionMean = new Harry.Vector;
    function Boid(options) {
      var twor;
      if (options == null) {
        options = {};
      }
      if (!(options.processing || options.p)) {
        throw "Boid needs a processing instance to render to! ";
      }
      if (!options.velocity) {
        throw "Boid needs a start velocity! ";
      }
      if (!options.startPosition) {
        throw "Boid needs a start position!";
      }
      jQuery.extend(this, options);
      if (options.radius) {
        this.r = options.radius;
      }
      this.p = options.processing || options.p;
      this.location = options.startPosition.copy();
      twor = this.r * 2;
      this.wrapDimensions = {
        north: -twor,
        south: this.p.width + twor,
        west: -twor,
        east: this.p.height + twor,
        width: this.p.width + 2 * twor,
        height: this.p.height + 2 * twor
      };
      this.desiredSeparation = this.desiredSeparation * this.r;
    }
    Boid.prototype.step = function(neighbours) {
      var acceleration;
      acceleration = this._flock(neighbours).add(this._gravitate());
      return this._move(acceleration);
    };
    Boid.prototype.render = function(neighbours) {
      var boid, d, _i, _len, _results;
      if (this.inspecting()) {
        this.p.pushMatrix();
        this.p.translate(this.location.x, this.location.y);
        if (this.indicators.neighbourRadius) {
          this.p.fill(100, 200, 50, 100);
          this.p.stroke(100, 200, 50, 200);
          this.p.ellipse(0, 0, this.neighbourRadius * 2, this.neighbourRadius * 2);
          this.p.popMatrix();
          this._renderSelfWithIndicators();
        }
        if (this.indicators.neighbours) {
          _results = [];
          for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
            boid = neighbours[_i];
            if (boid === this) {
              continue;
            }
            d = this.location.distance(boid.location, this.wrapDimensions);
            _results.push(d > 0 ? d < this.desiredSeparation ? (this.p.fill(250, 0, 0), this.p.stroke(100, 0, 0), boid._renderSelf(true)) : d < this.neighbourRadius ? (this.p.fill(0, 100, 0), this.p.stroke(0, 100, 0), boid._renderSelf(true)) : void 0 : void 0);
          }
          return _results;
        }
      } else {
        this.p.fill(70);
        this.p.stroke(0, 0, 255);
        return this._renderSelf();
      }
    };
    Boid.prototype._renderSelf = function(rerender, translate) {
      var theta;
      if (rerender == null) {
        rerender = false;
      }
      if (translate == null) {
        translate = true;
      }
      this.p.strokeWeight(1);
      if (!rerender) {
        if (this.renderedThisStep) {
          return;
        }
      }
      this.renderedThisStep = true;
      theta = this.velocity.heading() + this.p.radians(90);
      this.p.pushMatrix();
      if (translate) {
        this.p.translate(this.location.x, this.location.y);
      }
      this.p.rotate(theta);
      this.p.beginShape(this.p.TRIANGLES);
      this.p.vertex(0, -1 * this.r * 2);
      this.p.vertex(-1 * this.r, this.r * 2);
      this.p.vertex(this.r, this.r * 2);
      this.p.endShape();
      return this.p.popMatrix();
    };
    Boid.prototype._renderSelfWithIndicators = function(translate) {
      if (translate == null) {
        translate = true;
      }
      this.p.fill(200, 0, 200);
      this.p.stroke(250, 0, 250);
      this._renderSelf(true, translate);
      this.p.pushMatrix();
      if (translate) {
        this.p.translate(this.location.x, this.location.y);
      }
      if (this.indicators.velocity) {
        this.p.stroke(0, 0, 0);
        this.p.fill(0, 0, 0);
        this._renderVector(this.velocity);
      }
      if (this.indicators.separation) {
        this.p.stroke(250, 0, 0);
        this.p.fill(250, 0, 0);
        this._renderVector(this._separation, 100);
      }
      if (this.indicators.alignment) {
        this.p.stroke(0, 250, 0);
        this.p.fill(0, 250, 0);
        this._renderVector(this._alignment, 300);
      }
      if (this.indicators.cohesion) {
        this.p.stroke(0, 0, 250);
        this.p.fill(0, 0, 250);
        this._renderVector(this._cohesion, 300);
      }
      if (this.indicators.cohesionMean) {
        this.p.stroke(250, 0, 250);
        this.p.fill(250, 0, 250);
        this._renderVector(this._cohesionMean, 1);
      }
      return this.p.popMatrix();
    };
    Boid.prototype._renderVector = function(vector, scale) {
      var m, r, theta;
      if (scale == null) {
        scale = 10;
      }
      m = vector.magnitude() * scale;
      r = 2;
      this.p.pushMatrix();
      theta = vector.heading() - this.p.radians(90);
      this.p.rotate(theta);
      this.p.line(0, 0, 0, m);
      this.p.beginShape(this.p.TRIANGLES);
      this.p.vertex(0, m);
      this.p.vertex(0 - r, m - r * 2);
      this.p.vertex(0 + r, m - r * 2);
      this.p.endShape();
      return this.p.popMatrix();
    };
    Boid.prototype._move = function(acceleration) {
      this.velocity.add(acceleration).limit(this.maxSpeed);
      this.location.add(this.velocity);
      return this._wrapIfNeeded();
    };
    Boid.prototype._wrapIfNeeded = function() {
      if (this.location.x < this.wrapDimensions.west) {
        this.location.x = this.wrapDimensions.east;
      }
      if (this.location.y < this.wrapDimensions.north) {
        this.location.y = this.wrapDimensions.south;
      }
      if (this.location.x > this.wrapDimensions.east) {
        this.location.x = this.wrapDimensions.west;
      }
      if (this.location.y > this.wrapDimensions.south) {
        return this.location.y = this.wrapDimensions.north;
      }
    };
    Boid.prototype._flock = function(neighbours) {
      var alignment_count, alignment_mean, boid, cohesion_count, cohesion_direction, cohesion_mean, d, separation_count, separation_mean, _i, _len;
      separation_mean = new Harry.Vector;
      alignment_mean = new Harry.Vector;
      cohesion_mean = this.location.copy();
      separation_count = 0;
      alignment_count = 0;
      cohesion_count = 1;
      this.contributors = [];
      this.neighbours = [];
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        boid = neighbours[_i];
        if (boid === this) {
          continue;
        }
        d = this.location.distance(boid.location, this.wrapDimensions);
        if (d > 0) {
          if (d < this.desiredSeparation) {
            separation_mean.add(Harry.Vector.subtract(this.location, boid.location).copy().normalize().divide(d));
            separation_count++;
          }
          if (d < this.neighbourRadius) {
            this.neighbours.push(boid);
            alignment_mean.add(boid.velocity);
            alignment_count++;
            cohesion_mean.add(boid.location.wrapRelativeTo(this.location, this.wrapDimensions));
            cohesion_count++;
          }
        }
      }
      if (separation_count > 0) {
        separation_mean.divide(separation_count);
      }
      if (alignment_count > 0) {
        alignment_mean.divide(alignment_count);
      }
      if (cohesion_count > 0) {
        cohesion_mean.divide(cohesion_count);
      }
      this._cohesion_mean = cohesion_mean.copy().subtract(this.location);
      cohesion_direction = this.steer_to(cohesion_mean);
      alignment_mean.limit(this.maxForce);
      this._separation = separation_mean.multiply(this.weights.separation);
      this._alignment = alignment_mean.multiply(this.weights.alignment);
      this._cohesion = cohesion_direction.multiply(this.weights.cohesion);
      return this._separation.add(this._alignment).add(this._cohesion);
    };
    Boid.prototype._gravitate = function() {
      var d, gravity, mouse;
      gravity = new Harry.Vector;
      if (this.mousePhobic) {
        mouse = Harry.Vector.subtract(Harry.Mouse, this.location);
        d = mouse.magnitude() - this.mouseRadius;
        if (d < 0) {
          d = 0.01;
        }
        if (d > 0 && d < this.neighbourRadius * 5) {
          gravity.add(mouse.normalize().divide(d * d).multiply(-1));
        }
      }
      return gravity.multiply(this.weights.gravity);
    };
    Boid.prototype.steer_to = function(target) {
      var d, desired, steer;
      desired = Harry.Vector.subtract(target, this.location);
      d = desired.magnitude();
      if (d > 0) {
        desired.normalize();
        if (d < 100.0) {
          desired.multiply(this.maxSpeed * (d / 100.0));
        } else {
          desired.multiply(this.maxSpeed);
        }
        steer = desired.subtract(this.velocity);
        steer.limit(this.maxForce);
      } else {
        steer = new Harry.Vector(0, 0);
      }
      return steer;
    };
    Boid.prototype.inspecting = function() {
      var d;
      if (this.forceInspection) {
        return true;
      }
      if (!this.inspectable) {
        return false;
      }
      d = Harry.Vector.subtract(Harry.Mouse, this.location);
      return d.magnitude() < this.r * 2;
    };
    return Boid;
  })();
}).call(this);
