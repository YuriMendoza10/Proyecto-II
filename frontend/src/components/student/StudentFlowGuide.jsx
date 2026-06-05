import {
    BookOpen,
    CalendarDays,
    CheckCircle,
    ClipboardCheck,
    Sparkles,
} from 'lucide-react'

const STEPS = [
    {
        key: 'offer',
        title: 'Oferta académica',
        description: 'Selecciona cursos y docentes.',
        icon: BookOpen,
    },
    {
        key: 'generator',
        title: 'Generar opciones',
        description: 'Crea horarios posibles.',
        icon: Sparkles,
    },
    {
        key: 'compare',
        title: 'Comparar horarios',
        description: 'Evalúa las alternativas.',
        icon: ClipboardCheck,
    },
    {
        key: 'final',
        title: 'Horario final',
        description: 'Guarda tu mejor opción.',
        icon: CalendarDays,
    },
]

export default function StudentFlowGuide({ currentStep = 'offer' }) {
    const currentIndex = STEPS.findIndex((step) => step.key === currentStep)

    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
                <h2 className="text-xl font-black text-slate-900">
                    Flujo de selección de horario
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Sigue estos pasos para construir, comparar y confirmar tu horario final.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                {STEPS.map((step, index) => {
                    const Icon = step.icon
                    const active = step.key === currentStep
                    const completed = index < currentIndex

                    return (
                        <div
                            key={step.key}
                            className={[
                                'rounded-3xl border p-4 transition',
                                active
                                    ? 'border-orange-300 bg-orange-50'
                                    : completed
                                      ? 'border-emerald-300 bg-emerald-50'
                                      : 'border-slate-200 bg-slate-50',
                            ].join(' ')}
                        >
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div
                                    className={[
                                        'flex h-11 w-11 items-center justify-center rounded-2xl',
                                        active
                                            ? 'bg-orange-600 text-white'
                                            : completed
                                              ? 'bg-emerald-600 text-white'
                                              : 'bg-slate-200 text-slate-600',
                                    ].join(' ')}
                                >
                                    {completed ? (
                                        <CheckCircle size={22} />
                                    ) : (
                                        <Icon size={22} />
                                    )}
                                </div>

                                <span
                                    className={[
                                        'rounded-xl px-2 py-1 text-xs font-black',
                                        active
                                            ? 'bg-orange-100 text-orange-700'
                                            : completed
                                              ? 'bg-emerald-100 text-emerald-700'
                                              : 'bg-slate-200 text-slate-600',
                                    ].join(' ')}
                                >
                                    Paso {index + 1}
                                </span>
                            </div>

                            <h3 className="font-black text-slate-900">
                                {step.title}
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                {step.description}
                            </p>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}