window.onload = function() {
  var boardColor = DEFAULT_BOARD_COLOR;
  if (getQueryString() == 'real_color') {
    boardColor = REAL_BOARD_COLOR;
  }

  initializeBoard("main_board", boardColor);
  is_board_initialized = true;
};

function getQueryString() {
  if (document.location.search.length <= 1) {
    return null;
  }
  return document.location.search.substring(1);
}


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

const NONE  = 'NONE';
const BLACK = 'BLACK';
const WHITE = 'WHITE';
const STONES = [NONE, BLACK, WHITE];
const OUT_OF_BOUNDS = 'out_of_bounds';

const DEFAULT_BOARD_COLOR = '#fff';
const REAL_BOARD_COLOR    = '#fb0';
const RGB_BLACK = 'rgb(0, 0, 0)';
const RGB_WHITE = 'rgb(255, 255, 255)';

const KEY_FOR_DATA_IN_LOCAL_STORAGE = 'igoHtml5_keyForData';


function MoveBook() {
  this.moveSets = [];
  this.cursor = null;
  this.usesSGF = true;

  this.add = function(moveSet) {
    this.moveSets.push(moveSet);
    this.cursor = this.moveSets.length - 1;
    return this.current();
  };

  this.current = function() {
    if (this.cursor === null) {
      return null;
    }
    return this.moveSets[this.cursor];
  };

  this.prev = function() {
    return this.changeSet(-1);
  };

  this.next = function() {
    return this.changeSet(1);
  };

  this.changeSet = function(step) {
    if (this.moveSets.length === 0) {
      return null;
    } else if (this.cursor === null) {
      this.cursor = 0;
    } else {
      this.cursor += step;
    }
    if (this.cursor >= this.moveSets.length) {
      this.cursor = 0;
    } else if (this.cursor < 0) {
      this.cursor = this.moveSets.length - 1;
    }
    var nextSet = this.moveSets[this.cursor];
    return nextSet;
  };

  this.setNumber = function() {
    return '[' + (this.cursor + 1) + '/' + this.moveSets.length + ']';
  };

  this.readDataInJson = function(json) {
    var arrayOfHash = JSON.parse(json);
    if (! Array.isArray(arrayOfHash)) {
      arrayOfHash = [arrayOfHash];
    }
    this.moveSets = [];
    for (var hash of arrayOfHash) {
      var _moveSet = new MoveSet();
      _moveSet.readDataInHash(hash);
      this.add(_moveSet);
    }
    this.cursor = 0;
  };

  this.toJson = function() {
    var arrayOfHash = this.moveSets.map(function(moveSet) {
      return moveSet.toHash();
    });
    return JSON.stringify(arrayOfHash);
  };
}

function MoveSet() {

  this.clear = function() {
    this.title = "";
    this.inits = [];
    this.moves = [];
  };

  this.clear();
  this.isTempMode = false;
  this.tempMoves = [];

  this.writeInits = function(stone, x, y) {
    var init = stringifyMove(stone, x, y);
    this.inits = this.inits.filter(function(element, i, a) {
      return element.substr(1, 4) != init.substr(1, 4);
    });
    this.inits.push(init);
  };

  this.writeMoves = function(stone, x, y, stonesTaken) {
    var move = stringifyMove(stone, x, y);
    if (stonesTaken.length > 0) {
      move += '(' + stonesTaken.join(',') + ')';
    }
    var moves = this.isTempMode ? this.tempMoves : this.moves;
    moves.push(move);
  };

  this.popLastMove = function() {
    var moves = this.isTempMode ? this.tempMoves : this.moves;
    if (moves.length === 0) {
      return null;
    }
    return moves.pop();
  };

  this.DEFAULT_NEXT_TURN = BLACK;

  this.nextTurn = function() {
    if (this.moves.length === 0) {
      return this.DEFAULT_NEXT_TURN;
    }
    var lastStrMove = this.moves[this.moves.length - 1];
    switch (lastStrMove[0].toUpperCase()) {
      case  NONE[0]: return null;
      case BLACK[0]: return WHITE;
      case WHITE[0]: return BLACK;
      default : throw "Illegal stringified move '" + lastStrMove +"'";
    }
  };

  this.setTempMode = function(isTempMode) {
    this.isTempMode = isTempMode;
    if (isTempMode) {
      this.tempMoves = [];
    } else if (this.tempMoves.length > 0) {
      alert(this.tempMoves);
      this.tempMoves = [];
    }
  };

  this.addComment = function(comment, index) {
    if (index < 0 || index >= this.moves.length) {
      index = this.moves.length - 1;
    }

    var move = this.moves[index];
    move = move.replace(/\[[^\]]*\]/, '');
    move += '[' + comment + ']';
    this.moves[index] = move;
  };

  this.getComment = function(index) {
    if (index < 0) {
      return null;
    } else if (index >= this.moves.length) {
      index = this.moves.length - 1;
    }

    var move = this.moves[index];
    return parseMove(move)[4];
  };

  this.readDataInHash = function(hash) {
    this.title = hash.title;
    this.inits = hash.inits;
    this.moves = hash.moves;
  };

  this.readDataInJson = function(json) {
    var hash = JSON.parse(json);
    this.readDataInHash(hash);
  };

  this.toHash = function() {
    return {
      "title": this.title,
      "inits": this.inits,
      "moves": this.moves
    };
  };

  this.toJson = function() {
    return JSON.stringify(this.toHash());
  };
}


var moveBook = new MoveBook();
var moveSet;
var is_board_initialized = false;


function newMoveSet() {
  moveSet = moveBook.add(new MoveSet());
  if (is_board_initialized) {
    clearAll();
  }
}


newMoveSet();


function prevMoveSet() {
  moveSet = moveBook.prev();
  updateBoardByMoveSet();
}

function nextMoveSet() {
  moveSet = moveBook.next();
  updateBoardByMoveSet();
}


function convertToSGF() {
  var movesDisplay = document.getElementById("moves_display");
  movesDisplay.value = movesDisplay.value.replace(/([BW])(\d{2})(\d{2})/gi, function(m, p1, p2, p3) {
    var x = coordToChar(parseInt(p2));
    var y = coordToChar(parseInt(p3));
    return p1.toUpperCase() + x + y;
  });
}

function coordToChar(x) {
  return String.fromCharCode('a'.charCodeAt(0) + x - 1);
}

function charToCoord(c) {
  return c.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
}

// "bpd" あるいは "b1604" などの文字列に変換
function stringifyMove(stone, x, y) {
  if (moveBook.usesSGF) {
    return stone[0] + coordToChar(x) + coordToChar(y);
  }
  return stone[0] + KumaUtil.zeroLeftPad(x, 2) + KumaUtil.zeroLeftPad(y, 2);
}

const RE_MOVE_FORMAT_ORIGINAL =   /^([NBWnbw]\d{2,})(?:\(([\w,]+)\))?(?:\[([^\]]*)\])?$/;
const RE_MOVE_FORMAT_SGF      = /^([NBWnbw][a-s]{2})(?:\(([\w,]+)\))?(?:\[([^\]]*)\])?$/;

// (BLACK, 16, 4 [, ((WHITE, 17, 4), ...)]) などの配列に変換
// 第四要素は取られた石の配列
function parseMove(stringifiedMove) {
  var m  = stringifiedMove.match(RE_MOVE_FORMAT_SGF);
  var m2 = stringifiedMove.match(RE_MOVE_FORMAT_ORIGINAL);
  if (! m && ! m2) {
    throw "Illegal stringified move '" + stringifiedMove + "'";
  }
  var usesSGF = m;
  if (m2) {
    m = m2;
  }
  var strMove        = m[1];
  var strStonesTaken = m[2];
  var comment        = m[3];

  var stone = getColorOfStone(strMove);
  var x, y;
  if (usesSGF) {
    x = charToCoord(strMove[1]);
    y = charToCoord(strMove[2]);
  } else {
    x = parseInt(strMove.substr(1, 2));
    y = parseInt(strMove.substr(3, 2));
  }

  var arrayOfStonesTaken = [];
  if (strStonesTaken) {
    var arrayOfStrStoneTaken = strStonesTaken.split(',');
    arrayOfStonesTaken = arrayOfStrStoneTaken.map(parseMove);
  }

  return [stone, x, y, arrayOfStonesTaken, comment];
}

function getColorOfStone(strMove) {
  switch (strMove[0].toUpperCase()) {
    case  NONE[0]: return  NONE;
    case BLACK[0]: return BLACK;
    case WHITE[0]: return WHITE;
    default : throw "Illegal stringified move '" + strMove +"'";
  }
}

function putInits() {
  saveMode();

  setInitMode();
  displayTitle();

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

function readDataIntoMoveBook() {
  var moveDisplay = document.getElementById("moves_display");
  moveBook = new MoveBook();
  moveBook.readDataInJson(moveDisplay.value);

  moveSet = moveBook.current();
  updateBoardByMoveSet();
}

function updateBoardByMoveSet() {
  clearBoard();
  putInits();
  putMovesToLast();

  setTurnMode();
  setTurn(moveSet.nextTurn());

  displayMoveSet();
  disableRadioToInitMode(true);
}

function readDataFromLocalStorage() {
  if (isLocalStorageAvailable()) {
    var moveDisplay = document.getElementById("moves_display");
    var data = localStorage.getItem(KEY_FOR_DATA_IN_LOCAL_STORAGE);

    moveDisplay.value = data;
    readDataIntoMoveBook();
  }
}

function writeDataToLocalStorage() {
  if (isLocalStorageAvailable()) {
    var data = localStorage.getItem(KEY_FOR_DATA_IN_LOCAL_STORAGE);
    if (data !== null && ! confirm("いま保存されているデータを上書きしていいですか？")) {
      return;
    }

    localStorage.setItem(KEY_FOR_DATA_IN_LOCAL_STORAGE, moveBook.toJson());
  }
}

function isLocalStorageAvailable() {
  return (typeof localStorage !== 'undefined');
}

function initializeBoard(tableId, boardColor) {
  var dim = boardDimension;

  var table = document.getElementById(tableId);
  table.style.backgroundColor = boardColor;
  for (var y = 1; y <= dim.numGrids; y++) {
    var row = document.createElement('tr');
    table.appendChild(row);
    for (var x = 1; x <= dim.numGrids; x++) {
      var cell = document.createElement('td');
      row.appendChild(cell);
      var canvas = document.createElement('canvas');
      cell.appendChild(canvas);

      canvas.id = getCanvasId(x, y);
      canvas.setAttribute('x_coord', x);
      canvas.setAttribute('y_coord', y);
      canvas.width  = dim.gridPitch;
      canvas.height = dim.gridPitch;
      canvas.style.backgroundColor = boardColor;
      canvas.onclick = gridClickHandler;
    }
  }

  clearBoard();
}

function clearBoard() {
  var dim = boardDimension;

  for (var y = 1; y <= dim.numGrids; y++) {
    for (var x = 1; x <= dim.numGrids; x++) {
      drawStone(x, y, NONE);
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
  if (isPlayMode()) {
    return;
  }

  var x = parseInt(this.getAttribute('x_coord'));
  var y = parseInt(this.getAttribute('y_coord'));
  putStone(x, y);
}

function putStone(x, y) {
  if (isInitMode()) {
    var turnCycle = isBlackTurn() ? [NONE, BLACK, WHITE] : [NONE, WHITE, BLACK];
    var stone = KumaUtil.nextInArray(getStone(x, y), turnCycle);
    drawStone(x, y, stone);
    moveSet.writeInits(stone, x, y);
  } else if (getStone(x, y) == NONE) {
    var currentTurn = getCurrentTurn();
    drawStone(x, y, currentTurn);

    var stonesTaken = [];
    var adjs = adjacentCoordsInArray(x, y);
    for (var i = 0; i < adjs.length; i++) {
      var xAdj = adjs[i][0];
      var yAdj = adjs[i][1];
      var stonesTakenHere = checkIfStoneTaken(xAdj, yAdj, currentTurn);
      stonesTaken = stonesTaken.concat(stonesTakenHere);
    }

    moveSet.writeMoves(currentTurn, x, y, stonesTaken);
    toggleTurn();
    clearComment();

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
  var moveToRemove = moveSet.popLastMove();
  if (moveToRemove === null) {
    return;
  }

  removeMove(moveToRemove);

  toggleTurn();

  updateNumMoves(moveSet.moves.length);
  displayMoveSet();
}

function removeMove(strMove) {
  var moveWithTakens = parseMove(strMove);
  var move = moveWithTakens.splice(0, 3);
  removeStoneByMove(move);

  var movesTaken = moveWithTakens[0];
  for (var i = 0; i < movesTaken.length; i++) {
    var moveTaken = movesTaken[i];
    setStoneByMove(moveTaken);
  }
}

function putMove(strMove) {
  var moveWithTakens = parseMove(strMove);
  var move = moveWithTakens.splice(0, 3);
  setStoneByMove(move);

  var movesTaken = moveWithTakens[0];
  for (var i = 0; i < movesTaken.length; i++) {
    var moveTaken = movesTaken[i];
    removeStoneByMove(moveTaken);
  }

  var comment = moveWithTakens[1];
  displayComment(comment);
}

function setStoneByMove(move) {
  var stone   = move[0];
  var x       = move[1];
  var y       = move[2];
  var comment = move[4];
  drawStone(x, y, stone);
  displayComment(comment);
  updateCanvasDisplay(x, y);
}

function removeStoneByMove(move) {
  var x = move[1];
  var y = move[2];
  drawStone(x, y, NONE);
  updateCanvasDisplay(x, y);
}

function updateNumMoves(numMoves) {
  if (isTempMode()) {
    return;
  }

  var totalMoves = 0;
  if (moveSet !== null) {
    totalMoves = moveSet.moves.length;
  }

  document.getElementById("numMoves").innerText = numMoves + "手目 / 全" + totalMoves + "手";
}

function displayTitle() {
  document.getElementById("set_num").innerText = moveBook.setNumber();
  document.getElementById("title"  ).innerText = moveSet.title;
}

function displayMoveSet() {
  var moveDisplay = document.getElementById("moves_display");
  moveDisplay.value = moveBook.toJson();
}

function showTitleInput() {
  document.getElementById("title_holder"      ).style.display = 'none';
  document.getElementById("title_input_holder").style.display = 'inline';
  document.getElementById("title_input").value = document.getElementById("title").innerText;
}

function inputTitle() {
  document.getElementById("title_input_holder").style.display = 'none';
  document.getElementById("title_holder"      ).style.display = 'inline';
  var title = document.getElementById("title_input").value;
  document.getElementById("title").innerText = title;
  moveSet.title = title;
}

function showCommentInput() {
  document.getElementById("comment_holder"      ).style.display = 'none';
  document.getElementById("comment_input_holder").style.display = 'inline';
  document.getElementById("comment_input").value = document.getElementById("comment").innerText;
}

function inputComment() {
  document.getElementById("comment_input_holder").style.display = 'none';
  document.getElementById("comment_holder"      ).style.display = 'inline';
  document.getElementById("comment").innerText = document.getElementById("comment_input").value;

  var comment = document.getElementById("comment_input");
  var index = isTurnMode() ? -1 : indexPlay - 1;
  moveSet.addComment(comment.value, index);

  displayMoveSet();
}

function clearComment() {
  displayComment(null);
}

function displayComment(_comment) {
  var comment = document.getElementById("comment");
  comment.innerText = _comment === undefined ? null : _comment;
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
    return [];
  }

  var stonesTaken = [];
  if (isDead(x, y)) {
    stonesTaken = takeStones();
  }
  unmarkAllStones();

  return stonesTaken;
}

function takeStones() {
  var dim = boardDimension;

  var stonesTaken = [];
  for (var y = 1; y <= dim.numGrids; y++) {
    for (var x = 1; x <= dim.numGrids; x++) {
      if (isMarked(x, y)) {
        var stone = getStone(x, y);
        drawStone(x, y, NONE);
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
  getCanvas(x, y).setAttribute(ATTR_MARKED, ATTR_MARKED);
}

function unmarkStone(x, y) {
  getCanvas(x, y).removeAttribute(ATTR_MARKED);
}

function unmarkAllStones() {
  var dim = boardDimension;

  for (var y = 1; y <= dim.numGrids; y++) {
    for (var x = 1; x <= dim.numGrids; x++) {
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
    case WHITE:
      return BLACK;
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

function drawStone(x, y, stone) {
  if (STONES.indexOf(stone) < 0) {
    throw "drawStone(): Argument stone must be NONE, BLACK or WHITE";
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
  moveSet.setTempMode(false);

  clearBoard();
  clearComment();
  putInits();
  setPlayMode();

  indexPlay = 0;
  if (indexMovesToRestoreFromTempMode !== null) {
    goToMoveNumberOf(indexMovesToRestoreFromTempMode);
    indexMovesToRestoreFromTempMode = null;
  }
  var nextTurn;
  if (moveSet.moves.length === 0) {
    nextTurn = moveSet.DEFAULT_NEXT_TURN;
  } else if (indexPlay < moveSet.moves.length) {
    nextTurn = getColorOfStone(moveSet.moves[indexPlay]);
  } else {
    nextTurn = getOpponent(getColorOfStone(moveSet.moves[indexPlay - 1]));
  }
  setTurn(nextTurn);
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

  indexPlay--;
  var strMove = moveSet.moves[indexPlay];
  var comment = moveSet.getComment(indexPlay - 1);
  removeMove(strMove);
  setTurn(getColorOfStone(strMove));
  displayComment(comment);
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
  for (var i = 0; i < step && playNext(); i++) {}
}

function playToPrevOf(step) {
  for (var i = 0; i < step && playPrev(); i++) {}
}

function goToMove() {
  var num_move_to_go = parseInt(document.getElementById("num_move_to_go").value);
  goToMoveNumberOf(num_move_to_go);
}

function goToMoveNumberOf(numMove) {
  clearBoard();
  putInits();

  indexPlay = 0;
  for (var i = 0; i < numMove; i++) {
    playNext();
  }
}

