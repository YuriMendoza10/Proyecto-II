import React from 'react';

// Si CONFIG o API_URL no están definidos globalmente, impórtalos o pásalos por props
const CONFIG = { CICLO_ACTUAL: '2024-II' };
const API_URL = 'http://tu-api.com'; // Cambia esto por tu URL real

const MiHorario = ({ user, miHorario }) => {

    const handleDownloadPDF = () => {
        window.open(`${API_URL}/exportar/mi-horario-pdf?userId=${user.id}`, '_blank');
    };

    if (!miHorario) return <div className="text-white">Cargando horario...</div>;

    const bloquesHoras = ['07:30-09:00', '09:10-10:40', '10:50-12:20', '12:30-14:00', '14:10-15:40', '15:50-17:20'];
    const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    return (
        <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Horario {CONFIG.CICLO_ACTUAL}</h2>
                    <div className="text-sm text-gray-500">
                        {miHorario.total_cursos} cursos | {miHorario.total_creditos} créditos
                    </div>
                </div>
                <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    📄 Descargar PDF
                </button>
            </div>

            {miHorario.horario?.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
                    No tienes cursos matriculados
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full border-collapse border border-gray-200">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="p-3 border text-left text-xs font-bold uppercase text-slate-600">Hora/Día</th>
                                {diasSemana.map(dia => (
                                    <th key={dia} className="p-3 border text-left text-xs font-bold uppercase text-slate-600">{dia}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {bloquesHoras.map(hora => (
                                <tr key={hora}>
                                    <td className="p-3 border text-sm font-semibold bg-slate-50 text-slate-700">{hora}</td>
                                    {diasSemana.map(dia => {
                                        const curso = miHorario.horario?.find(c =>
                                            c.franja?.includes(dia) && c.franja?.includes(hora.split('-')[0])
                                        );
                                        return (
                                            <td key={dia} className="p-3 border align-top h-24 transition-colors hover:bg-blue-50/30">
                                                {curso && (
                                                    <div className="text-sm">
                                                        <div className="font-bold text-blue-700">{curso.curso_codigo}</div>
                                                        <div className="text-xs text-slate-700 font-medium leading-tight mb-1">
                                                            {curso.curso_nombre?.slice(0, 40)}
                                                        </div>
                                                        <div className="inline-block px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded border">
                                                            Aula: {curso.aula}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MiHorario;