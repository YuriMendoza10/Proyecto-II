// D:\TALLER 2\optiacademic\frontend\src\components\HorarioUniversitario.jsx
import React, { useState, useEffect } from 'react';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// Normalizar franjas horarias
const FRANJAS = [
    '07:30 - 09:00',
    '09:10 - 10:40',
    '10:50 - 12:20',
    '12:30 - 14:00',
    '14:10 - 15:40',
    '15:50 - 17:20',
    '17:30 - 19:00',
    '19:10 - 20:40',
];

const colores = [
    'bg-blue-50 border-blue-500 text-blue-800',
    'bg-green-50 border-green-500 text-green-800',
    'bg-purple-50 border-purple-500 text-purple-800',
    'bg-orange-50 border-orange-500 text-orange-800',
    'bg-pink-50 border-pink-500 text-pink-800',
    'bg-indigo-50 border-indigo-500 text-indigo-800',
    'bg-yellow-50 border-yellow-500 text-yellow-800',
    'bg-red-50 border-red-500 text-red-800',
    'bg-teal-50 border-teal-500 text-teal-800',
];

const HorarioUniversitario = ({ asignaciones = [], onCursoClick }) => {
    const [horarioData, setHorarioData] = useState({});
    const [selectedCurso, setSelectedCurso] = useState(null);

    useEffect(() => {
        console.log('HorarioUniversitario - Asignaciones recibidas:', asignaciones);

        // Inicializar estructura vacía
        const data = {};
        DIAS.forEach(dia => {
            data[dia] = {};
            FRANJAS.forEach(franja => {
                data[dia][franja] = null;
            });
        });

        // Llenar con asignaciones
        // En HorarioUniversitario.jsx, modifica la parte donde se procesan las asignaciones:

        asignaciones.forEach((asignacion, idx) => {
            console.log(`Procesando asignación ${idx}:`, asignacion);

            let dia = asignacion.dia;
            let franjaHoraria = asignacion.franja_horaria;

            // Si no tiene dia, intentar extraer de 'franja'
            if (!dia && asignacion.franja) {
                const partes = asignacion.franja.split(' ');
                dia = partes[0];
                // Normalizar el formato de la hora: convertir "07:30-09:00" a "07:30 - 09:00"
                let hora = partes.slice(1).join(' ');
                hora = hora.replace(/-/g, ' - '); // Agrega espacios alrededor del guion
                franjaHoraria = hora;
            }

            // Si aún no tiene dia, usar valores por defecto
            if (!dia) {
                dia = DIAS[idx % DIAS.length];
                franjaHoraria = FRANJAS[idx % FRANJAS.length];
            }

            // Verificar si la franja existe en FRANJAS
            if (data[dia] && data[dia][franjaHoraria] !== undefined) {
                data[dia][franjaHoraria] = {
                    ...asignacion,
                    dia: dia,
                    franja_horaria: franjaHoraria,
                    curso_nombre: asignacion.curso_nombre || asignacion.curso_id,
                    nrc: asignacion.nrc || asignacion.curso_id,
                    aula: asignacion.aula_id || asignacion.aula,
                    docente: asignacion.docente_id || asignacion.docente
                };
                console.log(`✅ Insertado en ${dia} - ${franjaHoraria}`);
            } else {
                console.warn(`⚠️ No se pudo insertar: ${dia} - ${franjaHoraria}`);
                // Intentar encontrar la franja más cercana
                const franjaCercana = FRANJAS.find(f => f.includes(hora.split(' - ')[0]));
                if (franjaCercana && data[dia][franjaCercana] !== undefined) {
                    data[dia][franjaCercana] = {
                        ...asignacion,
                        dia: dia,
                        franja_horaria: franjaCercana,
                        curso_nombre: asignacion.curso_nombre || asignacion.curso_id,
                        nrc: asignacion.nrc || asignacion.curso_id,
                        aula: asignacion.aula_id || asignacion.aula,
                        docente: asignacion.docente_id || asignacion.docente
                    };
                    console.log(`✅ Insertado en ${dia} - ${franjaCercana} (franja cercana)`);
                }
            }
        });

        setHorarioData(data);
    }, [asignaciones]);

    const getColorForCurso = (index) => {
        return colores[index % colores.length];
    };

    const handleCursoClick = (curso) => {
        setSelectedCurso(curso);
        if (onCursoClick) onCursoClick(curso);
    };

    return (
        <div className="w-full overflow-x-auto">
            <table className="min-w-[1000px] border-collapse">
                <thead>
                    <tr>
                        <th className="w-32 p-3 bg-gray-100 border border-gray-200 sticky left-0 z-10">
                            <div className="font-bold text-gray-700">Hora</div>
                        </th>
                        {DIAS.map(dia => (
                            <th key={dia} className="p-3 bg-gray-100 border border-gray-200 min-w-[220px]">
                                <div className="font-bold text-gray-700">{dia}</div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {FRANJAS.map((franja, idx) => {
                        const colorClass = getColorForCurso(idx);

                        return (
                            <tr key={idx} className="border-b border-gray-200">
                                <td className="p-2 bg-gray-50 border border-gray-200 text-center font-medium text-sm sticky left-0 z-10">
                                    {franja}
                                </td>
                                {DIAS.map(dia => {
                                    const curso = horarioData[dia]?.[franja];

                                    if (curso) {
                                        return (
                                            <td
                                                key={`${dia}-${franja}`}
                                                className={`p-2 border border-gray-200 ${colorClass.split(' ')[0]} cursor-pointer transition hover:shadow-md`}
                                                onClick={() => handleCursoClick(curso)}
                                            >
                                                <div className={`p-2 rounded border-l-4 ${colorClass.split(' ').slice(1).join(' ')}`}>
                                                    <div className="font-bold text-sm">
                                                        {curso.curso_nombre}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        NRC: {curso.nrc}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Aula: {curso.aula}
                                                    </div>
                                                    <div className="text-xs text-gray-600 mt-1 truncate">
                                                        Docente: {curso.docente}
                                                    </div>
                                                    {curso.duracion && (
                                                        <div className="text-xs text-purple-600 mt-1">
                                                            ⏱️ {curso.duracion} min
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        );
                                    }

                                    return (
                                        <td key={`${dia}-${franja}`} className="p-2 border border-gray-200 bg-white">
                                            <div className="h-28"></div>
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Modal de detalles */}
            {selectedCurso && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedCurso(null)}>
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900">Detalles del Curso</h3>
                            <button onClick={() => setSelectedCurso(null)} className="text-gray-400 hover:text-gray-600 text-2xl">
                                ×
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Curso:</label>
                                <p className="text-gray-900">{selectedCurso.curso_nombre}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">NRC:</label>
                                <p className="text-gray-900">{selectedCurso.nrc}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Horario:</label>
                                <p className="text-gray-900">{selectedCurso.dia} {selectedCurso.franja_horaria}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Aula:</label>
                                <p className="text-gray-900">{selectedCurso.aula}</p>
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Docente:</label>
                                <p className="text-gray-900">{selectedCurso.docente}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSelectedCurso(null)}
                            className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HorarioUniversitario;