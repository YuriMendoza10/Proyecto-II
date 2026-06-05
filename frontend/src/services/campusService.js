import api from '../api/axios'
import { cachedRequest, invalidateCache } from '../utils/serviceCache'

const CACHE_KEY = 'campuses'

export const campusService = {
    async getCampuses(options = {}) {
        return cachedRequest(CACHE_KEY, async () => {
            const response = await api.get('/campuses')
            return response.data
        }, options)
    },
    async createCampus(payload) {
        const response = await api.post('/campuses', payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async updateCampus(id, payload) {
        const response = await api.patch(`/campuses/${id}`, payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async deleteCampus(id) {
        const response = await api.delete(`/campuses/${id}`)
        invalidateCache(CACHE_KEY)
        return response.data
    },
}
