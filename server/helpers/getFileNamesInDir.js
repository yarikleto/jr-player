const fs = require('fs')

/**
 * @desc Смотрит, есть ли файлы в папке, если есть - отдавет массив названий
 */
module.exports = function getFileNamesInDir(dirName) {
  return new Promise((resolve, reject) => {
    fs.readdir(dirName, (err, files) => {
      if (err) throw new Error(err)
      resolve(files)
    })
  })
}