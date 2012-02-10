var app = require('http').createServer(handler)
  ,io = require('socket.io').listen(app)
  ,fs = require('fs')

app.listen(8000);

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


