'use strict';

var express = require('express');
var messaging = require('../../messaging');
var gameClient = require('../../game-client');
var EventEmitter = require('events').EventEmitter;
var inbox = new EventEmitter();

var reqCounter = 0;

function getMessages(req, res) {
  var sessionId = req.headers['x-session-id'];
  var gameId = req.query.gameId || null;
  var promises = [
    messaging.receive(sessionId).then((messages) => {
      return messages.map(messaging.readMessage);
    })
  ];

  if (gameId) {
    var promise = new Promise((resolve, reject) => {
      var reqId = reqCounter++;
      gameClient.send(gameId, ['messaging', 'read', sessionId, reqId]);
      inbox.once(reqId, function (messages) {
        resolve(messages);
      });
      setTimeout(reject, 1000);
    });
    promises.push(promise);
  }
  Promise.all(promises)
    .then((result) => {
      if (!result) {
        return [];
      }
      return result.reduce((a, b) => {
        return a.concat(b);
      });
    }).then((messages) => {
      res.json(messages || []);
    })
    .catch((error) => {
      res.status(500).json({
        error: error
      });
    });
}
function getRouter() {
  var router = express.Router();
  router.get('/', getMessages);
  return router;
}

gameClient.on('messaging', (message) => {
  if (message[0] === 'inbox') {
    inbox.emit(message[1], message[2]);
  }
});


module.exports = {
  getRouter: getRouter
};
