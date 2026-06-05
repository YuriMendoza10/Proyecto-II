import api from '../api/axios'

export const institutionalStudentService = {
    async getStudents(params = {}) {
        const response = await api.get('/students', { params: { skip: 0, limit: 20, ...params } })
        return response.data
    },
    async updateStudent(id, payload) {
        const response = await api.put(`/students/${id}`, payload)
        return response.data
    },
    async getAcademicSummary(id) {
        const response = await api.get(`/students/${id}/academic-summary`)
        return response.data
    },
}
