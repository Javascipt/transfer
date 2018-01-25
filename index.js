var config  = require('./config');
var request = require('request');

var Transfer = function () {
    this._version = require('./package.json').version;
};

Transfer.prototype.to = function (options) {
    var port    = isNaN(options) === false ? options : 80;
    var url     = isNaN(options) === true  ? options : `http://127.0.0.1:${port}`;

    //-- Attempt to connect to Transfer.pub servers --
    this._socket = require('socket.io-client')(config.socketUrl);

    return new Promise((resolve, reject) => {
        //-- Define token handler --
        var tokenHandler = (token) => {
            //-- Clear timeout to avoid rejecting the promise after resolving --
            clearTimeout(this._timeout);

            //-- Store the token --
            this._token = token;

            //-- Resolve the promise
            resolve({
                token   : token,
                url     : config.protocol + token + '.' + config.hostname,
                pathUrl : config.protocol + 'path.' + config.hostname + '/' + token
            });
        };

        //-- Set timeout in case no response received from the server --
        this._timeout = setTimeout(() => {

            //-- Remove the listner to avoid receiving late reply --
            this._socket.off('token', tokenHandler);

            //-- Disconnect from transfer.pub servers --
            this._socket.disconnect();
            reject('Connection timeout');

        }, config.timeout);

        //-- Handle token receiving then request the token when ready --
        this._socket.on('token', tokenHandler);
        this._socket.on('ready', () => {
            this._socket.emit('token', { version : this._version });
        });
        
        //-- Reproduce the request sent to the server --
        this._socket.on('request', (data) => {
            delete data.headers.host;
            request[data.method.toLowerCase()]({
                url     : url + data.route,
                body    : data.body.toString(),
                headers : data.headers,
                encoding: data.encoding
            }, (err, response) => {
                this._socket.emit('response', {
                    status  : (response || { statusCode : 500 }).statusCode,
                    body    : (response || {}).body,
                    headers : (response || {}).headers
                });
            });
        });
    });
};

Transfer.prototype.disconnect = function () {
    //-- Disconnect only when already connected --
    this._socket && this._socket.disconnect();
};

//-- Returning new instance of Transfer each time the module is required --
Object.defineProperty(module, 'exports', {
    get: () => new Transfer()
});