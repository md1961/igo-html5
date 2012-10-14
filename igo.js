onload = function() {
  var canvas = get_canvas_context();
  init(canvas);
};

var dimension = {
  originX: 20,
  originY: 20,
}

function init(canvas) {
  canvas.beginPath();
  canvas.moveTo(dimension.originX, dimension.originY);
  canvas.lineTo(120, 20);
  canvas.lineTo(120, 120);
  canvas.lineTo(20, 120);
  canvas.closePath();
  canvas.stroke();
}


