import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, BookOpen, CheckCircle, Loader2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { curriculumService } from '../../services/curriculumService'
import { getErrorMessage } from '../../utils/extractList'

export default function StudentCurriculumPage() {
    const [curriculum, setCurriculum] = useState(null)
    const [eligibility, setEligibility] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([
            curriculumService.getMyCurriculum(),
            curriculumService.getMyEligibleCourses(),
        ])
            .then(([plan, eligible]) => {
                setCurriculum(plan)
                setEligibility(eligible)
            })
            .catch((error) => toast.error(getErrorMessage(error, 'No se pudo cargar tu malla curricular')))
            .finally(() => setLoading(false))
    }, [])

    const eligibilityById = useMemo(
        () => Object.fromEntries((eligibility?.courses || []).map((course) => [course.id, course])),
        [eligibility]
    )

    if (loading) return <div className="flex justify-center rounded-2xl bg-white p-20 text-orange-600"><Loader2 className="animate-spin" /></div>
    if (!curriculum) return <p className="rounded-2xl bg-white p-8">No existe una malla curricular activa para mostrar.</p>

    const cycles = Array.from({ length: curriculum.total_cycles }, (_, index) => index + 1)

    return <div className="space-y-6">
        <header className="rounded-3xl bg-slate-950 p-7 text-white">
            <div className="mb-3 flex items-center gap-2 text-orange-300"><BookOpen size={20} /> Mi malla curricular</div>
            <h1 className="text-2xl font-bold">{curriculum.name}</h1>
            <p className="mt-2 text-slate-300">{curriculum.program?.name} | {curriculum.code}</p>
            <p className="mt-4 text-sm text-slate-400">{curriculum.source_note}</p>
        </header>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
            Los prerrequisitos recomendados son orientación académica editable y no bloquean tu selección.
        </div>
        {cycles.map((cycle) => {
            const courses = curriculum.courses.filter((course) => course.cycle_number === cycle)
            const credits = courses.reduce((sum, course) => sum + course.credits, 0)
            return <section key={cycle} className="overflow-hidden rounded-2xl border bg-white">
                <div className="flex justify-between bg-slate-50 px-5 py-3 font-bold"><span>Ciclo {String(cycle).padStart(2, '0')}</span><span>{credits} créditos</span></div>
                <div className="divide-y">{courses.map((course) => {
                    const state = eligibilityById[course.id]
                    return <article key={course.id} className="flex flex-col justify-between gap-3 p-4 md:flex-row md:items-center">
                        <div>
                            <p className="font-semibold">{course.course_name} <span className="text-slate-400">| {course.credits} cr.</span></p>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                <span className="rounded bg-slate-100 px-2 py-1">{course.course_type}</span>
                                {course.is_suggested_elective && <span className="flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-amber-800"><Star size={12} /> Electivo sugerido</span>}
                                {state?.recommended_prerequisites?.map((name) => <span key={name} className="rounded bg-blue-50 px-2 py-1 text-blue-700">Recomendado después de {name}</span>)}
                            </div>
                        </div>
                        {state?.eligible ? <span className="flex items-center gap-1 text-sm font-semibold text-green-700"><CheckCircle size={17} /> Habilitado</span> : <span className="flex items-center gap-1 text-sm font-semibold text-red-700"><AlertCircle size={17} /> Bloqueado</span>}
                    </article>
                })}</div>
            </section>
        })}
    </div>
}
