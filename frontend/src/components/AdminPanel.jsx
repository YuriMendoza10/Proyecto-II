// D:\TALLER 2\optiacademic\frontend\src\components\AdminPanel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search, Plus, Edit, Trash2, X,
    Building, BookOpen, Users, School, GraduationCap,
    ChevronLeft, ChevronRight, Download,
    Layers
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = 'http://localhost:8000/api/v1';

// Componente de tarjeta de estadísticas
const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
                {trend && (
                    <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mes anterior
                    </p>
                )}
            </div>
            <div className={`${color} p-3 rounded-xl text-white`}>
                {icon}
            </div>
        </div>
    </div>
);

// Componente de modal de confirmación
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

// Componente de carga
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Campos por defecto para crear nuevos registros según la entidad
const DEFAULT_FIELDS = {
    facultades: { nombre: '', codigo: '', descripcion: '' },
    programas: { nombre: '', codigo: '', facultad_id: '', descripcion: '' },
    docentes: { nombre: '', apellido: '', email: '', activo: true },
    aulas: { nombre: '', capacidad: 0, tipo: '', activo: true },
    cursos: { nombre: '', codigo: '', creditos: 0, semestre: 1, programa_id: '' },
};

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    // Datos de entidades
    const [facultades, setFacultades] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [cursos, setCursos] = useState([]);

    // UI
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [editando, setEditando] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [formData, setFormData] = useState({});

    // Generación masiva — hooks DENTRO del componente
    const [generandoMasivo, setGenerandoMasivo] = useState(false);
    const [resultadoMasivo, setResultadoMasivo] = useState(null);
    const [semestresSeleccionados, setSemestresSeleccionados] = useState([1, 2, 3]);
    const [numVersiones, setNumVersiones] = useState(3);

    const itemsPerPage = 10;
    const token = localStorage.getItem('token');

    // ── Carga de datos ──────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const endpoints = {
                facultades: '/facultades',
                programas: '/programas',
                docentes: '/docentes',
                aulas: '/aulas',
                cursos: '/cursos',
            };

            if (endpoints[activeTab]) {
                const res = await fetch(`${API_URL}${endpoints[activeTab]}`, { headers });
                const data = await res.json();

                const setters = {
                    facultades: setFacultades,
                    programas: setProgramas,
                    docentes: setDocentes,
                    aulas: setAulas,
                    cursos: setCursos,
                };
                setters[activeTab]?.(data);
            }
        } catch {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    }, [activeTab, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── CRUD ────────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Quita la 's' final para construir el endpoint singular
        const singular = activeTab.slice(0, -1);
        const method = editando ? 'PUT' : 'POST';
        const url = editando
            ? `${API_URL}/${singular}/${editando.id}`
            : `${API_URL}/${singular}`;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                toast.success(`${singular} ${editando ? 'actualizado' : 'creado'} exitosamente`);
                setShowModal(false);
                setEditando(null);
                setFormData({});
                fetchData();
            } else {
                const error = await response.json();
                toast.error(error.detail || 'Error al guardar');
            }
        } catch {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        const singular = activeTab.slice(0, -1);

        try {
            const response = await fetch(`${API_URL}/${singular}/${deleteTarget.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                toast.success(`${singular} eliminado`);
                setShowConfirm(false);
                setDeleteTarget(null);
                fetchData();
            } else {
                toast.error('Error al eliminar');
            }
        } catch {
            toast.error('Error de conexión');
        }
    };

    // ── Generación masiva ───────────────────────────────────────────────────────
    const generarHorariosMasivos = async () => {
        if (semestresSeleccionados.length === 0) {
            toast.error('Selecciona al menos un semestre');
            return;
        }
        setGenerandoMasivo(true);
        setResultadoMasivo(null);

        try {
            const params = `semestres=${semestresSeleccionados.join(',')}&num_versiones=${numVersiones}`;
            const response = await fetch(`${API_URL}/generar-masivo?${params}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();
            setResultadoMasivo(data);
            toast.success(data.message || 'Horarios generados exitosamente');
        } catch {
            toast.error('Error al generar horarios');
        } finally {
            setGenerandoMasivo(false);
        }
    };

    // ── Helpers de datos ────────────────────────────────────────────────────────
    const dataMap = { facultades, programas, docentes, aulas, cursos };

    const stats = {
        facultades: facultades.length,
        programas: programas.length,
        docentes: docentes.length,
        aulas: aulas.length,
        cursos: cursos.length,
    };

    const currentData = dataMap[activeTab] || [];
    const filteredData = currentData.filter((item) =>
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const totalItems = filteredData.length;
    const paginatedData = filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const tabs = [
        { id: 'dashboard', label: '📊 Dashboard', icon: <Building size={18} /> },
        { id: 'facultades', label: '🏛️ Facultades', icon: <Building size={18} /> },
        { id: 'programas', label: '📚 Programas', icon: <BookOpen size={18} /> },
        { id: 'docentes', label: '👨‍🏫 Docentes', icon: <Users size={18} /> },
        { id: 'aulas', label: '🏫 Aulas', icon: <School size={18} /> },
        { id: 'cursos', label: '📖 Cursos', icon: <GraduationCap size={18} /> },
    ];

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white p-6">
                <h1 className="text-2xl font-bold">Panel de Administración</h1>
                <p className="text-blue-100 mt-1">Gestión completa del sistema académico</p>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="px-6 overflow-x-auto">
                    <div className="flex space-x-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCurrentPage(1);
                                    setSearchTerm('');
                                }}
                                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap
                                    ${activeTab === tab.id
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="p-6">
                {/* ── Dashboard ── */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Tarjetas de estadísticas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <StatCard title="Facultades" value={stats.facultades} icon={<Building size={24} />} color="bg-blue-600" trend={5} />
                            <StatCard title="Programas" value={stats.programas} icon={<BookOpen size={24} />} color="bg-purple-600" trend={12} />
                            <StatCard title="Docentes" value={stats.docentes} icon={<Users size={24} />} color="bg-green-600" trend={8} />
                            <StatCard title="Aulas" value={stats.aulas} icon={<School size={24} />} color="bg-orange-600" trend={3} />
                            <StatCard title="Cursos" value={stats.cursos} icon={<GraduationCap size={24} />} color="bg-red-600" trend={15} />
                        </div>

                        {/* Generación Masiva — solo visible en Dashboard */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Layers size={20} /> Generación Masiva de Horarios
                            </h3>

                            <div className="bg-blue-50 rounded-xl p-4 mb-4">
                                <p className="text-sm text-blue-800">
                                    Esta herramienta generará automáticamente múltiples versiones de horarios
                                    para los semestres seleccionados. Se guardará la mejor versión de cada
                                    semestre en la base de datos.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {/* Selección de semestres */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Semestres</label>
                                    <div className="flex gap-3 flex-wrap">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <label key={s} className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={semestresSeleccionados.includes(s)}
                                                    onChange={(e) => {
                                                        setSemestresSeleccionados(
                                                            e.target.checked
                                                                ? [...semestresSeleccionados, s]
                                                                : semestresSeleccionados.filter((ss) => ss !== s)
                                                        );
                                                    }}
                                                    className="rounded border-gray-300 text-blue-600"
                                                />
                                                <span className="text-sm">{s}°</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Versiones por semestre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Versiones por semestre
                                    </label>
                                    <select
                                        value={numVersiones}
                                        onChange={(e) => setNumVersiones(parseInt(e.target.value))}
                                        className="w-full border rounded-lg px-3 py-2"
                                    >
                                        <option value={1}>1 versión</option>
                                        <option value={3}>3 versiones</option>
                                        <option value={5}>5 versiones</option>
                                    </select>
                                </div>

                                {/* Botón */}
                                <div className="flex items-end">
                                    <button
                                        onClick={generarHorariosMasivos}
                                        disabled={generandoMasivo}
                                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                                    >
                                        {generandoMasivo ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Generando...
                                            </>
                                        ) : (
                                            <>🚀 Generar Horarios Masivos</>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Resultado */}
                            {resultadoMasivo && (
                                <div className="bg-white border rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-800 mb-3">✅ Resultado</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                        <div className="bg-green-50 p-3 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {resultadoMasivo.semestres_generados}
                                            </div>
                                            <div className="text-sm text-gray-600">Semestres generados</div>
                                        </div>
                                        <div className="bg-blue-50 p-3 rounded-lg text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {resultadoMasivo.total_horarios}
                                            </div>
                                            <div className="text-sm text-gray-600">Horarios generados</div>
                                        </div>
                                    </div>

                                    {resultadoMasivo.detalle &&
                                        Object.entries(resultadoMasivo.detalle).map(([semestre, data]) => (
                                            <div key={semestre} className="mt-2 p-3 bg-gray-50 rounded-lg">
                                                <div className="font-medium">Semestre {semestre}</div>
                                                <div className="text-sm text-gray-600">
                                                    Cursos: {data.cursos} | Mejor versión:{' '}
                                                    {data.mejor_version?.asignaciones} asignaciones
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Paneles de entidades ── */}
                {activeTab !== 'dashboard' && (
                    <div className="bg-white rounded-xl shadow-sm border">
                        {/* Barra de herramientas */}
                        <div className="p-4 border-b flex flex-wrap justify-between items-center gap-4">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setEditando(null);
                                        setFormData(DEFAULT_FIELDS[activeTab] ?? {});
                                        setShowModal(true);
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                                >
                                    <Plus size={18} />
                                    Nuevo {activeTab.slice(0, -1)}
                                </button>
                                <button className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg border hover:bg-gray-50 transition">
                                    <Download size={18} />
                                </button>
                            </div>

                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Tabla */}
                        {loading ? (
                            <LoadingSpinner />
                        ) : paginatedData.length === 0 ? (
                            <p className="text-center text-gray-400 py-12">No hay registros que mostrar.</p>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b">
                                            <tr>
                                                {Object.keys(paginatedData[0]).slice(0, 4).map((key) => (
                                                    <th
                                                        key={key}
                                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                                                    >
                                                        {key.replace(/_/g, ' ')}
                                                    </th>
                                                ))}
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                                                    Acciones
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {paginatedData.map((item, idx) => (
                                                <tr key={item.id ?? idx} className="hover:bg-gray-50 transition">
                                                    {Object.entries(item).slice(0, 4).map(([key, value]) => (
                                                        <td key={key} className="px-6 py-4 text-sm text-gray-900">
                                                            {typeof value === 'object'
                                                                ? JSON.stringify(value)
                                                                : String(value).slice(0, 50)}
                                                        </td>
                                                    ))}
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditando(item);
                                                                setFormData(item);
                                                                setShowModal(true);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setDeleteTarget(item);
                                                                setShowConfirm(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Paginación */}
                                {totalItems > itemsPerPage && (
                                    <div className="px-6 py-4 border-t flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            Mostrando {(currentPage - 1) * itemsPerPage + 1} –{' '}
                                            {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 border rounded disabled:opacity-50"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <span className="px-3 py-1 border rounded bg-gray-50">
                                                {currentPage}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setCurrentPage((p) =>
                                                        Math.min(Math.ceil(totalItems / itemsPerPage), p + 1)
                                                    )
                                                }
                                                disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                                                className="px-3 py-1 border rounded disabled:opacity-50"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* ── Modal de creación / edición ── */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">
                                {editando
                                    ? `Editar ${activeTab.slice(0, -1)}`
                                    : `Crear ${activeTab.slice(0, -1)}`}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {Object.entries(formData).map(([key, value]) => {
                                if (['id', 'created_at', 'updated_at', 'recursos', 'disponibilidad'].includes(key))
                                    return null;

                                return (
                                    <div key={key}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                            {key.replace(/_/g, ' ')}
                                        </label>
                                        {typeof value === 'boolean' ? (
                                            <select
                                                value={String(value)}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, [key]: e.target.value === 'true' })
                                                }
                                                className="w-full border rounded-lg px-3 py-2"
                                            >
                                                <option value="true">Sí</option>
                                                <option value="false">No</option>
                                            </select>
                                        ) : (
                                            <input
                                                type={
                                                    key.includes('password')
                                                        ? 'password'
                                                        : typeof value === 'number'
                                                            ? 'number'
                                                            : 'text'
                                                }
                                                value={value ?? ''}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        [key]:
                                                            typeof value === 'number'
                                                                ? Number(e.target.value)
                                                                : e.target.value,
                                                    })
                                                }
                                                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        )}
                                    </div>
                                );
                            })}

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : editando ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Modal de confirmación de eliminación ── */}
            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleDelete}
                title="Confirmar eliminación"
                message={`¿Estás seguro de que deseas eliminar este ${activeTab.slice(0, -1)}? Esta acción no se puede deshacer.`}
            />
        </div>
    );
};

export default AdminPanel;