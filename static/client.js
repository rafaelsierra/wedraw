function Pen(canvasID){
  this.canvas = document.getElementById(canvasID)
  this.ctx = this.canvas.getContext('2d'),
  this.ctx.lineWidth=2;
  this.drawing = false;
  this.canvas.addEventListener('mousedown', this.begin())
  this.canvas.addEventListener('mouseup', this.stop())
  this.canvas.addEventListener('mousemove', this.moveTo())
}

Pen.prototype.begin = function(){
  var $this = this;
  return function(e){
    $this.drawing = true; 
    $this.ctx.beginPath();
    $this.ctx.moveTo(e.offsetX, e.offsetY)
  }
}

Pen.prototype.stop = function(){
  var $this = this;
  return function(e){
    $this.drawing = false; 
    $this.ctx.stroke();
  }
}

Pen.prototype.moveTo = function(x,y){
  var $this=this;
  return function(e){
    if(!$this.drawing)return;
    $this.ctx.lineTo(e.offsetX, e.offsetY)
    $this.ctx.fillRect(e.offsetX, e.offsetY, 1, 1)
    console.log(e.offsetX+'x'+e.offsetY)
  }
};

(function(){
  var pen = new Pen('canvas');
  pen.ctx.fillStyle='#0000ff';
})()
