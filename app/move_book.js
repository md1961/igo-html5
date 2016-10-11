function MoveBook() {
  this._moveSets = [];
  this._cursor = null;

  this.usesSGF = true;

  this.add = function(moveSet) {
    this._moveSets.push(moveSet);
    this._cursor = this._moveSets.length - 1;
    return this.current();
  };

  this.current = function() {
    if (this._cursor === null) {
      return null;
    }
    return this._moveSets[this._cursor];
  };

  this.prev = function() {
    return this.changeSet(-1);
  };

  this.next = function() {
    return this.changeSet(1);
  };

  this.changeSet = function(step) {
    if (this.current() !== null) {
      this.current().backToTrunk();
    }

    if (this._moveSets.length === 0) {
      return null;
    } else if (this._cursor === null) {
      this._cursor = 0;
    } else {
      this._cursor += step;
    }
    if (this._cursor >= this._moveSets.length) {
      this._cursor = 0;
    } else if (this._cursor < 0) {
      this._cursor = this._moveSets.length - 1;
    }
    var nextSet = this._moveSets[this._cursor];
    return nextSet;
  };

  this.setNumber = function() {
    return '[' + (this._cursor + 1) + '/' + this._moveSets.length + ']';
  };

  this.readDataInJson = function(json) {
    var arrayOfHash = JSON.parse(json);
    if (! Array.isArray(arrayOfHash)) {
      arrayOfHash = [arrayOfHash];
    }
    this._moveSets = [];
    for (var hash of arrayOfHash) {
      var _moveSet = new MoveSet();
      _moveSet.readDataInHash(hash);
      this.add(_moveSet);
    }
    this._cursor = 0;
  };

  this.toJson = function() {
    var arrayOfHash = this._moveSets.map(function(moveSet) {
      return moveSet.toHash();
    });
    return JSON.stringify(arrayOfHash);
  };
}
