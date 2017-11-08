const fs = require('fs')

module.exports = function getFileNamesInDir(dirName) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirName, (err, files) => {
      if (err) throw new Error(err)
      resolve(files)
    })
  })
}