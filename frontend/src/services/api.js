// D:\TALLER 2\optiacademic\frontend\src\services\api.js
const API_URL = 'http://localhost:8000/api/v1'

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token')
    }

    getHeaders() {
        const token = localStorage.getItem('token')
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    async request(endpoint, options = {}) {
        const headers = this.getHeaders()

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: { ...headers, ...options.headers }
            })

            // Si es 401, redirigir al login
            if (response.status === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.href = '/login'
                throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.')
            }

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || data.message || 'Error en la petición')
            }

            return data
        } catch (error) {
            console.error(`Error en ${endpoint}:`, error)
            throw error
        }
    }

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' })
    }

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        })
    }

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        })
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' })
    }
}

export const api = new ApiService()