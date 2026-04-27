// D:\TALLER 2\optiacademic\frontend\src\hooks\useAuth.js
import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000/api/v1'

export const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(localStorage.getItem('token'))

    useEffect(() => {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')

        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser))
            setToken(storedToken)
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        try {
            const formData = new URLSearchParams()
            formData.append('username', email)
            formData.append('password', password)

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.detail || 'Error de autenticación')
            }

            localStorage.setItem('token', data.access_token)
            localStorage.setItem('user', JSON.stringify(data.usuario))

            setToken(data.access_token)
            setUser(data.usuario)

            return { success: true, user: data.usuario }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }

    const getAuthHeaders = () => {
        const currentToken = localStorage.getItem('token')
        return {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
        }
    }

    return { user, loading, token, login, logout, getAuthHeaders }
}