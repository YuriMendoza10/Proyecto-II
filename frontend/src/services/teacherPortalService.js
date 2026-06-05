import api from '../api/axios'

export const teacherPortalService = {
    async getDashboard() {
        const response = await api.get('/teachers/me/dashboard')
        return response.data
    },
    async getSchedule() {
        const response = await api.get('/teachers/me/schedule')
        return response.data
    },
    async getSections() {
        const response = await api.get('/teachers/me/sections')
        return response.data
    },
    async getLoad() {
        const response = await api.get('/teachers/me/load')
        return response.data
    },
    async getConflicts() {
        const response = await api.get('/teachers/me/conflicts')
        return response.data
    },
}
