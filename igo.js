onload = function() {
  draw();
};

function draw() {
  var ctx = get_canvas_context();

  /* 四角を描く */
  ctx.beginPath();
  ctx.moveTo(20, 20);
  ctx.lineTo(120, 20);
  ctx.lineTo(120, 120);
  ctx.lineTo(20, 120);
  ctx.closePath();
  ctx.stroke();
}


