onload = function() {
  init("main_board");
};

var dimension = {
  margin: 10,
  gridPitch: 31,
  numGrids: 4,
}

function init(table_id) {
  var dim = dimension;

  var table = document.getElementById(table_id);
  for (y = 1; y <= dim.numGrids; y++) {
    var row = document.createElement('tr');
    table.appendChild(row);
    for (x = 1; x <= dim.numGrids; x++) {
      var id = getCanvasId(x, y);
      var cell = document.createElement('td');
      row.appendChild(cell);
      var canvas = document.createElement('canvas');
      cell.appendChild(canvas);
      canvas.id = id;
      canvas.width  = dim.gridPitch;
      canvas.height = dim.gridPitch;

      updateCanvasDisplay(x, y);
    }
  }
}

function getCanvasId(x, y) {
  return 'g' + ('0' + x).substr(-2) + ('0' + y).substr(-2);
}

function updateCanvasDisplay(x, y) {
  var dim = dimension;

  var cxt = getCanvasContext(getCanvasId(x, y));
  cxt.beginPath();

  var end = dim.gridPitch;
  var mid = Math.floor(dim.gridPitch / 2) + 1;
  // horizontal line
  var x0 = isLeftmost(x, y)  ? mid : 0;
  var x1 = isRightmost(x, y) ? mid : end;
  cxt.moveTo(x0, mid);
  cxt.lineTo(x1, mid);
  // vertical line
  var y0 = isTop(x, y)    ? mid : 0;
  var y1 = isBottom(x, y) ? mid : end;
  cxt.moveTo(mid, y0);
  cxt.lineTo(mid, y1);

  cxt.closePath();
  cxt.stroke();
}

function isTop(x, y) {
  return y == 1;
}

function isBottom(x, y) {
  return y == dimension.numGrids;
}

function isLeftmost(x, y) {
  return x == 1;
}

function isRightmost(x, y) {
  return x == dimension.numGrids;
}

