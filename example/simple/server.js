// you can use uws for better performance
const WSServer = require('ws').Server
const fdx      = require('./../../index')
const wss      = new WSServer({ host: 'localhost', port: 5000 })
var conns      = []


wss.on('connection', (ws) => {
    c = fdx(ws)
    // add the connection to conns
    conns.push(c)

    // remove the connection from conns on close
    ws.on('close', () => {
        let index = conns.indexOf(c)
        if (index > -1) conns.splice(index, 1)
    })

    // define a command we can answer to
    c.on('print', (data, cb) => {
        // messages are identified by a token, we can send a command while
        // the connection is waiting for a response without any problem
        c.emit('print', {msg: 'yes'}, (data) => {
            console.log('message arrived without any issue')
        })

        console.log(data)
        cb({ msg: 'done, bro!' })
    })
})
