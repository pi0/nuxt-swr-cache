exports.debug = process.env.DEBUG ? (url, ...args) => {
  // eslint-disable-next-line no-console
  console.log(`[${url}]`, ...args)
} : () => { }
