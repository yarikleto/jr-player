const app = new (require('koa'))()
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)
const { handleServerIsStarted } = require('./helpers')
const CONFIG = require('./config')
const serverIO = new (require('./ServerIO'))(io)

server.listen(CONFIG.port, handleServerIsStarted)




