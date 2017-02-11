const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

module.exports = function(ws) {
    this.ws        = ws
    this.waiters   = {}    // the CBs which are waiting for a res to their req
    this.commands  = {}    // known commands
    this.mustClose = false
    this.timeout   = 5000

    this.on    = on
    this.emit  = emit
    this.close = close

    this.ws.respond = wsRespond
    this.ws.error   = wsError

    this.ws.on('message', wsOnMsg.bind(this))

    return this
}

function on(command, cb) {
    // add the cb to the commands
    this.commands[command] = cb
}

function emit(command, data, cb) {
    if (!cb) {  // allow to pass no data
        cb = data
        data = {}
    } else if (!data) {  // if data is null, unsigned or something else
        data = {}
    }

    res = {  // request objet
        type:    'req',
        token:   randStr(6, chars), // 36^6 = 2 176 782 336
        command: command,
        data:    data,
    }

    // we add the cb to the waiters, it will be called on the res with the same
    // token
    this.waiters[res.token] = cb

    if (this.timeout > 0) {
        setTimeout(() => {
            if (this.waiters[res.token] != undefined) {
                cb({ error: 'timeout' })
                delete this.waiters[res.token]
            }
        }, this.timeout)
    }

    // we send the req
    ws.send(JSON.stringify(res))
}

function close() {
    if (this.ws.readyState === 2 || this.ws.readyState === 3) {
        return  // if it's closing or already closed
    }

    if (Object.keys(this.waiters).length === 0) {
        return this.ws.close()  // if there is no waiters, we can close now
    }

    // don't close close until all responses have been given
    this.close = true
}

function wsRespond(token, data) {
    if (!data) data = {}  // send even without data
    this.send(JSON.stringify({ type: 'res', token: token, data: data }))
}

function wsError(token, msg) {
    // send res with error message in data
    this.respond(token, { error: msg })
}

function wsOnMsg(msg) {
    try {  // parse JSON
        msg = JSON.parse(msg)
    } catch (e) {  // stop if JSON parsing failed
        return console.log('Non-valid JSON received.')
    }

    // check for the type and token properties
    if (msg.type === undefined || msg.token === undefined) {
        return console.log('Missing type or token on received JSON message.')
    }

    // if we receive a req, we need to send the appropriate res
    if (msg.type === 'req') {
        // check for the command property
        if (msg.command === undefined) {
            return this.ws.error(msg.token, 'Missing command.')
        }

        // call the correct command
        let cmd  = this.commands[msg.command]
        let data = msg.data ? msg.data : {}
        return cmd(data, (data) => this.ws.respond(msg.token, data))
    }

    // if we receive a res, we need to call the correct response-waiter
    if (msg.type === 'res') {
        if (this.waiters[msg.token] instanceof Function) {
            this.waiters[msg.token](msg.data ? msg.data : {})
        }

        delete this.waiters[msg.token]

        if (this.mustClose && Object.keys(this.waiters).length === 0) this.ws.close()
        return
    }

    console.log('Unknown message type.')
}



function randStr(len, chars) {
    var res = ""
    for (var i = 0; i < len; i++) {
        res += chars[Math.floor(Math.random() * chars.length)]
    }
    return res
}
