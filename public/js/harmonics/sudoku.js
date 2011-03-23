(function() {
  var Heatmap, h, heat, heatmap, id, margin, max, maxIndex, min, minIndex, n, ratio, w, x, y;
  Heatmap = function(x, y) {
    var a;
    x = (x - 50) / 26;
    y = (y - 50) / 26;
    a = 3 * Math.cos(Math.pow(x - 1, 2) + Math.pow(y, 2));
    a += 2 * Math.cos(Math.pow(x - 3, 2) + Math.pow(y + 4, 2));
    a += 2 * Math.pow(Math.cos(x) + Math.cos(y), 3);
    a += 2 * Math.pow(Math.abs(Math.cos(0.4 * x + 3) + Math.cos(0.6 * y - 2)), 1 / 2);
    return a -= 4 * Math.pow(Math.pow(x + 2, 2) + Math.pow(y, 2), 1 / 2);
  };
  max = -Infinity;
  min = Infinity;
  for (x = 0; x <= 100; x++) {
    for (y = 0; y <= 100; y++) {
      if ((n = Heatmap(x, y)) > max) {
        maxIndex = [x, y];
        max = n;
      }
      if (n < min) {
        min = n;
        minIndex = [x, y];
      }
    }
  }
  console.log("Max", maxIndex, max);
  console.log("Min", minIndex, min);
  console.log(Heatmap(50, 50));
  w = 100;
  h = 100;
  max = max + 0.5;
  ratio = 4;
  margin = 20;
  id = "sleepMap";
  x = pv.Scale.linear().domain(0, 10).range(0, w * ratio);
  y = pv.Scale.linear().domain(0, 10).range(0, h * ratio);
  heat = pv.Scale.linear().domain(min, 0, max / 5, 2 * max / 5, 3 * max / 5, 4 * max / 5, max).range("#000", "#0a0", "#6c0", "#ee0", "#eb4", "#eb9", "#fff").by(Heatmap);
  heatmap = new pv.Panel().canvas(id).width(w * ratio).height(h * ratio).margin(margin).strokeStyle("#aaa").lineWidth(2).antialias(false);
  heatmap.add(pv.Image).imageWidth(w).imageHeight(h).image(heat);
  heatmap.add(pv.Rule).data(x.ticks()).strokeStyle("").left(x).anchor("bottom").add(pv.Label).text(x.tickFormat);
  heatmap.add(pv.Rule).data(y.ticks()).strokeStyle("").bottom(y).anchor("left").add(pv.Label).text(y.tickFormat);
  heatmap.render();
  $("#" + id + " canvas").css({
    width: w * ratio,
    height: h * ratio
  });
}).call(this);
