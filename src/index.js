const { Terminal } = require('xterm');
const fit = require('xterm/lib/addons/fit/fit');
const io = require('socket.io-client');

Terminal.applyAddon(fit);

window.addEventListener('load', function() {
  // Terminal.applyAddon(fit);  // Apply the `fit` addon
  
  var terminalContainer = document.getElementById('terminal-container');
  var term = new Terminal({ cursorBlink: true });
  term.open(terminalContainer);
  term.fit();
  term.focus();
  
  document.addEventListener('keydown', (event) => {
    if (event.metaKey === true && event.key === 'k') {
      term.clear();
    }
  }, false);

  var waitForFinalEvent = (function () {
    var timers = {};
    return function (callback, ms, uniqueId) {
      if (!uniqueId) {
        uniqueId = "Don't call this twice without a uniqueId";
      }
      if (timers[uniqueId]) {
        clearTimeout (timers[uniqueId]);
      }
      timers[uniqueId] = setTimeout(callback, ms);
    };
  })();

  window.addEventListener('resize', () => {
    waitForFinalEvent(() => {
      console.log('fit');
      term.fit();
    }, 300)
  });
  window.addEventListener("click", function(event) 
  { 
    console.log('click', event);
    if (event.target.nodeName !== 'CANVAS') {
      term.focus();
    }
  }, false);

  var socket = io.connect('http://localhost:3001');
  socket.on('connect', function() {
    term.write('\r\n*** Connected to backend***\r\n');

    // Browser -> Backend
    term.on('data', function(data) {
      socket.emit('data', data);
    });

    // Backend -> Browser
    socket.on('data', function(data) {
      term.write(data);
    });

    socket.on('disconnect', function() {
      term.write('\r\n*** Disconnected from backend***\r\n');
    });
  });
}, false);
