function Pen(canvasID, socket){
  this.canvas = document.getElementById(canvasID)
  this.color='#000000';
  this.ctx = this.canvas.getContext('2d');
  this.ctx.lineWidth=2;
  this.drawing = false;
  this.canvas.addEventListener('mousedown', this.begin())
  this.canvas.addEventListener('mouseup', this.stop())
  this.canvas.addEventListener('mousemove', this.moveTo())
  this.socket = socket
}

Pen.prototype.getMousePos = function(e){
  // From http://caimansys.com/painter/CanvasWidget.js
  return {x: e.clientX,  y: e.clientY};
}

Pen.prototype.begin = function(){
  var $this = this;
  return function(e){
    $this.drawing = true; 
    $this.lastpos = $this.getMousePos(e);
  }
}

Pen.prototype.stop = function(){
  var $this = this;
  return function(e){
    $this.drawing = false; 
  }
}

Pen.prototype.moveTo = function(x,y){
  var $this=this;
  return function(e){
    if(!$this.drawing)return;
    var pos = $this.getMousePos(e);
    $this.ctx.strokeStyle = $this.color;
    $this.ctx.beginPath();
    $this.ctx.moveTo($this.lastpos.x, $this.lastpos.y);
    $this.ctx.lineTo(pos.x, pos.y);
    $this.ctx.stroke();
    // High bandwidth load
    $this.socket.emit('draw', {
      fromX: $this.lastpos.x,
      fromY: $this.lastpos.y,
      toX: pos.x,
      toY: pos.y,
      color: $this.color
    })
    $this.lastpos = $this.getMousePos(e);
  }
};

(function(){
  var canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  var socket = io.connect()
  socket.on('drawn', function(data){
    var ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = data.color;
    ctx.moveTo(data.fromX, data.fromY)
    ctx.lineTo(data.toX, data.toY)
    ctx.stroke();
  })

  window.pen = new Pen('canvas', socket);
  pen.ctx.strokeStyle='#0000ff';
})()
