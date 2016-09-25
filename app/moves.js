function Moves(strMoves) {
  this._moves = strMoves;

  this.strMoves = function() {
    return this._moves;
  };

  this._isTrunkMove = function(move) {
    return typeof move == 'string';
  };

  this._trunkMoves = function() {
    var _isTrunkMove = this._isTrunkMove;
    return this._moves.filter(function(move) {
      return _isTrunkMove(move);
    });
  };

  this._indexInMoves = function(index) {
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
  };

  this.length = function() {
    return this._trunkMoves().length;
  };

  this.get = function(index) {
    return this._trunkMoves()[index];
  };

  this.branches = function(index) {
    var branches = [];
    for (var move of this._moves.slice(0, this._indexInMoves(index)).reverse()) {
      if (this._isTrunkMove(move)) {
        break;
      }
      branches.unshift(move);
    }
    return branches;
  };

  this.set = function(index, move) {
    this._moves[this._indexInMoves(index)] = move;
  };

  this.push = function(move) {
    this._moves.push(move);
  };

  this.pop = function() {
    do {
      var move = this._moves.pop();
      if (this._isTrunkMove(move)) {
        return move;
      }
    } while (this._moves.length > 0);
    return null;
  };

  this.insert = function(index, move) {
    this._moves.splice(this._indexInMoves(index), 0, move);
  };

  this.branchTo = function(index, numBranch) {
    this._moves_trunk = this._moves;
    this._moves = this.branches(index)[numBranch];
  };

  this.backToTrunk = function() {
    this._moves = this._moves_trunk;
  };
}
