import api from '../api/axios'

export const dashboardService = {
    async getAdminSummary(scheduleId = null) {
        const params = {}

        if (scheduleId) {
            params.schedule_id = scheduleId
        }

        const response = await api.get('/dashboard/admin-summary', {
            params,
        })

        return response.data
    },
}