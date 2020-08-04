export default function ({ route, ssrContext }) {
  const [m] = route.matched
  if (m) {
    const { cache } = m.components.default.options
    ssrContext.cache = cache
  }
}
