'use strict';

var express = require('express');

function placeCard(req, res) {
  res.status(204).json(null);
}

function endTurn(req, res) {
  res.status(204).json(null);
}

function getRouter() {
  var router = express.Router();
  router.get('/place', placeCard);
  router.get('/end', endTurn);
  return router;
}

module.exports = {
  getRouter: getRouter
};
