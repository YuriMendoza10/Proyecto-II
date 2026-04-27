// D:\TALLER 2\optiacademic\frontend\src\App.jsx
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import MatriculaPanel from './components/MatriculaPanel'
import AdminPanel from './components/AdminPanel'

function App() {
  const [user, setUser] = useState(null)
  const [vista, setVista] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    console.log('Verificando autenticación:', { savedUser: !!savedUser, token: !!token })

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser)
        console.log('Usuario cargado:', parsedUser)
        setUser(parsedUser)
        // TODOS los usuarios van al Dashboard por defecto
        setVista('dashboard')
      } catch (e) {
        console.error('Error parsing user:', e)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const handleLogin = (usuario) => {
    console.log('Login exitoso:', usuario)
    setUser(usuario)
    // TODOS los usuarios van al Dashboard
    setVista('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setVista('dashboard')
    console.log('Sesión cerrada')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Cargando OptiAcademic...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  console.log('Renderizando App, usuario:', user.rol, 'vista actual:', vista)

  // Configurar items de navegación según rol
  const navItems = []

  // TODOS los usuarios ven el Dashboard
  navItems.push({ id: 'dashboard', label: '⚡ Dashboard', icon: '' })

  // Estudiantes ven adicionalmente Matrícula y Mi Horario
  if (user.rol === 'estudiante') {
    navItems.push({ id: 'matricula', label: '📝 Matrícula', icon: '' })
    navItems.push({ id: 'mi-horario', label: '📅 Mi Horario', icon: '' })
  }

  // Admin y coordinador ven Administración
  if (user.rol === 'admin' || user.rol === 'coordinador') {
    navItems.push({ id: 'admin', label: '⚙️ Administración', icon: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar profesional */}
      <nav className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center font-bold text-lg mr-3 shadow-lg">
                O
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight">OptiAcademic</span>
                <span className="ml-2 text-[10px] bg-blue-600/80 px-2 py-0.5 rounded text-blue-100 font-medium">v2.1</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setVista(item.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${vista === item.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="ml-4 pl-4 border-l border-gray-700 flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <div className="text-sm font-medium text-white">
                    {user.nombre} {user.apellido}
                  </div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    {user.rol}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg transition"
                  title="Cerrar sesión"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-fadeIn">
          {vista === 'dashboard' && <Dashboard user={user} />}
          {vista === 'matricula' && <MatriculaPanel user={user} />}
          {vista === 'mi-horario' && <MatriculaPanel user={user} vistaInicial="mi-horario" />}
          {vista === 'admin' && <AdminPanel user={user} />}
        </div>
      </main>
    </div>
  )
}

export default App