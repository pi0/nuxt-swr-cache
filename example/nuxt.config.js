import nuxtCache from '..'

export default {
  modules: [
    nuxtCache
  ],
  nuxtCache: {
    global: true,
    expiration: 10
  }
}
