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
    if (this.current() !== null) {
      this.current().backToTrunk();
    }

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
