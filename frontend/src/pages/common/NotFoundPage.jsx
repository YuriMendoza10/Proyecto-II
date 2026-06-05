import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

function dashboardFor(role) {
    if (role === 'ADMIN') return '/admin/dashboard'
    if (role === 'COORDINATOR') return '/coordinator/dashboard'
    if (role === 'TEACHER') return '/teacher/dashboard'
    if (role === 'STUDENT') return '/student'
    return '/login'
}

export default function NotFoundPage() {
    const user = useAuthStore((state) => state.user)
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
            <div className="max-w-md rounded-3xl border bg-white p-10 text-center shadow-sm">
                <h1 className="text-6xl font-black text-slate-900">404</h1>
                <p className="mt-4 text-slate-600">La ruta no existe o ya no esta disponible.</p>
                <Link to={dashboardFor(user?.role)} className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white">
                    Volver a una vista segura
                </Link>
            </div>
        </div>
    )
}

