const fdx    = require('./../../index')
const client = fdx.Client('ws://localhost:5000')

client.ws.on('open', () => {
    console.log('sending ping')
    client.emit('ping', () => {
        console.log('received pong')
    })
})

// even though it's not used in this example, clients too can receive commands
client.on('ping', (data, cb, ws, noAnswer) => {
    console.log('received ping => sending pong')
    cb()
})
