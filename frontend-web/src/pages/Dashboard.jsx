import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { analyticsAPI } from '../../api/api';
import { TrendingUp, Target, DollarSign, Award } from 'lucide-react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function Dashboard() {
    const [performance, setPerformance] = useState(null);
    const [equityCurve, setEquityCurve] = useState(null);
    const [symbolStats, setSymbolStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [perfRes, equityRes, symbolRes] = await Promise.all([
                    analyticsAPI.getPerformance(),
                    analyticsAPI.getEquityCurve(),
                    analyticsAPI.getBySymbol()
                ]);

                setPerformance(perfRes.data);
                setEquityCurve(equityRes.data);
                setSymbolStats(symbolRes.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center py-20">Carregando...</div>;
    }

    const equityChartData = {
        labels: equityCurve?.map((_, i) => i) || [],
        datasets: [
            {
                label: 'Curva de Equity',
                data: equityCurve?.map(e => e.cumulative_profit) || [],
                borderColor: '#3B82F6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const symbolChartData = {
        labels: symbolStats?.map(s => s.symbol) || [],
        datasets: [
            {
                label: 'Lucro por Símbolo',
                data: symbolStats?.map(s => s.total_profit) || [],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
            }
        ]
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Taxa de Vitória</p>
                            <p className="text-3xl font-bold text-gray-800">{performance?.winRate.toFixed(2)}%</p>
                        </div>
                        <Target className="text-blue-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Lucro Total</p>
                            <p className="text-3xl font-bold text-green-600">${performance?.totalProfitLoss.toFixed(2)}</p>
                        </div>
                        <DollarSign className="text-green-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">ROI Médio</p>
                            <p className="text-3xl font-bold text-gray-800">{performance?.averageROI.toFixed(2)}%</p>
                        </div>
                        <TrendingUp className="text-purple-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total de Trades</p>
                            <p className="text-3xl font-bold text-gray-800">{performance?.totalTrades}</p>
                        </div>
                        <Award className="text-orange-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Curva de Equity</h2>
                    <Line data={equityChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance por Símbolo</h2>
                    <Bar data={symbolChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Estatísticas Detalhadas</h2>
                    <ul className="space-y-3">
                        <li className="flex justify-between">
                            <span className="text-gray-600">Trades Vencedores:</span>
                            <span className="font-semibold text-green-600">{performance?.winningTrades}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Trades Perdedores:</span>
                            <span className="font-semibold text-red-600">{performance?.losingTrades}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Maior Ganho:</span>
                            <span className="font-semibold text-green-600">${performance?.maxProfit.toFixed(2)}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Maior Perda:</span>
                            <span className="font-semibold text-red-600">${performance?.maxLoss.toFixed(2)}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Profit Factor:</span>
                            <span className="font-semibold">{performance?.profitFactor.toFixed(2)}</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Médias</h2>
                    <ul className="space-y-3">
                        <li className="flex justify-between">
                            <span className="text-gray-600">Ganho Médio:</span>
                            <span className="font-semibold text-green-600">${performance?.averageWin.toFixed(2)}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Perda Média:</span>
                            <span className="font-semibold text-red-600">${performance?.averageLoss.toFixed(2)}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
