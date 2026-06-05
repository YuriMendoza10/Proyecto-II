import api from '../api/axios'

export const teacherAvailabilityService = {
    async listMine() {
        const response = await api.get('/teachers/me/availability')
        return response.data
    },
    async createMine(payload) {
        const response = await api.post('/teachers/me/availability', payload)
        return response.data
    },
    async updateMine(id, payload) {
        const response = await api.patch(`/teachers/me/availability/${id}`, payload)
        return response.data
    },
    async deleteMine(id) {
        const response = await api.delete(`/teachers/me/availability/${id}`)
        return response.data
    },
}
