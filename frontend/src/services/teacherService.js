import api from '../api/axios'

export const teacherService = {
    async getTeachers(params = {}) {
        const response = await api.get('/teachers', {
            params: {
                skip: 0,
                limit: 20,
                ...params,
            },
        })

        return response.data
    },

    async createTeacher(payload) {
        const response = await api.post('/teachers', payload)
        return response.data
    },

    async updateTeacher(teacherId, payload) {
        const response = await api.put(`/teachers/${teacherId}`, payload)
        return response.data
    },

    async deleteTeacher(teacherId) {
        const response = await api.delete(`/teachers/${teacherId}`)
        return response.data
    },

    async getTeacherAvailability(teacherId) {
        const response = await api.get(`/teachers/${teacherId}/availability`)
        return response.data
    },

    async createTeacherAvailability(payload) {
        const response = await api.post('/teachers/availability', payload)
        return response.data
    },

    async updateTeacherAvailability(availabilityId, payload) {
        const response = await api.put(`/teachers/availability/${availabilityId}`, payload)
        return response.data
    },

    async deleteTeacherAvailability(availabilityId) {
        const response = await api.delete(`/teachers/availability/${availabilityId}`)
        return response.data
    },
}
