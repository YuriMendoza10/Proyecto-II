import api from '../api/axios'

export const studentService = {
    async getStudents(params = {}) {
        const response = await api.get('/students', {
            params: {
                skip: 0,
                limit: 20,
                ...params,
            },
        })

        return response.data
    },

    async getMyStudentProfile() {
        const response = await api.get('/students/me')
        return response.data
    },

    async createStudent(payload) {
        const response = await api.post('/students', payload)
        return response.data
    },

    async updateStudent(studentId, payload) {
        const response = await api.put(`/students/${studentId}`, payload)
        return response.data
    },

    async deleteStudent(studentId) {
        const response = await api.delete(`/students/${studentId}`)
        return response.data
    },
}
