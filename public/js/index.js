(function() {
  var bigBangHorray, canvas, processingInstance, textShadowProperties;
  textShadowProperties = "Color X Y Blur".split(' ');
  (function() {
    var div, divStyle, props, rWhitespace, support;
    props = textShadowProperties;
    support = $.support;
    rWhitespace = /\s/;
    div = document.createElement('div');
    divStyle = div.style;
    support.textShadow = divStyle.textShadow === '';
    div = null;
    if ($.cssHooks && support.textShadow) {
      return $.each(props, function(i, suffix) {
        var hook;
        hook = 'textShadow' + suffix;
        $.cssHooks[hook] = {
          get: function(elem, computed, extra) {
            return (function(elem, pos) {
              var color, shadow;
              shadow = $.css(elem, 'textShadow');
              color = $.color.normalize(shadow);
              if (pos === 0) {
                return 'rgb' + (color.alpha ? 'a' : '') + '(' + color.r + ', ' + color.g + ', ' + color.b + (color.alpha ? ', ' + color.alpha : '') + ')';
              } else {
                return $.trim(shadow.replace(color.source, '')).split(rWhitespace)[pos - 1];
              }
            })(elem, i);
          },
          set: function(elem, value) {
            return elem.style.textShadow = (function(string, value, index) {
              var color_part, parts;
              color_part = $.style(elem, 'textShadowColor');
              parts = string.replace(color_part, '').split(rWhitespace);
              if (index === 0) {
                color_part = value;
              } else {
                parts[index] = value;
              }
              return color_part + parts.join(' ');
            })($.css(elem, 'textShadow'), value, i);
          }
        };
        if (i !== 0) {
          return $.fx.step[hook] = function(fx) {
            return $.cssHooks[hook].set(fx.elem, fx.now + fx.unit);
          };
        }
      });
    }
  })();
  $(document).ready(function() {
    var half_height, half_width, height, logo, name, original, title, width, _i, _len;
    logo = $('.index #header');
    width = logo.width();
    half_width = width / 2;
    height = logo.height();
    half_height = height / 2;
    title = $('h1', logo);
    original = {};
    for (_i = 0, _len = textShadowProperties.length; _i < _len; _i++) {
      name = textShadowProperties[_i];
      name = "textShadow" + name;
      original[name] = title.css(name);
    }
    return logo.mousemove(function(e) {
      var dx, dy;
      title.stop(true);
      dx = ((e.pageX - logo.offset().left) - half_width) / half_width * -3;
      dy = ((e.pageY - logo.offset().top) - half_height) / half_height * -3;
      return title.css({
        textShadowX: dx,
        textShadowY: dy,
        textShadowBlur: Math.sqrt(dx * dx + dy * dy) + 3
      });
    }).mouseout(function(e) {
      console.log(e);
      return title.animate(original, 300);
    });
  });
  bigBangHorray = function(processing) {
    return processing.draw = function() {
      var centerX, centerY, drawArm, hoursPosition, maxArmLength, minutesPosition, now, secondsPosition;
      centerX = processing.width / 2;
      centerY = processing.height / 2;
      maxArmLength = Math.min(centerX, centerY);
      drawArm = function(position, lengthScale, weight) {
        processing.strokeWeight(weight);
        return processing.line(centerX, centerY, centerX + Math.sin(position * 2 * Math.PI) * lengthScale * maxArmLength, centerY - Math.cos(position * 2 * Math.PI) * lengthScale * maxArmLength);
      };
      processing.background(224);
      now = new Date();
      hoursPosition = (now.getHours() % 12 + now.getMinutes() / 60) / 12;
      drawArm(hoursPosition, 0.5, 5);
      minutesPosition = (now.getMinutes() + now.getSeconds() / 60) / 60;
      drawArm(minutesPosition, 0.80, 3);
      secondsPosition = now.getSeconds() / 60;
      return drawArm(secondsPosition, 0.90, 1);
    };
  };
  canvas = $('canvas.bang')[0];
  processingInstance = new Processing(canvas, bigBangHorray);
}).call(this);
