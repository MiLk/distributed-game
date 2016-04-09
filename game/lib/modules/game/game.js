'use strict';

class Game {
  constructor(id, players) {
    this.players = players
  }

  getOpponent(player) {
    if (this.players[0] === player) {
      return this.players[1];
    }
    return this.players[0];
  }
}

module.exports = Game;
