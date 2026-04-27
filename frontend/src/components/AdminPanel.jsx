// frontend/src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('facultades');
    const [facultades, setFacultades] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [docentes, setDocentes] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});

    const token = localStorage.getItem('token');

    const api = axios.create({
        baseURL: 'http://localhost:8000/api/v1',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'facultades':
                    const facRes = await api.get('/facultades');
                    setFacultades(facRes.data);
                    break;
                case 'programas':
                    const progRes = await api.get('/programas');
                    setProgramas(progRes.data);
                    break;
                case 'docentes':
                    const docRes = await api.get('/docentes');
                    setDocentes(docRes.data);
                    break;
                case 'aulas':
                    const aulaRes = await api.get('/aulas');
                    setAulas(aulaRes.data);
                    break;
                case 'cursos':
                    const cursoRes = await api.get('/cursos');
                    setCursos(cursoRes.data);
                    break;
                case 'usuarios':
                    // Endpoint para listar usuarios (debes crearlo en backend)
                    const userRes = await api.get('/admin/usuarios');
                    setUsuarios(userRes.data);
                    break;
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let endpoint = '';
            switch (activeTab) {
                case 'facultades':
                    endpoint = '/facultades';
                    break;
                case 'programas':
                    endpoint = '/programas';
                    break;
                case 'docentes':
                    endpoint = '/docentes';
                    break;
                case 'aulas':
                    endpoint = '/aulas';
                    break;
                case 'cursos':
                    endpoint = '/cursos';
                    break;
            }
            await api.post(endpoint, formData);
            alert(`${activeTab.slice(0, -1)} creado exitosamente`);
            setFormData({});
            fetchData();
        } catch (error) {
            alert('Error: ' + (error.response?.data?.detail || 'Error al crear'));
        } finally {
            setLoading(false);
        }
    };

    const renderForm = () => {
        switch (activeTab) {
            case 'facultades':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.codigo || ''}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Creando...' : 'Crear Facultad'}
                        </button>
                    </form>
                );

            case 'programas':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.codigo || ''}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Facultad ID</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.facultad_id || ''}
                                onChange={(e) => setFormData({ ...formData, facultad_id: parseInt(e.target.value) })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Crear Programa
                        </button>
                    </form>
                );

            case 'docentes':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.codigo || ''}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Apellido</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.apellido || ''}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Horas semanales máx.</label>
                            <input
                                type="number"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.max_horas_semanales || 20}
                                onChange={(e) => setFormData({ ...formData, max_horas_semanales: parseInt(e.target.value) })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Crear Docente
                        </button>
                    </form>
                );

            case 'aulas':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.codigo || ''}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Capacidad</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.capacidad || ''}
                                onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.tipo || 'teoria'}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            >
                                <option value="teoria">Teoría</option>
                                <option value="laboratorio">Laboratorio</option>
                                <option value="taller">Taller</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Crear Aula
                        </button>
                    </form>
                );

            case 'cursos':
                return (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Código</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: MAT101"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.codigo || ''}
                                onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Nombre</label>
                            <input
                                type="text"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.nombre || ''}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Créditos</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.creditos || ''}
                                onChange={(e) => setFormData({ ...formData, creditos: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Semestre</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.semestre || ''}
                                onChange={(e) => setFormData({ ...formData, semestre: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Programa ID</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.programa_id || ''}
                                onChange={(e) => setFormData({ ...formData, programa_id: parseInt(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Docente ID</label>
                            <input
                                type="number"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={formData.docente_id || ''}
                                onChange={(e) => setFormData({ ...formData, docente_id: parseInt(e.target.value) })}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                        >
                            Crear Curso
                        </button>
                    </form>
                );

            default:
                return null;
        }
    };

    const renderList = () => {
        let items = [];
        switch (activeTab) {
            case 'facultades':
                items = facultades;
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Facultades Existentes</h3>
                        <div className="space-y-2">
                            {items.map(item => (
                                <div key={item.id} className="border rounded p-3">
                                    <strong>{item.codigo}</strong> - {item.nombre}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'programas':
                items = programas;
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Programas Existentes</h3>
                        <div className="space-y-2">
                            {items.map(item => (
                                <div key={item.id} className="border rounded p-3">
                                    <strong>{item.codigo}</strong> - {item.nombre} (Facultad ID: {item.facultad_id})
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'docentes':
                items = docentes;
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Docentes Existentes</h3>
                        <div className="space-y-2">
                            {items.map(item => (
                                <div key={item.id} className="border rounded p-3">
                                    <strong>{item.codigo}</strong> - {item.nombre} {item.apellido}<br />
                                    <span className="text-sm text-gray-600">Email: {item.email}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'aulas':
                items = aulas;
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Aulas Existentes</h3>
                        <div className="space-y-2">
                            {items.map(item => (
                                <div key={item.id} className="border rounded p-3">
                                    <strong>{item.codigo}</strong> - {item.nombre}<br />
                                    <span className="text-sm text-gray-600">Capacidad: {item.capacidad} | Tipo: {item.tipo}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'cursos':
                items = cursos;
                return (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Cursos Existentes</h3>
                        <div className="space-y-2">
                            {items.map(item => (
                                <div key={item.id} className="border rounded p-3">
                                    <strong>{item.codigo}</strong> - {item.nombre}<br />
                                    <span className="text-sm text-gray-600">
                                        Créditos: {item.creditos} | Semestre: {item.semestre} | Horas: {item.horas_semanales}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {['facultades', 'programas', 'docentes', 'aulas', 'cursos'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-2 px-4 text-sm font-medium ${activeTab === tab
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        Crear {activeTab.slice(0, -1)}
                    </h2>
                    {renderForm()}
                </div>

                <div className="bg-white rounded-lg shadow p-6 overflow-auto max-h-96">
                    {renderList()}
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;