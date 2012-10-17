window.onload = function() {
  initializeBoard("main_board");
};

var boardDimension = {
  margin:    10,
  gridPitch: 31,  // must be odd
  numGrids:   4,
  stoneDiameterShrinkage: 2,
}

const RADIO_MODE_INIT_ID  = "radio_mode_init";
const RADIO_TURN_BLACK_ID = "radio_turn_black";
const RADIO_TURN_WHITE_ID = "radio_turn_white";

const NONE  = 'none';
const BLACK = 'black';
const WHITE = 'white';

function initializeBoard(tableId) {
  var dim = boardDimension;

  var table = document.getElementById(tableId);
  for (y = 1; y <= dim.numGrids; y++) {
    var row = document.createElement('tr');
    table.appendChild(row);
    for (x = 1; x <= dim.numGrids; x++) {
      var cell = document.createElement('td');
      row.appendChild(cell);
      var canvas = document.createElement('canvas');
      cell.appendChild(canvas);

      canvas.id = getCanvasId(x, y);
      canvas.setAttribute('x_coord', x);
      canvas.setAttribute('y_coord', y);
      canvas.class = NONE;
      canvas.width  = dim.gridPitch;
      canvas.height = dim.gridPitch;
      canvas.onclick = gridClickHandler;

      updateCanvasDisplay(x, y);
    }
  }
}

function gridClickHandler() {
  if (isInitMode()) {
    var turnCycle = isBlackTurn() ? [NONE, BLACK, WHITE] : [NONE, WHITE, BLACK];
    this.class = KumaUtil.nextInArray(this.class, turnCycle);
  } else if (this.class == NONE) {
    this.class = isBlackTurn() ? BLACK : WHITE;
    toggleRadioTurn();
  }

  x = parseInt(this.getAttribute('x_coord'));
  y = parseInt(this.getAttribute('y_coord'));
  updateCanvasDisplay(x, y);
}

function toggleRadioTurn() {
  var radio_black = document.getElementById(RADIO_TURN_BLACK_ID);
  var radio_white = document.getElementById(RADIO_TURN_WHITE_ID);
  if (radio_black.checked) {
    radio_white.checked = true;
  } else {
    radio_black.checked = true;
  }
}

function isInitMode() {
  return document.getElementById(RADIO_MODE_INIT_ID).checked;
}

function isBlackTurn() {
  return document.getElementById(RADIO_TURN_BLACK_ID).checked;
}

function getCanvasId(x, y) {
  return 'g' + ('0' + x).substr(-2) + ('0' + y).substr(-2);
}

function getCanvasClass(x, y) {
  var canvas = document.getElementById(getCanvasId(x, y));
  return canvas.class;
}

function updateCanvasDisplay(x, y) {
  var dim = boardDimension;

  var end = dim.gridPitch;
  var mid = Math.floor(dim.gridPitch / 2) + 1;

  var cxt = getCanvasContext(getCanvasId(x, y));

  cxt.fillStyle = "rgb(255, 255, 255)";
  cxt.clearRect(0, 0, end, end);
  cxt.beginPath();

  // horizontal line
  var x0 = isLeftmost(x, y)  ? mid :   0;
  var x1 = isRightmost(x, y) ? mid : end;
  cxt.moveTo(x0, mid);
  cxt.lineTo(x1, mid);
  // vertical line
  var y0 = isTop(x, y)    ? mid :   0;
  var y1 = isBottom(x, y) ? mid : end;
  cxt.moveTo(mid, y0);
  cxt.lineTo(mid, y1);

  cxt.closePath();

  var clazz = getCanvasClass(x, y);
  if (clazz == WHITE || clazz == BLACK) {
    cxt.beginPath();
    cxt.arc(mid, mid, mid - dim.stoneDiameterShrinkage, 0, Math.PI * 2);
    if (clazz == BLACK) {
      cxt.fillStyle = "rgb(0, 0, 0)";
      cxt.fill();
    }
    cxt.closePath();
  }

  cxt.stroke();
}

function isTop(x, y) {
  return y == 1;
}

function isBottom(x, y) {
  return y == boardDimension.numGrids;
}

function isLeftmost(x, y) {
  return x == 1;
}

function isRightmost(x, y) {
  return x == boardDimension.numGrids;
}

