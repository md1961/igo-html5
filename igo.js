window.onload = function() {
  var boardColor = DEFAULT_BOARD_COLOR;
  if (getQueryString() == 'real_color') {
    boardColor = REAL_BOARD_COLOR;
  }

  board.initialize("main_board", boardColor);
  isBoardInitialized = true;
};

function getQueryString() {
  if (document.location.search.length <= 1) {
    return null;
  }
  return document.location.search.substring(1);
}


const NONE  = 'NONE';
const BLACK = 'BLACK';
const WHITE = 'WHITE';
const STONES = [NONE, BLACK, WHITE];


const RADIO_MODE_INIT_ID  = "radio_mode_init";
const RADIO_MODE_TURN_ID  = "radio_mode_turn";
const RADIO_MODE_PLAY_ID  = "radio_mode_play";
const RADIO_MODE_TEMP_ID  = "radio_mode_temp";
const RADIO_TURN_BLACK_ID = "radio_turn_black";
const RADIO_TURN_WHITE_ID = "radio_turn_white";

const DEFAULT_BOARD_COLOR = '#fff';
const REAL_BOARD_COLOR    = '#fb0';

const KEY_FOR_DATA_IN_LOCAL_STORAGE = 'igoHtml5_keyForData';


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

function adjacentCoordsInArray(x, y) {
  return [
    [x - 1, y    ],
    [x    , y - 1],
    [x + 1, y    ],
    [x    , y + 1]
  ];
}


var moveBook = new MoveBook();
var moveSet;
var board = new Board();
var isBoardInitialized = false;


function newMoveSet() {
  moveSet = moveBook.add(new MoveSet());
  if (isBoardInitialized) {
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
    board.setStoneByMove(move);
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
  board.clear();
  board.clearComment();
  putInits();
  putMovesToLast();

  setTurnMode();
  setTurn(moveSet.nextTurn());

  displayMoveSet();
  enableRadioToInitMode(false);
}

function readDataFromLocalStorage() {
  if (isLocalStorageAvailable()) {
    var moveDisplay = document.getElementById("moves_display");
    var data = localStorage.getItem(KEY_FOR_DATA_IN_LOCAL_STORAGE);
    if (data === null || ! confirm("いま表示されているデータを上書きしていいですか？")) {
      return;
    }

    moveDisplay.value = data;
    readDataIntoMoveBook();

    moveSet = moveBook.prev();
    updateBoardByMoveSet();
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


function Board() {

  this.boardDimension = {
    margin:    10,
    gridPitch: 24,  // recommended to be an even number
    numGrids:  19,
    stoneDiameterShrinkage: 1.5,
    starDiameter:           2.0,
  };

  this.RGB_BLACK = 'rgb(0, 0, 0)';
  this.RGB_WHITE = 'rgb(255, 255, 255)';
  this.OUT_OF_BOUNDS = 'out_of_bounds';
  this.ATTR_MARKED = 'marked';

  this.initialize = function(tableId, boardColor) {
    var dim = this.boardDimension;
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

        canvas.id = this.getCanvasId(x, y);
        canvas.setAttribute('x_coord', x);
        canvas.setAttribute('y_coord', y);
        canvas.width  = dim.gridPitch;
        canvas.height = dim.gridPitch;
        canvas.style.backgroundColor = boardColor;
        canvas.onclick = gridClickHandler;
      }
    }
    this.clear();
  };

  this.clear = function() {
    var dim = this.boardDimension;
    for (var y = 1; y <= dim.numGrids; y++) {
      for (var x = 1; x <= dim.numGrids; x++) {
        this.drawStone(x, y, NONE);
        this.updateCanvasDisplay(x, y);
      }
    }

    document.getElementById("title").innerText = null;
    document.getElementById("moves_display").value = null;
    updateNumMovesDisplay(0);
  };

  this.drawStone = function(x, y, stone) {
    if (STONES.indexOf(stone) < 0) {
      throw "drawStone(): Argument stone must be NONE, BLACK or WHITE";
    }
    var canvas = this.getCanvas(x, y);
    canvas.class = stone;
  };

  this.setStoneByMove = function(move) {
    var stone   = move[0];
    var x       = move[1];
    var y       = move[2];
    var comment = move[4];
    this.drawStone(x, y, stone);
    this.displayComment(comment);
    this.updateCanvasDisplay(x, y);
  };

  this.removeStoneByMove = function(move) {
    var x = move[1];
    var y = move[2];
    this.drawStone(x, y, NONE);
    this.updateCanvasDisplay(x, y);
  };

  this.takeStones = function() {
    var dim = this.boardDimension;
    var stonesTaken = [];
    for (var y = 1; y <= dim.numGrids; y++) {
      for (var x = 1; x <= dim.numGrids; x++) {
        if (this.isMarked(x, y)) {
          var stone = this.getStone(x, y);
          this.drawStone(x, y, NONE);
          stonesTaken.push(stringifyMove(stone, x, y));
          //TODO: Count up taken stones

          this.updateCanvasDisplay(x, y);
        }
      }
    }
    return stonesTaken;
  };

  this.removeMove = function(strMove) {
    var moveWithTakens = parseMove(strMove);
    var move = moveWithTakens.splice(0, 3);
    this.removeStoneByMove(move);

    var movesTaken = moveWithTakens[0];
    for (var i = 0; i < movesTaken.length; i++) {
      var moveTaken = movesTaken[i];
      this.setStoneByMove(moveTaken);
    }
  };

  this.putMove = function(strMove) {
    var moveWithTakens = parseMove(strMove);
    var move = moveWithTakens.splice(0, 3);
    this.setStoneByMove(move);

    var movesTaken = moveWithTakens[0];
    for (var i = 0; i < movesTaken.length; i++) {
      var moveTaken = movesTaken[i];
      this.removeStoneByMove(moveTaken);
    }

    var comment = moveWithTakens[1];
    this.displayComment(comment);
  };

  this.clearComment = function() {
    this.displayComment(null);
  };

  this.displayComment = function(_comment) {
    var comment = document.getElementById("comment");
    comment.innerText = _comment === undefined ? null : _comment;
  };

  this.getCanvasId = function(x, y) {
    return 'g' + KumaUtil.zeroLeftPad(x, 2) + KumaUtil.zeroLeftPad(y, 2);
  };

  this.getCanvas = function(x, y) {
    return document.getElementById(this.getCanvasId(x, y));
  };

  this.getStone = function(x, y) {
    var dim = this.boardDimension;

    if (x < 1 || x > dim.numGrids || y < 1 || y > dim.numGrids) {
      return this.OUT_OF_BOUNDS;
    }
    return this.getCanvas(x, y).class;
  };

  this.isTop = function(x, y) {
    return y == 1;
  };

  this.isBottom = function(x, y) {
    return y == this.boardDimension.numGrids;
  };

  this.isLeftmost = function(x, y) {
    return x == 1;
  };

  this.isRightmost = function(x, y) {
    return x == this.boardDimension.numGrids;
  };

  const STAR_COORDS = [4, 10, 16];

  this.isStar = function(x, y) {
    if (this.boardDimension.numGrids == 19) {
      if (STAR_COORDS.indexOf(x) >= 0 && STAR_COORDS.indexOf(y) >= 0) {
        return true;
      }
    }
  };

  this.checkIfStoneTaken = function(x, y, currentTurn) {
    var stone = this.getStone(x, y);
    var opponent = getOpponent(currentTurn);
    if (stone != opponent) {
      return [];
    }

    var stonesTaken = [];
    if (this.isDead(x, y)) {
      stonesTaken = this.takeStones();
    }
    this.unmarkAllStones();

    return stonesTaken;
  };

  this.isDead = function(x, y) {
    this.markStone(x, y);
    var stoneToBeTaken = this.getStone(x, y);
    var adjs = adjacentCoordsInArray(x, y);
    for (var i = 0; i < adjs.length; i++) {
      var xAdj = adjs[i][0];
      var yAdj = adjs[i][1];
      var stoneAdj = this.getStone(xAdj, yAdj);
      if (stoneAdj == NONE) {
        return false;
      } else if (stoneAdj == stoneToBeTaken) {
        if (! this.isMarked(xAdj, yAdj) && ! this.isDead(xAdj, yAdj)) {
          return false;
        }
      }
    }

    return true;
  };

  this.isMarked = function(x, y) {
    return this.getCanvas(x, y).hasAttribute(this.ATTR_MARKED);
  };

  this.markStone = function(x, y) {
    this.getCanvas(x, y).setAttribute(this.ATTR_MARKED, this.ATTR_MARKED);
  };

  this.unmarkStone = function(x, y) {
    this.getCanvas(x, y).removeAttribute(this.ATTR_MARKED);
  };

  this.unmarkAllStones = function() {
    var dim = this.boardDimension;

    for (var y = 1; y <= dim.numGrids; y++) {
      for (var x = 1; x <= dim.numGrids; x++) {
        this.unmarkStone(x, y);
      }
    }
  };

  this.updateCanvasDisplay = function(x, y) {
    var dim = this.boardDimension;

    var start = 0 + 0.5;
    var end = dim.gridPitch + 0.5;
    var mid = Math.floor(dim.gridPitch / 2) + 0.5;

    var cxt = CanvasUtil.getCanvasContext(this.getCanvasId(x, y));

    cxt.fillStyle = this.RGB_WHITE;
    cxt.clearRect(start, start, end, end);
    cxt.beginPath();

    // horizontal line
    var x0 = this.isLeftmost(x, y)  ? mid : start;
    var x1 = this.isRightmost(x, y) ? mid : end;
    cxt.moveTo(x0, mid);
    cxt.lineTo(x1, mid);
    // vertical line
    var y0 = this.isTop(x, y)    ? mid : start;
    var y1 = this.isBottom(x, y) ? mid : end;
    cxt.moveTo(mid, y0);
    cxt.lineTo(mid, y1);

    cxt.closePath();
    cxt.stroke();

    var stone = this.getStone(x, y);
    if (stone == WHITE || stone == BLACK) {
      cxt.beginPath();
      cxt.arc(mid, mid, mid - dim.stoneDiameterShrinkage, 0, Math.PI * 2);
      cxt.fillStyle = stone == BLACK ? this.RGB_BLACK : this.RGB_WHITE;
      cxt.fill();
      cxt.closePath();
    } else if (this.isStar(x, y)) {
      cxt.beginPath();
      cxt.arc(mid, mid, dim.starDiameter, 0, Math.PI * 2);
      cxt.fillStyle = this.RGB_BLACK;
      cxt.fill();
      cxt.closePath();
    }

    cxt.stroke();
  };
}



function clearAll() {
  moveSet.clear();
  setTurnMode();
  setTurn(BLACK);

  board.clear();
  board.clearComment();
  enableRadioToInitMode(true);
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
    var stone = KumaUtil.nextInArray(board.getStone(x, y), turnCycle);
    board.drawStone(x, y, stone);
    moveSet.writeInits(stone, x, y);
  } else if (board.getStone(x, y) == NONE) {
    var currentTurn = getCurrentTurn();
    board.drawStone(x, y, currentTurn);

    var stonesTaken = [];
    var adjs = adjacentCoordsInArray(x, y);
    for (var i = 0; i < adjs.length; i++) {
      var xAdj = adjs[i][0];
      var yAdj = adjs[i][1];
      var stonesTakenHere = board.checkIfStoneTaken(xAdj, yAdj, currentTurn);
      stonesTaken = stonesTaken.concat(stonesTakenHere);
    }

    moveSet.writeMoves(currentTurn, x, y, stonesTaken);
    toggleTurn();
    board.clearComment();

    enableRadioToInitMode(false);
  }

  board.updateCanvasDisplay(x, y);
  updateNumMovesDisplay(moveSet.length());
  displayMoveSet();
}

function enableRadioToInitMode(toBeEnabled) {
  var radioToInit = document.getElementById("radio_mode_init_with_label");
  radioToInit.style.display = toBeEnabled ? 'inline' : 'none';
}

function removeLastMove() {
  var moveToRemove = moveSet.popLastMove();
  if (moveToRemove === null) {
    return;
  }

  board.removeMove(moveToRemove);

  toggleTurn();

  updateNumMovesDisplay(moveSet.length());
  displayMoveSet();
}

function updateNumMovesDisplay(numMoves) {
  if (isTempMode()) {
    return;
  }

  var totalMoves = 0;
  if (moveSet !== null) {
    totalMoves = moveSet.length();
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
  var title_input = document.getElementById("title_input");
  title_input.value = document.getElementById("title").innerText;
  title_input.focus();
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
  var comment_input = document.getElementById("comment_input");
  comment_input.value = document.getElementById("comment").innerText;
  comment_input.focus();
}

function inputComment() {
  document.getElementById("comment_input_holder").style.display = 'none';
  document.getElementById("comment_holder"      ).style.display = 'inline';
  document.getElementById("comment").innerText = document.getElementById("comment_input").value;

  var comment = document.getElementById("comment_input");
  var index = isTurnMode() ? -1 : moveSet.indexPlay - 1;
  moveSet.addComment(comment.value, index);

  displayMoveSet();
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

function radioModeHandler(radioMode) {
  if (isPlayMode()) {
    prepareForPlayMode();
  } else if (isTurnMode()) {
    prepareForTurnMode();
  } else if (isTempMode()) {
    prepareForTempMode();
  }
}

const VALUE_TRUNK_OF_BRANCH_SELECT = 'trunk';

function branchSelectChangeHandler(branch_select) {
  if (branch_select.value == VALUE_TRUNK_OF_BRANCH_SELECT) {
    moveSet.backToTrunk();
    for (var strMove of moveSet.strMovesToRewind().reverse()) {
      board.removeMove(strMove);
    }
    updateBranchSelectDisplay();
    board.displayComment(moveSet.getCurrentComment());
  } else {
    var numBranch = parseInt(branch_select.value);
    moveSet.branchTo(numBranch);
    branch_select = replaceBranchSelect([['変化' + numBranch, numBranch]]);
    branch_select.value = numBranch;
  }
  updateNumMovesDisplay(moveSet.indexPlay);
}

function updateBranchSelectDisplay() {
  if (moveSet.onBranch) {
    return;
  }
  var options = moveSet.branches().map(function(branch, index) {
    return ['変化' + index, index];
  });
  var branch_select = replaceBranchSelect(options);
  branch_select.style.display = moveSet.branches().length === 0 ? 'none' : 'inline';
}

function replaceBranchSelect(options) {
  var branch_select = document.getElementById("branch_select");
  removeAllChildren(branch_select);
  branch_select.appendChild(createOption('本譜', VALUE_TRUNK_OF_BRANCH_SELECT));
  for (var label_and_value of options) {
    var label = label_and_value[0];
    var value = label_and_value[1];
    branch_select.appendChild(createOption(label, value));
  }
  return branch_select;
}

function createOption(label, value) {
  var option = document.createElement('option');
  option.setAttribute('value', value);
  option.innerText = label;
  return option;
}

function removeAllChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function prepareForPlayMode() {
  board.clear();
  board.clearComment();
  putInits();
  setPlayMode();

  var indexPlayToRestore = moveSet.prepareForPlayMode();
  if (indexPlayToRestore !== null) {
    playToNextOf(indexPlayToRestore);
  }

  setTurn(moveSet.nextTurn());
  updateBranchSelectDisplay();
  updateNumMovesDisplay(moveSet.indexPlay);

  showButtonsToPlay(true);
  showInfoDisplay(true);
}

function prepareForTurnMode() {
  moveSet.setTempMode(false);

  board.clear();
  putInits();
  putMovesToLast();

  setTurnMode();
  setTurn(moveSet.nextTurn());

  displayMoveSet();
  showButtonsToPlay(false);
  showInfoDisplay(true);
}

function prepareForTempMode() {
  moveSet.setTempMode(true);
   
  setTempMode();

  showButtonsToPlay(false);
  showInfoDisplay(false);
}

function showButtonsToPlay(toBeShown) {
  var buttons_to_play = document.getElementById("buttons_to_play");
  buttons_to_play.style.display = toBeShown ? 'inline' : 'none';
}

function showInfoDisplay(toBeShown) {
  var info = document.getElementById("info");
  info.style.display = toBeShown ? 'block' : 'none';
}

function putMovesToLast() {
  moveSet.prepareForPlayMode();
  playToLast();
}

function playNext() {
  var strMove = moveSet.playNext();
  if (strMove === null) {
    return false;
  }
  board.putMove(strMove);
  //TODO: Should be moveSet.nextTurn() ?
  setTurn(getOpponent(getColorOfStone(strMove)));
  updateBranchSelectDisplay();
  updateNumMovesDisplay(moveSet.indexPlay);
  return true;
}

function playPrev() {
  var strMove = moveSet.playPrev();
  if (strMove === null) {
    return false;
  }
  board.removeMove(strMove);
  setTurn(getColorOfStone(strMove));
  board.displayComment(moveSet.getCurrentComment());
  updateBranchSelectDisplay();
  updateNumMovesDisplay(moveSet.indexPlay);
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

function playToNextJunction() {
  playToNextOf(moveSet.offsetToNextJunction());
}

function playToPrevJunction() {
  playToPrevOf(moveSet.offsetToPrevJunction());
}

function goToMove() {
  var numMoveToGo = parseInt(document.getElementById("num_move_to_go").value);
  board.clear();
  putInits();
  moveSet.prepareForPlayMode();
  playToNextOf(numMoveToGo);
}

