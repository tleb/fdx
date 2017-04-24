const server = require('./../../index').Server({ port: 5000 }, console.log)

server.on('ping', (data, cb, ws, noAnswer) => {
    console.log('received ping => sending pong')
    cb() // you can pass data to send
         // if noAnswer is true, the sender doesn't want a response and cb
         // wont do anything
})
