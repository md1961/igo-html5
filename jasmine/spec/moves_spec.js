describe("Moves", function() {
  var moves;
  var strMoves = [
    "Bpd","Wdd","Bpq","Wdq","Bdo",["Wcm","Ben","Wfp","Bdl","Wck"],
    "Wco","Bcn","Wcp","Bdm","Wfq","Bep","Weq","Bfc","Wcf","Bci",
    "Wqo","Bqj","Wnc","Bpf","Wpb",["Bqc","Wkc","Bqp","Wpo","Bop","Wql"],"Bmc",
    ["Wmd","Blc","Wnd","Bqc"],["Wmd","Blc","Wnb","Bqc"],"Wmb","Bnb","Wlc","Bmd","Wob"
  ];

  beforeEach(function() {
    moves = new Moves(strMoves);
  });

  describe("#strMoves()", function() {
    it("should return an array which is passed to a constructor", function() {
      expect(moves.strMoves()).toEqual(strMoves);
    });
  });

  describe("#_isTrunkMove()", function() {
    describe("argument is a string", function() {
      it("should return true", function() {
        expect(moves._isTrunkMove('a string')).toBeTruthy;
      });
    });

    describe("argument is an array", function() {
      it("should return false", function() {
        expect(moves._isTrunkMove([])).toBeFalsy;
      });
    });
  });

  describe("#_trunkMoves()", function() {
    it("should return this._moves with elements of _trunkMoves() is true", function() {
      expect(moves._trunkMoves()).toEqual(
        [
          "Bpd","Wdd","Bpq","Wdq","Bdo",
          "Wco","Bcn","Wcp","Bdm","Wfq","Bep","Weq","Bfc","Wcf","Bci",
          "Wqo","Bqj","Wnc","Bpf","Wpb","Bmc",
          "Wmb","Bnb","Wlc","Bmd","Wob"
        ]
      );
    });
  });

  describe("#_indexInMoves()", function() {
    it("should return index in this._moves which corresponds to index in this._trunkMoves()", function() {
      expect(moves._indexInMoves( 0)).toEqual( 0);
      expect(moves._indexInMoves( 4)).toEqual( 4);
      expect(moves._indexInMoves( 5)).toEqual( 6);
      expect(moves._indexInMoves(19)).toEqual(20);
      expect(moves._indexInMoves(20)).toEqual(22);
      expect(moves._indexInMoves(21)).toEqual(25);
      expect(moves._indexInMoves(25)).toEqual(29);
    });
  });
});
