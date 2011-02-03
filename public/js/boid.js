(function() {
  var ALIGNMENT_WEIGHT, COHESION_WEIGHT, DESIRED_SEPARATION, GRAVITY_WEIGHT, NEIGHBOUR_RADIUS, SEPARATION_WEIGHT;
  SEPARATION_WEIGHT = 2;
  ALIGNMENT_WEIGHT = 1;
  COHESION_WEIGHT = 1;
  GRAVITY_WEIGHT = 1;
  DESIRED_SEPARATION = 17;
  NEIGHBOUR_RADIUS = 50;
  Harry.Boid = (function() {
    Boid.prototype.location = false;
    Boid.prototype.velocity = false;
    Boid.prototype.p = false;
    Boid.prototype.r = 2;
    Boid.prototype.max_speed = 0;
    Boid.prototype.max_force = 0;
    Boid.prototype.stepCount = 0;
    function Boid(loc, max_speed, max_force, processing) {
      var _ref;
      this.p = processing;
      this.location = loc.copy();
      this.velocity = new Harry.Vector(Math.random() * 2 - 1, Math.random() * 2 - 1);
      _ref = [max_speed, max_force], this.max_speed = _ref[0], this.max_force = _ref[1];
    }
    Boid.prototype.step = function(neighbours) {
      var acceleration;
      this.stepCount += 1;
      acceleration = this._flock(neighbours);
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
      var alignment, cohesion, separation;
      separation = this._separate(neighbours).multiply(SEPARATION_WEIGHT);
      alignment = this._align(neighbours).multiply(ALIGNMENT_WEIGHT);
      cohesion = this._cohesion(neighbours).multiply(GRAVITY_WEIGHT);
      return separation.add(alignment).add(cohesion);
    };
    Boid.prototype._separate = function(neighbours) {
      var boid, count, d, mean, _i, _len;
      mean = new Harry.Vector;
      count = 0;
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        boid = neighbours[_i];
        if (boid === this) {
          continue;
        }
        d = this.location.distance(boid.location);
        if (d > 0 && d < DESIRED_SEPARATION) {
          mean.add(Harry.Vector.subtract(this.location, boid.location).normalize().divide(d));
          count++;
        }
      }
      if (count > 0) {
        mean.divide(count);
      }
      return mean;
    };
    Boid.prototype._align = function(neighbours) {
      var boid, count, d, mean, _i, _len;
      mean = new Harry.Vector;
      count = 0;
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        boid = neighbours[_i];
        if (boid === this) {
          continue;
        }
        d = this.location.distance(boid.location);
        if (d > 0 && d < NEIGHBOUR_RADIUS) {
          mean.add(boid.velocity);
          count++;
        }
      }
      if (count > 0) {
        mean.divide(count);
      }
      mean.limit(this.max_force);
      return mean;
    };
    Boid.prototype._cohesion = function(neighbours) {
      var boid, count, d, sum, _i, _len;
      sum = new Harry.Vector;
      count = 0;
      for (_i = 0, _len = neighbours.length; _i < _len; _i++) {
        boid = neighbours[_i];
        if (boid === this) {
          continue;
        }
        d = this.location.distance(boid.location);
        if (d > 0 && d < NEIGHBOUR_RADIUS) {
          sum.add(boid.location);
          count++;
        }
      }
      if (count > 0) {
        return this.steer_to(sum.divide(count));
      } else {
        return sum;
      }
    };
    Boid.prototype._gravity = function() {};
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
        steer = desired.subtract(desired, this.velocity);
        steer.limit(this.max_force);
      } else {
        steer = new Harry.Vector(0, 0);
      }
      return steer;
    };
    return Boid;
  })();
}).call(this);
