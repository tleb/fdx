const WSServer  = require('ws').Server
const Datastore = require('nedb')
const fdx       = require('./../../index')

const db  = new Datastore({ filename: './data.db', autoload: true })
const wss = new WSServer({ host: 'localhost', port: 5000 })
var conns = []


wss.on('connection', (ws) => {
    c = fdx(ws)
    c.data = {}
    // add the connection to conns
    conns.push(c)

    // remove the connection from conns on close
    ws.on('close', () => {
        let index = conns.indexOf(c)
        if (index > -1) conns.splice(index, 1)
    })

    c.on('register', (data, cb) => {
        generateId((err, id) => {
            if (err) return cb({ error: 'Id generation failed: ' + err.message })

            db.insert({ id: id, name: '' }, (err, doc) => {
                if (err) return cb({ error: 'Database insertion failed: ' + err.message })

                cb({ id: id })
                c.data.id = id
            })
        })
    })

    c.on('login', (data, cb) => {
        if (!data.id) return cb({ error: 'Missing id in data' })

        db.findOne({ id: data.id }, (err, doc) => {
            if (err) return cb({ error: 'Database lookup failed: ' + err.message })
            if (!doc) return cb({ error: 'Unknown id', mustRegister: true })

            cb({ id: data.id, name: doc.name })
        })
    })
})

function generateId(cb) {
    var id = randStr(3, 'ACDEFGHJKLMNPQRSTUVWXY345679')

    db.findOne({ id: id }, (err, doc) => {
        if (err) return cb(err)
        if (doc) return generateId(cb)
        cb(null, id)
    })
}

function randStr(len, chars) {
    var res = ""
    for (var i = 0; i < len; i++) {
        res += chars[Math.floor(Math.random() * chars.length)]
    }
    return res
}
