window.onload = function() {
  initializeBoard("main_board");
};


var boardDimension = {
  margin:    10,
  gridPitch: 24,  // recommended to be an even number
  numGrids:  19,
  stoneDiameterShrinkage: 1.5,
  starDiameter:           2.0,
};

const RADIO_MODE_INIT_ID  = "radio_mode_init";
const RADIO_MODE_TURN_ID  = "radio_mode_turn";
const RADIO_MODE_PLAY_ID  = "radio_mode_play";
const RADIO_TURN_BLACK_ID = "radio_turn_black";
const RADIO_TURN_WHITE_ID = "radio_turn_white";
const ATTR_MARKED = 'marked';

const NONE  = 'none';
const BLACK = 'black';
const WHITE = 'white';
const STONES = [NONE, BLACK, WHITE];
const OUT_OF_BOUNDS = 'out_of_bounds';

const DEFAULT_BOARD_COLOR = '#fff'; //'#fb0';
const RGB_BLACK = 'rgb(0, 0, 0)';
const RGB_WHITE = 'rgb(255, 255, 255)';


function MoveSet() {
  this.inits = new Array();
  this.moves = new Array();

  this.clear = function() {
    this.title = "";
    this.inits = new Array();
    this.moves = new Array();
  };
  this.readInits = function(json) {
    h = JSON.parse(json);
    this.title = h["title"];
    this.inits = h["inits"];
    this.moves = h["moves"];
  };
  this.writeInits = function(stone, x, y) {
    var init = stringifyMove(stone, x, y);
    this.inits = this.inits.filter(function(element, i, a) {
      return element.substr(1, 4) != init.substr(1, 4)
    })
    this.inits.push(init);
  };
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
  };
  this.toJson = function() {
    return JSON.stringify({
      "title": this.title,
      "inits": this.inits,
      "moves": this.moves
    });
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

function loadInits() {
  var moveDisplay = document.getElementById("moves_display");
  moveSet.readInits(moveDisplay.value);
  setInitMode();
  displayTitle(moveSet.title);
  var inits = moveSet.inits;
  for (var i = 0; i < inits.length; i++) {
    var move = parseMove(inits[i]);
    setStoneByMove(move);
  }
  displayMoveSet();
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
}

function clearAll() {
  moveSet.clear();
  displayMoveSet();

  clearBoard();
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
    moveSet.writeInits(stone, x, y);
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
    toggleTurn();
  }

  updateCanvasDisplay(x, y);
  updateNumMoves(moveSet.moves.length);
  displayMoveSet();
}

function removeLastMove() {
  removeMove(moveSet.popLastMove());

  toggleTurn();

  updateNumMoves(moveSet.moves.length);
  displayMoveSet();
}

function removeMove(strMove) {
  moveWithTakens = parseMove(strMove);
  var move = moveWithTakens.splice(0, 3);
  removeStoneByMove(move);

  if (moveWithTakens.length > 0) {
    var movesTaken = moveWithTakens;
    for (var i = 0; i < movesTaken.length; i++) {
      var moveTaken = movesTaken[i];
      setStoneByMove(moveTaken);
    }
  }
}

function putMove(strMove) {
  moveWithTakens = parseMove(strMove);
  var move = moveWithTakens.splice(0, 3);
  setStoneByMove(move);

  if (moveWithTakens.length > 0) {
    var movesTaken = moveWithTakens;
    for (var i = 0; i < movesTaken.length; i++) {
      var moveTaken = movesTaken[i];
      removeStoneByMove(moveTaken);
    }
  }
}

function setStoneByMove(move) {
  var stone = move[0];
  var x     = move[1];
  var y     = move[2];
  setStone(x, y, stone);
  updateCanvasDisplay(x, y);
}

function removeStoneByMove(move) {
  var x = move[1];
  var y = move[2];
  setStone(x, y, NONE);
  updateCanvasDisplay(x, y);
}

function updateNumMoves(numMoves) {
  document.getElementById("numMoves").innerText = numMoves;
}

function displayTitle(title) {
  if (title) {
    document.getElementById("title").innerText = title;
  }
}

function displayMoveSet() {
  var moveDisplay = document.getElementById("moves_display");
  moveDisplay.value = moveSet.toJson();
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

function isTurnMode() {
  return document.getElementById(RADIO_MODE_TURN_ID).checked;
}

function isPlayMode() {
  return document.getElementById(RADIO_MODE_PLAY_ID).checked;
}

function setInitMode() {
  document.getElementById(RADIO_MODE_INIT_ID).checked = true;
}

function setTurnMode() {
  document.getElementById(RADIO_MODE_TURN_ID).checked = true;
}

function setPlayMode() {
  document.getElementById(RADIO_MODE_PLAY_ID).checked = true;
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

  var start = 0 + 0.5;
  var end = dim.gridPitch + 0.5;
  var mid = Math.floor(dim.gridPitch / 2) + 0.5;

  var cxt = getCanvasContext(getCanvasId(x, y));

  cxt.fillStyle = RGB_WHITE;
  cxt.clearRect(start, start, end, end);
  cxt.beginPath();

  // horizontal line
  var x0 = isLeftmost(x, y)  ? mid : start;
  var x1 = isRightmost(x, y) ? mid : end;
  cxt.moveTo(x0, mid);
  cxt.lineTo(x1, mid);
  // vertical line
  var y0 = isTop(x, y)    ? mid : start;
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

function radioModeHandler(radioMode) {
  var buttons_to_play = document.getElementById("buttons_to_play");
  if (isPlayMode()) {
    prepareForPlayMode();
  } else if (isTurnMode()) {
    prepareForTurnMode();
  }
}

var indexPlay;

function prepareForPlayMode() {
  buttons_to_play.style.display = 'inline';

  clearBoard();
  loadInits();
  setPlayMode();

  indexPlay = 0;
  updateNumMoves(indexPlay);
}

function prepareForTurnMode() {
  buttons_to_play.style.display = 'none';

  clearBoard();
  loadInits();

  indexPlay = 0;
  playToLast();

  setTurnMode();
}

function playNext() {
  if (indexPlay >= moveSet.moves.length) {
    return false;
  }

  var strMove = moveSet.moves[indexPlay++];
  putMove(strMove);
  updateNumMoves(indexPlay);

  return true;
}

function playPrev() {
  if (indexPlay <= 0) {
    return false;
  }

  var strMove = moveSet.moves[--indexPlay];
  removeMove(strMove);
  updateNumMoves(indexPlay);

  return true;
}

function playToLast() {
  while (playNext()) {}
}

function playToFirst() {
  while (playPrev()) {}
}

