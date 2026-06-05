import api from '../api/axios'

export const notificationService = {
    async listMine(params = {}) {
        const response = await api.get('/notifications/me', { params })
        return response.data
    },
    async unreadCount() {
        const response = await api.get('/notifications/me/unread-count')
        return response.data
    },
    async markRead(id) {
        const response = await api.patch(`/notifications/${id}/read`)
        return response.data
    },
    async markAllRead() {
        const response = await api.patch('/notifications/read-all')
        return response.data
    },
    async remove(id) {
        const response = await api.delete(`/notifications/${id}`)
        return response.data
    },
}
