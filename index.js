var config          = require('./config');
var request         = require('request');

var socket;

module.exports = {
    to : function (url) {
        return new Promise((resolve, reject) => {
            socket = require('socket.io-client')(config.protocol + config.hostname);
            socket.on('id', (id) => {
                resolve({
                    id      : id,
                    url     : config.protocol + id + '.' + config.hostname,
                    pathUrl : config.protocol + 'path.' + config.hostname + '/' + id
                });
            });
            socket.emit('id');
            
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


module.exports.to('https://httpbin.org')
    .then(console.log);