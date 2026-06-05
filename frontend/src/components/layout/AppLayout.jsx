import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
    BookOpen,
    Building2,
    CalendarDays,
    ClipboardCheck,
    ClipboardList,
    GraduationCap,
    LayoutDashboard,
    Leaf,
    Layers,
    LogOut,
    School,
    Sparkles,
    Star,
    UserCog,
    UserRound,
    Users,
} from 'lucide-react'

import ErrorBoundary from '../common/ErrorBoundary'
import ThemeToggle from '../common/ThemeToggle'
import SkipToContent from '../accessibility/SkipToContent'
import NotificationBell from '../notifications/NotificationBell'
import SidebarItem from './SidebarItem'
import SidebarSection from './SidebarSection'
import { useAuthStore } from '../../stores/authStore'

const roleLabels = {
    ADMIN: 'Administrador',
    COORDINATOR: 'Coordinador',
    TEACHER: 'Docente',
    STUDENT: 'Estudiante',
}

const pageTitles = {
    '/admin/dashboard': 'Dashboard institucional',
    '/admin/executive-dashboard': 'Panel ejecutivo',
    '/admin/audit-logs': 'Auditoria',
    '/admin/faculties': 'Facultades',
    '/admin/campuses': 'Sede Huancayo',
    '/admin/institutional-students': 'Estudiantes institucionales',
    '/admin/academic-history': 'Historial academico',
    '/admin/traceability': 'Trazabilidad',
    '/admin/reports/teacher-load': 'Reporte de carga docente',
    '/admin/reports/classroom-usage': 'Reporte de uso de aulas',
    '/admin/reports/offerings': 'Reporte de ofertas',
    '/admin/reports/conflicts': 'Reporte de conflictos',
    '/admin/reports/schedules': 'Reporte de horarios',
    '/admin/reports/students': 'Reporte de estudiantes',
    '/admin/reports/change-requests': 'Reporte de solicitudes docentes',
    '/admin/reports/sustainability': 'Reporte de sostenibilidad',
    '/admin/environmental-impact': 'Impacto ambiental',
    '/admin/data-readiness': 'Preparacion de datos',
    '/admin/users': 'Usuarios',
    '/admin/teachers': 'Docentes',
    '/admin/students': 'Estudiantes',
    '/admin/sections': 'Secciones',
    '/admin/courses': 'Cursos',
    '/admin/classrooms': 'Aulas',
    '/admin/academic-periods': 'Periodos academicos',
    '/admin/academic-programs': 'Programas academicos',
    '/admin/curriculum-plans': 'Planes curriculares',
    '/admin/curriculum': 'Malla curricular',
    '/admin/schedules': 'Generador CSP institucional',
    '/admin/institutional-csp': 'Generacion institucional',
    '/admin/student-generator': 'Simulador estudiantil',
    '/admin/student-schedules': 'Horarios de estudiantes',
    '/admin/schedule-view': 'Vista institucional',
    '/admin/schedule-quality': 'Calidad de horario',
    '/coordinator/dashboard': 'Dashboard del coordinador',
    '/coordinator/offerings': 'Oferta academica',
    '/coordinator/offerings/create': 'Crear oferta',
    '/coordinator/conflicts': 'Conflictos de oferta',
    '/coordinator/csp': 'CSP desde ofertas',
    '/coordinator/change-requests': 'Solicitudes docentes',
    '/coordinator/traceability': 'Trazabilidad',
    '/coordinator/reports': 'Reportes academicos',
    '/teacher/dashboard': 'Panel del docente',
    '/teacher/schedule': 'Mi horario',
    '/teacher/sections': 'Mis cursos y secciones',
    '/teacher/availability': 'Mi disponibilidad',
    '/teacher/load': 'Mi carga academica',
    '/teacher/conflicts': 'Conflictos docentes',
    '/teacher/change-requests': 'Solicitudes de cambio',
    '/student': 'Panel del estudiante',
    '/student/schedule-generator': 'Generador de horario',
    '/student/my-schedules': 'Mi horario elegido',
    '/student/curriculum': 'Mi malla curricular',
    '/student/offer': 'Oferta academica',
    '/notifications': 'Notificaciones',
}

export default function AppLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuthStore()
    const dashboardPath = getDashboardPath(user?.role)
    const menu = useMemo(() => buildMenu(user?.role, dashboardPath), [user?.role, dashboardPath])
    const activeSection = menu.find((section) => section.items.some((item) => isActivePath(location.pathname, item.to)))?.id
    const storageKey = `optiacademic_sidebar_${user?.role || 'guest'}`
    const [openSections, setOpenSections] = useState(() => readOpenSections(storageKey))

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(openSections))
    }, [openSections, storageKey])

    const toggleSection = (id) => {
        setOpenSections((current) => ({ ...current, [id]: !current[id] }))
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const currentTitle = pageTitles[location.pathname] || 'OptiAcademic'

    return (
        <div className="flex min-h-screen bg-slate-100">
            <SkipToContent />
            <aside className="flex w-72 shrink-0 flex-col bg-slate-950 text-white" aria-label="Navegación principal">
                <div className="border-b border-slate-800 p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600">
                            <GraduationCap size={26} />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-lg font-bold">OptiAcademic</h1>
                            <p className="truncate text-xs text-slate-400">Gestion inteligente de horarios</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto p-4" aria-label="Menú por módulos">
                    {menu.map((section) => (
                        <SidebarSection
                            key={section.id}
                            title={section.title}
                            icon={section.icon}
                            active={section.id === activeSection}
                            open={Boolean(openSections[section.id] || section.id === activeSection)}
                            onToggle={() => toggleSection(section.id)}
                        >
                            {section.items.map((item) => (
                                <SidebarItem key={item.to} to={item.to} icon={item.icon} label={item.label} badge={item.badge} />
                            ))}
                        </SidebarSection>
                    ))}
                </nav>

                <div className="border-t border-slate-800 p-4">
                    <div className="mb-4 rounded-2xl bg-slate-900 px-4 py-3">
                        <p className="truncate text-sm font-semibold">{user?.full_name || 'Usuario'}</p>
                        <p className="truncate text-xs text-slate-400">{user?.email}</p>
                        <p className="mt-1 text-xs font-medium text-orange-300">{roleLabels[user?.role] || user?.role}</p>
                    </div>
                    <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-2 text-sm font-semibold transition hover:bg-red-700">
                        <LogOut size={18} /> Cerrar sesion
                    </button>
                </div>
            </aside>

            <main id="main-content" tabIndex="-1" className="flex min-w-0 flex-1 flex-col">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8">
                    <div className="min-w-0">
                        <p className="text-sm text-slate-500">{roleLabels[user?.role] || 'Usuario'}</p>
                        <h2 className="truncate text-lg font-bold text-slate-800">{currentTitle}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <NotificationBell />
                    </div>
                </header>
                <section className="flex-1 overflow-y-auto p-8" aria-label={currentTitle}>
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </section>
            </main>
        </div>
    )
}

function buildMenu(role, dashboardPath) {
    const commonNotifications = {
        id: 'notifications',
        title: 'Notificaciones',
        icon: <ClipboardList size={16} />,
        items: [{ to: '/notifications', label: 'Notificaciones', icon: <ClipboardList size={18} /> }],
    }

    if (role === 'ADMIN') {
        return [
            { id: 'home', title: 'Inicio', icon: <LayoutDashboard size={16} />, items: [{ to: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={18} /> }] },
            {
                id: 'institutional-base',
                title: 'Institucional',
                icon: <Building2 size={16} />,
                items: [
                    { to: '/admin/faculties', label: 'Facultades', icon: <School size={18} /> },
                    { to: '/admin/campuses', label: 'Sede Huancayo', icon: <Building2 size={18} /> },
                    { to: '/admin/institutional-students', label: 'Estudiantes institucionales', icon: <Users size={18} /> },
                    { to: '/admin/academic-history', label: 'Historial academico', icon: <ClipboardList size={18} /> },
                ],
            },
            {
                id: 'analytics',
                title: 'Analitica',
                icon: <ClipboardCheck size={16} />,
                items: [
                    { to: '/admin/executive-dashboard', label: 'Panel ejecutivo', icon: <LayoutDashboard size={18} /> },
                    { to: '/admin/audit-logs', label: 'Auditoria', icon: <ClipboardCheck size={18} /> },
                    { to: '/admin/traceability', label: 'Trazabilidad', icon: <ClipboardList size={18} /> },
                    { to: '/admin/reports/teacher-load', label: 'Carga docente', icon: <ClipboardList size={18} /> },
                    { to: '/admin/reports/classroom-usage', label: 'Uso de aulas', icon: <Building2 size={18} /> },
                    { to: '/admin/reports/offerings', label: 'Ofertas', icon: <Layers size={18} /> },
                    { to: '/admin/reports/conflicts', label: 'Conflictos', icon: <ClipboardCheck size={18} /> },
                    { to: '/admin/reports/schedules', label: 'Horarios', icon: <CalendarDays size={18} /> },
                    { to: '/admin/reports/students', label: 'Estudiantes', icon: <Users size={18} /> },
                    { to: '/admin/reports/change-requests', label: 'Solicitudes docentes', icon: <ClipboardList size={18} /> },
                    { to: '/admin/reports/sustainability', label: 'Sostenibilidad', icon: <Leaf size={18} /> },
                ],
            },
            {
                id: 'institutional',
                title: 'Gestion institucional',
                icon: <Users size={16} />,
                items: [
                    { to: '/admin/data-readiness', label: 'Preparacion de datos', icon: <ClipboardList size={18} /> },
                    { to: '/admin/environmental-impact', label: 'Impacto ambiental', icon: <Leaf size={18} /> },
                    { to: '/admin/users', label: 'Usuarios', icon: <Users size={18} /> },
                    { to: '/admin/teachers', label: 'Docentes', icon: <UserCog size={18} /> },
                    { to: '/admin/students', label: 'Estudiantes', icon: <UserRound size={18} /> },
                    { to: '/admin/sections', label: 'Secciones', icon: <Layers size={18} /> },
                    { to: '/admin/courses', label: 'Cursos', icon: <School size={18} /> },
                    { to: '/admin/classrooms', label: 'Aulas', icon: <Building2 size={18} /> },
                ],
            },
            {
                id: 'academic',
                title: 'Dominio academico',
                icon: <BookOpen size={16} />,
                items: [
                    { to: '/admin/academic-periods', label: 'Periodos', icon: <CalendarDays size={18} /> },
                    { to: '/admin/academic-programs', label: 'Programas', icon: <GraduationCap size={18} /> },
                    { to: '/admin/curriculum-plans', label: 'Planes curriculares', icon: <ClipboardList size={18} /> },
                    { to: '/admin/curriculum', label: 'Malla curricular', icon: <BookOpen size={18} /> },
                    { to: '/coordinator/offerings', label: 'Oferta academica', icon: <Layers size={18} /> },
                    { to: '/coordinator/conflicts', label: 'Conflictos de oferta', icon: <ClipboardCheck size={18} /> },
                    { to: '/coordinator/csp', label: 'CSP desde ofertas', icon: <Sparkles size={18} /> },
                    { to: '/coordinator/change-requests', label: 'Solicitudes docentes', icon: <ClipboardCheck size={18} /> },
                ],
            },
            {
                id: 'schedules',
                title: 'Horarios',
                icon: <CalendarDays size={16} />,
                items: [
                    { to: '/admin/institutional-csp', label: 'Generacion institucional', icon: <RocketIcon /> },
                    { to: '/admin/schedules', label: 'Generar horario', icon: <CalendarDays size={18} /> },
                    { to: '/admin/schedule-view', label: 'Ver horario', icon: <CalendarDays size={18} /> },
                    { to: '/admin/schedule-quality', label: 'Calidad horario', icon: <ClipboardCheck size={18} /> },
                ],
            },
            {
                id: 'students',
                title: 'Estudiantes',
                icon: <Star size={16} />,
                items: [
                    { to: '/admin/student-generator', label: 'Simulador estudiantil', icon: <Sparkles size={18} /> },
                    { to: '/admin/student-schedules', label: 'Horarios estudiantes', icon: <Star size={18} /> },
                ],
            },
            commonNotifications,
        ]
    }

    if (role === 'COORDINATOR') {
        return [
            { id: 'home', title: 'Coordinacion', icon: <LayoutDashboard size={16} />, items: [{ to: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={18} /> }] },
            { id: 'offering', title: 'Oferta academica', icon: <Layers size={16} />, items: [{ to: '/coordinator/offerings', label: 'Gestionar oferta', icon: <Layers size={18} /> }, { to: '/coordinator/conflicts', label: 'Conflictos', icon: <ClipboardCheck size={18} /> }] },
            { id: 'csp', title: 'CSP', icon: <Sparkles size={16} />, items: [{ to: '/coordinator/csp', label: 'CSP desde ofertas', icon: <Sparkles size={18} /> }, { to: '/admin/institutional-csp', label: 'Generacion institucional', icon: <CalendarDays size={18} /> }] },
            { id: 'requests', title: 'Solicitudes docentes', icon: <ClipboardCheck size={16} />, items: [{ to: '/coordinator/change-requests', label: 'Solicitudes docentes', icon: <ClipboardCheck size={18} /> }] },
            { id: 'reports', title: 'Reportes', icon: <ClipboardList size={16} />, items: [{ to: '/coordinator/reports', label: 'Panel de reportes', icon: <LayoutDashboard size={18} /> }, { to: '/coordinator/reports/teacher-load', label: 'Carga docente', icon: <ClipboardList size={18} /> }, { to: '/coordinator/reports/classroom-usage', label: 'Uso de aulas', icon: <Building2 size={18} /> }, { to: '/coordinator/reports/offerings', label: 'Ofertas', icon: <Layers size={18} /> }, { to: '/coordinator/reports/conflicts', label: 'Conflictos', icon: <ClipboardCheck size={18} /> }, { to: '/coordinator/reports/schedules', label: 'Horarios', icon: <CalendarDays size={18} /> }, { to: '/coordinator/reports/change-requests', label: 'Solicitudes', icon: <ClipboardList size={18} /> }] },
            { id: 'traceability', title: 'Trazabilidad', icon: <ClipboardCheck size={16} />, items: [{ to: '/coordinator/traceability', label: 'Trazabilidad', icon: <ClipboardCheck size={18} /> }] },
            commonNotifications,
        ]
    }

    if (role === 'TEACHER') {
        return [
            { id: 'home', title: 'Portal docente', icon: <LayoutDashboard size={16} />, items: [{ to: dashboardPath, label: 'Dashboard', icon: <LayoutDashboard size={18} /> }, { to: '/teacher/schedule', label: 'Mi horario', icon: <CalendarDays size={18} /> }, { to: '/teacher/sections', label: 'Mis secciones', icon: <BookOpen size={18} /> }, { to: '/teacher/load', label: 'Carga academica', icon: <Layers size={18} /> }, { to: '/teacher/conflicts', label: 'Conflictos', icon: <ClipboardCheck size={18} /> }] },
            { id: 'availability', title: 'Disponibilidad', icon: <ClipboardList size={16} />, items: [{ to: '/teacher/availability', label: 'Mi disponibilidad', icon: <ClipboardList size={18} /> }] },
            { id: 'requests', title: 'Solicitudes', icon: <Sparkles size={16} />, items: [{ to: '/teacher/change-requests', label: 'Solicitudes de cambio', icon: <Sparkles size={18} /> }] },
            commonNotifications,
        ]
    }

    return [
        { id: 'home', title: 'Inicio', icon: <LayoutDashboard size={16} />, items: [{ to: dashboardPath, label: 'Inicio', icon: <LayoutDashboard size={18} /> }] },
        { id: 'academic', title: 'Academico', icon: <BookOpen size={16} />, items: [{ to: '/student/curriculum', label: 'Mi malla', icon: <GraduationCap size={18} /> }, { to: '/student/offer', label: 'Oferta', icon: <BookOpen size={18} /> }] },
        { id: 'schedules', title: 'Horarios', icon: <CalendarDays size={16} />, items: [{ to: '/student/schedule-generator', label: 'Generador', icon: <Sparkles size={18} /> }, { to: '/student/my-schedules', label: 'Mis horarios', icon: <Star size={18} /> }] },
        commonNotifications,
    ]
}

function getDashboardPath(role) {
    if (role === 'ADMIN') return '/admin/dashboard'
    if (role === 'COORDINATOR') return '/coordinator/dashboard'
    if (role === 'TEACHER') return '/teacher/dashboard'
    if (role === 'STUDENT') return '/student'
    return '/'
}

function isActivePath(pathname, to) {
    return pathname === to || (to !== '/' && pathname.startsWith(`${to}/`))
}

function readOpenSections(storageKey) {
    try {
        return JSON.parse(localStorage.getItem(storageKey) || '{}')
    } catch {
        return {}
    }
}

function RocketIcon() {
    return <Sparkles size={18} />
}
