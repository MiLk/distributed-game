'use strict';

var redisClient = require('../../redis').getClient();
var messaging = require('../../messaging');

var waitingQueueKey = 'matchmaking_queue:waiting';
var confirmQueueKey = 'matchmaking_queue:confirm';

class Queue {
  join(sessionId) {
    return new Promise((resolve, reject) => {
      function appendToQueue() {
        redisClient.sadd(waitingQueueKey, sessionId, (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        })
      }

      function moveToWaiting(player, opponent) {
        var confirmId = opponent + ':' + player;
        redisClient.sadd(confirmQueueKey, confirmId, (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          messaging
            .send(opponent, messaging.createMessage('gameFound', confirmId))
            .then(() => {
              resolve(confirmId);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }

      redisClient.spop(waitingQueueKey, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        if (!res) {
          appendToQueue();
          return;
        }
        moveToWaiting(sessionId, res);
      });
    });

  }

  leave(sessionId) {
    return new Promise((resolve, reject) => {
      redisClient.srem(waitingQueueKey, sessionId, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  confirm(sessionId, confirmId) {
    return new Promise((resolve, reject) => {
      function checkIfReady() {
        redisClient.hlen(confirmQueueKey + ':' + confirmId, (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          if (res !== 2) {
            resolve(false);
            return;
          }
          var players = confirmId.split(':');
          var opponent = players[0] === sessionId ? players[1] : players[0];

          // TODO: Notify the game server to start the game
          messaging
            .send(opponent, messaging.createMessage('gameStart', true))
            .then(() => {
              resolve(true);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }

      function markAsConfirmed() {
        redisClient.hset(confirmQueueKey + ':' + confirmId, sessionId, 1, (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          checkIfReady();
        })
      }

      redisClient.sismember(confirmQueueKey, confirmId, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        if (!res) {
          reject('Invalid confirm Id');
          return;
        }
        markAsConfirmed();
      });
    });
  }

  cancel(sessionId, confirmId) {
    return new Promise((resolve, reject) => {
      function markAsCanceled() {
        redisClient.hdel(confirmQueueKey + ':' + confirmId, sessionId, (err, res) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      }

      redisClient.sismember(confirmQueueKey, confirmId, (err, res) => {
        if (err) {
          reject(err);
          return;
        }
        if (!res) {
          reject('Invalid confirm Id');
          return;
        }
        markAsCanceled();
      });
    });
  }
}

module.exports = new Queue();
