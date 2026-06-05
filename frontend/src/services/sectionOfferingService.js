import api from '../api/axios'

export const sectionOfferingService = {
    async getOfferings(params = {}) {
        const response = await api.get('/section-offerings', { params })
        return response.data
    },
    async getOffering(id) {
        const response = await api.get(`/section-offerings/${id}`)
        return response.data
    },
    async getMyPublishedOfferings() {
        const response = await api.get('/section-offerings/published/me')
        return response.data
    },
    async createOffering(payload) {
        const response = await api.post('/section-offerings', payload)
        return response.data
    },
    async updateOffering(id, payload) {
        const response = await api.patch(`/section-offerings/${id}`, payload)
        return response.data
    },
    async updateStatus(id, status) {
        const response = await api.patch(`/section-offerings/${id}/status`, { status })
        return response.data
    },
    async deleteOffering(id) {
        const response = await api.delete(`/section-offerings/${id}`)
        return response.data
    },
    async bulkFromCurriculum(payload) {
        const response = await api.post('/section-offerings/bulk-from-curriculum', payload)
        return response.data
    },
}
