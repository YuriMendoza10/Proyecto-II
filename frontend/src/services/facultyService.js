import api from '../api/axios'
import { cachedRequest, invalidateCache } from '../utils/serviceCache'

const CACHE_KEY = 'faculties'

export const facultyService = {
    async getFaculties(options = {}) {
        return cachedRequest(CACHE_KEY, async () => {
            const response = await api.get('/faculties')
            return response.data
        }, options)
    },
    async createFaculty(payload) {
        const response = await api.post('/faculties', payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async updateFaculty(id, payload) {
        const response = await api.patch(`/faculties/${id}`, payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async deleteFaculty(id) {
        const response = await api.delete(`/faculties/${id}`)
        invalidateCache(CACHE_KEY)
        return response.data
    },
}
