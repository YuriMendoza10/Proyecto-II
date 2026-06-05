import api from '../api/axios'

export const classroomService = {
    async getClassrooms(params = {}) {
        const response = await api.get('/classrooms', {
            params: {
                skip: 0,
                limit: 20,
                ...params,
            },
        })

        return response.data
    },

    async createClassroom(payload) {
        const response = await api.post('/classrooms', payload)
        return response.data
    },

    async updateClassroom(classroomId, payload) {
        const response = await api.put(`/classrooms/${classroomId}`, payload)
        return response.data
    },

    async activateClassroom(classroomId) {
        const response = await api.patch(`/classrooms/${classroomId}/activate`)
        return response.data
    },

    async deactivateClassroom(classroomId) {
        const response = await api.patch(`/classrooms/${classroomId}/deactivate`)
        return response.data
    },

    async deleteClassroom(classroomId) {
        const response = await api.delete(`/classrooms/${classroomId}`)
        return response.data
    },
}
