import api from '../api/axios'

export const scheduleQualityService = {
    async getReport({
        scheduleId,
        careerFilter = '',
        cycleFilter = [],
        courseIds = [],
        allowedDays = [1, 2, 3, 4, 5, 6, 7],
        startHour = '07:00:00',
        endHour = '22:00:00',
    }) {
        const params = {
            start_hour: startHour,
            end_hour: endHour,
        }

        if (careerFilter) {
            params.career_filter = careerFilter
        }

        for (const cycle of cycleFilter) {
            params[`cycle_filter`] = params[`cycle_filter`] || []
            params[`cycle_filter`].push(cycle)
        }

        for (const courseId of courseIds) {
            params[`course_ids`] = params[`course_ids`] || []
            params[`course_ids`].push(courseId)
        }

        for (const day of allowedDays) {
            params[`allowed_days`] = params[`allowed_days`] || []
            params[`allowed_days`].push(day)
        }

        const response = await api.get(`/schedule-quality/${scheduleId}/report`, {
            params,
        })

        return response.data
    },
}