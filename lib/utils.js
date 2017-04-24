const randomatic = require('randomatic')

const LOCAL_ERRORS = [
    'Non-valid JSON received.',
    'Missing type or token on received JSON message.',
]

const REMOTE_ERRORS = [
    'Missing command.',
    'Unknown command.',
    'Unknown message type (should be "req" or "res").',
]

function objIsEmpty(obj) {
    return Object.keys(obj).length === 0
}

function createRequest(command, data, noAnswer) {
    let req = {
        type: 'req',
        token: randomatic('*', 6),  // 85^6 = 377 149 515 625
        command: command,
        data: data,
    }

    if (noAnswer) req.noAnswer = true;

    return req
}

function randomId() {
    return randomatic('*', 10)  // 85^10 = 19 687 440 434 072 265 625
}

module.exports = {
    LOCAL_ERRORS,
    REMOTE_ERRORS,
    objIsEmpty,
    createRequest,
    randomId,
}
