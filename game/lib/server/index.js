'use strict';

var zmq = require('zmq');
var config = require('config');
var EventEmitter = require('events').EventEmitter;

class Router extends EventEmitter {
  constructor() {
    super();

    this.router = zmq.createSocket('router');
    this.router.setsockopt(zmq.ZMQ_ROUTER_MANDATORY, 1);
    var port = config.get('zmq.port');
    var routerUri = 'tcp://0.0.0.0:' + port;
    this.router.identity = 'game:' + port;
    this.router.bindSync(routerUri);
    console.log('Game server started and listening on ' + routerUri +'!');

    this.router.on('error', (error) => {
      console.log('error', error);
    });

    this.router.on('message', this.handleMessage.bind(this));

    process.on('beforeExit', () => {
      this.router.close();
    });
  }

  handleMessage (from, data) {
    var parsed = JSON.parse(data);
    this.emit(parsed[0], from, parsed.slice(1));
  }

  send (to, message) {
    this.router.send([to, JSON.stringify(message)]);
  }
}

module.exports = new Router();
