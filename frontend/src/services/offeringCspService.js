import api from '../api/axios'

export const offeringCspService = {
    async preview(payload) {
        const response = await api.post('/institutional-csp/preview-from-offerings', payload)
        return response.data
    },
    async generate(payload) {
        const response = await api.post('/institutional-csp/generate-from-offerings', payload)
        return response.data
    },
    async saveSolution(payload) {
        const response = await api.post('/institutional-csp/save-offering-solution', payload)
        return response.data
    },
}
