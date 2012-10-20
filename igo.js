window.onload = function() {
  initializeBoard("main_board");
};


var boardDimension = {
  margin:    10,
  gridPitch: 25,  // must be odd
  numGrids:  19,
  stoneDiameterShrinkage: 2,
  starDiameter:           3,
};

const RADIO_MODE_INIT_ID  = "radio_mode_init";
const RADIO_TURN_BLACK_ID = "radio_turn_black";
const RADIO_TURN_WHITE_ID = "radio_turn_white";
const ATTR_MARKED = 'marked';

const NONE  = 'none';
const BLACK = 'black';
const WHITE = 'white';
const STONES = [NONE, BLACK, WHITE];
const OUT_OF_BOUNDS = 'out_of_bounds';

const DEFAULT_BOARD_COLOR = '#fb0';
const RGB_BLACK = 'rgb(0, 0, 0)';
const RGB_WHITE = 'rgb(255, 255, 255)';


function MoveSet() {
  this.inits = new Array();
  this.moves = new Array();

  this.writeMoves = function(stone, x, y, stonesTaken) {
    var move = stringifyMove(stone, x, y);
    if (stonesTaken.length > 0) {
      move += '(' + stonesTaken.join(',') + ')'
    }
    this.moves.push(move);
  };
  this.popLastMove = function() {
    var move = this.moves.pop();
    return move;
  }
  this.toJson = function() {
    return JSON.stringify({"moves": this.moves});
  };
}

function stringifyMove(stone, x, y) {
  return stone[0] + KumaUtil.zeroLeftPad(x, 2) + KumaUtil.zeroLeftPad(y, 2);
}

function parseMove(stringifiedMove) {
  var m = stringifiedMove.match(/^([nbw]\d{2,})(?:\(([\w,]+)\))?$/);
  if (! m) {
    throw "Illegal stringified move '" + stringifiedMove + "'";
  }
  var strMove = m[1];
  var strStonesTaken = m[2];

  var stone;
  switch (strMove[0]) {
    case 'n': stone = NONE ; break;
    case 'b': stone = BLACK; break;
    case 'w': stone = WHITE; break;
    default : throw "Illegal stringified move '" + strMove +"'"
  }

  x = parseInt(strMove.substr(1, 2));
  y = parseInt(strMove.substr(3, 2));

  retval = [stone, x, y];
  if (strStonesTaken) {
    arrayOfStrStoneTaken = strStonesTaken.split(',');
    retval = retval.concat(arrayOfStrStoneTaken.map(parseMove));
  }

  return retval;
}

var moveSet = new MoveSet();

function initializeBoard(tableId) {
  var dim = boardDimension;

  var table = document.getElementById(tableId);
  table.style.backgroundColor = DEFAULT_BOARD_COLOR;
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
      canvas.width  = dim.gridPitch;
      canvas.height = dim.gridPitch;
      canvas.style.backgroundColor = DEFAULT_BOARD_COLOR;
      canvas.onclick = gridClickHandler;
    }
  }

  clearBoard();
}

function clearBoard() {
  var dim = boardDimension;

  for (y = 1; y <= dim.numGrids; y++) {
    for (x = 1; x <= dim.numGrids; x++) {
      setStone(x, y, NONE);
      updateCanvasDisplay(x, y);
    }
  }

  //TODO: clear moveSet
}

function gridClickHandler() {
  var x = parseInt(this.getAttribute('x_coord'));
  var y = parseInt(this.getAttribute('y_coord'));
  putStone(x, y);
}

function putStone(x, y) {
  if (isInitMode()) {
    var turnCycle = isBlackTurn() ? [NONE, BLACK, WHITE] : [NONE, WHITE, BLACK];
    var stone = KumaUtil.nextInArray(getStone(x, y), turnCycle);
    setStone(x, y, stone);
  } else if (getStone(x, y) == NONE) {
    var currentTurn = getCurrentTurn();
    setStone(x, y, currentTurn);

    var stonesTaken = new Array();
    var adjs = adjacentCoordsInArray(x, y);
    for (var i = 0; i < adjs.length; i++) {
      var xAdj = adjs[i][0];
      var yAdj = adjs[i][1];
      var stonesTakenHere = checkIfStoneTaken(xAdj, yAdj, currentTurn);
      stonesTaken = stonesTaken.concat(stonesTakenHere);
    }

    moveSet.writeMoves(currentTurn, x, y, stonesTaken);
    displayMoveSet();
    toggleTurn();
  }

  updateCanvasDisplay(x, y);
}

function removeLastMove() {
  moveWithTakens = parseMove(moveSet.popLastMove());
  var lastMove = moveWithTakens.splice(0, 3);
  var x = lastMove[1];
  var y = lastMove[2];
  setStone(x, y, NONE);
  updateCanvasDisplay(x, y);

  if (moveWithTakens.length > 0) {
    var movesTaken = moveWithTakens;
    for (var i = 0; i < movesTaken.length; i++) {
      var stone = movesTaken[i][0];
      var x     = movesTaken[i][1];
      var y     = movesTaken[i][2];
      setStone(x, y, stone);
      updateCanvasDisplay(x, y);
    }
  }

  toggleTurn();

  displayMoveSet();
}

function displayMoveSet() {
  var moveDisplay = document.getElementById("moves_display");
  moveDisplay.firstChild.nodeValue = moveSet.toJson();
}

function adjacentCoordsInArray(x, y) {
  return [
    [x - 1, y    ],
    [x    , y - 1],
    [x + 1, y    ],
    [x    , y + 1]
  ];
}

function toggleTurn() {
  var radio_black = document.getElementById(RADIO_TURN_BLACK_ID);
  var radio_white = document.getElementById(RADIO_TURN_WHITE_ID);
  if (radio_black.checked) {
    radio_white.checked = true;
  } else {
    radio_black.checked = true;
  }
}

function checkIfStoneTaken(x, y, currentTurn) {
  var stone = getStone(x, y);
  var opponent = getOpponent(currentTurn);
  if (stone != opponent) {
    return new Array();
  }

  var stonesTaken = new Array();
  if (isDead(x, y)) {
    stonesTaken = takeStones();
  }
  unmarkAllStones();

  return stonesTaken;
}

function takeStones() {
  var dim = boardDimension;

  var stonesTaken = new Array();
  for (y = 1; y <= dim.numGrids; y++) {
    for (x = 1; x <= dim.numGrids; x++) {
      if (isMarked(x, y)) {
        var stone = getStone(x, y);
        setStone(x, y, NONE);
        stonesTaken.push(stringifyMove(stone, x, y));
        // TODO: Count up taken stones

        updateCanvasDisplay(x, y);
      }
    }
  }

  return stonesTaken;
}

function isDead(x, y) {
  markStone(x, y);
  var stoneToBeTaken = getStone(x, y);
  var adjs = adjacentCoordsInArray(x, y);
  for (var i = 0; i < adjs.length; i++) {
    var xAdj = adjs[i][0];
    var yAdj = adjs[i][1];
    var stoneAdj = getStone(xAdj, yAdj);
    if (stoneAdj == NONE) {
      return false;
    } else if (stoneAdj == stoneToBeTaken) {
      if (! isMarked(xAdj, yAdj) && ! isDead(xAdj, yAdj)) {
        return false;
      }
    }
  }

  return true;
}

function isMarked(x, y) {
  return getCanvas(x, y).hasAttribute(ATTR_MARKED);
}

function markStone(x, y) {
  getCanvas(x, y).setAttribute(ATTR_MARKED);
}

function unmarkStone(x, y) {
  getCanvas(x, y).removeAttribute(ATTR_MARKED);
}

function unmarkAllStones() {
  var dim = boardDimension;

  for (y = 1; y <= dim.numGrids; y++) {
    for (x = 1; x <= dim.numGrids; x++) {
      unmarkStone(x, y);
    }
  }
}

function isInitMode() {
  return document.getElementById(RADIO_MODE_INIT_ID).checked;
}

function isBlackTurn() {
  return document.getElementById(RADIO_TURN_BLACK_ID).checked;
}

function getCurrentTurn() {
  return isBlackTurn() ? BLACK : WHITE;
}

function getOpponent(stone) {
  switch (stone) {
    case BLACK:
      return WHITE;
      break;
    case WHITE:
      return BLACK;
      break;
    default:
      throw "getOpponent(): Argument stone must be BLACK or WHITE";
  }
}

function getCanvasId(x, y) {
  return 'g' + KumaUtil.zeroLeftPad(x, 2) + KumaUtil.zeroLeftPad(y, 2);
}

function getCanvas(x, y) {
  return document.getElementById(getCanvasId(x, y));
}

function getStone(x, y) {
  var dim = boardDimension;

  if (x < 1 || x > dim.numGrids || y < 1 || y > dim.numGrids) {
    return OUT_OF_BOUNDS;
  }
  return getCanvas(x, y).class;
}

function setStone(x, y, stone) {
  if (STONES.indexOf(stone) < 0) {
    throw "setStone(): Argument stone must be NONE, BLACK or WHITE";
  }

  var canvas = getCanvas(x, y);
  canvas.class = stone;
}

function updateCanvasDisplay(x, y) {
  var dim = boardDimension;

  var end = dim.gridPitch;
  var mid = Math.floor(dim.gridPitch / 2) + 1;

  var cxt = getCanvasContext(getCanvasId(x, y));

  cxt.fillStyle = RGB_WHITE;
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
  cxt.stroke();

  var stone = getStone(x, y);
  if (stone == WHITE || stone == BLACK) {
    cxt.beginPath();
    cxt.arc(mid, mid, mid - dim.stoneDiameterShrinkage, 0, Math.PI * 2);
    cxt.fillStyle = stone == BLACK ? RGB_BLACK : RGB_WHITE;
    cxt.fill();
    cxt.closePath();
  } else if (isStar(x, y)) {
    cxt.beginPath();
    cxt.arc(mid, mid, dim.starDiameter, 0, Math.PI * 2);
    cxt.fillStyle = RGB_BLACK;
    cxt.fill();
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

const STAR_COORDS = [4, 10, 16];

function isStar(x, y) {
  if (boardDimension.numGrids == 19) {
    if (STAR_COORDS.indexOf(x) >= 0 && STAR_COORDS.indexOf(y) >= 0) {
      return true;
    }
  }
}

