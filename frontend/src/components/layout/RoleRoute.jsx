import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import LoadingState from '../common/LoadingState'

export default function RoleRoute({ allowedRoles = [] }) {
    const { user, isAuthenticated, initialized, loading } = useAuthStore()

    if (!initialized || loading) {
        return <LoadingState title="Validando permisos..." text="Estamos cargando tu rol y sesion." />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (!user) {
        return <LoadingState title="Cargando usuario..." text="Un momento mientras se recupera tu perfil." />
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return <Outlet />
}
