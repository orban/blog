(function() {
  var ALIGNMENT_WEIGHT, COHESION_WEIGHT, DESIRED_SEPARATION, GRAVITY_WEIGHT, MOUSE_RADIUS, MOUSE_REPULSION, NEIGHBOUR_RADIUS, SEPARATION_WEIGHT;
  SEPARATION_WEIGHT = 2;
  ALIGNMENT_WEIGHT = 1;
  COHESION_WEIGHT = 1;
  GRAVITY_WEIGHT = 6;
  DESIRED_SEPARATION = 18;
  NEIGHBOUR_RADIUS = 50;
  MOUSE_REPULSION = 1;
  MOUSE_RADIUS = 5;
  Harry.Boid = (function() {
    Boid.prototype.location = false;
    Boid.prototype._unwrappedLocation = false;
    Boid.prototype.velocity = false;
    Boid.prototype.renderedThisStep = false;
    Boid.prototype.p = false;
    Boid.prototype.r = 3;
    Boid.prototype.maxSpeed = 0;
    Boid.prototype.maxForce = 0;
    Boid.prototype.mousePhobic = true;
    Boid.prototype.forceInspection = false;
    Boid.prototype.inspectable = false;
    Boid.prototype._separation = new Harry.Vector;
    Boid.prototype._alignment = new Harry.Vector;
    Boid.prototype._cohesion = new Harry.Vector;
    Boid.prototype._cohesion_mean = new Harry.Vector;
    function Boid(loc, maxSpeed, maxForce, radius, mousePhobic, processing) {
      var _ref;
      this.velocity = new Harry.Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
      this.p = processing;
      this.location = loc.copy();
      _ref = [maxSpeed, maxForce, radius, mousePhobic], this.maxSpeed = _ref[0], this.maxForce = _ref[1], this.r = _ref[2], this.mousePhobic = _ref[3];
      this.wrapHeightNorth = 0;
      this.wrapHeightSouth = this.p.width;
      this.wrapWidthWest = 0;
      this.wrapWidthEast = this.p.height;
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
        this.p.fill(100, 200, 50, 100);
        this.p.stroke(100, 200, 50, 200);
        this.p.ellipse(0, 0, NEIGHBOUR_RADIUS * 2, NEIGHBOUR_RADIUS * 2);
        this.p.popMatrix();
        this._renderSelfWithIndicators();
        _results = [];
        for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
          boid = neighbours[_i];
          if (boid === this) {
            continue;
          }
          d = this.location.distance(boid.location);
          _results.push(d > 0 ? d < DESIRED_SEPARATION ? (this.p.fill(250, 0, 0), this.p.stroke(100, 0, 0), boid._renderSelf(true)) : d < NEIGHBOUR_RADIUS ? (this.p.fill(0, 100, 0), this.p.stroke(0, 100, 0), boid._renderSelf(true)) : void 0 : void 0);
        }
        return _results;
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
      this.p.stroke(0, 0, 0);
      this.p.fill(0, 0, 0);
      this._renderVector(this.velocity);
      this.p.stroke(250, 0, 0);
      this.p.fill(250, 0, 0);
      this._renderVector(this._separation, 100);
      this.p.stroke(0, 250, 0);
      this.p.fill(0, 250, 0);
      this._renderVector(this._alignment, 300);
      this.p.stroke(0, 0, 250);
      this.p.fill(0, 0, 250);
      this._renderVector(this._cohesion, 300);
      this.p.stroke(250, 0, 250);
      this.p.fill(250, 0, 250);
      this._renderVector(this._cohesion_mean, 1);
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
      if (this.location.x < this.wrapWidthWest) {
        this.location.x = this.p.width;
      }
      if (this.location.y < this.wrapHeightNorth) {
        this.location.y = this.p.height;
      }
      if (this.location.x > this.wrapWidthEast) {
        this.location.x = 0;
      }
      if (this.location.y > this.wrapHeightSouth) {
        return this.location.y = 0;
      }
    };
    Boid.prototype._flock = function(neighbours) {
      var alignment_count, alignment_mean, boid, cohesion_count, cohesion_mean, d, separation_count, separation_mean, _i, _len;
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
        d = this.location.distance(boid.location);
        if (d > 0) {
          if (d < DESIRED_SEPARATION) {
            separation_mean.add(Harry.Vector.subtract(this.location, boid.location).copy().normalize().divide(d));
            separation_count++;
          }
          if (d < NEIGHBOUR_RADIUS) {
            this.neighbours.push(boid);
            alignment_mean.add(boid.velocity);
            alignment_count++;
            cohesion_mean.add(boid.location.wrapRelativeTo(this.location));
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
      cohesion_mean = this.steer_to(cohesion_mean);
      alignment_mean.limit(this.maxForce);
      this._separation = separation_mean.multiply(SEPARATION_WEIGHT);
      this._alignment = alignment_mean.multiply(ALIGNMENT_WEIGHT);
      this._cohesion = cohesion_mean.multiply(COHESION_WEIGHT);
      return this._separation.add(this._alignment).add(this._cohesion);
    };
    Boid.prototype._gravitate = function() {
      var d, gravity, mouse;
      gravity = new Harry.Vector;
      if (this.mousePhobic) {
        mouse = Harry.Vector.subtract(Harry.Mouse, this.location);
        d = mouse.magnitude() - MOUSE_RADIUS;
        if (d < 0) {
          d = 0.01;
        }
        if (d > 0 && d < NEIGHBOUR_RADIUS * 5) {
          gravity.add(mouse.normalize().divide(d * d).multiply(-1));
        }
      }
      return gravity.multiply(GRAVITY_WEIGHT);
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
