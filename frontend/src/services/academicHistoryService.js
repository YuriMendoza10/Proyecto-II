import api from '../api/axios'

export const academicHistoryService = {
    async getHistory(params = {}) {
        const response = await api.get('/student-academic-history', { params: { limit: 500, ...params } })
        return response.data
    },
    async getHistoryPage(params = {}) {
        const response = await api.get('/student-academic-history/page', { params })
        return response.data
    },
    async createHistory(payload) {
        const response = await api.post('/student-academic-history', payload)
        return response.data
    },
    async updateHistory(id, payload) {
        const response = await api.patch(`/student-academic-history/${id}`, payload)
        return response.data
    },
    async deleteHistory(id) {
        const response = await api.delete(`/student-academic-history/${id}`)
        return response.data
    },
    async bulkCreateHistory(records) {
        const response = await api.post('/student-academic-history/bulk', { records })
        return response.data
    },
    async getStudentSummary(id) {
        const response = await api.get(`/students/${id}/academic-summary`)
        return response.data
    },
}
