'use strict';

var zmq = require('zmq');
var config = require('config');
var gameServers = config.get('game.servers');
var crc = require('crc');
var EventEmitter = require('events').EventEmitter;

class GameClient  extends EventEmitter {
  constructor() {
    super();

    this.dealers = [];
    for (var i = 0; i < gameServers.length; ++i) {
      var dealer = zmq.createSocket('dealer');
      dealer.identity = 'router:' + process.pid + ':' + i;
      dealer.connect(gameServers[i]);
      dealer.on('error', (error) => {
        console.log('GameClient error:', error);
      });
      dealer.on('message', this.handleMessage.bind(this));
      this.dealers[i] = dealer;
    }
    process.on('beforeExit', () => {
      this.disconnect();
    });
  }

  connect() {
    config.get('game.servers').map((server) => {
      this.dealer.connect(server);
    });
  }

  disconnect() {
    for (var i = 0; i < this.dealers.length; ++i) {
      this.dealers[i].disconnect(gameServers[i]);
    }
  }

  getDestination(shardKey) {
    // Support up to 256 shards
    var shardIdx = crc.crc8(shardKey) % this.dealers.length;
    return this.dealers[shardIdx];
  }

  send(shardKey, message) {
    this.getDestination(shardKey).send(JSON.stringify(message));
  }

  handleMessage(data) {
    var parsed = JSON.parse(data);
    this.emit(parsed[0], parsed.slice(1));
  }
}

module.exports = new GameClient();
