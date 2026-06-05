import api from '../api/axios'

export const auditLogService = {
    async list(params = {}) {
        const response = await api.get('/audit-logs', { params })
        return response.data
    },
    async exportCsv(params = {}) {
        const response = await api.get('/audit-logs/export.csv', { params, responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
        const link = document.createElement('a')
        link.href = url
        link.download = 'audit-logs.csv'
        link.click()
        window.URL.revokeObjectURL(url)
    },
}
