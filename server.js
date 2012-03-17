var app = require('http').createServer(handler)
  ,io = require('socket.io').listen(app)
  ,fs = require('fs')

app.listen(8000);

console.log('Creating map');
var map = {}
for(var x=0;x<100;x++){
  if(!map[x]) map[x] = {}
  for(var y=0;y<100;y++){
    map[x][y] = '#ffffff';
  }
}
console.log('Map created');

function route(path){
  switch(path){
    case '/': return 'index.html';
    case '/client.js': return 'client.js';
    case '/client.css': return 'client.css';
  }
}

function handler(req, res) {
  var filename = route(req.url);
  fs.readFile(__dirname + '/static/'+filename, function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.sockets.on('connection', function(socket){
  socket.on('draw', function(data){
    map[data.x][data.y] = data.color
    socket.broadcast.emit('drawn', data);
  });
  socket.on('ready', function(){
    for(var i in map){
      var row = {};row[i] = map[i];
      socket.emit('setup', row)
    }
  });
})
