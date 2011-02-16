class Harry.Vector
    map_width: 500 # Accessors used for wrapping
    map_height: 500
    map_depth: 500

    # Class methods for nondestructively operating
    for name in ['add', 'subtract', 'multiply', 'divide']
      do (name) ->
        Vector[name] = (a,b) ->
          a.copy()[name](b)

    constructor: (x=0,y=0,z=0,width,height,depth) ->
      [@x,@y,@z] = [x,y,z]
      # Don't use coffeescript's default arguments, these things get instantiated a lot,
      # and I'd rather use one property on the prototype than set it every time
      if width?
        @map_width = width
      if height?
        @map_height = height
      if depth?
        @map_depth = depth

    copy: ->
      new Harry.Vector(@x,@y,@z,@map_width,@map_height,@map_depth)

    magnitude: ->
      Math.sqrt(@x*@x + @y*@y + @z*@z)
    
    normalize: ->
      m = this.magnitude()
      this.divide(m) if m > 0
      return this
    
    limit: (max) ->
      if this.magnitude() > max
        this.normalize()
        return this.multiply(max)
      else
        return this
  
    heading: ->
      -1 * Math.atan2(-1 * @y,@x)

    eucl_distance: (other) ->
      dx = @x-other.x
      dy = @y-other.y
      dz = @z-other.z
      Math.sqrt(dx*dx + dy*dy + dz*dz)

    distance: (other) ->
      dx = Math.abs(@x-other.x)
      dy = Math.abs(@y-other.y)
      dz = Math.abs(@z-other.z)

      # Wrap
      dx = if dx < @map_width/2 then dx else @map_width - dx
      dy = if dy < @map_height/2 then dy else @map_height - dy

      Math.sqrt(dx*dx + dy*dy + dz*dz)

    subtract: (other) ->
      @x -= other.x
      @y -= other.y
      @z -= other.z
      this
 
    add: (other) ->
      @x += other.x
      @y += other.y
      @z += other.z
      this

    divide: (n) ->
      [@x,@y,@z] = [@x/n,@y/n,@z/n]
      this

    multiply: (n) ->
      [@x,@y,@z] = [@x*n,@y*n,@z*n]
      this
    
    dot: (other) ->
      @x*other.x + @y*other.y + @z*other.z
    
    # Not the strict projection, the other isn't converted to a unit vector first.
    projectOnto: (other) ->
      other.copy().multiply(this.dot(other))
    
    # Called on a vector acting as a position vector to return the wrapped representation closest
    # to another location
    wrapRelativeTo: (location) ->
      v = this.copy()
      for a,key of {"x":"width", "y":"height", "z":"depth"}
        d = this[a]-location[a]
        map_d = this["map_#{key}"]
        # If the distance is greater than half the map wrap it.
        if Math.abs(d) > map_d/2
          # If the distance is positive, then the this vector is in front of the location, and it 
          # would be closer to the location if it were wrapped to the negative behind the axis
          if d > 0
            # Take the distance to the axis and put the point behind the opposite side of the map by
            # that much
            v[a] = (map_d - this[a]) * -1
          else
          # If the distance is negative, then this this vector is behind the location, and it
          # would be closer if it were wrapped in front of the location past the axis in the positive
          # direction. Take the distance back to the axis, and put the point past the edge by that much
            v[a] = (this[a] + map_d)
      v

    invalid: () ->
      return (@x == Infinity) || isNaN(@x) || @y == Infinity || isNaN(@y) || @z == Infinity || isNaN(@z)
