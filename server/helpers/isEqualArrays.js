/**
 * @param { Array<string> } firstArray
 * @param { Array<string> } secondArray
 * @return { boolean }
 */
module.exports = function isEqualArrays(firstArray = [], secondArray = []) {
  return [
    firstArray.length === secondArray.length,
    firstArray.every(firstArrayItem => secondArray.includes(firstArrayItem))
  ].every(Boolean)
}