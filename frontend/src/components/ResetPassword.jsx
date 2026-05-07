// D:\TALLER 2\optiacademic\frontend\src\components\ResetPassword.jsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api/v1'

export default function ResetPassword({ onBack }) {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [verificando, setVerificando] = useState(true)
    const [tokenValido, setTokenValido] = useState(false)
    const [resetExitoso, setResetExitoso] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        verificarToken()
    }, [token])

    const verificarToken = async () => {
        if (!token) {
            setError('Token no proporcionado')
            setVerificando(false)
            return
        }

        try {
            const res = await fetch(`${API_URL}/verify-reset-token/${token}`)
            const data = await res.json()

            if (res.ok) {
                setTokenValido(true)
            } else {
                setError(data.detail || 'Token inválido o expirado')
            }
        } catch (err) {
            setError('Error al verificar el token')
        } finally {
            setVerificando(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden')
            return
        }
        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, new_password: password })
            })

            const data = await res.json()

            if (res.ok) {
                setResetExitoso(true)
                toast.success('Contraseña restablecida exitosamente')
            } else {
                setError(data.detail || 'Error al restablecer la contraseña')
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.')
        } finally {
            setLoading(false)
        }
    }

    if (verificando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <div className="bg-white rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando enlace...</p>
                </div>
            </div>
        )
    }

    if (resetExitoso) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Contraseña Restablecida!</h2>
                    <p className="text-gray-600 mb-6">
                        Tu contraseña ha sido actualizada correctamente.
                    </p>
                    <button
                        onClick={onBack}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Iniciar sesión
                    </button>
                </div>
            </div>
        )
    }

    if (!tokenValido) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="text-red-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Enlace Inválido</h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'El enlace de recuperación es inválido o ha expirado.'}
                    </p>
                    <button
                        onClick={onBack}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Solicitar nuevo enlace
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-2xl text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Nueva Contraseña</h1>
                    <p className="text-blue-100 text-sm mt-1">Ingresa tu nueva contraseña</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Nueva contraseña
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="••••••"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Restableciendo...
                                </span>
                            ) : (
                                'Restablecer contraseña'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}