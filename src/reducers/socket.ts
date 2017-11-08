import * as io from 'socket.io-client'

const HOST = 'http://localhost:9100'

export function socket(state: SocketIOClient.Socket = io(HOST), action: any) {
  return state
}


