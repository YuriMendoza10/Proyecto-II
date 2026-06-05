import api from '../api/axios'

export const cspService = {
    async diagnoseInstitutionalDomains(payload) {
        const response = await api.post(
            '/csp-diagnostics/institutional/domains',
            payload
        )

        return response.data
    },

    async previewInstitutionalSchedule(payload) {
        const response = await api.post('/institutional-csp/preview', payload)
        return response.data
    },

    async generateInstitutionalSchedule(payload) {
        const response = await api.post('/institutional-csp/generate', payload)
        return response.data
    },

    async generateSelectedInstitutionalSchedule(payload) {
        const response = await api.post(
            '/institutional-csp/generate-selected',
            payload
        )

        return response.data
    },
}