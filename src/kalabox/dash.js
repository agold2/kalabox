/**
 * @file
 * Server controller for the Kalabox dashboard.
 */

// Dependencies:
var box = require('./box'),
    exec = require('child_process').exec;

// "Constants":
var KALABOX_DIR = process.env.HOME + '/.kalabox/',
    KALASTACK_DIR = KALABOX_DIR + 'kalastack-2.x';

// Variables:
var socket;

// Client communication handlers:

function handleStartRequest(data) {
  console.log('Start request received.');
  box.startBox(function() {
    console.log('Box started');
    socket.emit('boxStarted');
  });
}

function handleStopRequest(data) {
  console.log('Stop request received.');
  box.stopBox(function() {
    console.log('Box stopped');
    socket.emit('boxStopped');
  });
}

function handleSSHRequest(data) {
  // If box not running, don't launch ssh.
  if (!box.isRunning()) {
    return;
  }
  // Launch ssh in a new Terminal window.
  exec('osascript ' + __dirname + '/utils/scpts/start_ssh.scpt "' + KALASTACK_DIR + '"');
}

function handleFoldersRequest(data) {
  // If box not running, don't open folders.
  if (!box.isRunning()) {
    return;
  }
  exec('open .', {cwd: process.env.HOME + '/kalabox'});
}

// Module communication handlers:

function handleStart() {
  socket.emit('boxStarted');
}

function handleStop() {
  socket.emit('boxStopped');
}

/**
 * Initializes the controller, binding to events from client and other modules.
 */
exports.initialize = function() {
  // Bind handlers for communication events coming from the client.
  io.sockets.on('connection', function (newSocket) {
    socket = newSocket;
    socket.on('startRequest', handleStartRequest);
    socket.on('stopRequest', handleStopRequest);
    socket.on('sshRequest', handleSSHRequest);
    socket.on('foldersRequest', handleFoldersRequest);
  });
  // Bind handlers for communication events coming from other modules.
  box.on('start', handleStart);
  box.on('stop', handleStop);
};