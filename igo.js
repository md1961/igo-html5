document.addEventListener('DOMContentLoaded', function() {
  var boardColor = DEFAULT_BOARD_COLOR;
  if (getQueryString() == 'real_color') {
    boardColor = REAL_BOARD_COLOR;
  }

  board.initialize("main_board", boardColor);
  isBoardInitialized = true;

  database = new Database();
  if (!database.enabled) {
    document.getElementById('button_to_read_data_from_firebase').style.display = 'none';
    document.getElementById('button_to_write_data_to_firebase' ).style.display = 'none';
  }
});

var database;

function writeDataToFirebase() {
  database.writeMoveBook(moveBook.toHash());
}

function readDataFromFirebase(key) {
  if (! confirm("いま表示されているデータを上書きしていいですか？")) {
    return;
  }
  var moveDisplay = document.getElementById("moves_display");
  database.promiseToReadMoveBook(key).then(function(objMoveBook) {
    moveDisplay.value = JSON.stringify(objMoveBook);
    readDataIntoMoveBook(key);
  }).catch(function(reason) {
    alert('Failed to read from Firebase: ' + reason);
  });
}

function showMoveBookNamesFromFirebase() {
  database.promiseToReadMoveBookHeaders().then(function(headers) {
    var keys = Object.keys(headers);
    var names = Object.values(headers).map(function(obj) { return obj.name; });
    var hashNamesWithDbKeys = {};
    for (var i = 0; i < names.length; i++) {
      hashNamesWithDbKeys[names[i]] = keys[i];
    }
    hashNamesWithDbKeys['キャンセル'] = '';

    var ulNames = document.getElementById('move_book_name_list');
    HtmlUtil.removeAllChildren(ulNames);
    for (var name of Object.keys(hashNamesWithDbKeys)) {
      var key = hashNamesWithDbKeys[name];
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.setAttribute('href', "javascript: selectMoveBookByName('" + key + "');");
      a.textContent = name;
      li.appendChild(a);
      ulNames.appendChild(li);
    }
    ulNames.style.display = 'block';
  }).catch(function(reason) {
    alert('Failed to read from Firebase: ' + reason);
  });
}

function selectMoveBookByName(key) {
  var ulNames = document.getElementById('move_book_name_list');
  ulNames.style.display = 'none';
  if (key === '') {
    return;
  }
  readDataFromFirebase(key);
}

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
    displayTitle();
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

//TODO: Use SGF-like format as default
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

function readDataIntoMoveBook(firebaseKey) {
  var moveDisplay = document.getElementById("moves_display");
  moveBook = new MoveBook();
  moveBook.readDataInJson(moveDisplay.value, firebaseKey);
  document.getElementById("book_name").textContent = moveBook.name;

  moveSet = moveBook.prev();
  updateBoardByMoveSet();
}

function updateBoardByMoveSet() {
  board.clear();
  board.clearComment();
  putInits();

  setInitialMode();
  if (isTurnMode()) {
    putMovesToLast();
  }

  displayMoveSet();
  enableRadioToInitMode(false);
}

function setInitialMode() {
  var isReadOnly = moveSet.isReadOnly;
  checkIsReadOnly(isReadOnly);
  if (isReadOnly) {
    setPlayMode();
    prepareForPlayMode();
    moveSet.resetIndex();
  } else {
    setTurnMode();
    setTurn(moveSet.nextTurn());
  }
}

function readDataFromLocalStorage() {
  if (isLocalStorageAvailable()) {
    var data = localStorage.getItem(KEY_FOR_DATA_IN_LOCAL_STORAGE);
    if (data === null || ! confirm("いま表示されているデータを上書きしていいですか？")) {
      return;
    }

    var moveDisplay = document.getElementById("moves_display");
    moveDisplay.value = data;
    readDataIntoMoveBook(null);
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

function clearAll() {
  moveSet.clear();
  setTurnMode();
  setTurn(BLACK);

  board.clear();
  board.clearComment();
  enableRadioToInitMode(true);
  checkIsReadOnly(moveSet.isReadOnly);
}

function checkIsReadOnly(is_checked) {
  document.getElementById("is_read_only").checked = is_checked;
  document.getElementById("radio_mode_turn_with_label").style.display = is_checked ? 'none' : 'inline';
}

function isReadOnlyHandler(checkbox) {
  moveSet.isReadOnly = checkbox.checked;
  document.getElementById("radio_mode_turn_with_label").style.display = checkbox.checked ? 'none' : 'inline';
}

function gridClickHandler() {
  var x = parseInt(this.getAttribute('x_coord'));
  var y = parseInt(this.getAttribute('y_coord'));
  if (isPlayMode()) {
    if (isPlayingBlack() || isPlayingWhite()) {
      if (!isPlayingTurn() || isNextMoveAt(x, y)) {
        playNext();
      } else {
        alert('WRONG MOVE!');
      }
      return;
    } else if (! moveSet.isReadOnly) {
      return;
    } else {
      setTempMode();
      prepareForTempMode();
    }
  }
  putStone(x, y);
}

function isPlayingTurn() {
  return (isBlackTurn() && isPlayingBlack()) || (!isBlackTurn() && isPlayingWhite());
}

function isPlayingBlack() {
  return document.getElementById('plays_black').checked;
}

function isPlayingWhite() {
  return document.getElementById('plays_white').checked;
}

function isNextMoveAt(x, y) {
  var strMove = moveSet.nextMove();
  if (strMove === null) {
    return false;
  }
  var move = parseMove(strMove);
  return x == move[1] && y == move[2];
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
  if (! isTempMode()) {
    displayMoveSet();
  }
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

  document.getElementById("num_moves").textContent = numMoves + "手目 / 全" + totalMoves + "手";
}

function displayTitle() {
  document.getElementById("set_num").textContent = moveBook.setNumber();
  document.getElementById("title"  ).textContent = moveSet.title;
}

function displayMoveSet() {
  var moveDisplay = document.getElementById("moves_display");
  moveDisplay.value = moveBook.toJson();
}

function showBookNameInput() {
  document.getElementById("book_name_holder"      ).style.display = 'none';
  document.getElementById("book_name_input_holder").style.display = 'inline';
  var book_name_input = document.getElementById("book_name_input");
  book_name_input.value = document.getElementById("book_name").textContent;
  book_name_input.focus();
}

function inputBookName() {
  document.getElementById("book_name_input_holder").style.display = 'none';
  document.getElementById("book_name_holder"      ).style.display = 'inline';
  var book_name = document.getElementById("book_name_input").value;
  document.getElementById("book_name").textContent = book_name;
  moveBook.name = book_name;
}

function showTitleInput() {
  document.getElementById("title_holder"      ).style.display = 'none';
  document.getElementById("title_input_holder").style.display = 'inline';
  var title_input = document.getElementById("title_input");
  title_input.value = document.getElementById("title").textContent;
  title_input.focus();
}

function inputTitle() {
  document.getElementById("title_input_holder").style.display = 'none';
  document.getElementById("title_holder"      ).style.display = 'inline';
  var title = document.getElementById("title_input").value;
  document.getElementById("title").textContent = title;
  moveSet.title = title;
  displayMoveSet();
}

function showCommentInput() {
  document.getElementById("comment_holder"      ).style.display = 'none';
  document.getElementById("comment_input_holder").style.display = 'inline';
  var comment_input = document.getElementById("comment_input");
  comment_input.value = document.getElementById("comment").textContent;
  comment_input.focus();
}

function inputComment() {
  document.getElementById("comment_input_holder").style.display = 'none';
  document.getElementById("comment_holder"      ).style.display = 'inline';
  var comment = document.getElementById("comment_input").value;
  moveSet.addComment(comment);
  board.displayComment(comment);
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

function enableRadioToInitMode(toBeEnabled) {
  var radioToInit = document.getElementById("radio_mode_init_with_label");
  radioToInit.style.display = toBeEnabled ? 'inline' : 'none';
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
    backBoardToTrunk();
  } else {
    var numBranch = parseInt(branch_select.value);
    moveSet.branchTo(numBranch);
    var label = makeBranchLabel(numBranch, moveSet.branchName());
    branch_select = replaceBranchSelect([[label, numBranch]]);
    branch_select.value = numBranch;
    document.getElementById("branch_edit_holder").style.display = 'inline';
  }
  updateNumMovesDisplay(moveSet.numCurrentMove());
}

function backBoardToTrunk() {
  for (var strMove of moveSet.strMovesToRewind().reverse()) {
    board.removeMove(strMove);
    setTurn(getColorOfStone(strMove));
  }
  updateBranchSelectDisplay();
  board.displayComment(moveSet.getCurrentComment());
}

function updateBranchSelectDisplay() {
  if (moveSet.onBranch()) {
    return;
  }
  var branchNames = moveSet.branchNames();
  var options = moveSet.branches().map(function(branch, index) {
    var label = makeBranchLabel(index, branchNames[index]);
    return [label, index];
  });
  var branch_select = replaceBranchSelect(options);
  branch_select.style.display = moveSet.branches().length === 0 ? 'none' : 'inline';
  document.getElementById("branch_edit_holder").style.display = 'none';
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

function makeBranchLabel(index, name) {
  return '変化' + index + ': ' + name;
}

function createOption(label, value) {
  var option = document.createElement('option');
  option.setAttribute('value', value);
  option.textContent = label;
  return option;
}

function removeAllChildren(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function removeBranch() {
  if (confirm("この分岐を削除していいですか？")) {
    moveSet.removeBranch();
    backBoardToTrunk();
    updateNumMovesDisplay(moveSet.numCurrentMove());
  }
}

function showBranchNameInput() {
  document.getElementById("branch_edit_holder" ).style.display = 'none';
  document.getElementById("branch_input_holder").style.display = 'inline';
  var branch_name_input = document.getElementById("branch_name_input");
  branch_name_input.value = moveSet.branchName();
  branch_name_input.focus();
}

function inputBranchName() {
  document.getElementById("branch_edit_holder" ).style.display = 'inline';
  document.getElementById("branch_input_holder").style.display = 'none';
  var branchName = document.getElementById("branch_name_input").value;
  moveSet.inputBranchName(branchName);
  var optionBranch = document.getElementById("branch_select").lastChild;
  var currentLabel = optionBranch.textContent;
  optionBranch.textContent = currentLabel.replace(/\S*$/, branchName);
}

function prepareForPlayMode() {
  moveSet.setMode(moveSet.MODE_PLAY);

  board.clear();
  board.clearComment();
  putInits();
  setPlayMode();

  playToNextOf(moveSet.numMovesToPlay());

  setTurn(moveSet.nextTurn());
  updateBranchSelectDisplay();
  updateNumMovesDisplay(moveSet.numCurrentMove());

  showButtonsToPlay(true);
  showInfoDisplay(true);
}

function prepareForTurnMode() {
  moveSet.setMode(moveSet.MODE_TURN);

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
  moveSet.setMode(moveSet.MODE_TEMP);
   
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
  moveSet.resetIndex();
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
  updateNumMovesDisplay(moveSet.numCurrentMove());
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
  updateNumMovesDisplay(moveSet.numCurrentMove());
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
  moveSet.resetIndex();
  playToNextOf(numMoveToGo);
}

