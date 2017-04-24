const WSClient = require('ws')
const WSServer = require('uws').Server
const server   = require('./lib/server')
const client   = require('./lib/client')

module.exports = {
    Client: function(address, onError, timeout=5000) {
        return new client(new WSClient(address), onError, timeout)
    },
    Server: function(options, onError, timeout=5000) {
        return new server(new WSServer(options), onError, timeout)
    },
}
