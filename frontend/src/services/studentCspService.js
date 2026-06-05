import api from '../api/axios'

export const studentCspService = {
    async getMyStudentProfile() {
        const response = await api.get('/student-csp/me')
        return response.data
    },

    async getOfferCourses(params = {}) {
        const response = await api.get('/student-csp/offer-courses', {
            params,
        })

        return response.data
    },

    async getOfferDetail(params = {}) {
        const response = await api.get('/student-csp/offer-detail', {
            params,
        })

        return response.data
    },

    async previewStudentSchedules(payload) {
        const response = await api.post('/student-csp/preview', payload)
        return response.data
    },

    async saveSelectedStudentSchedule(payload) {
        const response = await api.post('/student-csp/save-selected', payload)
        return response.data
    },

    async getSavedStudentSchedules(params = {}) {
        const response = await api.get('/student-csp/saved', {
            params,
        })

        return response.data
    },

    async getSavedStudentScheduleDetail(studentScheduleId) {
        const response = await api.get(`/student-csp/saved/${studentScheduleId}`)
        return response.data
    },

    async markStudentScheduleAsFavorite(studentScheduleId) {
        const response = await api.patch(
            `/student-csp/saved/${studentScheduleId}/favorite`
        )

        return response.data
    },

    async getMyEnrolledCourses() {
        const response = await api.get('/students/me/enrolled-courses')
        return response.data
    },

    async getMyPublishedSections() {
        const response = await api.get('/students/me/published-sections')
        return response.data
    },

    async generateFromEnrollments(payload = {}) {
        const response = await api.post('/student-csp/generate-from-enrollments', payload)
        return response.data
    },

    async saveFromEnrollments(payload) {
        const response = await api.post('/student-csp/save-from-enrollments', payload)
        return response.data
    },
}
