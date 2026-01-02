import React, { useState } from 'react';
import { settingsAPI } from '../../api/api';
import { Save, Loader } from 'lucide-react';

export default function Settings() {
    const [settings, setSettings] = useState({
        tradingStyle: 'day_trading',
        riskPercentage: 2,
        dailyLossLimit: null,
        tradingHours: { start: '09:30', end: '16:00' }
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTimeChange = (field, value) => {
        setSettings((prev) => ({
            ...prev,
            tradingHours: {
                ...prev.tradingHours,
                [field]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await settingsAPI.update(settings);
            setMessage('Configurações salvas com sucesso!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Erro ao salvar configurações');
            console.error('Error saving settings:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Configurações</h1>

            {message && (
                <div className={`p-4 rounded-lg ${message.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
                {/* Estilo de Trading */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estilo de Trading
                    </label>
                    <select
                        name="tradingStyle"
                        value={settings.tradingStyle}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="day_trading">Day Trading</option>
                        <option value="swing_trading">Swing Trading</option>
                        <option value="position_trading">Position Trading</option>
                        <option value="scalping">Scalping</option>
                    </select>
                </div>

                {/* Risco por Trade */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Risco por Trade (%)
                    </label>
                    <input
                        type="number"
                        name="riskPercentage"
                        value={settings.riskPercentage}
                        onChange={handleChange}
                        min="0.1"
                        max="10"
                        step="0.1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Máximo percentual de perda aceitável por trade
                    </p>
                </div>

                {/* Limite de Perda Diária */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Limite de Perda Diária ($)
                    </label>
                    <input
                        type="number"
                        name="dailyLossLimit"
                        value={settings.dailyLossLimit || ''}
                        onChange={handleChange}
                        step="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Deixar vazio para sem limite"
                    />
                </div>

                {/* Horário de Trading */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hora de Início
                        </label>
                        <input
                            type="time"
                            value={settings.tradingHours.start}
                            onChange={(e) => handleTimeChange('start', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hora de Fim
                        </label>
                        <input
                            type="time"
                            value={settings.tradingHours.end}
                            onChange={(e) => handleTimeChange('end', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Botão Salvar */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            Salvando...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Salvar Configurações
                        </>
                    )}
                </button>
            </form>

            {/* Segurança */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Segurança</h2>
                <button className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg transition">
                    Mudar Senha
                </button>
            </div>

            {/* Integração */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Integrações</h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chave API TradingView
                        </label>
                        <input
                            type="password"
                            placeholder="Cole sua chave API"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chave API Broker
                        </label>
                        <input
                            type="password"
                            placeholder="Cole sua chave API do broker"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition">
                        Conectar APIs
                    </button>
                </div>
            </div>
        </div>
    );
}
