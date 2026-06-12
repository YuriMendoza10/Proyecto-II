// D:\TALLER 2\optiacademic\frontend\src\components\ForgotPassword.jsx
import { useState } from 'react'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000/api/v1'

export default function ForgotPassword({ onBack }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (res.ok) {
                setEnviado(true)
                toast.success('Revisa tu correo para restablecer tu contraseña')

                // Guardar token para desarrollo (solo si está en modo dev)
                if (data.dev_token) {
                    console.log('🔐 Token de desarrollo:', data.dev_token)
                    localStorage.setItem('reset_token', data.dev_token)
                }
            } else {
                setError(data.detail || 'Error al enviar el correo')
                toast.error(error)
            }
        } catch (err) {
            setError('Error de conexión. Intenta nuevamente.')
            toast.error('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    if (enviado) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="text-green-600" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Correo Enviado</h2>
                    <p className="text-gray-600 mb-6">
                        Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                    </p>
                    <div className="bg-blue-50 rounded-lg p-3 mb-6">
                        <p className="text-sm text-blue-700">
                            📧 Revisa tu bandeja de entrada y también la carpeta de spam.
                            El enlace expirará en 1 hora.
                        </p>
                    </div>
                    <button
                        onClick={onBack}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        Volver al inicio de sesión
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
                        <Mail className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Recuperar Contraseña</h1>
                    <p className="text-blue-100 text-sm mt-1">Te enviaremos un enlace para restablecer tu contraseña</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@uni.edu"
                                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                                    Enviando...
                                </span>
                            ) : (
                                'Enviar enlace de recuperación'
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={onBack}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
                        >
                            <ArrowLeft size={14} />
                            Volver al inicio de sesión
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t text-center">
                        <p className="text-xs text-gray-400">
                            ¿No recibiste el correo? Verifica que el email esté registrado
                            o contacta al administrador.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}