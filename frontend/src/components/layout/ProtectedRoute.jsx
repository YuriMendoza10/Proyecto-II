import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import LoadingPage from '../../pages/common/LoadingPage'

export default function ProtectedRoute() {
    const { isAuthenticated, initialized, loading } = useAuthStore()

    if (!initialized || loading) {
        return <LoadingPage />
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
