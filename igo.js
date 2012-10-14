onload = function() {
  init("main_board");
};

var dimension = {
  margin: 10,
  gridPitch: 40,
  numGrids: 19,

  originX: function() { return this.margin + this.gridPitch / 2; },
  originY: function() { return this.margin + this.gridPitch / 2; },
}

function init(table_id) {
  var table = document.getElementById(table_id);
  for (i = 0; i < 9; i++) {
    var row = document.createElement('tr');
    table.appendChild(row);
    for (j = 0; j < 9; j++) {
      var id = 'g' + i + j;
      var cell = document.createElement('td');
      row.appendChild(cell);
      var canvas = document.createElement('canvas');
      cell.appendChild(canvas);
      canvas.id = id;
      canvas.width  = 21;
      canvas.height = 21;

      cxt = get_canvas_context(id);
      cxt.beginPath();
      cxt.moveTo( 0, 11);
      cxt.lineTo(21, 11);
      cxt.moveTo(11,  0);
      cxt.lineTo(11, 21);
      cxt.closePath();
      cxt.stroke();
    }
  }
}


