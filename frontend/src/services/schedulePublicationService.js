import api from '../api/axios'

export const schedulePublicationService = {
    async publishSafely({
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

        if (cycleFilter.length > 0) {
            params.cycle_filter = cycleFilter
        }

        if (courseIds.length > 0) {
            params.course_ids = courseIds
        }

        if (allowedDays.length > 0) {
            params.allowed_days = allowedDays
        }

        const response = await api.patch(
            `/schedule-publication/${scheduleId}/publish-safe`,
            null,
            { params }
        )

        return response.data
    },
}