import api from '../api/axios'

export const coordinatorDashboardService = {
    async getDashboard() {
        const response = await api.get('/coordinator/dashboard')
        return response.data
    },
}
