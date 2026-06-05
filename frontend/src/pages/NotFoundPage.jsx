import { Link } from 'react-router-dom'

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center max-w-md">
                <h1 className="text-5xl font-bold text-slate-900 mb-4">404</h1>
                <p className="text-slate-600 mb-6">
                    La página que buscas no existe o no tienes acceso.
                </p>

                <Link
                    to="/login"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
                >
                    Volver al login
                </Link>
            </div>
        </div>
    )
}