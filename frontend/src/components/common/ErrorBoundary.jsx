import { Component } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

function dashboardFor(role) {
    if (role === 'ADMIN') return '/admin/dashboard'
    if (role === 'COORDINATOR') return '/coordinator/dashboard'
    if (role === 'TEACHER') return '/teacher/dashboard'
    if (role === 'STUDENT') return '/student'
    return '/login'
}

function BoundaryFallback({ error, onRetry }) {
    const user = useAuthStore((state) => state.user)
    const showDetail = import.meta.env.DEV

    return (
        <div className="flex min-h-[60vh] items-center justify-center px-4">
            <div className="max-w-xl rounded-3xl border bg-white p-8 text-center shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Ocurrio un error al cargar esta vista</h1>
                <p className="mt-3 text-sm text-slate-500">
                    La aplicacion sigue activa. Puedes reintentar la vista o volver al dashboard de tu rol.
                </p>
                {showDetail && error && (
                    <pre className="mt-5 max-h-40 overflow-auto rounded-xl bg-slate-950 p-4 text-left text-xs text-slate-100">
                        {String(error.stack || error.message || error)}
                    </pre>
                )}
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button onClick={onRetry} className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white">
                        Reintentar
                    </button>
                    <Link to={dashboardFor(user?.role)} className="rounded-xl border px-5 py-2.5 text-sm font-semibold text-slate-700">
                        Volver al dashboard
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default class ErrorBoundary extends Component {
    state = { error: null, version: 0 }

    static getDerivedStateFromError(error) {
        return { error }
    }

    componentDidCatch(error, info) {
        console.error('Vista capturada por ErrorBoundary:', error, info)
    }

    retry = () => {
        this.setState((current) => ({ error: null, version: current.version + 1 }))
    }

    render() {
        if (this.state.error) {
            return <BoundaryFallback error={this.state.error} onRetry={this.retry} />
        }

        return <div key={this.state.version}>{this.props.children}</div>
    }
}

