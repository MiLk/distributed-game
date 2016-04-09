'use strict';

var express = require('express');
var gameClient = require('../../game-client');

function placeCard(req, res) {
  var sessionId = req.headers['x-session-id'];
  if (!req.body || !req.body.gameId) {
    res.status(400).json({
      error: 'Invalid gameId'
    });
    return;
  }
  gameClient.send(req.body.gameId, ['game', 'placeCard', req.body.gameId, sessionId, req.body.card]);
  res.status(204).json(null);
}

function endTurn(req, res) {
  if (!req.body || !req.body.gameId) {
    res.status(400).json({
      error: 'Invalid gameId'
    });
    return;
  }
  gameClient.send(req.body.gameId, ['game', 'endTurn']);
  res.status(204).json(null);
}

function getRouter() {
  var router = express.Router();
  router.post('/place', placeCard);
  router.post('/end', endTurn);
  return router;
}

function created (message) {
  var gameId = message[0];
  require('../queue').remove(gameId);
}

var handlers = {
  created: created
};

gameClient.on('game', (message) => {
  if (!handlers.hasOwnProperty(message[0])) {
    console.log('Router server / Game module received an unhandled message:', message);
    return;
  }
  handlers[message[0]](message.slice(1));
});

module.exports = {
  getRouter: getRouter,
  startGame: function (confirmId) {
    gameClient.send(confirmId, ['game','start', confirmId]);
  }
};
