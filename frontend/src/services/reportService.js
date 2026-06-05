import api from '../api/axios'

async function downloadCsv(path, filename, params = {}) {
    const response = await api.get(path, { params, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }))
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    window.URL.revokeObjectURL(url)
}

export const reportService = {
    async getExecutiveSummary(params = {}) {
        const response = await api.get('/reports/executive-summary', { params })
        return response.data
    },
    async getTeacherLoadReport(params = {}) {
        const response = await api.get('/reports/teacher-load', { params })
        return response.data
    },
    async getClassroomUsageReport(params = {}) {
        const response = await api.get('/reports/classroom-usage', { params })
        return response.data
    },
    async getOfferingStatusReport(params = {}) {
        const response = await api.get('/reports/offering-status', { params })
        return response.data
    },
    async getConflictsReport(params = {}) {
        const response = await api.get('/reports/conflicts', { params })
        return response.data
    },
    async getSchedulesReport(params = {}) {
        const response = await api.get('/reports/schedules', { params })
        return response.data
    },
    async getStudentsReport(params = {}) {
        const response = await api.get('/reports/students', { params })
        return response.data
    },
    async getChangeRequestsReport(params = {}) {
        const response = await api.get('/reports/change-requests', { params })
        return response.data
    },
    async getSustainabilityReport() {
        const response = await api.get('/reports/sustainability')
        return response.data
    },
    exportTeacherLoadCsv(params) {
        return downloadCsv('/reports/teacher-load/export.csv', 'teacher-load.csv', params)
    },
    exportClassroomUsageCsv(params) {
        return downloadCsv('/reports/classroom-usage/export.csv', 'classroom-usage.csv', params)
    },
    exportOfferingStatusCsv(params) {
        return downloadCsv('/reports/offering-status/export.csv', 'offering-status.csv', params)
    },
    exportConflictsCsv(params) {
        return downloadCsv('/reports/conflicts/export.csv', 'conflicts.csv', params)
    },
    exportStudentsCsv(params) {
        return downloadCsv('/reports/students/export.csv', 'students.csv', params)
    },
}
