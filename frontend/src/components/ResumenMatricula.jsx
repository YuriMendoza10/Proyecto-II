// D:\TALLER 2\optiacademic\frontend\src\components\ResumenMatricula.jsx
import { CheckCircle, Calendar, BookOpen, Award, Clock } from 'lucide-react'

export default function ResumenMatricula({ matricula, onCerrar, onVerHorario }) {
    if (!matricula) return null

    const totalCreditos = matricula.total_creditos || matricula.cursos?.reduce((sum, c) => sum + (c.creditos || 0), 0) || 0

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={onCerrar}>
            <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                {/* Header verde de éxito */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold">¡Matrícula Exitosa!</h2>
                    <p className="text-green-100 text-sm mt-1">Tu inscripción ha sido registrada correctamente</p>
                </div>

                <div className="p-6">
                    {/* Resumen rápido */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                            <BookOpen size={20} className="mx-auto text-blue-600 mb-1" />
                            <div className="text-2xl font-bold text-blue-700">{matricula.total_cursos || matricula.cursos?.length || 0}</div>
                            <div className="text-xs text-gray-500">Cursos inscritos</div>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                            <Award size={20} className="mx-auto text-green-600 mb-1" />
                            <div className="text-2xl font-bold text-green-700">{totalCreditos}</div>
                            <div className="text-xs text-gray-500">Créditos totales</div>
                        </div>
                    </div>

                    {/* Lista de cursos matriculados */}
                    {matricula.cursos && matricula.cursos.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <Calendar size={16} />
                                Cursos matriculados
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-auto">
                                {matricula.cursos.map((curso, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-mono text-xs text-gray-500">{curso.curso_codigo || curso.codigo}</span>
                                                <div className="font-medium text-gray-800">{curso.curso_nombre || curso.nombre}</div>
                                                {curso.franja && (
                                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                        <Clock size={12} /> {curso.franja}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold text-blue-600">{curso.creditos || 0} cr</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCerrar}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={onVerHorario}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                        >
                            Ver mi horario
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}