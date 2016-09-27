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

  describe("#length()", function() {
    it("should return length of this._trunkMoves()", function() {
      expect(moves.length()).toEqual(26);
    });
  });

  describe("#get()", function() {
    it("should return corresponding element of this._trunkMoves()", function() {
      expect(moves.get( 0)).toEqual("Bpd");
      expect(moves.get( 4)).toEqual("Bdo");
      expect(moves.get( 5)).toEqual("Wco");
      expect(moves.get(19)).toEqual("Wpb");
      expect(moves.get(20)).toEqual("Bmc");
      expect(moves.get(21)).toEqual("Wmb");
      expect(moves.get(25)).toEqual("Wob");
    });
  });

  describe("#branches()", function() {
    it("should return an array of arrays just before in this._trunkMoves()", function() {
      expect(moves.branches( 0)).toEqual([]);
      expect(moves.branches( 4)).toEqual([]);
      expect(moves.branches( 5)).toEqual([["Wcm","Ben","Wfp","Bdl","Wck"]]);
      expect(moves.branches(19)).toEqual([]);
      expect(moves.branches(20)).toEqual([["Bqc","Wkc","Bqp","Wpo","Bop","Wql"]]);
      expect(moves.branches(21)).toEqual([["Wmd","Blc","Wnd","Bqc"],["Wmd","Blc","Wnb","Bqc"]]);
      expect(moves.branches(25)).toEqual([]);
    });
  });
});
