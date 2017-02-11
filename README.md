# fdx-cmd

Full-duplex commands through a websocket connection. Basically, it's an RPC where both sides can send commands to the other one.

## Usage

`conn.on(command, cb)`: define the callback which will answer to a command. The signature of the callback is: `function(data, send)` where `data` is the received data and `send` is the callback to call with the data to send as an answer.

`conn.emit(command, data, cb)`: send a command to the connection with data. `cb` is the function which will get called when the command gets answered. It takes one argument: the data received in the response.

`conn.close()`: closes the connection when no more answers are expected.

I would recommend having `register` and `login` commands which give unique IDs to slaves.

## TODO

- [ ] Proper error handling, not just `console.log`
- [ ] Timeout on response callbacks, because if no response is received, it can't close the ws connection
- [ ] Add pubsub
- [ ] Add a function which handles a ws server, adding connections to a client obj, give id to each connection
