const WS   = require('ws')
const fs   = require('fs')
const util = require('util')

const ws        = new WS('ws://localhost:5000')
const c         = require('./../../index')(ws)
var id          = null
var loginOnOpen = false

fs.readFile('id.txt', { encoding: 'UTF-8' }, (err, data) => {
    if (!err) id = data.trim()

    if (ws.readyState === 1) return login()
    loginOnOpen = true
})

ws.on('open', () => {
    if (loginOnOpen) login()
})

function login() {
    function register() {
        c.emit('register', (data) => {
            if (data.err) {
                console.log('Error received on register: ' + data.err.message)
                process.exit()
            }

            id = data.id

            fs.writeFile('id.txt', id, { encoding: 'UTF-8' }, (err) => {
                if (err) console.log('writeFile failed: ' + err.message)
            })
        })
    }

    if (id) {
        return c.emit('login', { id: id }, (data) => {
            if (data.mustRegister) return register()
            if (data.err) console.log('Error received on login: ' + data.err.message)

            console.log('login successful, id=' + id)
        })
    }

    register()
}
