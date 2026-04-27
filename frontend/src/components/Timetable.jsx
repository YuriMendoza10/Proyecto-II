// frontend/src/components/Timetable.jsx
import React from 'react'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const HORARIOS = {
    '07:00-09:00': 0,
    '09:00-11:00': 1,
    '11:00-13:00': 2,
    '13:00-15:00': 3,
    '15:00-17:00': 4,
    '17:00-19:00': 5,
    '19:00-21:00': 6
}

export default function Timetable({ asignaciones }) {
    // Inicializar matriz de horario
    const matriz = Array(7).fill().map(() => Array(7).fill(null))

    // Función para parsear franja (ej: "Lunes 07:00-09:00")
    const parseFranja = (franja) => {
        for (const dia of DIAS) {
            if (franja.includes(dia)) {
                for (const [hora, idx] of Object.entries(HORARIOS)) {
                    if (franja.includes(hora)) {
                        return { dia, hora, idx }
                    }
                }
            }
        }
        return null
    }

    // Llenar matriz con asignaciones
    asignaciones?.forEach(asig => {
        const parsed = parseFranja(asig.franja)
        if (parsed) {
            const col = DIAS.indexOf(parsed.dia)
            const row = parsed.idx
            if (col !== -1 && row !== -1 && !matriz[row][col]) {
                matriz[row][col] = asig
            }
        }
    })

    const colores = ['blue', 'green', 'purple', 'orange', 'red', 'teal', 'pink']

    const getColorForCurso = (cursoId) => {
        let hash = 0
        for (let i = 0; i < cursoId.length; i++) {
            hash = ((hash << 5) - hash) + cursoId.charCodeAt(i)
            hash |= 0
        }
        return colores[Math.abs(hash) % colores.length]
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-28">
                                Horario
                            </th>
                            {DIAS.map(dia => (
                                <th key={dia} className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {dia}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(HORARIOS).map(([hora, idx]) => (
                            <tr key={hora} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-3 text-xs font-medium text-gray-600 bg-gray-50/50">
                                    {hora}
                                </td>
                                {DIAS.map((dia, col) => {
                                    const asig = matriz[idx][col]
                                    return (
                                        <td key={col} className="px-2 py-2 align-top">
                                            {asig && (
                                                <div className={`bg-${getColorForCurso(asig.curso_id)}-50 border-l-4 border-${getColorForCurso(asig.curso_id)}-500 rounded p-2 text-xs`}>
                                                    <div className="font-semibold text-gray-800">{asig.curso_id}</div>
                                                    <div className="text-gray-600 text-xs mt-1">
                                                        <div>Aula: {asig.aula_id}</div>
                                                        <div className="truncate">Docente: {asig.docente_id?.split(' ')[0] || asig.docente_id}</div>
                                                    </div>
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
            {(!asignaciones || asignaciones.length === 0) && (
                <div className="text-center py-12 text-gray-400">
                    📅 No hay horarios generados aún
                </div>
            )}
        </div>
    )
}