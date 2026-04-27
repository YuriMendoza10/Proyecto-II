/**
 * Timetable.jsx
 * Componente visual que renderiza el horario generado en formato de grilla semanal.
 * Agrupa las asignaciones por día y franja horaria para detección visual de conflictos.
 */

import { useMemo } from 'react'

const DIAS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
const HORAS = ['08-10', '10-12', '12-14', '14-16', '16-18']

export default function Timetable({ asignaciones }) {
    /**
     * Construye una matriz día x hora con las asignaciones correspondientes.
     * Estructura: { 'lunes': { '08-10': [asignacion1, ...] } }
     */
    const matriz = useMemo(() => {
        const m = {}
        DIAS.forEach(dia => {
            m[dia] = {}
            HORAS.forEach(hora => {
                m[dia][hora] = []
            })
        })

        asignaciones.forEach(asig => {
            const [dia, hora] = asig.franja.split('_')
            if (m[dia] && m[dia][hora]) {
                m[dia][hora].push(asig)
            }
        })

        return m
    }, [asignaciones])

    // Función para obtener color según tipo de curso
    const getColorCurso = (cursoId) => {
        const colors = [
            'bg-blue-100 text-blue-800 border-blue-300',
            'bg-green-100 text-green-800 border-green-300',
            'bg-purple-100 text-purple-800 border-purple-300',
            'bg-orange-100 text-orange-800 border-orange-300',
            'bg-pink-100 text-pink-800 border-pink-300',
            'bg-teal-100 text-teal-800 border-teal-300',
        ]
        // Hash simple para consistencia de color por curso
        let hash = 0
        for (let i = 0; i < cursoId.length; i++) {
            hash = cursoId.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    return (
        <div className="card overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📅 Horario Generado — Vista Semanal
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border border-gray-200 bg-gray-50 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24">
                                Hora / Día
                            </th>
                            {DIAS.map(dia => (
                                <th
                                    key={dia}
                                    className="border border-gray-200 bg-gray-50 p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[160px]"
                                >
                                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {HORAS.map(hora => (
                            <tr key={hora}>
                                <td className="border border-gray-200 bg-gray-50 p-3 text-sm font-medium text-gray-700 text-center">
                                    {hora}
                                </td>
                                {DIAS.map(dia => {
                                    const celdas = matriz[dia][hora]
                                    return (
                                        <td
                                            key={`${dia}-${hora}`}
                                            className="border border-gray-200 p-2 align-top min-h-[80px]"
                                        >
                                            {celdas.length === 0 ? (
                                                <div className="h-full flex items-center justify-center">
                                                    <span className="text-gray-300 text-xs">—</span>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {celdas.map((asig, idx) => (
                                                        <div
                                                            key={`${asig.curso_id}-${idx}`}
                                                            className={`rounded-md border px-3 py-2 text-xs ${getColorCurso(asig.curso_id)}`}
                                                        >
                                                            <div className="font-bold text-sm mb-0.5">
                                                                {asig.curso_id}
                                                            </div>
                                                            <div className="opacity-90">
                                                                🏫 {asig.aula_id}
                                                            </div>
                                                            <div className="opacity-90">
                                                                👤 {asig.docente_id}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Leyenda */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400"></div>
                    <span>Curso asignado</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gray-100 border border-gray-300"></div>
                    <span>Franja libre</span>
                </div>
            </div>
        </div>
    )
}