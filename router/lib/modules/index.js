'use strict';

function initializeRoutes(app) {
  app.use(function (req, res, next) {
    if (req.path === '/api/messages') {
      next();
      return;
    }
    console.info('Received request: ', req.originalUrl);
    next();
  });

  app.get('/api', function (req, res) {
    res.json({
      result: 'Hello world!'
    });
  });

  app.use('/api/game', require('./game').getRouter());
  app.use('/api/messages', require('./messages').getRouter());
  app.use('/api/queue', require('./queue').getRouter());
}

module.exports = {
  initializeRoutes: initializeRoutes
};

