import { create } from 'zustand'
import { authService } from '../services/authService'

const savedToken = localStorage.getItem('optiacademic_token')
const savedUser = localStorage.getItem('optiacademic_user')

const readSavedUser = () => {
    if (!savedUser) return null
    try {
        return JSON.parse(savedUser)
    } catch {
        localStorage.removeItem('optiacademic_user')
        return null
    }
}

const normalizeUser = (data) => {
    if (!data) return null

    // Caso backend devuelve: { user: {...} }
    if (data.user) return data.user

    // Caso backend devuelve directamente: { id, full_name, role, ... }
    return data
}

export const useAuthStore = create((set, get) => ({
    token: savedToken || null,
    user: readSavedUser(),
    isAuthenticated: Boolean(savedToken),
    loading: Boolean(savedToken && !readSavedUser()),
    initialized: !savedToken || Boolean(readSavedUser()),

    login: async (email, password) => {
        set({ loading: true })

        try {
            const data = await authService.login(email, password)

            localStorage.setItem('optiacademic_token', data.access_token)

            set({
                token: data.access_token,
                isAuthenticated: true,
            })

            const meResponse = await authService.getMe()
            const me = normalizeUser(meResponse)

            localStorage.setItem('optiacademic_user', JSON.stringify(me))

            set({
                user: me,
                loading: false,
                isAuthenticated: true,
                initialized: true,
            })

            return me
        } catch (error) {
            set({ loading: false, initialized: true })
            throw error
        }
    },

    loadUser: async () => {
        const { token } = get()

        if (!token) {
            set({ initialized: true, loading: false })
            return null
        }

        try {
            set({ loading: true })
            const meResponse = await authService.getMe()
            const me = normalizeUser(meResponse)

            localStorage.setItem('optiacademic_user', JSON.stringify(me))

            set({
                user: me,
                isAuthenticated: true,
                loading: false,
                initialized: true,
            })

            return me
        } catch {
            get().logout()
            return null
        }
    },

    logout: () => {
        localStorage.removeItem('optiacademic_token')
        localStorage.removeItem('optiacademic_user')

        set({
            token: null,
            user: null,
            isAuthenticated: false,
            loading: false,
            initialized: true,
        })
    },
}))
