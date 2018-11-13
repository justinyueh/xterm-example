const express = require('express')
const SSHClient = require('ssh2').Client;
const config = require('./config');

const app = express()
const port = 3001
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static('dist'))
app.use(express.static('public'))

app.get('/', (req, res) => res.send('Hello World!'))

server.listen(port);

io.on('connection', function(socket) {
  var conn = new SSHClient();
  conn.on('ready', function() {
    socket.emit('data', '\r\n*** SSH CONNECTION ESTABLISHED ***\r\n');
    conn.shell(function(err, stream) {
      if (err)
        return socket.emit('data', '\r\n*** SSH SHELL ERROR: ' + err.message + ' ***\r\n');
      socket.on('data', function(data) {
        stream.write(data);
      });
      
      stream.on('close', function() {
        console.log('Stream :: close');
        conn.end();
      }).on('data', function(data) {
        const encoding = 'utf8';
        // console.log(data.toString(encoding));
        socket.emit('data', data.toString(encoding));
      }).stderr.on('data', function(data) {
        console.log('STDERR: ' + data);
      });

      // stream.on('data', function(d) {
      //   socket.emit('data', d.toString('binary'));
      // }).on('close', function() {
      //   conn.end();
      // });
    });
  }).on('close', function() {
    socket.emit('data', '\r\n*** SSH CONNECTION CLOSED ***\r\n');
  }).on('error', function(err) {
    socket.emit('data', '\r\n*** SSH CONNECTION ERROR: ' + err.message + ' ***\r\n');
  }).connect({
    host: '',
    username: '',
    password: '',
    ...config,
  });
});
