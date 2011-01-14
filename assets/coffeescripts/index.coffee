textShadowProperties = "Color X Y Blur".split(' ')
do ->
  props = textShadowProperties
  support = $.support
  rWhitespace = /\s/
  div = document.createElement('div')
  divStyle = div.style

  support.textShadow = (divStyle.textShadow == '')
  div = null

  if ($.cssHooks && support.textShadow)
    $.each props, (i, suffix) ->
      hook = 'textShadow' + suffix

      $.cssHooks[hook] =
        get: (elem, computed, extra) ->
          return ((elem, pos) ->
            shadow = $.css(elem, 'textShadow')
            color = $.color.normalize(shadow)
            return if pos == 0
              'rgb' + (if color.alpha then 'a' else '') + '(' + color.r + ', ' + color.g + ', ' + color.b + (if color.alpha then ', ' + color.alpha else '') + ')'
            else
              $.trim(shadow.replace(color.source, '')).split(rWhitespace)[pos - 1]
          )(elem, i)

        set: (elem, value) ->
          elem.style.textShadow = ( (string, value, index) ->
            color_part = $.style(elem, 'textShadowColor')
            parts = string.replace(color_part, '').split(rWhitespace)
            
            if index == 0
              color_part = value
            else
              parts[index] = value

            return color_part + parts.join(' ')
          )($.css(elem, 'textShadow'), value, i)

      unless i == 0
        $.fx.step[hook] = (fx) ->
          $.cssHooks[hook].set(fx.elem, fx.now + fx.unit)

$(document).ready ->
  logo = $('.index #header')
  width = logo.width()
  half_width = width/2
  height = logo.height()
  half_height = height/2
  title = $('h1', logo)
  original = {}

  for name in textShadowProperties
    name = "textShadow#{name}"
    original[name] = title.css name

  logo.mousemove((e) ->
    title.stop(true)
    dx = ((e.pageX - logo.offset().left) - half_width)/half_width * -3
    dy = ((e.pageY - logo.offset().top) - half_height)/half_height * -3
    title.css
      textShadowX: dx
      textShadowY: dy
      textShadowBlur: Math.sqrt(dx*dx+dy*dy)+3

  ).mouseout((e) ->
    console.log e
    title.animate original, 300
  )


bigBangHorray = (processing) ->
  # Override draw function, by default it will be called 60 times per second

  processing.draw = ->
    # determine center and max clock arm length
    centerX = processing.width / 2
    centerY = processing.height / 2
    maxArmLength = Math.min(centerX, centerY)

    drawArm = (position, lengthScale, weight) ->
      processing.strokeWeight(weight)
      processing.line(centerX, centerY,
        centerX + Math.sin(position * 2 * Math.PI) * lengthScale * maxArmLength,
        centerY - Math.cos(position * 2 * Math.PI) * lengthScale * maxArmLength)

    # erase background
    processing.background(224)

    now = new Date()

    # Moving hours arm by small increments
    hoursPosition = (now.getHours() % 12 + now.getMinutes() / 60) / 12
    drawArm(hoursPosition, 0.5, 5)

    # Moving minutes arm by small increments
    minutesPosition = (now.getMinutes() + now.getSeconds() / 60) / 60
    drawArm(minutesPosition, 0.80, 3)

    # Moving hour arm by second increments
    secondsPosition = now.getSeconds() / 60
    drawArm(secondsPosition, 0.90, 1)

#canvas = $('canvas.bang')[0]
# attaching the sketchProc function to the canvas
#processingInstance = new Processing(canvas, bigBangHorray)

