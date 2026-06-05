import api from '../api/axios'

export const scheduleChangeRequestService = {
    async listMine() {
        const response = await api.get('/teachers/me/change-requests')
        return response.data
    },
    async createMine(payload) {
        const response = await api.post('/teachers/me/change-requests', payload)
        return response.data
    },
    async cancelMine(id) {
        const response = await api.patch(`/teachers/me/change-requests/${id}/cancel`)
        return response.data
    },
    async listForCoordinator(params = {}) {
        const response = await api.get('/coordinator/change-requests', { params })
        return response.data
    },
    async resolve(id, payload) {
        const response = await api.patch(`/coordinator/change-requests/${id}/resolve`, payload)
        return response.data
    },
}
