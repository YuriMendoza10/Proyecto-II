import api from '../api/axios'
import { cachedRequest, invalidateCache } from '../utils/serviceCache'

const CACHE_KEY = 'curriculum-plans'

export const curriculumService = {
    async getPlans(options = {}) {
        return cachedRequest(CACHE_KEY, async () => {
            const response = await api.get('/curriculum-plans')
            return response.data
        }, options)
    },
    async getPlan(id) {
        const response = await api.get(`/curriculum-plans/${id}`)
        return response.data
    },
    async createPlan(payload) {
        const response = await api.post('/curriculum-plans', payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async updatePlan(id, payload) {
        const response = await api.patch(`/curriculum-plans/${id}`, payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async deletePlan(id) {
        const response = await api.delete(`/curriculum-plans/${id}`)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async updateCurriculumCourse(id, payload) {
        const response = await api.patch(`/curriculum-courses/${id}`, payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async createPrerequisite(payload) {
        const response = await api.post('/course-prerequisites', payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async deletePrerequisite(id) {
        const response = await api.delete(`/course-prerequisites/${id}`)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async updateElective(id, payload) {
        const response = await api.patch(`/elective-bank-courses/${id}`, payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async createElective(payload) {
        const response = await api.post('/elective-bank-courses', payload)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async deleteElective(id) {
        const response = await api.delete(`/elective-bank-courses/${id}`)
        invalidateCache(CACHE_KEY)
        return response.data
    },
    async getMyCurriculum() {
        const response = await api.get('/students/me/curriculum')
        return response.data
    },
    async getMyEligibleCourses() {
        const response = await api.get('/students/me/eligible-courses')
        return response.data
    },
}
