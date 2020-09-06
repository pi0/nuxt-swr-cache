# Nuxt.js SWR Cache

This module adds in-memory SWR caching support to [nuxt.js](https://nuxtjs.org/) projects. (Experimental)

## Usage

Install package:

```sh
yarn add @pi0/nuxt-cache
# or
npm i @pi0/nuxt-cache
```

Add to `modules` section in `nuxt.config` file:

```js
export default {
  modules: [
    '@pi0/nuxt-cache'
  ]
}
```

For any page that you want to enable SWR, use `cache: true` in default export:

`pages/index.vue`

```vue
<script>
export default {
  cache: true
}
</script>
```

If you to cache every pages add:

Add in `nuxt.config` file:

```js
export default {
  modules: [
    '@pi0/nuxt-cache'
  ],
  nuxtCache: {
    global: true
  }
}
```

or 

```js
export default {
  modules: [
    ['@pi0/nuxt-cache', {
      global: true
    }]
  ],
}
```

From here you can disable pages for being cached by

`pages/second.vue`

```vue
<script>
export default {
  cache: false
}
</script>
```

## How it works?

Using stale-while-revalidate, when making SSR request to pages module's middleware first checks if item is in cache or not, if cache is hit will be returned instantly so user won't need to wait for SSR process and will have much faster load time meanwhile in the background we fetch new version of the webpage so when reloading it will be updated (TODO: auto reload client)

## SSR Remarks

You have to ensure there is no shared state for pages with cache enabled like reading headers for authentication otherwise it will lead to **security issues**.

## Alternatives

- [nuxt-ssr-cache](https://github.com/arash16/nuxt-ssr-cache)
- [SPR with Vercel](https://github.com/nuxt/vercel-builder/issues/37#issuecomment-489409731)

## Roadmap

Please see [Project](https://github.com/pi0/nuxt-swr-cache/projects/1). Making PRs for `TODO` items and suggestions are more than welcome!

## Benchmarks

**Without module:**

```
┌─────────┬──────┬──────┬───────┬───────┬─────────┬─────────┬──────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%   │ Avg     │ Stdev   │ Max      │
├─────────┼──────┼──────┼───────┼───────┼─────────┼─────────┼──────────┤
│ Latency │ 7 ms │ 8 ms │ 16 ms │ 19 ms │ 8.93 ms │ 2.59 ms │ 30.82 ms │
└─────────┴──────┴──────┴───────┴───────┴─────────┴─────────┴──────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev  │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼────────┼────────┤
│ Req/Sec   │ 660    │ 660    │ 1095    │ 1229    │ 1060.8  │ 169.1  │ 660    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼────────┼────────┤
│ Bytes/Sec │ 940 kB │ 940 kB │ 1.56 MB │ 1.75 MB │ 1.51 MB │ 241 kB │ 940 kB │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴────────┴────────┘
```

**SWR/1sec expiration:** (module default)

```
┌─────────┬──────┬──────┬───────┬──────┬─────────┬─────────┬──────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev   │ Max      │
├─────────┼──────┼──────┼───────┼──────┼─────────┼─────────┼──────────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 1 ms │ 0.04 ms │ 0.36 ms │ 38.67 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴─────────┴──────────┘
┌───────────┬───────┬───────┬─────────┬─────────┬──────────┬─────────┬───────┐
│ Stat      │ 1%    │ 2.5%  │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min   │
├───────────┼───────┼───────┼─────────┼─────────┼──────────┼─────────┼───────┤
│ Req/Sec   │ 10639 │ 10639 │ 17599   │ 18655   │ 16998.55 │ 2109.26 │ 10635 │
├───────────┼───────┼───────┼─────────┼─────────┼──────────┼─────────┼───────┤
│ Bytes/Sec │ 14 MB │ 14 MB │ 23.2 MB │ 24.6 MB │ 22.4 MB  │ 2.78 MB │ 14 MB │
└───────────┴───────┴───────┴─────────┴─────────┴──────────┴─────────┴───────┘
```

**SWR/5sec expiration:**

```
┌─────────┬──────┬──────┬───────┬──────┬─────────┬────────┬──────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%  │ Avg     │ Stdev  │ Max      │
├─────────┼──────┼──────┼───────┼──────┼─────────┼────────┼──────────┤
│ Latency │ 0 ms │ 0 ms │ 0 ms  │ 1 ms │ 0.03 ms │ 0.2 ms │ 12.32 ms │
└─────────┴──────┴──────┴───────┴──────┴─────────┴────────┴──────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬──────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg      │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Req/Sec   │ 11263   │ 11263   │ 19439   │ 19919   │ 18556.73 │ 2408.12 │ 11261   │
├───────────┼─────────┼─────────┼─────────┼─────────┼──────────┼─────────┼─────────┤
│ Bytes/Sec │ 14.8 MB │ 14.8 MB │ 25.6 MB │ 26.2 MB │ 24.4 MB  │ 3.17 MB │ 14.8 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴──────────┴─────────┴─────────┘
```

## License

MIT
