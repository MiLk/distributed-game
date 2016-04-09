'use strict';

var express = require('express');
var messaging = require('../../messaging');

function getMessages(req, res) {
    var sessionId = req.headers['x-session-id'];
    messaging.receive(sessionId)
        .then((messages) => {
            res.json(messages.map(messaging.readMessage));
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

module.exports = {
    getRouter: getRouter
};