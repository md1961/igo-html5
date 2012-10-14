onload = function() {
  var canvas = get_canvas_context('board');
  init(canvas);
};

var dimension = {
  margin: 10,
  gridPitch: 40,
  numGrids: 19,

  originX: function() { return this.margin + this.gridPitch / 2; },
  originY: function() { return this.margin + this.gridPitch / 2; },
}

function init(canvas) {
  var dim = dimension;

  canvas.beginPath();

  var x1 = dim.originX() + dim.gridPitch * (dim.numGrids - 1);
  var y1 = dim.originY() + dim.gridPitch * (dim.numGrids - 1);
  for (i = 0; i < dim.numGrids; i++) {
    var x0 = dim.originX() + dim.gridPitch * i;
    canvas.moveTo(x0, dim.originY());
    canvas.lineTo(x0, y1);

    var y0 = dim.originY() + dim.gridPitch * i;
    canvas.moveTo(dim.originX(), y0);
    canvas.lineTo(x1           , y0);
  }

  canvas.closePath();

  canvas.stroke();
}


