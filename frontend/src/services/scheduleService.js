import api from '../api/axios'
import { extractList } from '../utils/extractList'

export const scheduleService = {
    // Obtener listado de horarios (con paginación por defecto)
    async getSchedules(params = {}) {
        const response = await api.get('/schedules', {
            params: {
                skip: 0,
                limit: 100,
                ...params,
            },
        })
        return response.data
    },

    // Obtener solo horarios publicados
    async getPublishedSchedules(params = {}) {
        const response = await api.get('/schedules', {
            params: {
                skip: 0,
                limit: 100,
                ...params,
            },
        })
        const schedules = extractList(response.data)
        return schedules.filter((schedule) => schedule.status === 'PUBLISHED')
    },

    // Crear un nuevo horario (método requerido)
    async createSchedule(payload) {
        const response = await api.post('/schedules', payload)
        return response.data
    },

    // Obtener un horario específico por ID (método requerido)
    async getSchedule(scheduleId) {
        const response = await api.get(`/schedules/${scheduleId}`)
        return response.data
    },

    // Publicar un horario existente
    async publishSchedule(scheduleId) {
        const response = await api.patch(
            `/schedule-publication/${scheduleId}/publish-safe`
        )
        return response.data
    },
}
