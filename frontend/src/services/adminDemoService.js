import api from '../api/axios'

export const adminDemoService = {
    async prepareInstitutionalCsp(payload = {}) {
        const response = await api.post('/admin/demo/prepare-institutional-csp', payload)
        return response.data
    },
}
