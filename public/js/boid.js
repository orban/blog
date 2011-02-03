(function() {
  var ALIGNMENT_WEIGHT, COHESION_WEIGHT, DESIRED_SEPARATION, GRAVITY_WEIGHT, MOUSE_REPULSION, NEIGHBOUR_RADIUS, SEPARATION_WEIGHT;
  SEPARATION_WEIGHT = 2;
  ALIGNMENT_WEIGHT = 1;
  COHESION_WEIGHT = 1;
  GRAVITY_WEIGHT = 6;
  DESIRED_SEPARATION = 15;
  NEIGHBOUR_RADIUS = 40;
  MOUSE_REPULSION = 1;
  Harry.Boid = (function() {
    Boid.prototype.location = false;
    Boid.prototype.velocity = false;
    Boid.prototype.p = false;
    Boid.prototype.r = 2;
    Boid.prototype.max_speed = 0;
    Boid.prototype.max_force = 0;
    function Boid(loc, max_speed, max_force, processing) {
      var _ref;
      this.p = processing;
      this.location = loc.copy();
      this.velocity = new Harry.Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
      _ref = [max_speed, max_force], this.max_speed = _ref[0], this.max_force = _ref[1];
    }
    Boid.prototype.step = function(neighbours) {
      var acceleration;
      acceleration = this._flock(neighbours).add(this._gravitate());
      this._move(acceleration);
      return this.render();
    };
    Boid.prototype.render = function() {
      var theta;
      theta = this.velocity.heading() + this.p.radians(90);
      this.p.fill(70);
      this.p.stroke(255, 255, 0);
      this.p.pushMatrix();
      this.p.translate(this.location.x, this.location.y);
      this.p.rotate(theta);
      this.p.beginShape(this.p.TRIANGLES);
      this.p.vertex(0, -1 * this.r * 2);
      this.p.vertex(-1 * this.r, this.r * 2);
      this.p.vertex(this.r, this.r * 2);
      this.p.endShape();
      return this.p.popMatrix();
    };
    Boid.prototype._move = function(acceleration) {
      this.velocity.add(acceleration).limit(this.max_speed);
      this.location.add(this.velocity);
      return this._wrapIfNeeded();
    };
    Boid.prototype._wrapIfNeeded = function() {
      if (this.location.x < -this.r) {
        this.location.x = this.p.width + this.r;
      }
      if (this.location.y < -this.r) {
        this.location.y = this.p.height + this.r;
      }
      if (this.location.x > this.p.width + this.r) {
        this.location.x = -this.r;
      }
      if (this.location.y > this.p.height + this.r) {
        return this.location.y = -this.r;
      }
    };
    Boid.prototype._flock = function(neighbours) {
      var alignment, alignment_count, alignment_mean, boid, cohesion, cohesion_count, cohesion_sum, d, separation, separation_count, separation_mean, _i, _len;
      separation_mean = new Harry.Vector;
      alignment_mean = new Harry.Vector;
      cohesion_sum = new Harry.Vector;
      separation_count = 0;
      alignment_count = 0;
      cohesion_count = 0;
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        boid = neighbours[_i];
        if (boid === this) {
          continue;
        }
        d = this.location.distance(boid.location);
        if (d > 0) {
          if (d < DESIRED_SEPARATION) {
            separation_mean.add(Harry.Vector.subtract(this.location, boid.location).normalize().divide(d));
            separation_count++;
          }
          if (d < NEIGHBOUR_RADIUS) {
            alignment_mean.add(boid.velocity);
            alignment_count++;
            cohesion_sum.add(boid.location);
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
        cohesion_sum.divide(cohesion_count);
      }
      cohesion_sum = this.steer_to(cohesion_sum);
      alignment_mean.limit(this.max_force);
      separation = separation_mean.multiply(SEPARATION_WEIGHT);
      alignment = alignment_mean.multiply(ALIGNMENT_WEIGHT);
      cohesion = cohesion_sum.multiply(COHESION_WEIGHT);
      return separation.add(alignment).add(cohesion);
    };
    Boid.prototype._gravitate = function() {
      var d, gravity, mouse;
      gravity = new Harry.Vector;
      mouse = Harry.Vector.subtract(Harry.Mouse, this.location);
      d = mouse.magnitude();
      if (d > 0 && d < NEIGHBOUR_RADIUS * 4) {
        gravity.add(mouse.normalize().divide(d * d).multiply(-1));
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
          desired.multiply(this.max_speed * (d / 100.0));
        } else {
          desired.multiply(this.max_speed);
        }
        steer = desired.subtract(this.velocity);
        steer.limit(this.max_force);
      } else {
        steer = new Harry.Vector(0, 0);
      }
      return steer;
    };
    return Boid;
  })();
}).call(this);
