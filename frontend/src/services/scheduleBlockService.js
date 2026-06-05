import api from '../api/axios'

export const scheduleBlockService = {
    async getScheduleBlocks(scheduleId) {
        const response = await api.get('/schedule-blocks/enriched', {
            params: {
                schedule_id: scheduleId,
                limit: 1000,
            },
        })

        return response.data
    },

    async getBlocks(params = {}) {
        const response = await api.get('/schedule-blocks', { params })
        return response.data
    },

    async getEnrichedBlocks(scheduleId) {
        const response = await api.get('/schedule-blocks/enriched', {
            params: {
                schedule_id: scheduleId,
                limit: 1000,
            },
        })

        return response.data
    },

    async getEnrichedBlocksWithParams(params = {}) {
        const response = await api.get('/schedule-blocks/enriched', {
            params: {
                limit: 1000,
                ...params,
            },
        })

        return response.data
    },

    async createBlock(payload) {
        const response = await api.post('/schedule-blocks', payload)
        return response.data
    },

    async updateBlock(blockId, payload) {
        const response = await api.put(`/schedule-blocks/${blockId}`, payload)
        return response.data
    },

    async deleteBlock(blockId) {
        const response = await api.delete(`/schedule-blocks/${blockId}`)
        return response.data
    },
}