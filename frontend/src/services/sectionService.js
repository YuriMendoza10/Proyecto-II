import api from '../api/axios'

export const sectionService = {
    async getSections(params = {}) {
        const response = await api.get('/sections', {
            params: {
                skip: 0,
                limit: 100,
                ...params,
            },
        })

        return response.data
    },

    async createSection(payload) {
        const response = await api.post('/sections', payload)
        return response.data
    },

    async updateSection(sectionId, payload) {
        const response = await api.put(`/sections/${sectionId}`, payload)
        return response.data
    },

    async deleteSection(sectionId) {
        const response = await api.delete(`/sections/${sectionId}`)
        return response.data
    },
}