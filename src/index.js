const { resolve } = require('path')
const { totalmem } = require('os')
const etag = require('etag')
const lru = require('./algorithm')
const { debug } = require('./utils')

module.exports = function (moduleOptions) {
  // route => { url, date, strategy, hash, html, stale }
  const cacheItems = {}

  this.options.nuxtCache = {
    ...(this.options.nuxtCache || {}),
    ...(moduleOptions || {})
  }

  const global = this.options.nuxtCache.global
  const expirationMultiplicator = this.options.nuxtCache.expiration || 5
  const memory = this.options.nuxtCache.memory || 0

  this.addPlugin({
    src: resolve(__dirname, 'cache.server.js'),
    fileName: 'cache.server.js'
  })

  const updateJobs = {}

  const updateInBackground = (cacheItem) => {
    if (updateJobs[cacheItem.url]) {
      debug(cacheItem.url, 'Already Updating in background')
      return
    }
    debug(cacheItem.url, 'Updating in background')
    updateJobs[cacheItem.url] = Promise.resolve().then(async () => {
      const { html } = await this.nuxt.renderRoute(cacheItem.url, {})
      cacheItem.html = html
      cacheItem.date = new Date()
      debug(cacheItem.url, 'Updated cache in background')
      delete updateJobs[cacheItem.url]
    }).catch((err) => {
      debug(cacheItem.url, err)
      delete updateJobs[cacheItem.url]
    })
  }

  this.options.serverMiddleware.unshift((req, res, next) => {
    const cacheItem = cacheItems[req.url]
    if (!cacheItem) {
      return next()
    }

    const expired = (Date.now() - cacheItem.date) > cacheItem.maxAge * 1000

    if (expired) {
      debug(cacheItem.url, 'Expired')
      if (cacheItem.stale) {
        debug(req.url, 'Using Stale')
        updateInBackground(cacheItem)
        return res.end(cacheItem.html)
      } else {
        delete cacheItems[req.url]
        return next()
      }
    }

    debug(req.url, 'Cache Hit')
    res.end(cacheItem.html)
  })

  this.nuxt.hook('render:route', (url, { html }, context) => {
    if ((typeof context.cache === 'undefined' && !global) || context.cache === false) { return }

    const hash = etag(JSON.stringify(context.nuxt))
    const { req } = context
    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024
    const heapTotal = totalmem() / 1024 / 1024
    const convertToMB = Math.round(heapUsed * 100) / 100
    const memoryTotalMbAvailable = Math.round(heapTotal * 100) / 100

    debug(`${convertToMB} MB memory used`)
    debug(`${memoryTotalMbAvailable} MB memory available`)

    const cacheItem = cacheItems[req.url] = {
      url: req.url,
      date: Date.now(),
      maxAge: expirationMultiplicator,
      stale: true,
      hash,
      html
    }

    if (memory > 0 && (convertToMB >= memory - 100 || convertToMB >= memoryTotalMbAvailable - 100)) { lru(cacheItems) }

    debug(cacheItem.url, 'Cache item created')
  })
}
