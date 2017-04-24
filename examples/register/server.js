const server = require('./../../index').Server({ port: 5000 }, console.log)
const randomatic = require('randomatic')
const CHARS = 'ACDEFGHJKLMNPQRSTUVWXY345679'

// id: true
const db = {}

server.on('register', (data, cb, ws, noAnswer) => {
    let id = generateId()

    db[id] = true
    ws.storage.id = id
    cb({ id: id })
})

server.on('login', (data, cb, ws, noAnswer) => {
    if (!data.id) return cb({ error: 'Missing id.' });
    if (!db[data.id]) return cb({ error: 'Unknown id.', mustRegister: true });

    ws.storage.id = data.id
    cb({ id: data.id })
})

function generateId() {
    while (true) {
        let id = randomatic('?', 3, { chars: CHARS })
        if (!db[id]) return id
    }
}
