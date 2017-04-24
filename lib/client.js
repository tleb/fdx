const utils = require('./utils')

function client(ws, onError, timeout, id) {
    this.ws               = ws
    this.onError          = onError
    this.timeout          = timeout
    this.id               = id
    this.pendingCallbacks = {}
    this.commands         = {}
    this.onClose          = false

    this.ws.on('message', onMessage.bind(this))
}

client.prototype._error = function(errorId) {
    this.onError(new Error(utils.LOCAL_ERRORS[errorId]))
}

client.prototype._wsError = function(token, errorId) {
    this._respond(token, { error: utils.REMOTE_ERRORS[errorId] })
}

client.prototype._respond = function(token, data) {
    if (!data) data = {};
    this._send({ type: 'res', token: token, data: data })
}

client.prototype._send = function(obj) {
    this.ws.send(JSON.stringify(obj))
}

client.prototype.on = function(command, cb) {
    this.commands[command] = cb
}

client.prototype.emit = function(command, data, cb) {
    if (cb instanceof Function) {
        data = data || {}
    } else if (data instanceof Function) {
        [data, cb] = [cb || {}, data]
    }

    let req = utils.createRequest(command, data, !cb)
    if (cb) this.pendingCallbacks[req.token] = cb;

    if (this.timeout > 0) {
        setTimeout(() => {
            if (this.pendingCallbacks[req.token]) {
                cb({ error: 'timeout' })
                delete this.pendingCallbacks[req.token]
            }
        }, this.timeout)
    }

    this._send(req)
}

client.prototype.close = function(cb) {
    this.onClose = cb || true

    if ([2, 3].indexOf(this.ws.readyState) != -1) return this._close();
    if (utils.objIsEmpty(this.pendingCallbacks)) {
        this.ws.close()
        return this._close()
    }
}

client.prototype._close = function() {
    if (this.onClose instanceof Function) this.onClose();
}

function onMessage(msg) {
    try { msg = JSON.parse(msg) }
    catch (e) { return this._error(0) }

    if (!msg.type || !msg.token) return this._error(1);

    msg.data = msg.data || {}

    if (msg.type === 'req') return onRequest.bind(this)(msg);
    if (msg.type === 'res') return onResponse.bind(this)(msg);

    this._wsError(msg.token, 2)
}

function onRequest(msg) {
    if (!msg.command) return this._wsError(msg.token, 0);

    let commandCallback = this.commands[msg.command]
    if (!commandCallback) return this._wsError(msg.token, 1);

    commandCallback(
        msg.data,
        (data) => { if (!msg.noAnswer) this._respond(msg.token, data) },
        this,
        msg.noAnswer
    )
}

function onResponse(msg) {
    let cb = this.pendingCallbacks[msg.token]
    if (cb) cb(msg.data, this);

    delete this.pendingCallbacks[msg.token]

    if (this.onClose && utils.objIsEmpty(this.pendingCallbacks)) {
        this.ws.close()
        this._close()
    }
}

module.exports = client
