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
  cxt.moveTo(  0, mid);
  cxt.lineTo(end, mid);
  cxt.moveTo(mid,   0);
  cxt.lineTo(mid, end);
  cxt.closePath();
  cxt.stroke();
}
