var assert      = require('assert');
var mock        = require('mock-require');
var Server      = require('mock-socket').Server;

/* global describe before it */

describe('Transfer.prototype.to - Connection', () => {
    var config  = require('../config');

    //-- Mock socket.io-client for both tests --
    mock('socket.io-client', require('mock-socket').SocketIO);

    var success = {};
    var failure = {};
    var server  = {};

    before((done) => {
        Promise.resolve()
            .then(() => {
                mock('./config', Object.assign(config, { socketUrl : 'http://localhost:8080', timeout : 100 }));
                server  = new Server(config.socketUrl);
                success = { transfer : require('..') };

                server.on('connection', () => {
                    success.outcome = 'success';
                    server.stop();
                });
        
                return success.transfer.to(1234).then(() => {}).catch(() => {});
            })
            .then(() => {
                mock('./config', Object.assign(config, { socketUrl : 'http://localhost:8081', timeout : 100 }));
                failure = { transfer : require('..') };

                return failure.transfer.to(1234).then(() => {}).catch(() => {});
            })
            .then(done);
    });

    it('Should connect successfully when server is up', () => assert.equal(success.outcome, 'success'));
    it('Should\'t be able to connect when server is down', () => assert.equal(failure.outcome, undefined));
});

describe('Transfer.prototype.to - Token', () => {
    var config  = require('../config');

    //-- Mock socket.io-client for both tests --
    mock('socket.io-client', require('mock-socket').SocketIO);

    var success = {};
    var failure = {};
    var server  = {};

    before((done) => {
        Promise.resolve()
            .then(() => {
                mock('./config', Object.assign(config, { socketUrl : 'http://localhost:8080', timeout : 100 }));
                server  = new Server(config.socketUrl);
                success = { transfer : require('..'), outcome : {} };

                server.on('connection', socket => {
                    socket.on('token', () => {
                        socket.emit('token', 'test');
                        server.stop();
                    });
                    socket.emit('ready');
                });

                return success.transfer
                    .to(1234)
                    .then(data => success.outcome.token = data.token);
            })
            .then(() => {
                mock('./config', Object.assign(config, { socketUrl : 'http://localhost:8081', timeout : 100 }));
                server  = new Server(config.socketUrl);
                failure = { transfer : require('..'), outcome : {} };

                server.on('connection', socket => {
                    socket.on('token', server.stop);
                    socket.emit('ready');
                });

                return failure.transfer
                    .to(1234)
                    .then(data => failure.outcome.token = data.token)
                    .catch(error => failure.outcome.error = error);
            })
            .then(() => done());
    });

    it('Should successfully receive the token', () => assert.equal(success.outcome.token, 'test'));
    it('Should\'t throw timeout exception when no token received from Transfer.pub servers', () => {
        assert.equal(failure.outcome.token, undefined);
        assert.equal(failure.outcome.error, 'Connection timeout');
    });
});

describe('Transfer.prototype.to - Request reproduction', () => {
    // Test different methods , headers , body ...
});

describe('Transfer.prototype.disconnect', () => {
    
    it('Should not throw exception when not connected', () => {
        var transfer = require('..');

        transfer._socket = null;
        transfer.disconnect();
    });

    it('Should disconnect successfully', () => {
        var transfer = require('..');

        transfer._socket = { disconnect : () => { transfer._socket._disconnected = true; } };
        transfer.disconnect();
        
        assert.equal(transfer._socket._disconnected, true);
    });
});