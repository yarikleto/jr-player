const app = new (require('koa'))(),
      server = require('http').createServer(app.callback()),
      io = require('socket.io')(server),
      { handleServerIsStarted } = require('./helpers'),
      serverIO = new (require('./ServerIO'))(io)

server.listen(9100, handleServerIsStarted)




