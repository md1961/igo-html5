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
});
