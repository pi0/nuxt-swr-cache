const { debug } = require('./utils')

exports.exec = (items) => {
  // eslint-disable-next-line no-unused-vars
  for (const [name, value] of items.entries()) {
    items.delete(name)
    debug(items.name, 'LRU: delete url from cache')
    break
  }
}
