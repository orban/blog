# Boid class for use in the index page. Ported almost directly from http://processingjs.org/learning/topic/flocking,
# thanks to Craig Reynold and Daniel Shiffman
SEPARATION_WEIGHT = 2
ALIGNMENT_WEIGHT = 1
COHESION_WEIGHT = 1
GRAVITY_WEIGHT = 6

DESIRED_SEPARATION = 18
NEIGHBOUR_RADIUS = 50

MOUSE_REPULSION = 1
MOUSE_RADIUS = 5

class Harry.Boid
    location: false
    _unwrappedLocation: false
    velocity: false
    renderedThisStep: false
    p: false
    r: 3
    maxSpeed: 0
    maxForce: 0
    mousePhobic: true
    forceInspection: false
    inspectable: false
    
    constructor: (loc, maxSpeed, maxForce, radius, mousePhobic, processing) ->
      @p = processing
      @location = loc.copy()
      @velocity = new Harry.Vector(Math.random()*2-1,Math.random()*2-1)
      [@maxSpeed, @maxForce, @r, @mousePhobic] = [maxSpeed, maxForce, radius, mousePhobic]

    step: (neighbours) ->
      acceleration = this._flock(neighbours).add(this._gravitate())
      this._move(acceleration)

    render: (neighbours) ->
      if this.inspecting()
        @p.pushMatrix()
        @p.translate(@location.x,@location.y)
        # Draw neighbour radius
        @p.fill(100,200,50, 100)
        @p.stroke(100,200,50, 200)
        @p.ellipse(0,0, NEIGHBOUR_RADIUS*2, NEIGHBOUR_RADIUS*2)
        @p.popMatrix()
        this._renderSelfWithIndicators()
        
        # Highlight neighbours
        for boid in neighbours
          continue if boid == this
          d = @location.distance(boid.location)
          if d > 0
            if d < DESIRED_SEPARATION
              # Highlight other boids which are too close in red
              @p.fill(250,0,0)
              @p.stroke(100,0,0)
              boid._renderSelf(true)
            else if d < NEIGHBOUR_RADIUS
              # Highlight other neighbouring boids which affect cohesion and alignment in green
              @p.fill(0,100,0)
              @p.stroke(0,100,0)
              boid._renderSelf(true)

      else
        # Standard Render
        @p.fill(70)
        @p.stroke(0,0,255)
        this._renderSelf()

    # Expects the colour to be set already
    _renderSelf: (rerender = false, translate = true) ->
      @p.strokeWeight(1)
      unless rerender
        return if @renderedThisStep # don't render twice unless forced
      @renderedThisStep = true
      # Draw a triangle rotated in the direction of velocity
      theta = @velocity.heading() + @p.radians(90)
      @p.pushMatrix()
      @p.translate(@location.x,@location.y) if translate
      @p.rotate(theta)
      @p.beginShape(@p.TRIANGLES)
      @p.vertex(0, -1 * @r *2)
      @p.vertex(-1 * @r, @r * 2)
      @p.vertex(@r, @r * 2)
      @p.endShape()
      @p.popMatrix()

    _renderSelfWithIndicators: (translate = true) ->
        # Render self
        @p.fill(200,0,200)
        @p.stroke(250,0,250)
        this._renderSelf(true, translate)

        # Draw component vectors
        @p.pushMatrix()
        @p.translate(@location.x,@location.y) if translate

        #Velocity - black
        @p.stroke(0,0,0)
        @p.fill(0,0,0)
        this._renderVector(@velocity)

        # Seperation - red
        @p.stroke(250,0,0)
        @p.fill(250,0,0)
        this._renderVector(@_separation, 100)

        # Alignment - green
        @p.stroke(0,250,0)
        @p.fill(0,250,0)
        this._renderVector(@_alignment, 300)

        # Cohesion - blue
        @p.stroke(0,0,250)
        @p.fill(0,0,250)
        this._renderVector(@_cohesion, 300)
        # Cohesion - blue
        @p.stroke(250,0,250)
        @p.fill(250,0,250)
        this._renderVector(@_cohesion_mean, 1)
        @p.popMatrix()
      
    # Have location and color set by the calling function
    _renderVector: (vector, scale=10) ->
      m = vector.magnitude() * scale
      r = 2
      @p.pushMatrix()
      theta = vector.heading() - @p.radians(90)
      @p.rotate(theta)
      @p.line(0,0,0,m)
      @p.beginShape(@p.TRIANGLES)
      @p.vertex(0,m)
      @p.vertex(0-r, m - r*2)
      @p.vertex(0+r, m - r*2)
      @p.endShape()
      @p.popMatrix()
      
    _move: (acceleration) ->
      @velocity.add(acceleration).limit(@maxSpeed)
      @location.add(@velocity)
      this._wrapIfNeeded()

    # Wraparound
    _wrapIfNeeded: () ->
      @_unwrappedLocation = @location.copy()
      @location.x = @p.width+@r if @location.x < -@r
      @location.y = @p.height+@r if @location.y < -@r
      @location.x = -@r if @location.x > @p.width+@r
      @location.y = -@r if @location.y > @p.height+@r

    _flock: (neighbours) ->
      separation_mean = new Harry.Vector
      alignment_mean = new Harry.Vector
      cohesion_mean = new Harry.Vector

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
            cohesion_mean.add(boid.location)
            cohesion_count++

      separation_mean.divide(separation_count) if separation_count > 0
      alignment_mean.divide(alignment_count) if alignment_count > 0
      cohesion_mean.divide(cohesion_count) if cohesion_count > 0
      @_cohesion_mean = cohesion_mean.copy().subtract(@location)
      cohesion_mean = this.steer_to cohesion_mean
      alignment_mean.limit(@maxForce)

      # Store these as temporary variables for use in the indicators.
      # Only the return value of the function is actually used for calculation
      @_separation = separation_mean.multiply(SEPARATION_WEIGHT)
      @_alignment = alignment_mean.multiply(ALIGNMENT_WEIGHT)
      @_cohesion = cohesion_mean.multiply(COHESION_WEIGHT)
      return @_separation.add(@_alignment).add(@_cohesion)


    # Adds negative gravity from the mouse
    _gravitate: () ->
      gravity = new Harry.Vector

      if @mousePhobic
        mouse = Harry.Vector.subtract(Harry.Mouse, @location)
        d = mouse.magnitude() - MOUSE_RADIUS
        d = 0.01 if d < 0
        if d > 0 && d < NEIGHBOUR_RADIUS*5
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
          desired.multiply(@maxSpeed*(d/100.0)) # This damping is somewhat arbitrary
        else
          desired.multiply(@maxSpeed)
          # Steering = Desired minus Velocity
        steer = desired.subtract(@velocity)
        steer.limit(@maxForce)  # Limit to maximum steering force
      else
        steer = new Harry.Vector(0,0)
      return steer

    inspecting: () ->
      return true if @forceInspection
      return false unless @inspectable
      d = Harry.Vector.subtract(Harry.Mouse, @location)
      d.magnitude() < @r * 2 # HACKETYHACKHACK
