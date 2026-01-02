import React, { useState, useEffect } from 'react';
import { tradesAPI } from '../api/api';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';

export default function Trades() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        symbol: '',
        entryPrice: '',
        exitPrice: '',
        entryDate: '',
        exitDate: '',
        quantity: '',
        side: 'BUY',
        notes: '',
        emotion: ''
    });

    useEffect(() => {
        fetchTrades();
    }, []);

    const fetchTrades = async () => {
        try {
            const response = await tradesAPI.getAll();
            setTrades(response.data);
        } catch (error) {
            console.error('Error fetching trades:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await tradesAPI.update(editingId, formData);
            } else {
                await tradesAPI.create(formData);
            }
            setFormData({
                symbol: '',
                entryPrice: '',
                exitPrice: '',
                entryDate: '',
                exitDate: '',
                quantity: '',
                side: 'BUY',
                notes: '',
                emotion: ''
            });
            setShowForm(false);
            setEditingId(null);
            fetchTrades();
        } catch (error) {
            console.error('Error saving trade:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
            try {
                await tradesAPI.delete(id);
                fetchTrades();
            } catch (error) {
                console.error('Error deleting trade:', error);
            }
        }
    };

    const handleEdit = (trade) => {
        setFormData(trade);
        setEditingId(trade.id);
        setShowForm(true);
    };

    if (loading) {
        return <div className="text-center py-20">Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Meus Trades</h1>
                <div className="space-x-3">
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={20} /> Novo Trade
                    </button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <Upload size={20} /> Importar CSV
                    </button>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">{editingId ? 'Editar Trade' : 'Novo Trade'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Símbolo"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Preço de Entrada"
                            step="0.01"
                            value={formData.entryPrice}
                            onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Preço de Saída"
                            step="0.01"
                            value={formData.exitPrice}
                            onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Quantidade"
                            step="0.01"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="datetime-local"
                            value={formData.entryDate}
                            onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <input
                            type="datetime-local"
                            value={formData.exitDate}
                            onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        />
                        <select
                            value={formData.side}
                            onChange={(e) => setFormData({ ...formData, side: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="BUY">BUY</option>
                            <option value="SELL">SELL</option>
                        </select>
                        <select
                            value={formData.emotion}
                            onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Emoção...</option>
                            <option value="confident">Confiante</option>
                            <option value="nervous">Nervoso</option>
                            <option value="excited">Animado</option>
                            <option value="calm">Calmo</option>
                        </select>
                        <textarea
                            placeholder="Notas"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 col-span-2"
                        />
                        <div className="col-span-2 space-x-3">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                                Salvar
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingId(null);
                                }}
                                className="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Trades List */}
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold">Símbolo</th>
                            <th className="px-6 py-3 text-left font-semibold">Entrada</th>
                            <th className="px-6 py-3 text-left font-semibold">Saída</th>
                            <th className="px-6 py-3 text-left font-semibold">Qtd</th>
                            <th className="px-6 py-3 text-left font-semibold">P&L</th>
                            <th className="px-6 py-3 text-left font-semibold">ROI</th>
                            <th className="px-6 py-3 text-left font-semibold">Lado</th>
                            <th className="px-6 py-3 text-left font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade) => (
                            <tr key={trade.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold">{trade.symbol}</td>
                                <td className="px-6 py-4">${trade.entry_price?.toFixed(2)}</td>
                                <td className="px-6 py-4">${trade.exit_price?.toFixed(2)}</td>
                                <td className="px-6 py-4">{trade.quantity?.toFixed(2)}</td>
                                <td className={`px-6 py-4 font-semibold ${trade.profit_loss > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${trade.profit_loss?.toFixed(2)}
                                </td>
                                <td className="px-6 py-4">{trade.roi?.toFixed(2)}%</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-sm ${trade.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {trade.side}
                                    </span>
                                </td>
                                <td className="px-6 py-4 space-x-2">
                                    <button
                                        onClick={() => handleEdit(trade)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(trade.id)}
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
        </div>
    );
}
