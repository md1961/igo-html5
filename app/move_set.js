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

  this.clear();

  this._mode = this.MODE_TURN;
  //TODO: Rename to indexNext or indexMoves ?
  this._indexPlay = 0;  // This points to index of next move.
  this._onBranch = false;
  this._indexPlaySaved = null;

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

  this.numCurrentMove = function() {
    return this._indexPlay;
  }

  this.onBranch = function() {
    return this._onBranch;
  }

  this.resetIndex = function() {
    this._indexPlay = 0;
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
    this.moves.push(move);
  };

  this.popLastMove = function() {
    if (this.moves.length() === 0) {
      return null;
    }
    return this.moves.pop();
  };

  this._startMode = function(mode) {
    switch (mode) {
      case this.MODE_PLAY:
        this._startPlayMode();
        break;
      case this.MODE_TEMP:
        this._startTempMode();
        break;
    }
  };

  this._finishMode = function(mode) {
    switch (mode) {
      case this.MODE_TEMP:
        this._finishTempMode();
        break;
      case this.MODE_PLAY:
        this.backToTrunk();
        break;
    }
  };

  this._startPlayMode = function() {
    this._indexPlay = 0;
    this._numMovesToPlay = this._indexPlaySaved;
    this._indexPlaySaved = null;
  };

  this._startTempMode = function() {
    this._moves_saved = this.moves;
    this.moves = new Moves([]);
    //TODO: _indexPlaySaved is unused while isTempMode is true ????
    this._indexPlaySaved = this._indexPlay;
  };

  this._finishTempMode = function() {
    if (this.moves.length() > 0 && confirm("この検討手順を分岐として保存しますか?")) {
      this._moves_saved.insert(this._indexPlaySaved, this.moves.strMoves());
    }
    this.moves = this._moves_saved;
  };

  this.numMovesToPlay = function() {
    return this._numMovesToPlay || 0;
  };

  this.playNext = function() {
    if (this._indexPlay >= this.moves.length()) {
      this._indexPlay = this.moves.length();
      return null;
    }
    return this.moves.get(this._indexPlay++);
  };

  this.playPrev = function() {
    if (this._indexPlay <= 0) {
      this._indexPlay = 0;
      return null;
    }
    this._indexPlay--;
    return this.moves.get(this._indexPlay);
  };

  this.DEFAULT_NEXT_TURN = BLACK;

  this.nextTurn = function() {
    if (this.moves.length() === 0) {
      return this.DEFAULT_NEXT_TURN;
    } else if (this._mode == this.MODE_PLAY) {
      if (this._indexPlay < this.moves.length()) {
        return getColorOfStone(this.moves.get(this._indexPlay));
      }
      return getOpponent(getColorOfStone(this.moves.get(this._indexPlay - 1)));
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
    return this.moves.branches(this._indexPlay);
  };

  this.offsetToNextJunction = function() {
    return this._offsetToAdjacentJunction(+1);
  };

  this.offsetToPrevJunction = function() {
    return -this._offsetToAdjacentJunction(-1);
  };

  this._offsetToAdjacentJunction = function(direction) {
    direction = direction / Math.abs(direction);
    for (var i = this._indexPlay + direction; 0 <= i && i <= this.moves.length(); i += direction) {
      if (this.moves.branches(i).length > 0) {
        return i - this._indexPlay;
      }
    }
    return null;
  };

  this.branchTo = function(numBranch) {
    this._strMovesToRewind = this.moves.branches(this._indexPlay)[numBranch];
    this.moves.branchTo(this._indexPlay, numBranch);
    //TODO: Handle branch on branch...
    this._indexPlaySaved = this._indexPlay;
    this._indexPlay = 0;
    this._onBranch = true;
    this._numBranch = numBranch;
  };

  this.backToTrunk = function() {
    if (! this.onBranch() || this._indexPlaySaved === null) {
      return;
    }
    this.moves.backToTrunk();
    this._strMovesToRewind = this._strMovesToRewind.slice(0, this._indexPlay);
    this._indexPlay = this._indexPlaySaved;
    this._indexPlaySaved = null;
    this._onBranch = false;
  };

  this.removeBranch = function() {
    if (! this.onBranch()) {
      return;
    }
    this.backToTrunk();
    this.moves.removeBranch(this._indexPlay, this._numBranch);
  };

  this.strMovesToRewind = function() {
    return this._strMovesToRewind;
  };

  this.addComment = function(comment) {
    var _index = (this._mode == this.MODE_TURN) ? this.moves.length() - 1 : this._indexPlay - 1;
    this.moves.addComment(comment, _index);
  };

  this.getCurrentComment = function() {
    if (this._indexPlay <= 0) {
      return null;
    } else if (this._indexPlay > this.moves.length()) {
      this._indexPlay = this.moves.length();
    }
    var move = this.moves.get(this._indexPlay - 1);
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
