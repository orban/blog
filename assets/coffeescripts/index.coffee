$(document).ready () ->
  logo = $('#header')
  width = logo.width()
  half_width = width/2
  height = logo.height()
  half_height = height/2
  title = $('h1', logo)
  original = title.css('textShadow')
  logo.mousemove((e) ->
    dx = ((e.pageX - logo.offset().left) - half_width)/half_width * -3
    dy = ((e.pageY - logo.offset().top) - half_height)/half_height * -3
    str = '#333333 '+dx+'px '+dy+'px '+(Math.sqrt(dx*dx+dy*dy)+4)+'px'
    title.css('textShadow', str)
  ).mouseout((e) ->
    title.css('textShadow', original)
  )

