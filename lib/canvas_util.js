var CanvasUtil = {

  getCanvasContext: function(canvasId) {
    var canvas = document.getElementById(canvasId);
    if (! canvas || ! canvas.getContext) {
      return false;
    }
    return canvas.getContext('2d');
  }
};
