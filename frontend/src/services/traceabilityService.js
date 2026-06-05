import api from '../api/axios'

export const traceabilityService = {
    async getScheduleTrace(scheduleId) {
        const response = await api.get(`/traceability/schedule/${scheduleId}`)
        return response.data
    },
    async getChangeRequestTrace(requestId) {
        const response = await api.get(`/traceability/change-request/${requestId}`)
        return response.data
    },
}
