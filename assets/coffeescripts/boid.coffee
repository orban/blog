# Boid class for use in the index page. Ported almost directly from http://processingjs.org/learning/topic/flocking,
# thanks to Craig Reynold and Daniel Shiffman
SEPARATION_WEIGHT = 2
ALIGNMENT_WEIGHT = 1
COHESION_WEIGHT = 1
GRAVITY_WEIGHT = 1

DESIRED_SEPARATION = 17
NEIGHBOUR_RADIUS = 50

class Harry.Boid
    location: false
    velocity: false
    p: false
    r: 2
    max_speed: 0
    max_force: 0
    stepCount: 0

    constructor: (loc, max_speed, max_force, processing) ->
      @p = processing
      @location = loc.copy()
      @velocity = new Harry.Vector(Math.random()*2-1,Math.random()*2-1)
      [@max_speed, @max_force] = [max_speed, max_force]

    step: (neighbours) ->
      @stepCount += 1
      acceleration = this._flock(neighbours)
      this._move(acceleration)
      this.render()


    render: () ->
      # Draw a triangle rotated in the direction of velocity
      theta = @velocity.heading() + @p.radians(90)
      @p.fill(70)
      @p.stroke(255,255,0)
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
      separation = this._separate(neighbours).multiply(SEPARATION_WEIGHT)
      alignment = this._align(neighbours).multiply(ALIGNMENT_WEIGHT)
      cohesion = this._cohesion(neighbours).multiply(GRAVITY_WEIGHT)
      #gravity = this._gravity()
      return separation.add(alignment).add(cohesion)


    _separate: (neighbours) ->
      mean = new Harry.Vector
      count = 0
      for boid in neighbours
        continue if boid == this
        d = @location.distance(boid.location)
        if d > 0 and d < DESIRED_SEPARATION
          mean.add Harry.Vector.subtract(@location,boid.location).normalize().divide(d) # Normalized,weighted by distance vector pointing away from the neighbour
          count++

      mean.divide(count) if count > 0
      mean


    _align: (neighbours) ->
      mean = new Harry.Vector
      count = 0
      for boid in neighbours
        continue if boid == this
        d = @location.distance(boid.location)
        if d > 0 and d < NEIGHBOUR_RADIUS
          mean.add(boid.velocity)
          count++

      mean.divide(count) if count > 0
      mean.limit(@max_force)
      mean

    _cohesion: (neighbours) ->
      sum = new Harry.Vector
      count = 0
      for boid in neighbours
        continue if boid == this
        d = @location.distance(boid.location)
        if d > 0 and d < NEIGHBOUR_RADIUS
          sum.add(boid.location)
          count++

      if count > 0
        this.steer_to sum.divide(count)
      else
        sum

    _gravity: () ->

  

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
        steer = desired.subtract(desired,@velocity)
        steer.limit(@max_force)  # Limit to maximum steering force
      else
        steer = new Harry.Vector(0,0)
      return steer
