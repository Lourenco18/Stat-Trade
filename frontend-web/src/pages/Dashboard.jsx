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
import { analyticsAPI, tradesAPI } from '../api/api';
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
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [perfRes, equityRes, symbolRes, tradesRes] = await Promise.all([
                    analyticsAPI.getPerformance(),
                    analyticsAPI.getEquityCurve(),
                    analyticsAPI.getBySymbol(),
                    tradesAPI.getAll()
                ]);

                setPerformance(perfRes.data);
                setEquityCurve(equityRes.data);
                setSymbolStats(symbolRes.data);
                setTrades(tradesRes.data || []);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    const equityChartData = {
        labels: equityCurve?.map((_, i) => i) || [],
        datasets: [
            {
                label: 'Equity Curve',
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
                label: 'Profit by Symbol',
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
                            <p className="text-gray-600 text-sm">Win Rate</p>
                            <p className="text-3xl font-bold text-gray-800">{performance?.winRate.toFixed(2)}%</p>
                        </div>
                        <Target className="text-blue-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Profit</p>
                            <p className="text-3xl font-bold text-green-600">${performance?.totalProfitLoss.toFixed(2)}</p>
                        </div>
                        <DollarSign className="text-green-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Average ROI</p>
                            <p className="text-3xl font-bold text-gray-800">{performance?.averageROI.toFixed(2)}%</p>
                        </div>
                        <TrendingUp className="text-purple-500" size={32} />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm">Total Trades</p>
                            <p className="text-3xl font-bold text-gray-800">{performance?.totalTrades}</p>
                        </div>
                        <Award className="text-orange-500" size={32} />
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Equity Curve</h2>
                    <Line data={equityChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Performance by Symbol</h2>
                    <Bar data={symbolChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Detailed Statistics</h2>
                    <ul className="space-y-3">
                        <li className="flex justify-between">
                            <span className="text-gray-600">Winning Trades:</span>
                            <span className="font-semibold text-green-600">{performance?.winningTrades}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Losing Trades:</span>
                            <span className="font-semibold text-red-600">{performance?.losingTrades}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Max Profit:</span>
                            <span className="font-semibold text-green-600">${performance?.maxProfit.toFixed(2)}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Max Loss:</span>
                            <span className="font-semibold text-red-600">${performance?.maxLoss.toFixed(2)}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Profit Factor:</span>
                            <span className="font-semibold">{performance?.profitFactor.toFixed(2)}</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Averages</h2>
                    <ul className="space-y-3">
                        <li className="flex justify-between">
                            <span className="text-gray-600">Average Win:</span>
                            <span className="font-semibold text-green-600">${performance?.averageWin.toFixed(2)}</span>
                        </li>
                        <li className="flex justify-between">
                            <span className="text-gray-600">Average Loss:</span>
                            <span className="font-semibold text-red-600">${performance?.averageLoss.toFixed(2)}</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* All Trades (across all accounts) */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">All Trades</h2>
                    <p className="text-sm text-gray-500">Latest {Math.min(trades.length, 50)} of {trades.length}</p>
                </div>
                {trades.length === 0 ? (
                    <p className="text-gray-600">No trades recorded yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-2 text-left font-semibold">Symbol</th>
                                    <th className="px-4 py-2 text-left font-semibold">Entry</th>
                                    <th className="px-4 py-2 text-left font-semibold">Exit</th>
                                    <th className="px-4 py-2 text-left font-semibold">Qty</th>
                                    <th className="px-4 py-2 text-left font-semibold">P&L</th>
                                    <th className="px-4 py-2 text-left font-semibold">ROI</th>
                                    <th className="px-4 py-2 text-left font-semibold">Side</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trades.slice(0, 50).map((trade) => (
                                    <tr key={trade.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2 font-semibold">{trade.symbol}</td>
                                        <td className="px-4 py-2">${trade.entry_price?.toFixed(2)}</td>
                                        <td className="px-4 py-2">${trade.exit_price?.toFixed(2)}</td>
                                        <td className="px-4 py-2">{trade.quantity?.toFixed(2)}</td>
                                        <td className={`px-4 py-2 font-semibold ${trade.profit_loss > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            ${trade.profit_loss?.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-2">{trade.roi?.toFixed(2)}%</td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-1 rounded text-sm ${trade.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {trade.side}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
