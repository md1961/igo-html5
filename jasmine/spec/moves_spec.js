describe("Moves", function() {
  var moves;
  var strMoves = ["Bpd","Wdd","Bpq","Wdq"];

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
});
