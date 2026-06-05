import api from '../api/axios'

export const userService = {
    async getUsers(params = {}) {
        const response = await api.get('/users', {
            params: {
                skip: 0,
                limit: 20,
                ...params,
            },
        })

        return response.data
    },

    async createUser(payload) {
        const response = await api.post('/users', payload)
        return response.data
    },

    async updateUser(userId, payload) {
        const response = await api.put(`/users/${userId}`, payload)
        return response.data
    },

    async activateUser(userId) {
        const response = await api.patch(`/users/${userId}/activate`)
        return response.data
    },

    async deactivateUser(userId) {
        const response = await api.patch(`/users/${userId}/deactivate`)
        return response.data
    },
}
