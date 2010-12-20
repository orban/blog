(function() {
  $(document).ready(function() {
    var half_height, half_width, height, logo, original, title, width;
    logo = $('#header');
    width = logo.width();
    half_width = width / 2;
    height = logo.height();
    half_height = height / 2;
    title = $('h1', logo);
    original = title.css('textShadow');
    return logo.mousemove(function(e) {
      var dx, dy, str;
      dx = ((e.pageX - logo.offset().left) - half_width) / half_width * -3;
      dy = ((e.pageY - logo.offset().top) - half_height) / half_height * -3;
      str = '#333333 ' + dx + 'px ' + dy + 'px ' + (Math.sqrt(dx * dx + dy * dy) + 4) + 'px';
      return title.css('textShadow', str);
    }).mouseout(function(e) {
      return title.css('textShadow', original);
    });
  });
}).call(this);
