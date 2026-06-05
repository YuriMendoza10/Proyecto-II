export function safeArray(value) {
    if (Array.isArray(value)) return value
    if (Array.isArray(value?.items)) return value.items
    if (Array.isArray(value?.data)) return value.data
    return []
}

export function safeObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export function normalizeApiError(error, fallback = 'No se pudo completar la operacion.') {
    const detail = error?.response?.data?.detail
    if (typeof detail === 'string') return detail
    if (detail?.message) return detail.message
    if (error?.message) return error.message
    return fallback
}

