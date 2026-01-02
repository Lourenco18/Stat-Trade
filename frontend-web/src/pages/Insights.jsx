import React, { useState, useEffect } from 'react';
import { insightsAPI } from '../api/api';
import { Lightbulb, TrendingUp } from 'lucide-react';

export default function Insights() {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsights();
    }, []);

    const fetchInsights = async () => {
        try {
            const response = await insightsAPI.getSuggestions();
            setInsights(response.data);
        } catch (error) {
            console.error('Error fetching insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20">Carregando...</div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">IA Insights</h1>

            {/* Performance Level */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-8">
                <div className="flex items-center gap-4">
                    <TrendingUp size={40} />
                    <div>
                        <p className="text-sm opacity-90">Nível de Performance</p>
                        <p className="text-4xl font-bold">{insights?.performanceLevel}</p>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Análises e Alertas</h2>
                {insights?.insights && insights.insights.length > 0 ? (
                    insights.insights.map((insight, idx) => (
                        <div
                            key={idx}
                            className={`rounded-lg shadow p-6 border-l-4 ${insight.type === 'positive'
                                ? 'bg-green-50 border-green-500'
                                : 'bg-yellow-50 border-yellow-500'
                                }`}
                        >
                            <div className="flex gap-3">
                                <Lightbulb className={insight.type === 'positive' ? 'text-green-500' : 'text-yellow-500'} />
                                <p className="text-gray-800">{insight.message}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-500">Sem alertas no momento.</p>
                    </div>
                )}
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">Recomendações</h2>
                <div className="space-y-3">
                    {insights?.recommendations && insights.recommendations.length > 0 ? (
                        insights.recommendations.map((rec, idx) => (
                            <div key={idx} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                                <div className="flex gap-3">
                                    <div className="text-2xl font-bold text-blue-500">{idx + 1}</div>
                                    <p className="text-gray-800">{rec}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-500">Adicione mais trades para gerar recomendações.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Action Items */}
            <div className="bg-white rounded-lg shadow p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Próximas Ações</h2>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-800">Revisar sua estratégia de entrada</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-800">Analisar a psicologia dos seus trades</span>
                    </li>
                    <li className="flex items-center gap-3">
                        <input type="checkbox" className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-800">Focar nos símbolos com melhor performance</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}
