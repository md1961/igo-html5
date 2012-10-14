function get_canvas_context(canvas_id) {

  /* canvas要素のノードオブジェクト */
  var canvas = document.getElementById(canvas_id);

  /* canvas要素の存在チェックとCanvas未対応ブラウザの対処 */
  if ( ! canvas || ! canvas.getContext ) {
    return false;
  }

  /* 2Dコンテキスト */
  return canvas.getContext('2d');
}

