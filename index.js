var config          = require('./config');
var request         = require('request');
var socket;

module.exports = {
    to : function (url) {
        return new Promise((resolve, reject) => {
            socket = require('socket.io-client')(config.socketUrl);
            socket.on('token', (token) => {
                resolve({
                    token   : token,
                    url     : config.protocol + token + '.' + config.hostname,
                    pathUrl : config.protocol + 'path.' + config.hostname + '/' + token
                });
            });
            socket.emit('token');
            
            socket.on('request', (data) => {
                delete data.headers.host;

                request[data.method.toLowerCase()]({
                    url     : url + data.route,
                    body    : data.body.toString(),
                    headers : data.headers
                }, function (err, response, body) {
                    socket.emit('response', {
                        status  : (response || { statusCode : 500 }).statusCode,
                        body    : (response || {}).body,
                        headers : (response || {}).headers
                    });
                });
            });
        });
    },
    disconnect : function () {
        socket && socket.disconnect();
    }
};