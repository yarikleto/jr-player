const path = require('path')

module.exports = {
  port: 9100,
  paths: {
    musicFullPath: path.join(__dirname, '../music'),
    musicDirName: 'music'
  },
}