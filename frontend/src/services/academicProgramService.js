import api from '../api/axios'
import { cachedRequest, invalidateCache } from '../utils/serviceCache'

const CACHE_KEY = 'academic-programs'

export const academicProgramService = {
    async getPrograms(options = {}) {
        return cachedRequest(CACHE_KEY, async () => {
            const response = await api.get('/academic-programs')
            return response.data
        }, options)
    },
    async createProgram(payload) {
        const response = await api.post('/academic-programs', payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async updateProgram(id, payload) {
        const response = await api.patch(`/academic-programs/${id}`, payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async deleteProgram(id) {
        const response = await api.delete(`/academic-programs/${id}`)
        invalidateCache(CACHE_KEY)
        return response.data
    },
}
