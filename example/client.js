const WS = require('ws')
const ws = new WS('ws://localhost:5000')
const c  = require('./../index')(ws)

// we can define a command here, too!
c.on('print', (data, cb) => {
    console.log(data)
    cb({ msg: 'done, bro!' })
})

ws.on('open', () => {
    c.emit('print', {foo: 'bar'}, (data) => {
        // we are receiving the response
        console.log(data)
    })
})
