'use strict';

var redisClient = require('../redis').getClient();

var prefixkey = 'messages:';

class Messaging {
    createMessage(name, content) {
        return JSON.stringify([name, content]);
    }

    readMessage (message) {
        return JSON.parse(message);
    }

    send(address, message) {
        return new Promise((resolve, reject) => {
            redisClient.rpush(prefixkey + address, message, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(res);
            });
        });
    }

    receive(address) {
        return new Promise((resolve, reject) => {
            function clearQueue(messages) {
                redisClient.ltrim(prefixkey + address, messages.length, -1, (err, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(messages);
                });
            }

            redisClient.lrange(prefixkey + address, 0, -1, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                clearQueue(res);
            });
        });
    }
}

module.exports = new Messaging();