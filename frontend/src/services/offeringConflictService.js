import api from '../api/axios'

export const offeringConflictService = {
    async getConflicts(params = {}) {
        const response = await api.get('/offering-conflicts', { params })
        return response.data
    },
    async analyze(payload) {
        const response = await api.post('/offering-conflicts/analyze', payload)
        return response.data
    },
    async resolve(id) {
        const response = await api.patch(`/offering-conflicts/${id}/resolve`)
        return response.data
    },
}
