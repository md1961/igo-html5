function MoveSet() {

  this.MODE_TURN = "turn";
  this.MODE_PLAY = "play";
  this.MODE_TEMP = "temp";
  this.VALID_MODES = [this.MODE_TURN, this.MODE_PLAY, this.MODE_TEMP];

  this.clear = function() {
    this.title = "";
    this.inits = [];
    this.moves = new Moves([]);
  };

  this._mode = this.MODE_TURN;
  this.clear();
  //TODO: Rename to indexNext or indexMoves ?
  this.indexPlay = 0;
  this.onBranch = false;
  //TODO: Remove these two
  this.isPlayMode = false;
  this.isTempMode = false;
  this.tempMoves = [];
  this.indexPlaySaved = null;
  //TODO: Remove these two
  this.indexPlayOnTrunk = null;
  this.indexMovesToRestoreFromTempMode = null;

  this.setMode = function(mode) {
    if (this.VALID_MODES.indexOf(mode) < 0) {
      throw "Illegal mode specified: " + mode;
    } else if (this._mode == mode) {
      return;
    }
    this._finishMode(this._mode);
    this._startMode(mode);
    this._mode = mode;
  };

  this.length = function() {
    return this.moves.length();
  };

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

  this._startMode = function(mode) {
    switch (mode) {
      case this.MODE_PLAY:
        this.prepareForPlayMode();
        break;
      case this.MODE_TEMP:
        this.setTempMode(true);
        break;
    }
  };
  this._finishMode = function(mode) {
    switch (mode) {
      case this.MODE_TEMP:
        this.setTempMode(false);
        break;
      case this.MODE_PLAY:
        this.backToTrunk();
        break;
    }
  };
  //TODO: Remove these function.
  this.prepareForPlayMode = function() {
    this.isPlayMode = true;
    this.setTempMode(false);
    this.indexPlay = 0;

    this._numMovesToPlay = this.indexPlaySaved;
    this.indexPlaySaved = null;
  };
  this.setTempMode = function(isTempMode) {
    this.isTempMode = isTempMode;
    if (isTempMode) {
      this.tempMoves = [];
      this.isPlayMode = false;
      //TODO: indexPlaySaved is unused while isTempMode is true
      this.indexPlaySaved = this.indexPlay;
    } else if (this.tempMoves.length > 0) {
      if (confirm("Save this branch?")) {
        this.moves.insert(this.indexPlaySaved, this.tempMoves);
      }
      this.tempMoves = [];
    }
  };

  this.numMovesToPlay = function() {
    return this._numMovesToPlay || 0;
  };

  this.playNext = function() {
    if (this.indexPlay >= this.moves.length()) {
      this.indexPlay = this.moves.length();
      return null;
    }
    return this.moves.get(this.indexPlay++);
  };

  this.playPrev = function() {
    if (this.indexPlay <= 0) {
      this.indexPlay = 0;
      return null;
    }
    this.indexPlay--;
    return this.moves.get(this.indexPlay);
  };

  this.DEFAULT_NEXT_TURN = BLACK;

  this.nextTurn = function() {
    if (this.moves.length() === 0) {
      return this.DEFAULT_NEXT_TURN;
    } else if (this.isPlayMode) {
      if (this.indexPlay < this.moves.length()) {
        return getColorOfStone(this.moves.get(this.indexPlay));
      }
      return getOpponent(getColorOfStone(this.moves.get(this.indexPlay - 1)));
    } else {
      var lastStrMove = this.moves.get(this.moves.length() - 1);
      //TODO: Use getOpponent()?
      switch (lastStrMove[0].toUpperCase()) {
        case  NONE[0]: return null;
        case BLACK[0]: return WHITE;
        case WHITE[0]: return BLACK;
        default : throw "Illegal stringified move '" + lastStrMove +"'";
      }
    }
  };

  this.branches = function() {
    return this.moves.branches(this.indexPlay);
  };

  this.offsetToNextJunction = function() {
    return this._offsetToAdjacentJunction(+1);
  };

  this.offsetToPrevJunction = function() {
    return -this._offsetToAdjacentJunction(-1);
  };

  //FIXME: Junction at very end
  this._offsetToAdjacentJunction = function(direction) {
    direction = direction / Math.abs(direction);
    for (var i = this.indexPlay + direction; 0 <= i && i < this.moves.length(); i += direction) {
      if (this.moves.branches(i).length > 0) {
        return i - this.indexPlay;
      }
    }
    return null;
  };

  this.branchTo = function(numBranch) {
    this._strMovesToRewind = this.moves.branches(this.indexPlay)[numBranch];
    this.moves.branchTo(this.indexPlay, numBranch);
    //TODO: Handle branch on branch...
    this.indexPlaySaved = this.indexPlay;
    this.indexPlay = 0;
    this.onBranch = true;
  };

  this.backToTrunk = function() {
    if (! this.onBranch || this.indexPlaySaved === null) {
      return;
    }
    this.moves.backToTrunk();
    this._strMovesToRewind = this._strMovesToRewind.slice(0, this.indexPlay);
    this.indexPlay = this.indexPlaySaved;
    this.indexPlaySaved = null;
    this.onBranch = false;
  };

  this.strMovesToRewind = function() {
    return this._strMovesToRewind;
  };

  this.addComment = function(comment, index) {
    if (index < 0 || index >= this.moves.length()) {
      index = this.moves.length() - 1;
    }

    var move = this.moves.get(index);
    move = move.replace(/\[[^\]]*\]/, '');
    move += '[' + comment + ']';
    this.moves.set(index, move);
  };

  this.getCurrentComment = function() {
    if (this.indexPlay <= 0) {
      return null;
    } else if (this.indexPlay > this.moves.length()) {
      this.indexPlay = this.moves.length();
    }
    var move = this.moves.get(this.indexPlay - 1);
    return parseMove(move)[4];
  };

  this.readDataInHash = function(hash) {
    this.title = hash.title;
    this.inits = hash.inits;
    this.moves = new Moves(hash.moves);
  };

  this.readDataInJson = function(json) {
    var hash = JSON.parse(json);
    this.readDataInHash(hash);
  };

  this.toHash = function() {
    return {
      "title": this.title,
      "inits": this.inits,
      "moves": this.moves.strMoves()
    };
  };

  this.toJson = function() {
    return JSON.stringify(this.toHash());
  };
}
