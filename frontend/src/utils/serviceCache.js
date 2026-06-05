const cache = new Map()

export function cachedRequest(key, request, { force = false, ttl = 60000 } = {}) {
  const current = cache.get(key)
  if (!force && current?.data && Date.now() - current.createdAt < ttl) return Promise.resolve(current.data)
  if (!force && current?.promise) return current.promise

  const promise = request()
    .then((data) => {
      cache.set(key, { data, createdAt: Date.now() })
      return data
    })
    .catch((error) => {
      cache.delete(key)
      throw error
    })

  cache.set(key, { promise, createdAt: Date.now() })
  return promise
}

export function invalidateCache(...keys) {
  keys.forEach((key) => cache.delete(key))
}
