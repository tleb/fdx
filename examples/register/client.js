const fdx  = require('./../../index')
var client = fdx.Client('ws://localhost:5000')

client.ws.on('open', () => {
    client.emit('register', {}, (data) => {
        console.log('register, got id', data.id)
        logIn(data.id)
    })
})

function logIn(id) {
    client = fdx.Client('ws://localhost:5000')
    client.ws.on('open', () => {
        client.emit('login', { id: id }, (data) => {
            console.log('log in using id', data.id)
        })
    })
}
