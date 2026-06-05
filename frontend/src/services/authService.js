import api from '../api/axios'

export const authService = {
    async login(email, password) {
        const response = await api.post('/auth/login-json', {
            email,
            password,
        })

        return response.data
    },

    async getMe() {
        const response = await api.get('/auth/me')
        return response.data
    },
}