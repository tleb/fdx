const client = require('./client')
const utils  = require('./utils')

function server(wss, onError, timeout) {
    this.wss      = wss
    this.onError  = onError
    this.conns    = {}
    this.timeout  = timeout
    this.commands = {}

    this.wss.on('connection', onConnection.bind(this))
}

server.prototype.on = function(command, cb) {
    this.commands[command] = cb
}

server.prototype.broadcast = function(command, data, cb) {
    for (let id in this.conns) {
        if (!this.conns.hasOwnProperty(id)) continue;
        ws.emit(command, data, cb)
    }
}

server.prototype.close = function(cb) {
    //
}

function onConnection(ws) {
    let id = utils.randomId()

    let conn = new client(ws, this.onError, this.timeout, id)
    conn.commands = this.commands
    conn.storage = {}

    this.conns[id] = conn

    ws.on('close', () => {
        delete this.conns[id]
    })
}

module.exports = server
