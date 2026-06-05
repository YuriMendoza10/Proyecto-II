import api from '../api/axios'

export const courseService = {
    async getCourses(params = {}) {
        const response = await api.get('/courses', {
            params: {
                skip: 0,
                limit: 100,
                ...params,
            },
        })

        return response.data
    },

    async createCourse(payload) {
        const response = await api.post('/courses', payload)
        return response.data
    },

    async updateCourse(courseId, payload) {
        const response = await api.put(`/courses/${courseId}`, payload)
        return response.data
    },

    async activateCourse(courseId) {
        const response = await api.patch(`/courses/${courseId}/activate`)
        return response.data
    },

    async deactivateCourse(courseId) {
        const response = await api.patch(`/courses/${courseId}/deactivate`)
        return response.data
    },

    async deleteCourse(courseId) {
        const response = await api.delete(`/courses/${courseId}`)
        return response.data
    },
}