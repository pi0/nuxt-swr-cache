const { resolve } = require('path')
const etag = require('etag')

const debug = process.env.DEBUG ? (url, ...args) => {
  // eslint-disable-next-line no-console
  console.log(`[${url}]`, ...args)
} : () => { }

module.exports = function (moduleOptions) {
  // route => { url, date, strategy, hash, html, stale }
  const cacheItems = {}

  this.options.nuxtCache = {
    ...(this.options.nuxtCache || {}),
    ...(moduleOptions || {})
  }

  const global = this.options.nuxtCache.global
  const expirationMultiplicator = this.options.nuxtCache.expiration || 5

  debug('you declare you want all pages being cache', global)

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

    const cacheItem = cacheItems[req.url] = {
      url: req.url,
      date: Date.now(),
      maxAge: expirationMultiplicator,
      stale: true,
      hash,
      html
    }
    debug(cacheItem.url, 'Cache item created')
  })
}
