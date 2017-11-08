
// TODO: Заменить NodeID3 на что-то другое. Падает при большом количестве треков
const NodeID3 = require('node-id3')

const path = require('path')
const { isEqualArrays, getFileNamesInDir } = require('./helpers')
const { NEW_MUSIC, GET_MUSIC, SEND_MUSIC } = require('./constants/music')
const CONFIG = require('./config')

module.exports = class ServerIO {
  constructor(io) {
    this.socket = null
    this.currentMusicNames = []
    
    this.init = this.init.bind(this)
    this.handleIOConnection = this.handleIOConnection.bind(this)
    this.checkMusicFolderWithInterval = this.checkMusicFolderWithInterval.bind(this)
    this.checkOnChangeMusicFolder = this.checkOnChangeMusicFolder.bind(this)
    this.emit = this.emit.bind(this)
    this.formatMusicNames = this.formatMusicNames.bind(this)
    this.handleGetMusic = this.handleGetMusic.bind(this)
    
   
   io.on('connection', this.handleIOConnection)
  }
  
  init() {
    this.currentMusicNames = []
    this.checkMusicFolderWithInterval()
    this.socket.on(GET_MUSIC, this.handleGetMusic)
  }

  /**
   * @desc Когда клиент просит список песен, то эта функция отправляет песни в нужном виде
   */
  async handleGetMusic() {
    const formatedMusic = await this.formatMusicNames(this.currentMusicNames)
    this.socket.emit(SEND_MUSIC, formatedMusic)
  }

  handleIOConnection(socket) {
    this.socket = socket
    this.init()
  }

  /**
  * @desc Запускает слежку за папкой с музыкой
  * @param { number } interval in ms. Default value equals 5s
  * @return { number } Returns interval id
  */
  checkMusicFolderWithInterval(interval = 5e3) {
    return setInterval(this.checkOnChangeMusicFolder, interval)
  }

  /**
   * @desc Сравнивает новые данные папки с музыкой, если есть различия - сказать клиенту об этом
   */
  async checkOnChangeMusicFolder() {
    const newMusicNames = await getFileNamesInDir(CONFIG.paths.musicFullPath)
    if (isEqualArrays(newMusicNames, this.currentMusicNames) === false) {
      this.currentMusicNames = newMusicNames;
      this.emit(NEW_MUSIC)
    }
  }

  /**
   * @desc Emit action to SocketIO
   * @param { string } action
   * @param { any } payload
   */
  emit(action, payload = null) {
    this.socket.emit(action, payload)
  }
  
  /**
   * @desc Приводит названия песен в обьекты с метаданными и отдает
   * @param { Array<string> } musicNames
   * @return { Array<Object> }
   */
  async formatMusicNames(musicNames = []) {
    //TODO: перевести с императивного стиля в более декларативный
    
    // FIXME: Обернуть async в try/catch
    const formatedMusic = await Promise.all(
      musicNames.map( trackName => {
        return new Promise((resolve, reject) => {
          const fullFilePath = path.join(CONFIG.paths.musicFullPath, trackName)
          NodeID3.read(fullFilePath, (err, tags) => {
            if (err) {
              console.log(err)
              reject(err)
            }
            
            resolve({
              artist: tags.artist || '',
              name: tags.title || '',
              fullname: trackName,
            })
          })
        })
      })
    )
    return {
      meta: {
        path: CONFIG.paths.musicDirName + '/', // Example: 'music/'
      },
      music: formatedMusic,
    }
  }

}