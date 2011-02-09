# Boid class for use in the index page. Ported almost directly from http://processingjs.org/learning/topic/flocking,
# thanks to Craig Reynold and Daniel Shiffman
SEPARATION_WEIGHT = 2
ALIGNMENT_WEIGHT = 1
COHESION_WEIGHT = 1
GRAVITY_WEIGHT = 6

DESIRED_SEPARATION = 15
NEIGHBOUR_RADIUS = 40

MOUSE_REPULSION = 1

#PLANETS = [{x:}]
class Harry.Boid
    location: false
    velocity: false
    p: false
    r: 3
    max_speed: 0
    max_force: 0

    constructor: (loc, max_speed, max_force, processing) ->
      @p = processing
      @location = loc.copy()
      @velocity = new Harry.Vector(Math.random()*2-1,Math.random()*2-1)
      [@max_speed, @max_force] = [max_speed, max_force]

    step: (neighbours) ->
      acceleration = this._flock(neighbours).add(this._gravitate())
      this._move(acceleration)
      this.render()


    render: () ->
      # Draw a triangle rotated in the direction of velocity
      theta = @velocity.heading() + @p.radians(90)
      @p.fill(70)
      @p.stroke(0,0,255)
      @p.pushMatrix()
      @p.translate(@location.x,@location.y)
      @p.rotate(theta)
      @p.beginShape(@p.TRIANGLES)
      @p.vertex(0, -1 * @r *2)
      @p.vertex(-1 * @r, @r * 2)
      @p.vertex(@r, @r * 2)
      @p.endShape()
      @p.popMatrix()

    _move: (acceleration) ->
      @velocity.add(acceleration).limit(@max_speed)
      @location.add(@velocity)
      this._wrapIfNeeded()

    # Wraparound
    _wrapIfNeeded: () ->
      @location.x = @p.width+@r if @location.x < -@r
      @location.y = @p.height+@r if @location.y < -@r
      @location.x = -@r if @location.x > @p.width+@r
      @location.y = -@r if @location.y > @p.height+@r

    _flock: (neighbours) ->
      separation_mean = new Harry.Vector
      alignment_mean = new Harry.Vector
      cohesion_sum = new Harry.Vector

      separation_count = 0
      alignment_count = 0
      cohesion_count = 0
      
      # Each flocking behaviour did this loop, so lets put them together into one
      for boid in neighbours
        continue if boid == this
        d = @location.distance(boid.location)

        if d > 0
          if d < DESIRED_SEPARATION
            separation_mean.add Harry.Vector.subtract(@location,boid.location).normalize().divide(d) # Normalized,weighted by distance vector pointing away from the neighbour
            separation_count++
          if d < NEIGHBOUR_RADIUS
            alignment_mean.add(boid.velocity)
            alignment_count++
            cohesion_sum.add(boid.location)
            cohesion_count++

      separation_mean.divide(separation_count) if separation_count > 0
      alignment_mean.divide(alignment_count) if alignment_count > 0
      cohesion_sum.divide(cohesion_count) if cohesion_count > 0

      cohesion_sum = this.steer_to cohesion_sum
      alignment_mean.limit(@max_force)

      separation = separation_mean.multiply(SEPARATION_WEIGHT)
      alignment = alignment_mean.multiply(ALIGNMENT_WEIGHT)
      cohesion = cohesion_sum.multiply(COHESION_WEIGHT)
      return separation.add(alignment).add(cohesion)
      
    _gravitate: () ->
      gravity = new Harry.Vector

      mouse = Harry.Vector.subtract(Harry.Mouse, @location)
      d = mouse.magnitude()
      if d > 0 && d < NEIGHBOUR_RADIUS*4
        gravity.add mouse.normalize().divide(d*d).multiply(-1)

      return gravity.multiply(GRAVITY_WEIGHT)
  

    steer_to: (target) ->
      desired = Harry.Vector.subtract(target, @location) # A vector pointing from the location to the target  
      d = desired.magnitude()  # Distance from the target is the magnitude of the vector  
      # If the distance is greater than 0, calc steering (otherwise return zero vector)  
      if d > 0
        # Normalize desired  
        desired.normalize()
        # Two options for desired vector magnitude (1 -- based on distance, 2 -- maxspeed)  
        if d < 100.0
          desired.multiply(@max_speed*(d/100.0)) # This damping is somewhat arbitrary  
        else
          desired.multiply(@max_speed)
          # Steering = Desired minus Velocity
        steer = desired.subtract(@velocity)
        steer.limit(@max_force)  # Limit to maximum steering force
      else
        steer = new Harry.Vector(0,0)
      return steer
