function getCanvasContext(canvasId) {

  /* canvas要素のノードオブジェクト */
  var canvas = document.getElementById(canvasId);

  /* canvas要素の存在チェックとCanvas未対応ブラウザの対処 */
  if ( ! canvas || ! canvas.getContext ) {
    return false;
  }

  /* 2Dコンテキスト */
  return canvas.getContext('2d');
}

