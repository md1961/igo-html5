describe("Feature of igo-html5", function() {
  var moveBookInJson = getMoveBookInJson();

  describe("read MoveBook data with two MoveSet's", function() {

    beforeEach(function() {
      document.getElementById("moves_display").value = moveBookInJson;
      document.getElementById("button_to_read_data_into_move_book").click();
    });

    describe("just after data read", function() {
      it("display name of MoveBook", function() {
        expect(document.getElementById("book_name").textContent).toEqual("十段戦2016予選");
      });
      it("display title of last MoveSet", function() {
        expect(document.getElementById("title").textContent).toEqual("高尾紳路 x 清成哲也");
      });
      it("display MoveSet number with total MoveSet's", function() {
        expect(document.getElementById("set_num").textContent).toEqual("[2/2]");
      });
      it("display total number of moves", function() {
        expect(document.getElementById("num_moves").textContent).toEqual("135手目 / 全135手");
      });
      it("display comment of last move", function() {
        expect(document.getElementById("comment").textContent).toEqual("入力はここまで");
      });
    });

    describe("in Play mode", function() {
      beforeEach(function() {
        document.getElementById("radio_mode_play").click();
      });
      it("display number of moves of 0", function() {
        expect(document.getElementById("num_moves").textContent).toEqual("0手目 / 全135手");
      });
      it("display no comment", function() {
        expect(document.getElementById("comment").textContent).toEqual("");
      });
      it("keep drop-down list for branch hidden", function() {
        expect(document.getElementById("branch_select").style.display).toEqual('none');
      });
      it("display last number of moves after play to last", function() {
        document.getElementById("button_to_last").click();
        expect(document.getElementById("num_moves").textContent).toEqual("135手目 / 全135手");
      });
      it("display comment of last move after play to last", function() {
        document.getElementById("button_to_last").click();
        expect(document.getElementById("comment").textContent).toEqual("入力はここまで");
      });
    });

    describe("go to first junction in Play mode", function() {
      beforeEach(function() {
        document.getElementById("radio_mode_play" ).click();
        document.getElementById("button_next_junc").click();
      });
      it("display number of moves of 19", function() {
        expect(document.getElementById("num_moves").textContent).toEqual("19手目 / 全135手");
      });
      it("show drop-down list for branch", function() {
        expect(document.getElementById("branch_select").style.display).toEqual("inline");
      });
      it("show drop-down list for branch with three options", function() {
        var branch_select = document.getElementById("branch_select");
        expect(branch_select.options[0].textContent).toEqual("本譜");
        expect(branch_select.options[1].textContent).toEqual("変化0: 不要な変化");
        expect(branch_select.options[2].textContent).toEqual("変化1: ");
      });
    });

    describe("go into first branch at first junction in Play mode", function() {
      beforeEach(function() {
        document.getElementById("radio_mode_play" ).click();
        document.getElementById("button_next_junc").click();
        document.getElementById("branch_select").selectedIndex = 1;
        document.getElementById("branch_select").onchange();
      });
      it("display total number of moves of the branch", function() {
        expect(document.getElementById("num_moves").textContent).toEqual("0手目 / 全3手");
      });
      it("display last number of moves after play to last", function() {
        document.getElementById("button_to_last").click();
        expect(document.getElementById("num_moves").textContent).toEqual("3手目 / 全3手");
      });
      it("display comment of last move after play to last", function() {
        document.getElementById("button_to_last").click();
        expect(document.getElementById("comment").textContent).toEqual("うそ");
      });
      it("display total number of trunk moves and no comment after selecting trunk", function() {
        document.getElementById("button_next_move").click();
        document.getElementById("branch_select").selectedIndex = 0;
        document.getElementById("branch_select").onchange();
        expect(document.getElementById("num_moves").textContent).toEqual("19手目 / 全135手");
        expect(document.getElementById("comment").textContent).toEqual("");
      });
    });
  });
});


function getMoveBookInJson() {
  return '{"name":"十段戦2016予選","moveSets":[{"title":"沼舘沙輝哉 x 依田紀基","inits":[],"moves":["Bpd","Wdd","Bpq","Wdq","Bdo",["Wcm","Ben","Wfp","Bdl","Wck"],"Wco","Bcn","Wcp","Bdm","Wfq","Bep","Weq","Bfc","Wcf","Bci","Wqo","Bqj","Wnc","Bpf","Wpb",["Bqc","Wkc","Bqp","Wpo","Bop","Wql"],"Bmc",["Wmd","Blc","Wnd","Bqc"],["Wmd","Blc","Wnb","Bqc"],"Wmb","Bnb","Wlc","Bmd","Wob",["Blb","Wna(Bnb)","Bkc","Wdj","Bld(Wlc)","Wcj","Bgn","Wdi"],"Bde","Wce","Bdc","Wed","Bcc","Wec","Beb","Wfb","Bgb","Wdb","Bfa(Wfb)","Wcb","Bfd","Wcd","Blb","Wna(Bnb)","Bkb","Woe",["Bme","Wpe","Bqe","Wof","Bog","Wnf","Bpg","Wqd","Brd","Wqc","Bqm"],["Bpe","Wqc"],"Bmf","Wpe","Bqe","Wne","Bme","Wqf","Bqg","Wrf","Bre","Wrg[]",["Bpg","Wrh","Bqc","Wqb","Brb","Wra","Brd","Wpi","Bqi","Wqh","Bph","Woh","Boi","Wpj","Bog","Wqk[黒敗勢]"],"Bqh","Wpg","Bof","Wnf","Bog","Wng","Boh","Wqd","Brd","Wqc","Brc","Wnh","Boi","Wrq","Bpo","Wpp","Bqp","Wop","Bqq","Wrp","Boq","Wpn","Bro","Wqn","Bnp","Woo(Bpo)","Brr","Wrn","Bqb","Wpc","Bsq","Wso(Bro)","Bkq","Wjc","Bkc","Wje","Bic","Wcl","Bbm","Wcj","Bdj","Wdk","Bbj","Wbk","Bck(Wcj)","Wnq","Bnr","Wcj(Bck)","Bek","Wej","Bck(Wcj)","Wmq","Bdl(Wdk)","Wmr","Bns","Wrs","Bqr","Wmo","Bor","Wid","Bib","Wrb","Bsb","Wqa(Bqb)","Brh",["Wkf","Blg","Wjh"],"Whq[依田唯一の失着]","Bjg","Wlg","Bkf","Whg","Bgf","Whf","Bhe","Wge","Bfe","Wgg","Bff","Wih[黒敗勢に近い]"]},{"title":"高尾紳路 x 清成哲也","inits":[],"moves":["Bqd","Wdc","Bdp","Wqp","Boq","Wlp","Bon","Wop","Bnp","Wpq","Boo","Wpp","Bmp","Wlq","Bmq","Wqm","Blo","Wko","Bln",["Wjp","Bgq","Wjm[うそ]","不要な変化"],["Wjp","Bgq","Wkn","Blm","Wjl[白ゆっくりしていて打てる]"],"Wfq[焦りすぎ]","Bjq","Wdn","Ben","Wlr","Bjp","Wkp","Bdo","Wkn","Blm","Wfo","Bin","Weo","Bfn","Wgo","Bgn[]",["Who","Bhn","Wio","Bjo","Wjn","Bhq","Wir","Bgq","Wiq","Bip","Wjr","Bfp","Whp","Bep","Wkq(Bjo,Bip,Bjp,Bjq)","Bdm","Wcf"],"Wdq","Bcq","Wdr","Bcn","Wdm","Bho","Wcm","Bbn","Wcr","Bbm[]",["Wck","Bbq","Whq","Bjl","Wir","Bjr","Wor","Bnr","Wls","Bci"],"Whp","Bhq","Wbq","Bgp","Wep",["Wco","Bel"],"Bcl","Wdl","Bdk","Wck","Bbl",["Wco","Bel"],"Wel","Bek","Wfl","Bbp","Wcp(Bcq)","Bco","Whm","Bhn","Wfk","Bcj","Wkm","Bkl","Wjm","Bim","Wjl",["Bil","Wll","Bkk","Wjk","Bml","Whj"],"Bhk[正しい]","Wll","Bml","Wkk(Bkl)","Bmk","Wil","Bhl","Wgm","Bgq","Wfr","Bjj","Wlj","Bir","Whj","Bgj","Wik","Bhi","Wij","Bgk","Wdj","Bbk(Wck)","Wej","Bgh","Wci","Bbi","Wck(Bdk,Bek)","Bdk(Wck)","Wdf","Bjh","Wor","Bfe","Weg","Bch","Wfi","Bgi","Wgf","Bff","Wfg","Bgg","Whf","Bfc","Wgd","Bfd","Wcd","Bic","Wjd","Bjc","Wkd","Blh","Wmj","Bcf","Wde","Beb","Wdb","Blb","Wjf","Bmg","Wmc","Blc","Wld","Bne","Wme","Bnd","Wmd","Bnf[入力はここまで]",["Wob","Bnc","Wmb","Bnb","Wna"]]}]}';
}
