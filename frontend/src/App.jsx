import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import AppLayout from './components/layout/AppLayout'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/layout/ProtectedRoute'
import RoleRoute from './components/layout/RoleRoute'
import LoadingPage from './pages/common/LoadingPage'
import AccessibilityToolbar from './components/accessibility/AccessibilityToolbar'
import NotFoundPage from './pages/common/NotFoundPage'
import UnauthorizedPage from './pages/common/UnauthorizedPage'
import { useAuthStore } from './stores/authStore'

const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'))
const EnvironmentalImpactPage = lazy(() => import('./pages/admin/EnvironmentalImpactPage'))
const ClassroomsPage = lazy(() => import('./pages/admin/ClassroomsPage'))
const CoursesPage = lazy(() => import('./pages/admin/CoursesPage'))
const DataReadinessPage = lazy(() => import('./pages/admin/DataReadinessPage'))
const InstitutionalCSPPage = lazy(() => import('./pages/admin/InstitutionalCSPPage'))
const InstitutionalCspGeneratorPage = lazy(() => import('./pages/admin/InstitutionalCspGeneratorPage'))
const InstitutionalScheduleViewPage = lazy(() => import('./pages/admin/InstitutionalScheduleViewPage'))
const ScheduleQualityPage = lazy(() => import('./pages/admin/ScheduleQualityPage'))
const SectionsPage = lazy(() => import('./pages/admin/SectionsPage'))
const StudentsPage = lazy(() => import('./pages/admin/StudentsPage'))
const TeachersPage = lazy(() => import('./pages/admin/TeachersPage'))
const UsersPage = lazy(() => import('./pages/admin/UsersPage'))
const AcademicPeriodsPage = lazy(() => import('./pages/admin/AcademicPeriodsPage'))
const AcademicProgramsPage = lazy(() => import('./pages/admin/AcademicProgramsPage'))
const CurriculumPlansPage = lazy(() => import('./pages/admin/CurriculumPlansPage'))
const CurriculumPage = lazy(() => import('./pages/admin/CurriculumPage'))
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'))
const FacultiesPage = lazy(() => import('./pages/admin/FacultiesPage'))
const CampusesPage = lazy(() => import('./pages/admin/CampusesPage'))
const InstitutionalStudentsPage = lazy(() => import('./pages/admin/InstitutionalStudentsPage'))
const AcademicHistoryPage = lazy(() => import('./pages/admin/AcademicHistoryPage'))

const CoordinatorDashboard = lazy(() => import('./pages/coordinator/CoordinatorDashboard'))
const OfferingsPage = lazy(() => import('./pages/coordinator/OfferingsPage'))
const OfferingFormPage = lazy(() => import('./pages/coordinator/OfferingFormPage'))
const OfferingConflictsPage = lazy(() => import('./pages/coordinator/OfferingConflictsPage'))
const CoordinatorCspPage = lazy(() => import('./pages/coordinator/CoordinatorCspPage'))
const CoordinatorChangeRequestsPage = lazy(() => import('./pages/coordinator/CoordinatorChangeRequestsPage'))
const TraceabilityPage = lazy(() => import('./pages/coordinator/TraceabilityPage'))

const ExecutiveDashboardPage = lazy(() => import('./pages/reports/ExecutiveDashboardPage'))
const ReportDetailPage = lazy(() => import('./pages/reports/ReportDetailPage'))
const NotificationPage = lazy(() => import('./pages/notifications/NotificationPage'))

const TeacherDashboardPage = lazy(() => import('./pages/teacher/TeacherDashboardPage'))
const TeacherSchedulePage = lazy(() => import('./pages/teacher/TeacherSchedulePage'))
const TeacherSectionsPage = lazy(() => import('./pages/teacher/TeacherSectionsPage'))
const TeacherAvailabilityPage = lazy(() => import('./pages/teacher/TeacherAvailabilityPage'))
const TeacherLoadPage = lazy(() => import('./pages/teacher/TeacherLoadPage'))
const TeacherConflictsPage = lazy(() => import('./pages/teacher/TeacherConflictsPage'))
const TeacherChangeRequestsPage = lazy(() => import('./pages/teacher/TeacherChangeRequestsPage'))

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'))
const MySavedSchedulesPage = lazy(() => import('./pages/student/MySavedSchedulesPage'))
const StudentScheduleGeneratorPage = lazy(() => import('./pages/student/StudentScheduleGeneratorPage'))
const StudentCurriculumPage = lazy(() => import('./pages/student/StudentCurriculumPage'))
const StudentOfferPage = lazy(() => import('./pages/student/StudentOfferPage'))

function dashboardFor(role) {
    if (role === 'ADMIN') return '/admin/dashboard'
    if (role === 'COORDINATOR') return '/coordinator/dashboard'
    if (role === 'TEACHER') return '/teacher/dashboard'
    if (role === 'STUDENT') return '/student'
    return '/login'
}

function HomeRedirect() {
    const { user, isAuthenticated, initialized } = useAuthStore()

    if (!initialized) return <LoadingPage />
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <Navigate to={dashboardFor(user?.role)} replace />
}

function Page(element) {
    return <ErrorBoundary>{element}</ErrorBoundary>
}

export default function App() {
    const { loadUser, token, initialized, logout } = useAuthStore()

    useEffect(() => {
        if (token && !initialized) {
            loadUser()
        }
    }, [token, initialized, loadUser])

    useEffect(() => {
        const onExpired = () => logout()
        window.addEventListener('optiacademic:auth-expired', onExpired)
        return () => window.removeEventListener('optiacademic:auth-expired', onExpired)
    }, [logout])

    return (
        <>
            <AccessibilityToolbar />
            <Toaster position="top-right" />
            <Suspense fallback={<LoadingPage />}>
                <Routes>
                    <Route path="/login" element={Page(<LoginPage />)} />
                    <Route path="/unauthorized" element={<UnauthorizedPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={Page(<AppLayout />)}>
                            <Route path="/" element={<HomeRedirect />} />
                            <Route path="/notifications" element={Page(<NotificationPage />)} />

                            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                            <Route path="/coordinator" element={<Navigate to="/coordinator/dashboard" replace />} />
                            <Route path="/teacher" element={<Navigate to="/teacher/dashboard" replace />} />

                            <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                                <Route path="/admin/dashboard" element={Page(<AdminDashboardPage />)} />
                                <Route path="/admin/executive-dashboard" element={Page(<ExecutiveDashboardPage />)} />
                                <Route path="/admin/audit-logs" element={Page(<AuditLogsPage />)} />
                                <Route path="/admin/faculties" element={Page(<FacultiesPage />)} />
                                <Route path="/admin/campuses" element={Page(<CampusesPage />)} />
                                <Route path="/admin/institutional-students" element={Page(<InstitutionalStudentsPage />)} />
                                <Route path="/admin/academic-history" element={Page(<AcademicHistoryPage />)} />
                                <Route path="/admin/reports/teacher-load" element={Page(<ReportDetailPage reportType="teacher-load" />)} />
                                <Route path="/admin/reports/classroom-usage" element={Page(<ReportDetailPage reportType="classroom-usage" />)} />
                                <Route path="/admin/reports/offerings" element={Page(<ReportDetailPage reportType="offerings" />)} />
                                <Route path="/admin/reports/conflicts" element={Page(<ReportDetailPage reportType="conflicts" />)} />
                                <Route path="/admin/reports/schedules" element={Page(<ReportDetailPage reportType="schedules" />)} />
                                <Route path="/admin/reports/students" element={Page(<ReportDetailPage reportType="students" />)} />
                                <Route path="/admin/reports/change-requests" element={Page(<ReportDetailPage reportType="change-requests" />)} />
                                <Route path="/admin/reports/sustainability" element={Page(<EnvironmentalImpactPage />)} />
                                <Route path="/admin/environmental-impact" element={Page(<EnvironmentalImpactPage />)} />
                                <Route path="/admin/users" element={Page(<UsersPage />)} />
                                <Route path="/admin/teachers" element={Page(<TeachersPage />)} />
                                <Route path="/admin/students" element={Page(<StudentsPage />)} />
                                <Route path="/admin/sections" element={Page(<SectionsPage />)} />
                                <Route path="/admin/courses" element={Page(<CoursesPage />)} />
                                <Route path="/admin/classrooms" element={Page(<ClassroomsPage />)} />
                                <Route path="/admin/academic-periods" element={Page(<AcademicPeriodsPage />)} />
                                <Route path="/admin/academic-programs" element={Page(<AcademicProgramsPage />)} />
                                <Route path="/admin/curriculum-plans" element={Page(<CurriculumPlansPage />)} />
                                <Route path="/admin/curriculum" element={Page(<CurriculumPage />)} />
                                <Route path="/admin/student-generator" element={Page(<StudentScheduleGeneratorPage />)} />
                                <Route path="/admin/student-schedules" element={Page(<MySavedSchedulesPage />)} />
                                <Route path="/admin/student-offer" element={Page(<StudentOfferPage />)} />
                            </Route>

                            <Route element={<RoleRoute allowedRoles={['ADMIN', 'COORDINATOR']} />}>
                                <Route path="/coordinator/dashboard" element={Page(<CoordinatorDashboard />)} />
                                <Route path="/coordinator/offerings" element={Page(<OfferingsPage />)} />
                                <Route path="/coordinator/offerings/create" element={Page(<OfferingFormPage />)} />
                                <Route path="/coordinator/offerings/:id" element={Page(<OfferingFormPage />)} />
                                <Route path="/coordinator/conflicts" element={Page(<OfferingConflictsPage />)} />
                                <Route path="/coordinator/csp" element={Page(<CoordinatorCspPage />)} />
                                <Route path="/coordinator/change-requests" element={Page(<CoordinatorChangeRequestsPage />)} />
                                <Route path="/coordinator/traceability" element={Page(<TraceabilityPage />)} />
                                <Route path="/admin/traceability" element={Page(<TraceabilityPage />)} />
                                <Route path="/coordinator/reports" element={Page(<ExecutiveDashboardPage />)} />
                                <Route path="/coordinator/reports/teacher-load" element={Page(<ReportDetailPage reportType="teacher-load" />)} />
                                <Route path="/coordinator/reports/classroom-usage" element={Page(<ReportDetailPage reportType="classroom-usage" />)} />
                                <Route path="/coordinator/reports/offerings" element={Page(<ReportDetailPage reportType="offerings" />)} />
                                <Route path="/coordinator/reports/conflicts" element={Page(<ReportDetailPage reportType="conflicts" />)} />
                                <Route path="/coordinator/reports/schedules" element={Page(<ReportDetailPage reportType="schedules" />)} />
                                <Route path="/coordinator/reports/change-requests" element={Page(<ReportDetailPage reportType="change-requests" />)} />
                                <Route path="/admin/schedules" element={Page(<InstitutionalCSPPage />)} />
                                <Route path="/admin/schedule-view" element={Page(<InstitutionalScheduleViewPage />)} />
                                <Route path="/admin/schedule-quality" element={Page(<ScheduleQualityPage />)} />
                                <Route path="/admin/data-readiness" element={Page(<DataReadinessPage />)} />
                                <Route path="/admin/institutional-csp" element={Page(<InstitutionalCspGeneratorPage />)} />
                            </Route>

                            <Route element={<RoleRoute allowedRoles={['TEACHER']} />}>
                                <Route path="/teacher/dashboard" element={Page(<TeacherDashboardPage />)} />
                                <Route path="/teacher/schedule" element={Page(<TeacherSchedulePage />)} />
                                <Route path="/teacher/sections" element={Page(<TeacherSectionsPage />)} />
                                <Route path="/teacher/availability" element={Page(<TeacherAvailabilityPage />)} />
                                <Route path="/teacher/load" element={Page(<TeacherLoadPage />)} />
                                <Route path="/teacher/conflicts" element={Page(<TeacherConflictsPage />)} />
                                <Route path="/teacher/change-requests" element={Page(<TeacherChangeRequestsPage />)} />
                            </Route>

                            <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
                                <Route path="/student" element={Page(<StudentDashboard />)} />
                                <Route path="/student/schedule-generator" element={Page(<StudentScheduleGeneratorPage />)} />
                                <Route path="/student/my-schedules" element={Page(<MySavedSchedulesPage />)} />
                                <Route path="/student/offer" element={Page(<StudentOfferPage />)} />
                                <Route path="/student/curriculum" element={Page(<StudentCurriculumPage />)} />
                            </Route>

                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </>
    )
}
