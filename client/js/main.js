$(document).ready(function () {

    // Session management
    // TODO: Ask the server to give you a session ID
    function generateNewId() {
        return btoa(
            '' +
            Math.floor((Math.random() * 997) % 983) +
            Date.now() +
            Math.floor((Math.random() * 991) % 977)
        );
    }

    var sessionId = generateNewId();

    // Game logic variables
    var confirmId = null;

    // Functions
    function handleMessage(message) {
        switch (message[0]) {
            case 'gameFound':
                return handler['join-queue'](message[1]);
            case 'gameStart':
                return handler['start-game'](message[1]);
            default:
        }
    }

    var handler = {
        'join-queue': function (_confirmId) {
            if (!_confirmId) {
                console.log('You have joined the queue!');
                return;
            }
            confirmId = _confirmId;
            console.log('You can now start the game!');
        },
        'leave-queue': function () {
            console.log('You left the queue!');
        },
        'start-game': function (isStarted) {
            if (!isStarted) {
                console.log('Waiting for the opponent...');
                return;
            }
            console.log('The game has started!');
        },
        'cancel-game': function() {
            console.log('You cancel the game, but you can still join it.')
        }
    };

    function handleResponse(callId, response) {
        if (!handler.hasOwnProperty(callId)) {
            return;
        }
        handler[callId](response);
    }

    var urlForCallIds = {
        'join-queue': '/queue/join',
        'leave-queue': '/queue/leave',
        'start-game': '/queue/confirm',
        'cancel-game': '/queue/cancel',
        'place-card': '/game/place',
        'end-turn': '/game/end'
    };

    function doCall(url, method, data) {
        return $.ajax({
            cache: false,
            method: method || 'GET',
            url: '/api' + url,
            headers: {
                'X-Session-Id': sessionId
            },
            dataType: 'json',
            contentType: 'application/json; charset=UTF-8',
            data: JSON.stringify(data) || null
        });
    }

    (function shortPolling() {
        doCall('/messages')
            .done(function (messages) {
                if (messages && Array.isArray(messages)) {
                    messages.forEach(handleMessage);
                }
                setTimeout(shortPolling, 1000);
            })
            .fail(function (xhr, status, error) {
                console.error('Error:', status, error);
            });
    })();

    $('button').on('click', function () {
        var $this = $(this);
        var callId = $this.attr('data-call');

        if (!urlForCallIds.hasOwnProperty(callId)) {
            console.error('Invalid call ID: ' + callId);
            return;
        }

        var promise = null;
        switch (callId) {
            case 'start-game':
            case 'cancel-game':
                promise = doCall(urlForCallIds[callId], 'POST', {
                    confirm: confirmId
                });
                break;
            default:
                promise = doCall(urlForCallIds[callId]);
        }
        promise.done(function (data) {
            handleResponse(callId, data);
        }).fail(function (xhr, status, error) {
            console.error('Error:', status, error);
        });
    });
});