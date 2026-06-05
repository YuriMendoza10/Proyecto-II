import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('optiacademic_token')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('optiacademic_token')
            localStorage.removeItem('optiacademic_user')
            window.dispatchEvent(new Event('optiacademic:auth-expired'))
            if (!window.location.pathname.startsWith('/login')) {
                toast.error('Tu sesion expiro. Inicia sesion nuevamente.')
                window.location.assign('/login')
            }
        }

        return Promise.reject(error)
    }
)

export default api
