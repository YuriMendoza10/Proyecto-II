import api from '../api/axios'

export const environmentalImpactService = {
    async getSummary() {
        const response = await api.get('/environmental-impact/summary')
        return response.data
    },

    async getMetrics(limit = 100) {
        const response = await api.get('/environmental-impact/metrics', {
            params: { limit },
        })
        return response.data
    },

    async getRanking(limit = 25) {
        const response = await api.get('/environmental-impact/ranking', {
            params: { limit },
        })
        return response.data
    },
}
