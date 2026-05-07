import { useState } from 'react'

export default function Login({ onLogin, onForgotPassword }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            setError('Completa todos los campos')
            return
        }

        setLoading(true)
        setError(null)

        const formData = new URLSearchParams()
        formData.append('username', email)
        formData.append('password', password)

        try {
            const res = await fetch('http://localhost:8000/api/v1/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.detail || 'Error de autenticación')
            }

            const data = await res.json()

            localStorage.setItem('token', data.access_token)
            localStorage.setItem('user', JSON.stringify(data.usuario))

            onLogin(data.usuario)

        } catch (e) {
            setError(e.message || 'Error de conexión con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const cuentasDemo = [
        { email: 'admin@uni.edu', pass: 'admin123', rol: 'admin', color: 'bg-red-100 text-red-700 border-red-200' },
        { email: 'coord.sistemas@uni.edu', pass: 'coord123', rol: 'coordinador', color: 'bg-blue-100 text-blue-700 border-blue-200' },
        { email: 'estudiante1@uni.edu', pass: 'est123', rol: 'estudiante', color: 'bg-green-100 text-green-700 border-green-200' },
        { email: 'docente1@uni.edu', pass: 'doc123', rol: 'docente', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    ]

    const autocompletar = (email, pass) => {
        setEmail(email)
        setPassword(pass)
        setError(null)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-3xl font-bold">O</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">OptiAcademic</h1>
                        <p className="text-blue-100 text-sm mt-1">Sistema de Planificación Universitaria</p>
                    </div>

                    {/* FORM */}
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* EMAIL */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Correo institucional
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>

                                {/* 🔥 CORREGIDO */}
                                <div className="text-right mt-2">
                                    <button
                                        type="button"
                                        onClick={onForgotPassword}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </button>
                                </div>
                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    ❌ {error}
                                </div>
                            )}

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                            >
                                {loading ? 'Verificando...' : 'Ingresar'}
                            </button>

                        </form>

                        {/* DEMO */}
                        <div className="mt-6">
                            <p className="text-xs font-semibold text-gray-500 mb-3">
                                Cuentas de demostración
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                {cuentasDemo.map((c, i) => (
                                    <button
                                        key={i}
                                        onClick={() => autocompletar(c.email, c.pass)}
                                        className={`text-left p-3 rounded-lg border ${c.color}`}
                                    >
                                        <div className="text-xs font-bold uppercase">{c.rol}</div>
                                        <div className="text-xs">{c.email}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-white/40 text-xs mt-6">
                    OptiAcademic v2.1
                </p>
            </div>
        </div>
    )
}