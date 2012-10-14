onload = function() {
  //var canvas = get_canvas_context('board');
  //init(canvas);

  for (i = 0; i < 4; i++) {
    canvas0 = get_canvas_context('canvas0' + i);
    canvas0.beginPath();
    canvas0.moveTo( 0, 11);
    canvas0.lineTo(21, 11);
    canvas0.moveTo(11,  0);
    canvas0.lineTo(11, 21);
    canvas0.closePath();
    canvas0.stroke();
  }
  /*
    canvas1 = get_canvas_context('canvas01');
    canvas1.beginPath();
    canvas1.moveTo( 0, 11);
    canvas1.lineTo(21, 11);
    canvas1.moveTo(11,  0);
    canvas1.lineTo(11, 21);
    canvas1.closePath();
    canvas1.stroke();
  */
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


