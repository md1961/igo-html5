describe("Feature of igo-html5", function() {
  var moveBookInJson = '[{"title":"沼舘沙輝哉 x 依田紀基","inits":[],"moves":["Bpd","Wdd","Bpq","Wdq","Bdo",["Wcm","Ben","Wfp","Bdl","Wck"],"Wco","Bcn","Wcp","Bdm","Wfq","Bep","Weq","Bfc","Wcf","Bci","Wqo","Bqj","Wnc","Bpf","Wpb",["Bqc","Wkc","Bqp","Wpo","Bop","Wql"],"Bmc",["Wmd","Blc","Wnd","Bqc"],["Wmd","Blc","Wnb","Bqc"],"Wmb","Bnb","Wlc","Bmd","Wob",["Blb","Wna(Bnb)","Bkc","Wdj","Bld(Wlc)","Wcj","Bgn","Wdi"],"Bde","Wce","Bdc","Wed","Bcc","Wec","Beb","Wfb","Bgb","Wdb","Bfa(Wfb)","Wcb","Bfd","Wcd","Blb","Wna(Bnb)","Bkb","Woe",["Bme","Wpe","Bqe","Wof","Bog","Wnf","Bpg","Wqd","Brd","Wqc","Bqm"],["Bpe","Wqc"],"Bmf","Wpe","Bqe","Wne","Bme","Wqf","Bqg","Wrf","Bre","Wrg[]",["Bpg","Wrh","Bqc","Wqb","Brb","Wra","Brd","Wpi","Bqi","Wqh","Bph","Woh","Boi","Wpj","Bog","Wqk[黒敗勢]"],"Bqh","Wpg","Bof","Wnf","Bog","Wng","Boh","Wqd","Brd","Wqc","Brc","Wnh","Boi","Wrq","Bpo","Wpp","Bqp","Wop","Bqq","Wrp","Boq","Wpn","Bro","Wqn","Bnp","Woo(Bpo)","Brr","Wrn","Bqb","Wpc","Bsq","Wso(Bro)","Bkq","Wjc","Bkc","Wje","Bic","Wcl","Bbm","Wcj","Bdj","Wdk","Bbj","Wbk","Bck(Wcj)","Wnq","Bnr","Wcj(Bck)","Bek","Wej","Bck(Wcj)","Wmq","Bdl(Wdk)","Wmr","Bns","Wrs","Bqr","Wmo","Bor","Wid","Bib","Wrb","Bsb","Wqa(Bqb)","Brh",["Wkf","Blg","Wjh"],"Whq[依田唯一の失着]","Bjg","Wlg","Bkf","Whg","Bgf","Whf","Bhe","Wge","Bfe","Wgg","Bff","Wih[黒敗勢に近い]"]},{"title":"高尾紳路 x 清成哲也","inits":[],"moves":["Bqd","Wdc","Bdp","Wqp","Boq","Wlp","Bon","Wop","Bnp","Wpq","Boo","Wpp","Bmp","Wlq","Bmq","Wqm","Blo","Wko","Bln",["Wjp","Bgq","Wjm[うそ]"],["Wjp","Bgq","Wkn","Blm","Wjl[白ゆっくりしていて打てる]"],"Wfq[焦りすぎ]","Bjq","Wdn","Ben","Wlr","Bjp","Wkp","Bdo","Wkn","Blm","Wfo","Bin","Weo","Bfn","Wgo","Bgn[]",["Who","Bhn","Wio","Bjo","Wjn","Bhq","Wir","Bgq","Wiq","Bip","Wjr","Bfp","Whp","Bep","Wkq(Bjo,Bip,Bjp,Bjq)","Bdm","Wcf"],"Wdq","Bcq","Wdr","Bcn","Wdm","Bho","Wcm","Bbn","Wcr","Bbm[]",["Wck","Bbq","Whq","Bjl","Wir","Bjr","Wor","Bnr","Wls","Bci"],"Whp","Bhq","Wbq","Bgp","Wep",["Wco","Bel"],"Bcl","Wdl","Bdk","Wck","Bbl",["Wco","Bel"],"Wel","Bek","Wfl","Bbp","Wcp(Bcq)","Bco","Whm","Bhn","Wfk","Bcj","Wkm","Bkl","Wjm","Bim","Wjl",["Bil","Wll","Bkk","Wjk","Bml","Whj"],"Bhk[正しい]","Wll","Bml","Wkk(Bkl)","Bmk","Wil","Bhl","Wgm","Bgq","Wfr","Bjj","Wlj","Bir","Whj","Bgj","Wik","Bhi","Wij","Bgk","Wdj","Bbk(Wck)","Wej","Bgh","Wci","Bbi","Wck(Bdk,Bek)","Bdk(Wck)","Wdf","Bjh","Wor","Bfe","Weg","Bch","Wfi","Bgi","Wgf","Bff","Wfg","Bgg","Whf","Bfc","Wgd","Bfd","Wcd","Bic","Wjd","Bjc","Wkd","Blh","Wmj","Bcf","Wde","Beb","Wdb","Blb","Wjf","Bmg","Wmc","Blc","Wld","Bne","Wme","Bnd","Wmd","Bnf",["Wob","Bnc","Wmb","Bnb","Wna"]]}]';

  describe("read MoveBook data with two MoveSet's", function() {

    beforeEach(function() {
      document.getElementById("moves_display").value = moveBookInJson;
      document.getElementById("button_to_read_data_into_move_book").click();
    });

    describe("just after data read", function() {
      it("display title of last MoveSet", function() {
        expect(document.getElementById("title").innerText).toEqual("高尾紳路 x 清成哲也");
      });
      it("display MoveSet number with total MoveSet's", function() {
        expect(document.getElementById("set_num").innerText).toEqual("[2/2]");
      });
      it("display number of moves", function() {
        expect(document.getElementById("numMoves").innerText).toEqual("135手目 / 全135手");
      });
    });
  });
});
