'use strict';

var server = require('../../server');
var Game = require('./game');
var messaging = require('../messaging');

var games = {};

function start(from, message) {
  var id = message[0];
  var players = id.split(':');
  games[id] = new Game(id, players);
  server.send(from, ['game', 'created', id, players]);
}

function placeCard(from, message) {
  var gameId = message[0];
  var playerId = message[1];
  var cardId = message[2];
  var opponentId = games[gameId].getOpponent(playerId);
  messaging.send(opponentId, playerId, ['cardPlaced', cardId]);
}

var handlers = {
  start: start,
  placeCard: placeCard
};

server.on('game', (from, message) => {
  if (!handlers.hasOwnProperty(message[0])) {
    console.log('Game server / Game module received an unhandled message:', message);
    return;
  }
  handlers[message[0]](from, message.slice(1));
});
