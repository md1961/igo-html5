function Moves(strMoves) {
  this._moves = strMoves;
}

Moves.prototype = {

  strMoves : function() {
    return this._moves;
  },

  _isTrunkMove : function(move) {
    return typeof move == 'string' && move.match(/^[NBWnbw][a-s]{2}/);
  },

  _trunkMoves : function() {
    var _isTrunkMove = this._isTrunkMove;
    return this._moves.filter(function(move) {
      return _isTrunkMove(move);
    });
  },

  _indexInMoves : function(index) {
    var countTrunkMoves = 0;
    var countBranches   = 0;
    for (var move of this._moves) {
      if (this._isTrunkMove(move)) {
        countTrunkMoves++;
        if (countTrunkMoves >= index + 1) {
          break;
        }
      } else {
        countBranches++;
      }
    }
    return index + countBranches;
  },

  length : function() {
    return this._trunkMoves().length;
  },

  get : function(index) {
    return this._trunkMoves()[index];
  },

  branches : function(index) {
    var branches = [];
    for (var move of this._moves.slice(0, this._indexInMoves(index)).reverse()) {
      if (this._isTrunkMove(move)) {
        break;
      }
      branches.unshift(move);
    }
    return branches;
  },

  branchNames : function(index) {
    var _getBranchName = this._getBranchName;
    var _isTrunkMove   = this._isTrunkMove;
    return this.branches(index).map(function(branch) {
      return _getBranchName(branch, _isTrunkMove);
    });
  },

  removeBranch : function(index, numBranch) {
    var lenBranches = this.branches(index).length;
    if (lenBranches === 0) {
      throw "No branches at index " + index;
    }
    var indexInMoves = this._indexInMoves(index) - lenBranches + numBranch;
    this._moves.splice(indexInMoves, 1);
  },

  set : function(index, move) {
    this._moves[this._indexInMoves(index)] = move;
  },

  push : function(move) {
    this._moves.push(move);
  },

  pop : function() {
    do {
      var move = this._moves.pop();
      if (this._isTrunkMove(move)) {
        return move;
      }
    } while (this._moves.length > 0);
    return null;
  },

  insert : function(index, move) {
    this._moves.splice(this._indexInMoves(index), 0, move);
  },

  branchTo : function(index, numBranch) {
    this._moves_trunk = this._moves;
    this._moves = this.branches(index)[numBranch];
  },

  backToTrunk : function() {
    this._moves = this._moves_trunk;
  },

  branchName : function() {
    return this._getBranchName(this._moves);
  },

  inputBranchName : function(name) {
    var lastMove = this._moves[this._moves.length - 1];
    if (this._isTrunkMove(lastMove) || typeof lastMove != 'string') {
      this._moves.push(name);
    } else {
      this._moves[this._moves.length - 1] = name;
    }
  },

  _getBranchName : function(moves, _isTrunkMove) {
    if (_isTrunkMove === undefined) {
      _isTrunkMove = this._isTrunkMove;
    }
    var name = moves[moves.length - 1];
    if (_isTrunkMove(name)) {
      name = "";
    }
    return name;
  },

  addComment : function(comment, index) {
    var move = this.get(index);
    move = move.replace(/\[[^\]]*\]/, '');
    move += '[' + comment + ']';
    this.set(index, move);
  },
};
