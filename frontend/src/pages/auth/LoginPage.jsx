import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, Loader2, Lock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../stores/authStore'
import SkipToContent from '../../components/accessibility/SkipToContent'
import AccessibleAlert from '../../components/common/AccessibleAlert'
import ThemeToggle from '../../components/common/ThemeToggle'

export default function LoginPage() {
    const navigate = useNavigate()
    const { login, loading, isAuthenticated, user } = useAuthStore()

    const [form, setForm] = useState({
        email: 'admin@optiacademic.com',
        password: 'admin123',
    })
    const [errorMessage, setErrorMessage] = useState('')

    const redirectByRole = useCallback((role) => {
        if (role === 'ADMIN') navigate('/admin', { replace: true })
        else if (role === 'COORDINATOR') navigate('/coordinator', { replace: true })
        else if (role === 'TEACHER') navigate('/teacher/dashboard', { replace: true })
        else if (role === 'STUDENT') navigate('/student', { replace: true })
        else navigate('/', { replace: true })
    }, [navigate])

    useEffect(() => {
        if (isAuthenticated && user?.role) {
            redirectByRole(user.role)
        }
    }, [isAuthenticated, redirectByRole, user])

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value,
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        try {
            setErrorMessage('')
            const loggedUser = await login(form.email, form.password)

            toast.success('Inicio de sesión correcto')
            redirectByRole(loggedUser.role)
        } catch (error) {
            console.error(error)

            const message =
                error.response?.data?.detail ||
                'No se pudo iniciar sesión. Revisa tus credenciales.'

            toast.error(message)
            setErrorMessage(message)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center px-4">
            <SkipToContent />
            <div className="absolute right-4 top-4"><ThemeToggle /></div>
            <main id="main-content" tabIndex="-1" className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="h-16 w-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white mb-4">
                        <GraduationCap size={36} aria-hidden="true" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900">OptiAcademic</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Sistema inteligente de horarios académicos
                    </p>
                </div>

                {errorMessage && <div className="mb-5"><AccessibleAlert type="error" title="No se pudo iniciar sesión" message={errorMessage} /></div>}
                <form onSubmit={handleSubmit} className="space-y-5" aria-label="Inicio de sesión">
                    <div>
                        <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 mb-2">
                            Correo electrónico
                        </label>

                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                aria-hidden="true"
                            />

                            <input
                                type="email"
                                id="login-email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 mb-2">
                            Contraseña
                        </label>

                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                aria-hidden="true"
                            />

                            <input
                                type="password"
                                id="login-password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
                        Iniciar sesión
                    </button>
                </form>
            </main>
        </div>
    )
}
