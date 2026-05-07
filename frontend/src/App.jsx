import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'

// Componentes
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import MatriculaPanel from './components/MatriculaPanel'
import AdminPanel from './components/AdminPanel'
import AdminUsuarios from './components/AdminUsuarios'
import AdminAulas from './components/AdminAulas'
import DashboardEjecutivo from './components/DashboardEjecutivo'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import MisCursos from './components/MisCursos'
import GestionarSolicitudes from './components/GestionarSolicitudes'

// NUEVO
import SelectorHorarioProfesional from './components/SelectorHorarioProfesional'

function App() {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        handleLogout()
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (usuario) => {
    setUser(usuario)

    if (usuario.rol === 'estudiante') {
      navigate('/selector-horario') // 🔥 ahora entra directo al generador
    } else if (usuario.rol === 'docente') {
      navigate('/mis-cursos')
    } else {
      navigate('/dashboard')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
  }

  const getNavItems = () => {
    if (!user) return []

    const items = [{ id: 'dashboard', label: '⚡ Dashboard' }]

    // 👨‍🎓 ESTUDIANTE
    if (user.rol === 'estudiante') {
      items.push(
        { id: 'selector-horario', label: '🎯 Generar Horario' },
        { id: 'matricula', label: '📝 Matrícula' },
        { id: 'mi-horario', label: '📅 Mi Horario' },
        { id: 'mis-cursos', label: '📚 Mis Cursos' }
      )
    }

    // 🧑‍💼 ADMIN / COORDINADOR
    if (user.rol === 'admin' || user.rol === 'coordinador') {
      items.push(
        { id: 'admin', label: '⚙️ Administración' },
        { id: 'admin-usuarios', label: '👥 Usuarios' },
        { id: 'admin-aulas', label: '🏫 Aulas' },
        { id: 'dashboard-ejecutivo', label: '📈 Ejecutivo' },
        { id: 'gestionar-solicitudes', label: '📋 Solicitudes' }
      )
    }

    return items
  }

  // ⏳ LOADING
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm font-medium">Cargando OptiAcademic...</p>
        </div>
      </div>
    )
  }

  // 🔐 NO AUTENTICADO
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} onForgotPassword={() => navigate('/forgot-password')} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} onForgotPassword={() => navigate('/forgot-password')} />} />
        <Route path="/forgot-password" element={<ForgotPassword onBack={() => navigate('/login')} onSuccess={() => navigate('/login')} />} />
        <Route path="/reset-password" element={<ResetPassword onBack={() => navigate('/login')} onSuccess={() => navigate('/login')} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // 🧠 APP PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">

          <div className="flex items-center">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-bold text-lg mr-3">
              O
            </div>
            <span className="font-bold text-xl hidden sm:block">OptiAcademic</span>
          </div>

          <div className="flex items-center gap-1">
            {getNavItems().map(item => (
              <button
                key={item.id}
                onClick={() => navigate(`/${item.id}`)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${location.pathname === `/${item.id}`
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                {item.label}
              </button>
            ))}

            <div className="ml-4 pl-4 border-l border-gray-700 flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold">{user.nombre} {user.apellido}</p>
                <p className="text-[10px] text-gray-400 uppercase">{user.rol}</p>
              </div>

              <button onClick={handleLogout} className="text-red-400 hover:text-red-300">
                🚪
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>

          {/* ESTUDIANTE */}
          <Route path="/selector-horario" element={
            <SelectorHorarioProfesional
              user={user}
              onMatricular={(solucion) => {
                console.log('Matricular en:', solucion)
                navigate('/matricula')
              }}
            />
          } />

          <Route path="/matricula" element={<MatriculaPanel user={user} />} />
          <Route path="/mi-horario" element={<MatriculaPanel user={user} vistaInicial="mi-horario" />} />
          <Route path="/mis-cursos" element={<MisCursos user={user} />} />

          {/* ADMIN */}
          <Route path="/admin" element={<AdminPanel user={user} />} />
          <Route path="/admin-usuarios" element={<AdminUsuarios user={user} />} />
          <Route path="/admin-aulas" element={<AdminAulas user={user} />} />
          <Route path="/dashboard-ejecutivo" element={<DashboardEjecutivo user={user} />} />
          <Route path="/gestionar-solicitudes" element={<GestionarSolicitudes user={user} />} />

          {/* GENERAL */}
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/" element={<Dashboard user={user} />} />

        </Routes>
      </main>
    </div>
  )
}

export default App