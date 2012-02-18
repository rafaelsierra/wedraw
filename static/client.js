var console = window.console || {log:function(foo){}}

function Pen(canvasID, socket, square_size){
  this.canvas = document.getElementById(canvasID)
  this.color='#000000';
  this.ctx = this.canvas.getContext('2d');
  this.ctx.lineWidth=2;
  this.drawing = false;
  this.canvas.addEventListener('mousedown', this.begin())
  this.canvas.addEventListener('mouseup', this.stop())
  this.canvas.addEventListener('mousemove', this.moveTo())
  this.canvas.addEventListener('click', this.moveTo(true))
  this.socket = socket
  this.square_size=square_size;
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

Pen.prototype.clearHighlight = function(x,y){
  for(x in map){
    for(y in map[x]){
      this.ctx.fillStyle = map[x][y];
      this.ctx.fillRect(x*this.square_size,y*this.square_size, this.square_size, this.square_size);
    }
  }
};

Pen.prototype.highlight = function(x,y){
  // Highlight the square at x,y in map
  this.clearHighlight();
  this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
  this.ctx.fillRect(x*this.square_size,y*this.square_size, this.square_size, this.square_size);
};

Pen.prototype.moveTo = function(click){
  var $this=this;
  return function(e){
    // Highlight the current square
    var pos = $this.getMousePos(e);
    var x = parseInt(pos.x/$this.square_size);
    var y = parseInt(pos.y/$this.square_size);
    $this.highlight(x,y);
  
    if(!$this.drawing && !click)return;
    // Draw the square
    $this.ctx.fillStyle = $this.color;
    $this.ctx.fillRect(x*$this.square_size,y*$this.square_size, $this.square_size, $this.square_size);
    map[x][y]=$this.color;
    // High bandwidth load
    $this.socket.emit('draw', {
      x: x,
      y: y,
      color: $this.color
    })
    $this.lastpos = $this.getMousePos(e);
  }
};

(function(){
  var canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var SQRSIZE=8;
  window.map = {};
  function draw_from_data(data){
    var ctx = canvas.getContext('2d');
    for(var x in data){
      if(!map[x]) map[x] = {};
      for(var y in data[x]){
        var color = data[x][y];
        map[x][y]=color;
        ctx.fillStyle = color;
        ctx.fillRect(SQRSIZE*x,SQRSIZE*y, SQRSIZE, SQRSIZE);
      }
    }
  }

  var socket = io.connect()
  // Setup map
  socket.on('setup', function(data){
    draw_from_data(data);
  })
  // Receive update
  socket.on('drawn', function(data){
    var ctx = canvas.getContext('2d');
    if(!map[data.x]) map[data.x] = {};
    if(!map[data.x][data.y]) map[data.x][data.y] = data.color;
    ctx.fillStyle = data.color;
    ctx.fillRect(SQRSIZE*data.x,SQRSIZE*data.y, SQRSIZE, SQRSIZE);
  })
  // Ask for the map
  socket.emit('ready');
  window.pen = new Pen('canvas', socket, SQRSIZE);
  pen.ctx.fillStyle='#0000ff';
})()
