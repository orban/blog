(function() {
  $('#header h1').mousemove(function(e) {
    console.log(e);
    return $('#header h1').css('textShadow', '#666666 10px 10px 1px');
  });
}).call(this);
