export default function Reportes() {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">📈 Reportes Institucionales</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <ReporteCard titulo="Ocupación de Aulas" valor="78%" tendencia="+5%" color="blue" />
                    <ReporteCard titulo="Tasa de Conflictos" valor="0%" tendencia="Óptimo" color="green" />
                    <ReporteCard titulo="Carga Docente Promedio" valor="16h" tendencia="Balanceado" color="purple" />
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 font-semibold text-gray-700 flex justify-between">
                        <span>Detalle por Programa</span>
                        <button className="text-sm text-blue-600 hover:underline">📥 Exportar Excel</button>
                    </div>
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium">Programa</th>
                                <th className="text-left px-4 py-3 font-medium">Cursos</th>
                                <th className="text-left px-4 py-3 font-medium">Estudiantes</th>
                                <th className="text-left px-4 py-3 font-medium">Ocupación</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { prog: 'Ing. Sistemas', cursos: 24, est: 340, oc: '82%' },
                                { prog: 'Ing. Industrial', cursos: 18, est: 280, oc: '75%' },
                                { prog: 'Administración', cursos: 20, est: 310, oc: '79%' },
                            ].map((r, i) => (
                                <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900">{r.prog}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.cursos}</td>
                                    <td className="px-4 py-3 text-gray-600">{r.est}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: r.oc }} />
                                            </div>
                                            <span className="text-gray-600 text-xs">{r.oc}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function ReporteCard({ titulo, valor, tendencia, color }) {
    const colors = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        purple: 'bg-purple-50 border-purple-200',
    }
    return (
        <div className={`rounded-xl border p-6 ${colors[color]}`}>
            <div className="text-sm font-medium text-gray-500 mb-1">{titulo}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{valor}</div>
            <div className="text-xs font-medium text-gray-600">{tendencia}</div>
        </div>
    )
}