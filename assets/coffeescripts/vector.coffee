class Harry.Vector
    # Class methods for nondestructively operating
    for name in ['add', 'subtract', 'multiply', 'divide']
      do (name) ->
        Vector[name] = (a,b) ->
          a.copy()[name](b)

    constructor: (x=0,y=0,z=0) ->
      [@x,@y,@z] = [x,y,z]
    
    copy: ->
      new Harry.Vector(@x, @y, @z)

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

    distance: (other) ->
      dx = @x-other.x
      dy = @y-other.y
      dz = @z-other.z
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
    
    invalid: () ->
      return @x == Infinity || isNaN(@x) || @y == Infinity || isNaN(@y) || @z == Infinity || isNaN(@z)
