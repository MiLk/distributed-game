'use strict';

var express = require('express');
var queue = require('./queue');

function join(req, res) {
  var sessionId = req.headers['x-session-id'];
  queue.join(sessionId)
    .then((data) => {
      if (!data) {
        res.status(204).json(null);
        return;
      }
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({
        error: error
      });
    });
}

function leave(req, res) {
  var sessionId = req.headers['x-session-id'];
  queue.leave(sessionId)
    .then(() => {
      res.status(204).json(null);
    })
    .catch((error) => {
      res.status(500).json({
        error: error
      });
    });
}

function confirm(req, res) {
  var sessionId = req.headers['x-session-id'];
  if (!req.body || !req.body.confirm) {
    res.status(400).json({
      error: 'Invalid confirm Id'
    });
    return;
  }
  queue.confirm(sessionId, req.body.confirm)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      res.status(500).json({
        error: error
      });
    });
}

function cancel(req, res) {
  var sessionId = req.headers['x-session-id'];
  if (!req.body || !req.body.confirm) {
    res.status(400).json({
      error: 'Invalid confirm Id'
    });
    return;
  }
  queue.cancel(sessionId, req.body.confirm)
    .then(() => {
      res.status(204).json();
    })
    .catch((error) => {
      res.status(500).json({
        error: error
      });
    });
}

function getRouter() {
  var router = express.Router();
  router.get('/join', join);
  router.get('/leave', leave);
  router.post('/confirm', confirm);
  router.post('/cancel', cancel);
  return router;
}

module.exports = {
  getRouter: getRouter
};
