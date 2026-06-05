import api from '../api/axios'

export const sectionRequirementService = {
    async getRequirements(params = {}) {
        const response = await api.get('/section-requirements', { params })
        return response.data
    },
    async createRequirement(payload) {
        const response = await api.post('/section-requirements', payload)
        return response.data
    },
    async updateRequirement(id, payload) {
        const response = await api.patch(`/section-requirements/${id}`, payload)
        return response.data
    },
    async deleteRequirement(id) {
        const response = await api.delete(`/section-requirements/${id}`)
        return response.data
    },
}
