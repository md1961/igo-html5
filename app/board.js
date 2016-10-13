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
    if (_comment === undefined || _comment === null || _comment === "") {
      comment.innerText = null;
      comment.style.border = "none 0px black";
    } else {
      comment.innerText = _comment;
      comment.style.border = "solid 1px black";
    }
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
