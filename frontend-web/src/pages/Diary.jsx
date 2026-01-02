import React, { useState, useEffect } from 'react';
import { diaryAPI } from '../api/api';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function Diary() {
    const [entries, setEntries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        emotion: ''
    });

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const response = await diaryAPI.getAll();
            setEntries(response.data);
        } catch (error) {
            console.error('Error fetching diary entries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await diaryAPI.update(editingId, formData);
            } else {
                await diaryAPI.create(formData);
            }
            setFormData({ title: '', content: '', emotion: '' });
            setShowForm(false);
            setEditingId(null);
            fetchEntries();
        } catch (error) {
            console.error('Error saving entry:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
            try {
                await diaryAPI.delete(id);
                fetchEntries();
            } catch (error) {
                console.error('Error deleting entry:', error);
            }
        }
    };

    const handleEdit = (entry) => {
        setFormData(entry);
        setEditingId(entry.id);
        setShowForm(true);
    };

    if (loading) {
        return <div className="text-center py-20">Carregando...</div>;
    }

    const emotionColors = {
        confident: 'bg-blue-100 text-blue-800',
        nervous: 'bg-yellow-100 text-yellow-800',
        excited: 'bg-green-100 text-green-800',
        calm: 'bg-purple-100 text-purple-800'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Diário Pessoal</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={20} /> Novo Registro
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Registro' : 'Novo Registro'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Título"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />

                        <textarea
                            placeholder="Conte suas reflexões, emoções e aprendizados do dia..."
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-40"
                            required
                        />

                        <select
                            value={formData.emotion}
                            onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Selecione sua emoção...</option>
                            <option value="confident">😎 Confiante</option>
                            <option value="nervous">😰 Nervoso</option>
                            <option value="excited">🤩 Animado</option>
                            <option value="calm">😌 Calmo</option>
                        </select>

                        <div className="space-x-3">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                Salvar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                    setFormData({ title: '', content: '', emotion: '' });
                                }}
                                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Entries List */}
            <div className="space-y-4">
                {entries.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-500">Nenhum registro no diário ainda. Comece escrevendo suas reflexões!</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <div key={entry.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-800">{entry.title}</h2>
                                    <p className="text-gray-600 mt-1 whitespace-pre-wrap">{entry.content}</p>
                                    <div className="mt-4 flex items-center gap-2">
                                        {entry.emotion && (
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${emotionColors[entry.emotion] || 'bg-gray-100'}`}>
                                                {entry.emotion}
                                            </span>
                                        )}
                                        <span className="text-gray-500 text-sm">
                                            {new Date(entry.created_at).toLocaleDateString('pt-PT')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(entry)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(entry.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
