import api from '../api/axios'
import { cachedRequest, invalidateCache } from '../utils/serviceCache'

const CACHE_KEY = 'academic-periods'

export const academicPeriodService = {
    async getPeriods(options = {}) {
        return cachedRequest(CACHE_KEY, async () => {
            const response = await api.get('/academic-periods')
            return response.data
        }, options)
    },
    async createPeriod(payload) {
        const response = await api.post('/academic-periods', payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async updatePeriod(id, payload) {
        const response = await api.patch(`/academic-periods/${id}`, payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async deletePeriod(id) {
        const response = await api.delete(`/academic-periods/${id}`)
        invalidateCache(CACHE_KEY)
        return response.data
    },
}
