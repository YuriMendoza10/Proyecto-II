// D:\TALLER 2\optiacademic\frontend\src\components\HorarioSemanal.jsx
import { useState } from 'react'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const FRANJAS = [
    { hora: '07:30', fin: '09:00', label: '07:30 - 09:00' },
    { hora: '09:10', fin: '10:40', label: '09:10 - 10:40' },
    { hora: '10:50', fin: '12:20', label: '10:50 - 12:20' },
    { hora: '12:30', fin: '14:00', label: '12:30 - 14:00' },
    { hora: '14:10', fin: '15:40', label: '14:10 - 15:40' },
    { hora: '15:50', fin: '17:20', label: '15:50 - 17:20' },
    { hora: '17:30', fin: '19:00', label: '17:30 - 19:00' },
    { hora: '19:10', fin: '20:40', label: '19:10 - 20:40' },
]

const COLOR_PALETA = [
    { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-800', hover: 'hover:bg-blue-200' },
    { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800', hover: 'hover:bg-green-200' },
    { bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-800', hover: 'hover:bg-purple-200' },
    { bg: 'bg-orange-100', border: 'border-orange-500', text: 'text-orange-800', hover: 'hover:bg-orange-200' },
    { bg: 'bg-pink-100', border: 'border-pink-500', text: 'text-pink-800', hover: 'hover:bg-pink-200' },
    { bg: 'bg-indigo-100', border: 'border-indigo-500', text: 'text-indigo-800', hover: 'hover:bg-indigo-200' },
    { bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800', hover: 'hover:bg-yellow-200' },
    { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800', hover: 'hover:bg-red-200' },
    { bg: 'bg-teal-100', border: 'border-teal-500', text: 'text-teal-800', hover: 'hover:bg-teal-200' },
    { bg: 'bg-cyan-100', border: 'border-cyan-500', text: 'text-cyan-800', hover: 'hover:bg-cyan-200' },
]

const getColorForCurso = (cursoId) => {
    if (!cursoId) return COLOR_PALETA[0]
    let hash = 0
    for (let i = 0; i < cursoId.length; i++) {
        hash = ((hash << 5) - hash) + cursoId.charCodeAt(i)
        hash |= 0
    }
    return COLOR_PALETA[Math.abs(hash) % COLOR_PALETA.length]
}

/**
 * Normaliza la franja horaria a { dia, franjaLabel }
 * Soporta múltiples formatos que puede devolver el API:
 *   - "Lunes 07:30 - 09:00"
 *   - "Lunes 07:30-09:00"
 *   - "Lunes07:30-09:00"
 *   - { dia: "Lunes", hora_inicio: "07:30", hora_fin: "09:00" }
 *   - "Lunes 1" (solo número de bloque)
 */
const parsearFranja = (curso) => {
    const franja = curso.franja || curso.horario || curso.hora || ''

    if (!franja) return null

    // Si es objeto con dia + hora_inicio/fin
    if (typeof franja === 'object' && franja.dia) {
        const dia = franja.dia
        const horaInicio = franja.hora_inicio || franja.inicio || ''
        const horaFin = franja.hora_fin || franja.fin || ''
        const label = `${horaInicio} - ${horaFin}`
        return { dia, franjaLabel: label }
    }

    const str = String(franja).trim()

    // Intenta extraer día y horas con regex flexible
    // Soporta: "Lunes 07:30 - 09:00", "Lunes 07:30-09:00", "Lunes07:30-09:00"
    const matchConHoras = str.match(
        /^(Lunes|Martes|Mi[eé]rcoles|Jueves|Viernes|S[aá]bado)\s*(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/i
    )
    if (matchConHoras) {
        const dia = normalizarDia(matchConHoras[1])
        const label = `${matchConHoras[2]} - ${matchConHoras[3]}`
        // Buscar la franja más cercana
        const franjaExacta = encontrarFranjaMasCercana(label)
        return { dia, franjaLabel: franjaExacta }
    }

    // Solo el día (ej: "Lunes") — usar dia del curso si tiene campo separado
    const matchSoloDia = str.match(/^(Lunes|Martes|Mi[eé]rcoles|Jueves|Viernes|S[aá]bado)$/i)
    if (matchSoloDia) {
        const dia = normalizarDia(matchSoloDia[1])
        const horaInicio = curso.hora_inicio || curso.inicio || ''
        const horaFin = curso.hora_fin || curso.fin || ''
        if (horaInicio && horaFin) {
            const label = `${horaInicio} - ${horaFin}`
            const franjaExacta = encontrarFranjaMasCercana(label)
            return { dia, franjaLabel: franjaExacta }
        }
    }

    return null
}

const normalizarDia = (dia) => {
    const mapa = {
        'miercoles': 'Miércoles', 'miércoles': 'Miércoles',
        'sabado': 'Sábado', 'sábado': 'Sábado',
        'lunes': 'Lunes', 'martes': 'Martes',
        'jueves': 'Jueves', 'viernes': 'Viernes',
    }
    return mapa[dia.toLowerCase()] || dia
}

// Encuentra la franja del horario que mejor coincide con la hora dada
const encontrarFranjaMasCercana = (horaLabel) => {
    // Intento exacto primero
    const exacta = FRANJAS.find(f => f.label === horaLabel)
    if (exacta) return exacta.label

    // Extrae hora de inicio para comparar
    const match = horaLabel.match(/(\d{1,2}):(\d{2})/)
    if (!match) return FRANJAS[0].label

    const horas = parseInt(match[1])
    const minutos = parseInt(match[2])
    const minutosTotales = horas * 60 + minutos

    let mejorFranja = FRANJAS[0]
    let menorDiff = Infinity

    FRANJAS.forEach(f => {
        const m = f.hora.match(/(\d{1,2}):(\d{2})/)
        if (m) {
            const diff = Math.abs(parseInt(m[1]) * 60 + parseInt(m[2]) - minutosTotales)
            if (diff < menorDiff) {
                menorDiff = diff
                mejorFranja = f
            }
        }
    })

    return mejorFranja.label
}

const HorarioSemanal = ({ horario, onCursoClick }) => {
    const [selectedCurso, setSelectedCurso] = useState(null)

    // Construir matriz días × franjas
    const matriz = {}
    DIAS.forEach(dia => {
        matriz[dia] = {}
        FRANJAS.forEach(f => { matriz[dia][f.label] = null })
    })

    // Llenar matriz — tolerante a múltiples formatos de franja
    const cursosNoUbicados = []

    horario?.forEach(curso => {
        const parsed = parsearFranja(curso)
        if (parsed && matriz[parsed.dia] !== undefined && matriz[parsed.dia][parsed.franjaLabel] !== undefined) {
            matriz[parsed.dia][parsed.franjaLabel] = curso
        } else {
            cursosNoUbicados.push(curso)
        }
    })

    const handleCursoClick = (curso) => {
        setSelectedCurso(curso)
        if (onCursoClick) onCursoClick(curso)
    }

    return (
        <div className="w-full">
            {/* Leyenda */}
            <div className="mb-4 flex flex-wrap gap-2">
                {horario?.map((curso, idx) => {
                    const id = curso.curso_codigo || curso.curso_id || String(idx)
                    const color = getColorForCurso(id)
                    return (
                        <span
                            key={idx}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color.bg} ${color.text}`}
                        >
                            <span className={`w-2 h-2 rounded-full border-2 ${color.border}`}></span>
                            {curso.curso_codigo}
                        </span>
                    )
                })}
            </div>

            {/* Cursos sin horario asignado */}
            {cursosNoUbicados.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
                    <strong>⚠️ {cursosNoUbicados.length} curso(s) sin horario asignado:</strong>{' '}
                    {cursosNoUbicados.map(c => c.curso_codigo).join(', ')}
                    <div className="text-xs mt-1 text-yellow-600">
                        Franja recibida: "{cursosNoUbicados.map(c => c.franja || 'sin franja').join('", "')}"
                    </div>
                </div>
            )}

            {/* Tabla */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-[900px] border-separate border-spacing-0">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-20 w-28 bg-gray-50 px-3 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                Hora
                            </th>
                            {DIAS.map(dia => (
                                <th key={dia} className="min-w-[140px] bg-gray-50 px-3 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {dia}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {FRANJAS.map((franja, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                                <td className="sticky left-0 z-10 bg-inherit px-3 py-1 border-b border-gray-100 text-xs font-medium text-gray-400 whitespace-nowrap">
                                    {franja.label}
                                </td>
                                {DIAS.map(dia => {
                                    const curso = matriz[dia]?.[franja.label]
                                    const color = curso ? getColorForCurso(curso.curso_codigo || curso.curso_id) : null

                                    if (curso) {
                                        return (
                                            <td
                                                key={`${dia}-${franja.label}`}
                                                onClick={() => handleCursoClick(curso)}
                                                className={`p-1 border-b border-gray-100 cursor-pointer transition-all duration-150 ${color?.hover}`}
                                            >
                                                <div className={`${color?.bg} rounded-lg p-2 border-l-4 ${color?.border} shadow-sm h-full`}>
                                                    <div className={`font-bold text-xs ${color?.text}`}>
                                                        {curso.curso_codigo}
                                                    </div>
                                                    <div className="text-xs text-gray-700 mt-0.5 leading-tight">
                                                        {curso.curso_nombre?.length > 28
                                                            ? curso.curso_nombre.substring(0, 28) + '…'
                                                            : curso.curso_nombre}
                                                    </div>
                                                    <div className="flex justify-between items-center mt-1.5">
                                                        <span className="text-[10px] text-gray-500">
                                                            {curso.aula ? `Aula ${curso.aula}` : ''}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-500">
                                                            {curso.creditos} cr.
                                                        </span>
                                                    </div>
                                                    {curso.docente && (
                                                        <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                                                            {curso.docente}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        )
                                    }

                                    return (
                                        <td key={`${dia}-${franja.label}`} className="p-1 border-b border-gray-100">
                                            <div className="h-20 rounded-lg bg-transparent"></div>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal detalles */}
            {selectedCurso && (
                <div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    onClick={() => setSelectedCurso(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`p-5 ${getColorForCurso(selectedCurso.curso_codigo || selectedCurso.curso_id).bg}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="text-xs font-mono bg-white/80 px-2 py-1 rounded">
                                        {selectedCurso.curso_codigo}
                                    </span>
                                    <h3 className="text-lg font-bold mt-2 leading-tight">
                                        {selectedCurso.curso_nombre}
                                    </h3>
                                </div>
                                <button
                                    onClick={() => setSelectedCurso(null)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl leading-none ml-3"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Horario</p>
                                    <p className="font-medium text-sm">{selectedCurso.franja || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Aula</p>
                                    <p className="font-medium text-sm">{selectedCurso.aula || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Créditos</p>
                                    <p className="font-medium text-sm">{selectedCurso.creditos}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Sección</p>
                                    <p className="font-medium text-sm">{selectedCurso.seccion || 'A'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Docente</p>
                                <p className="font-medium text-sm">{selectedCurso.docente || '—'}</p>
                            </div>
                            <div className="pt-3 border-t">
                                <button
                                    onClick={() => setSelectedCurso(null)}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HorarioSemanal