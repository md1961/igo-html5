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
const RADIO_MODE_TEMP_ID  = "radio_mode_temp";
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
  this.isTempMode = false;
  this.tempMoves = new Array();

  this.clear = function() {
    this.title = "";
    this.inits = new Array();
    this.moves = new Array();
  };

  this.readDataInJson = function(json) {
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
    var moves = this.isTempMode ? this.tempMoves : this.moves;
    moves.push(move);
  };

  this.popLastMove = function() {
    var moves = this.isTempMode ? this.tempMoves : this.moves;
    if (moves.length == 0) {
      return null;
    }
    return moves.pop();
  };

  this.nextTurn = function() {
    if (this.moves.length == 0) {
      return null;  // TODO: Need to have next turn value
    }
    var lastStrMove = this.moves[this.moves.length - 1];
    switch (lastStrMove[0]) {
      case 'n': return null;
      case 'b': return WHITE;
      case 'w': return BLACK;
      default : throw "Illegal stringified move '" + lastStrMove +"'"
    }
  };

  this.setTempMode = function(isTempMode) {
    this.isTempMode = isTempMode;
    if (isTempMode) {
      this.tempMoves = this.moves.slice(0);
    }
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

  var stone = getColorOfStone(strMove)
  var x = parseInt(strMove.substr(1, 2));
  var y = parseInt(strMove.substr(3, 2));

  retval = [stone, x, y];
  if (strStonesTaken) {
    arrayOfStrStoneTaken = strStonesTaken.split(',');
    retval = retval.concat(arrayOfStrStoneTaken.map(parseMove));
  }

  return retval;
}

function getColorOfStone(strMove) {
  switch (strMove[0]) {
    case 'n': return NONE ;
    case 'b': return BLACK;
    case 'w': return WHITE;
    default : throw "Illegal stringified move '" + strMove +"'"
  }
}

function putInits() {
  saveMode();

  setInitMode();
  displayTitle(moveSet.title);
  var inits = moveSet.inits;
  for (var i = 0; i < inits.length; i++) {
    var move = parseMove(inits[i]);
    setStoneByMove(move);
  }

  restoreMode();
}

var modeSaved = null;

function saveMode() {
  modeSaved = isInitMode() ? "init"
            : isTurnMode() ? "turn"
            : isPlayMode() ? "play"
                           : "temp";
}

function restoreMode() {
  if (modeSaved == "init") {
    setInitMode();
  } else if (modeSaved == "turn") {
    setTurnMode();
  } else if (modeSaved == "play") {
    setPlayMode();
  } else if (modeSaved == "temp") {
    setTempMode();
  } else {
    throw "Cannot call restoreMode() unless saveMode() was called in advance";
  }

  modeSaved = null;
}

function readData() {
  var moveDisplay = document.getElementById("moves_display");
  moveSet.readDataInJson(moveDisplay.value);

  putInits();
  putMovesToLast();

  setTurnMode();
  setTurn(moveSet.nextTurn());

  displayMoveSet();
  disableRadioToInitMode(true);
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

  document.getElementById("title").innerText = null;
  document.getElementById("moves_display").value = null;
  updateNumMoves(0);
}

function clearAll() {
  moveSet.clear();
  setTurnMode();
  setTurn(BLACK);

  clearBoard();
  disableRadioToInitMode(false);
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

    disableRadioToInitMode(true);
  }

  updateCanvasDisplay(x, y);
  updateNumMoves(moveSet.moves.length);
  displayMoveSet();
}

function disableRadioToInitMode(toBeDisabled) {
  var radioToInit = document.getElementById("radio_mode_init_with_label");
  radioToInit.style.display = toBeDisabled ? 'none' : 'inline';
}

function removeLastMove() {
  var moveToRemove = moveSet.moves[moveSet.moves.length - 1];
  moveToRemove = moveSet.popLastMove();
  removeMove(moveToRemove);

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
  if (isTempMode()) {
    return;
  }

  document.getElementById("numMoves").innerText
      = numMoves + "手目 / 全" + moveSet.moves.length + "手";
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

function isBlackTurn() {
  return document.getElementById(RADIO_TURN_BLACK_ID).checked;
}

function toggleTurn() {
  setTurn(isBlackTurn() ? WHITE : BLACK);
}

function setTurn(stone) {
  if (stone != BLACK && stone != WHITE) {
    throw "setTurn(): Argument stone must be BLACK or WHITE";
  }

  var radioId = stone == BLACK ? RADIO_TURN_BLACK_ID : RADIO_TURN_WHITE_ID;
  document.getElementById(radioId).checked = true;
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

function isTempMode() {
  return document.getElementById(RADIO_MODE_TEMP_ID).checked;
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

function setTempMode() {
  document.getElementById(RADIO_MODE_TEMP_ID).checked = true;
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
  if (isPlayMode()) {
    prepareForPlayMode();
  } else if (isTurnMode()) {
    prepareForTurnMode();
  } else if (isTempMode()) {
    prepareForTempMode();
  }
}

var indexPlay;

function prepareForPlayMode() {
  clearBoard();
  putInits();
  setPlayMode();

  indexPlay = 0;
  if (indexMovesToRestoreFromTempMode != null) {
    goToMoveNumberOf(indexMovesToRestoreFromTempMode);
    indexMovesToRestoreFromTempMode = null;
  }
  setTurn(getColorOfStone(moveSet.moves[indexPlay]));
  updateNumMoves(indexPlay);

  hideButtonsToPlay(false);
  hideInfoDisplay(false);
}

function prepareForTurnMode() {
  moveSet.setTempMode(false);

  clearBoard();
  putInits();
  putMovesToLast();

  setTurnMode();
  setTurn(moveSet.nextTurn());

  displayMoveSet();
  hideButtonsToPlay(true);
  hideInfoDisplay(false);
}

var indexMovesToRestoreFromTempMode = null;

function prepareForTempMode() {
  indexMovesToRestoreFromTempMode = indexPlay;
  moveSet.setTempMode(true);
   
  setTempMode();

  hideButtonsToPlay(true);
  hideInfoDisplay(true);
}

function hideButtonsToPlay(toBeHidden) {
  var buttons_to_play = document.getElementById("buttons_to_play");
  buttons_to_play.style.display = toBeHidden ? 'none' : 'inline';
}

function hideInfoDisplay(toBeHidden) {
  var info = document.getElementById("info");
  info.style.display = toBeHidden ? 'none' : 'block';
}

function putMovesToLast() {
  indexPlay = 0;
  playToLast();
}

function playNext() {
  if (indexPlay >= moveSet.moves.length) {
    indexPlay = moveSet.moves.length;
    return false;
  }

  var strMove = moveSet.moves[indexPlay++];
  putMove(strMove);
  setTurn(getOpponent(getColorOfStone(strMove)));
  updateNumMoves(indexPlay);

  return true;
}

function playPrev() {
  if (indexPlay <= 0) {
    indexPlay = 0;
    return false;
  }

  var strMove = moveSet.moves[--indexPlay];
  removeMove(strMove);
  setTurn(getColorOfStone(strMove));
  updateNumMoves(indexPlay);

  return true;
}

function playToLast() {
  while (playNext()) {}
}

function playToFirst() {
  while (playPrev()) {}
}

function playToNextOf(step) {
  for (i = 0; i < step && playNext(); i++) {}
}

function playToPrevOf(step) {
  for (i = 0; i < step && playPrev(); i++) {}
}

function goToMove() {
  var num_move_to_go = parseInt(document.getElementById("num_move_to_go").value);
  goToMoveNumberOf(num_move_to_go);
}

function goToMoveNumberOf(numMove) {
  clearBoard();
  putInits();

  indexPlay = 0;
  for (i = 0; i < numMove; i++) {
    playNext();
  }
}

