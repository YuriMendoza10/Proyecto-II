import api from '../api/axios'

export const dataReadinessService = {
    async getReport({
        careerFilter = '',
        academicPeriod = '',
    } = {}) {
        const params = {}

        if (careerFilter) {
            params.career_filter = careerFilter
        }

        if (academicPeriod) {
            params.academic_period = academicPeriod
        }

        const response = await api.get('/data-readiness/report', {
            params,
        })

        return response.data
    },
}