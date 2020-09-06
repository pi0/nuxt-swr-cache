const { debug } = require('./utils')

module.exports = (items) => {
  let tmp = ''

  for (const item in items) {
    tmp = item
  }

  debug(tmp, 'delete item from cache because full memory')
  delete items[tmp]
}
