import React, { useState, useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { accountsAPI, tradesAPI } from '../api/api';
import { Plus, Edit2, TrendingUp, TrendingDown, AlertTriangle, DollarSign, Target, Calendar } from 'lucide-react';

export default function Accounts() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountStats, setAccountStats] = useState(null);
    const [accountTrades, setAccountTrades] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        propFirm: '',
        accountType: 'evaluation',
        stage: 'phase1',
        initialBalance: '',
        profitTarget: '',
        dailyLossLimit: '',
        maxLossLimit: '',
        maxDrawdown: '',
        pricePaid: '',
        leverage: '',
        startDate: '',
        endDate: '',
        notes: ''
    });

    const [tradeForm, setTradeForm] = useState({
        symbol: '',
        entryPrice: '',
        exitPrice: '',
        entryDate: '',
        exitDate: '',
        quantity: '',
        side: 'BUY',
        notes: '',
        emotion: '',
        stopLoss: '',
        takeProfit: ''
    });

    const [placeMode, setPlaceMode] = useState('entry');
    const chartContainerRef = useRef(null);
    const chartRef = useRef(null);
    const seriesRef = useRef(null);
    const priceLinesRef = useRef({ entry: null, stop: null, tp: null });
    const dataTimerRef = useRef(null);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            const response = await accountsAPI.getAll();
            setAccounts(response.data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAccountStats = async (accountId) => {
        try {
            const response = await accountsAPI.getStats(accountId);
            setAccountStats(response.data);
            setSelectedAccount(accountId);
            fetchAccountTrades(accountId);
        } catch (error) {
            console.error('Error fetching account stats:', error);
        }
    };

    const fetchAccountTrades = async (accountId) => {
        try {
            const response = await tradesAPI.getAll(accountId);
            setAccountTrades(response.data || []);
        } catch (error) {
            console.error('Error fetching account trades:', error);
        }
    };

    const clearPriceLine = (key) => {
        if (priceLinesRef.current[key] && seriesRef.current) {
            seriesRef.current.removePriceLine(priceLinesRef.current[key]);
            priceLinesRef.current[key] = null;
        }
    };

    const setPriceLine = (key, price, color) => {
        if (!seriesRef.current) return;
        clearPriceLine(key);
        priceLinesRef.current[key] = seriesRef.current.createPriceLine({
            price,
            color,
            lineWidth: 2,
            lineStyle: 2,
            axisLabelVisible: true,
            title: key === 'entry' ? 'Entry' : key === 'stop' ? 'SL' : 'TP'
        });
    };

    const handleChartClick = (param) => {
        if (!param || !param.seriesPrices) return;
        const price = parseFloat((param.seriesPrices.get(seriesRef.current) || param.price)?.toFixed(2));
        if (!price) return;

        if (placeMode === 'entry') {
            setTradeForm((prev) => ({ ...prev, entryPrice: price }));
            setPriceLine('entry', price, '#2563eb');
        } else if (placeMode === 'stop') {
            setTradeForm((prev) => ({ ...prev, stopLoss: price }));
            setPriceLine('stop', price, '#ef4444');
        } else if (placeMode === 'tp') {
            setTradeForm((prev) => ({ ...prev, takeProfit: price }));
            setPriceLine('tp', price, '#10b981');
        }
    };

    const seedData = (anchorPrice) => {
        const base = anchorPrice && !Number.isNaN(anchorPrice) ? anchorPrice : 100 + Math.random() * 10;
        const points = [];
        let last = base;
        const now = Date.now();
        for (let i = 120; i >= 0; i--) {
            const time = Math.floor((now - i * 60 * 1000) / 1000);
            last += (Math.random() - 0.5) * (base * 0.0015);
            points.push({ time, value: parseFloat(last.toFixed(2)) });
        }
        return points;
    };

    useEffect(() => {
        if (!selectedAccount || !accountStats) return;

        // Recreate chart per account open to avoid stale blank state
        if (chartRef.current) {
            if (dataTimerRef.current) clearInterval(dataTimerRef.current);
            chartRef.current.remove();
            chartRef.current = null;
            seriesRef.current = null;
            priceLinesRef.current = { entry: null, stop: null, tp: null };
        }

        const container = chartContainerRef.current;
        if (!container) return;

        try {
            const chart = createChart(container, {
                width: container.clientWidth,
                height: 320,
                layout: { background: { color: '#ffffff' }, textColor: '#111827' },
                grid: { horzLines: { color: '#f3f4f6' }, vertLines: { color: '#f3f4f6' } },
                rightPriceScale: { borderColor: '#e5e7eb' },
                timeScale: { borderColor: '#e5e7eb' }
            });

            const series = chart.addLineSeries({ color: '#2563eb', lineWidth: 2 });
            const baseData = seedData(parseFloat(tradeForm.entryPrice) || undefined);
            series.setData(baseData);
            chart.timeScale().fitContent();

            chart.subscribeClick(handleChartClick);

            const pump = () => {
                const last = baseData[baseData.length - 1];
                const nextTime = last.time + 60;
                const nextValue = last.value + (Math.random() - 0.5) * 0.6;
                baseData.push({ time: nextTime, value: parseFloat(nextValue.toFixed(2)) });
                if (baseData.length > 300) baseData.shift();
                series.update(baseData[baseData.length - 1]);
            };

            const timer = setInterval(pump, 2000);

            chartRef.current = chart;
            seriesRef.current = series;
            dataTimerRef.current = timer;

            const handleResize = () => {
                if (container && chart) {
                    chart.applyOptions({ width: container.clientWidth });
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                if (timer) clearInterval(timer);
                chart.unsubscribeClick(handleChartClick);
                chart.remove();
                chartRef.current = null;
                seriesRef.current = null;
                priceLinesRef.current = { entry: null, stop: null, tp: null };
            };
        } catch (err) {
            console.error('Error initializing chart:', err);
        }
    }, [selectedAccount, accountStats]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toNumberOrNull = (v) => (v === '' || v === null || v === undefined ? null : parseFloat(v));

        const payload = {
            name: formData.name,
            propFirm: formData.propFirm || null,
            accountType: formData.accountType,
            stage: formData.accountType === 'evaluation' ? formData.stage : null,
            initialBalance: toNumberOrNull(formData.initialBalance),
            currentBalance: editingAccount ? editingAccount.current_balance : undefined,
            profitTarget: toNumberOrNull(formData.profitTarget),
            dailyLossLimit: toNumberOrNull(formData.dailyLossLimit),
            maxLossLimit: toNumberOrNull(formData.maxLossLimit),
            maxDrawdown: toNumberOrNull(formData.maxDrawdown),
            pricePaid: toNumberOrNull(formData.pricePaid),
            leverage: toNumberOrNull(formData.leverage),
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            notes: formData.notes || null,
        };

        try {
            if (editingAccount) {
                await accountsAPI.update(editingAccount.id, payload);
            } else {
                await accountsAPI.create(payload);
            }
            fetchAccounts();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error('Error saving account:', error);
        }
    };

    const handleTradeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAccount) return;

        const toNumber = (v) => (v === '' ? null : parseFloat(v));

        const payload = {
            ...tradeForm,
            entryPrice: toNumber(tradeForm.entryPrice),
            exitPrice: toNumber(tradeForm.exitPrice),
            quantity: toNumber(tradeForm.quantity),
            stopLoss: toNumber(tradeForm.stopLoss),
            takeProfit: toNumber(tradeForm.takeProfit),
            accountId: selectedAccount
        };

        if (!payload.entryPrice || !payload.quantity) return;
        if (!payload.exitPrice) {
            payload.exitPrice = payload.takeProfit || payload.entryPrice;
        }
        const nowIso = new Date().toISOString().slice(0, 16);
        if (!payload.entryDate) payload.entryDate = nowIso;
        if (!payload.exitDate) payload.exitDate = nowIso;

        try {
            await tradesAPI.create(payload);
            await fetchAccountTrades(selectedAccount);
            await fetchAccountStats(selectedAccount);
            setTradeForm({
                symbol: '',
                entryPrice: '',
                exitPrice: '',
                entryDate: '',
                exitDate: '',
                quantity: '',
                side: 'BUY',
                notes: '',
                emotion: '',
                stopLoss: '',
                takeProfit: ''
            });
        } catch (error) {
            console.error('Error creating trade for account:', error);
        }
    };

    const buildUpdatePayload = (account, override = {}) => ({
        name: account.name,
        propFirm: account.prop_firm || '',
        accountType: account.account_type,
        stage: account.stage || 'phase1',
        initialBalance: account.initial_balance,
        currentBalance: account.current_balance,
        profitTarget: account.profit_target || '',
        dailyLossLimit: account.daily_loss_limit || '',
        maxLossLimit: account.max_loss_limit || '',
        maxDrawdown: account.max_drawdown || '',
        pricePaid: account.price_paid || '',
        leverage: account.leverage || '',
        startDate: account.start_date ? account.start_date.split('T')[0] : '',
        endDate: account.end_date ? account.end_date.split('T')[0] : '',
        status: account.status,
        notes: account.notes || '',
        ...override
    });

    const handleMarkStatus = async (account, status) => {
        try {
            const payload = buildUpdatePayload(account, { status });
            await accountsAPI.update(account.id, payload);
            await fetchAccounts();
            if (selectedAccount === account.id) {
                fetchAccountStats(account.id);
            }
        } catch (error) {
            console.error(`Error updating account status to ${status}:`, error);
        }
    };

    const handleEdit = (account) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            propFirm: account.prop_firm || '',
            accountType: account.account_type,
            stage: account.stage || 'phase1',
            initialBalance: account.initial_balance,
            profitTarget: account.profit_target || '',
            dailyLossLimit: account.daily_loss_limit || '',
            maxLossLimit: account.max_loss_limit || '',
            maxDrawdown: account.max_drawdown || '',
            pricePaid: account.price_paid || '',
            leverage: account.leverage || '',
            startDate: account.start_date ? account.start_date.split('T')[0] : '',
            endDate: account.end_date ? account.end_date.split('T')[0] : '',
            notes: account.notes || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            propFirm: '',
            accountType: 'evaluation',
            stage: 'phase1',
            initialBalance: '',
            profitTarget: '',
            dailyLossLimit: '',
            maxLossLimit: '',
            maxDrawdown: '',
            pricePaid: '',
            leverage: '',
            startDate: '',
            endDate: '',
            notes: ''
        });
        setEditingAccount(null);
    };

    const getStatusBadge = (status) => {
        const colors = {
            active: 'bg-blue-100 text-blue-800',
            passed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            funded: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getTypeBadge = (type) => {
        const labels = {
            evaluation: 'Evaluation',
            funded: 'Funded',
            personal: 'Personal'
        };
        return labels[type] || type;
    };

    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Prop Firm Accounts</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                    <Plus size={20} />
                    New Account
                </button>
            </div>

            {/* Accounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts.map((account) => {
                    const pnl = parseFloat(account.current_balance) - parseFloat(account.initial_balance);
                    const roi = (pnl / parseFloat(account.initial_balance)) * 100;

                    return (
                        <div
                            key={account.id}
                            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer"
                            onClick={() => fetchAccountStats(account.id)}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{account.name}</h3>
                                    {account.prop_firm && (
                                        <p className="text-sm text-gray-600">{account.prop_firm}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(account);
                                        }}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkStatus(account, 'failed');
                                        }}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <AlertTriangle size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-semibold">{getTypeBadge(account.account_type)}</span>
                                </div>
                                {account.stage && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Stage:</span>
                                        <span className="font-semibold uppercase">{account.stage}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Balance:</span>
                                    <span className="font-semibold">${parseFloat(account.current_balance).toFixed(2)}</span>
                                </div>
                                {account.leverage && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Leverage:</span>
                                        <span className="font-semibold">{parseFloat(account.leverage).toFixed(2)}x</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">P&L:</span>
                                    <span className={`font-semibold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({roi.toFixed(2)}%)
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(account.status)}`}>
                                        {account.status}
                                    </span>
                                </div>
                                {(account.price_paid || account.price_paid === 0) && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Account Cost:</span>
                                        <span className="font-semibold">${parseFloat(account.price_paid).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Account Details Modal */}
            {selectedAccount && accountStats && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{accountStats.account.name}</h2>
                                    {accountStats.account.prop_firm && (
                                        <p className="text-gray-600">{accountStats.account.prop_firm}</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedAccount(null);
                                        setAccountStats(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Risk Status Alerts */}
                            {(accountStats.drawdown.breached || accountStats.daily.breached) && (
                                <div className="mb-6 space-y-2">
                                    {accountStats.drawdown.breached && (
                                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                                            <AlertTriangle size={20} />
                                            <span className="font-semibold">Max Drawdown Breached!</span>
                                        </div>
                                    )}
                                    {accountStats.daily.breached && (
                                        <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded flex items-center gap-2">
                                            <AlertTriangle size={20} />
                                            <span className="font-semibold">Daily Loss Limit Breached!</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="text-blue-600" size={20} />
                                        <span className="text-sm text-gray-600">Balance</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">${accountStats.balance.current}</p>
                                    <p className="text-xs text-gray-500">Initial: ${accountStats.balance.initial}</p>
                                </div>

                                <div className="bg-green-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target className="text-green-600" size={20} />
                                        <span className="text-sm text-gray-600">Profit Target</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">{accountStats.profit.progress}%</p>
                                    <p className="text-xs text-gray-500">${accountStats.profit.current} / ${accountStats.profit.target}</p>
                                </div>

                                <div className={`${parseFloat(accountStats.drawdown.percent) > 50 ? 'bg-red-50' : 'bg-yellow-50'} rounded-lg p-4`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingDown className={parseFloat(accountStats.drawdown.percent) > 50 ? 'text-red-600' : 'text-yellow-600'} size={20} />
                                        <span className="text-sm text-gray-600">Drawdown</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-800">{accountStats.drawdown.percent}%</p>
                                    <p className="text-xs text-gray-500">Max: {accountStats.drawdown.max}</p>
                                </div>

                                <div className="bg-purple-50 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="text-purple-600" size={20} />
                                        <span className="text-sm text-gray-600">Today's P&L</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${parseFloat(accountStats.daily.pnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${accountStats.daily.pnl}
                                    </p>
                                    <p className="text-xs text-gray-500">Limit: ${accountStats.daily.limit}</p>
                                </div>
                            </div>

                            {/* Trading Statistics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-4">Trading Stats</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Trades:</span>
                                            <span className="font-semibold">{accountStats.stats.totalTrades}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Win Rate:</span>
                                            <span className="font-semibold text-blue-600">{accountStats.stats.winRate}%</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total P&L:</span>
                                            <span className={`font-semibold ${parseFloat(accountStats.stats.totalPnl) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                ${accountStats.stats.totalPnl}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-4">Performance</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Avg Win:</span>
                                            <span className="font-semibold text-green-600">${accountStats.stats.avgWin}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Avg Loss:</span>
                                            <span className="font-semibold text-red-600">${accountStats.stats.avgLoss}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Max Profit:</span>
                                            <span className="font-semibold text-green-600">${accountStats.stats.maxProfit}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Trades for this account */}
                            <div className="mt-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">Trades for this account</h3>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                                    <div className="lg:col-span-2 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setPlaceMode('entry')}
                                                className={`px-3 py-2 rounded border ${placeMode === 'entry' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}
                                            >
                                                Set Entry
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPlaceMode('stop')}
                                                className={`px-3 py-2 rounded border ${placeMode === 'stop' ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-700'}`}
                                            >
                                                Set Stop
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPlaceMode('tp')}
                                                className={`px-3 py-2 rounded border ${placeMode === 'tp' ? 'bg-green-600 text-white border-green-600' : 'border-gray-300 text-gray-700'}`}
                                            >
                                                Set Take Profit
                                            </button>
                                            <div className="text-sm text-gray-500">Click on the chart to place levels</div>
                                        </div>
                                        <div ref={chartContainerRef} className="w-full h-[320px] border border-gray-200 rounded" />
                                        <div className="flex flex-wrap gap-3 text-sm">
                                            <span className="px-3 py-1 rounded bg-blue-100 text-blue-800">Entry: {tradeForm.entryPrice || '--'}</span>
                                            <span className="px-3 py-1 rounded bg-red-100 text-red-800">SL: {tradeForm.stopLoss || '--'}</span>
                                            <span className="px-3 py-1 rounded bg-green-100 text-green-800">TP: {tradeForm.takeProfit || '--'}</span>
                                        </div>
                                    </div>

                                    <form onSubmit={handleTradeSubmit} className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Symbol"
                                            value={tradeForm.symbol}
                                            onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                            required
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Entry Price (optional if set on chart)"
                                            value={tradeForm.entryPrice}
                                            onChange={(e) => setTradeForm({ ...tradeForm, entryPrice: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Exit Price (optional)"
                                            value={tradeForm.exitPrice}
                                            onChange={(e) => setTradeForm({ ...tradeForm, exitPrice: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Quantity"
                                            value={tradeForm.quantity}
                                            onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                            required
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Stop Loss"
                                            value={tradeForm.stopLoss}
                                            onChange={(e) => setTradeForm({ ...tradeForm, stopLoss: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Take Profit"
                                            value={tradeForm.takeProfit}
                                            onChange={(e) => setTradeForm({ ...tradeForm, takeProfit: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                        <select
                                            value={tradeForm.side}
                                            onChange={(e) => setTradeForm({ ...tradeForm, side: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        >
                                            <option value="BUY">BUY</option>
                                            <option value="SELL">SELL</option>
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Notes"
                                            value={tradeForm.notes}
                                            onChange={(e) => setTradeForm({ ...tradeForm, notes: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        />
                                        <select
                                            value={tradeForm.emotion}
                                            onChange={(e) => setTradeForm({ ...tradeForm, emotion: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded"
                                        >
                                            <option value="">Emotion...</option>
                                            <option value="confident">Confident</option>
                                            <option value="nervous">Nervous</option>
                                            <option value="excited">Excited</option>
                                            <option value="calm">Calm</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                                        >
                                            Add Trade
                                        </button>
                                    </form>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-100 border-b">
                                            <tr>
                                                <th className="px-3 py-2 text-left">Symbol</th>
                                                <th className="px-3 py-2 text-left">Entry</th>
                                                <th className="px-3 py-2 text-left">Exit</th>
                                                <th className="px-3 py-2 text-left">Qty</th>
                                                <th className="px-3 py-2 text-left">SL</th>
                                                <th className="px-3 py-2 text-left">TP</th>
                                                <th className="px-3 py-2 text-left">P&L</th>
                                                <th className="px-3 py-2 text-left">ROI</th>
                                                <th className="px-3 py-2 text-left">Side</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {accountTrades.map((trade) => (
                                                <tr key={trade.id} className="border-b hover:bg-gray-50">
                                                    <td className="px-3 py-2 font-semibold">{trade.symbol}</td>
                                                    <td className="px-3 py-2">${trade.entry_price?.toFixed(2)}</td>
                                                    <td className="px-3 py-2">${trade.exit_price?.toFixed(2)}</td>
                                                    <td className="px-3 py-2">{trade.quantity?.toFixed(2)}</td>
                                                    <td className="px-3 py-2">{trade.stop_loss ? `$${trade.stop_loss.toFixed(2)}` : '-'}</td>
                                                    <td className="px-3 py-2">{trade.take_profit ? `$${trade.take_profit.toFixed(2)}` : '-'}</td>
                                                    <td className={`px-3 py-2 font-semibold ${trade.profit_loss > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        ${trade.profit_loss?.toFixed(2)}
                                                    </td>
                                                    <td className="px-3 py-2">{trade.roi?.toFixed(2)}%</td>
                                                    <td className="px-3 py-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${trade.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {trade.side}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Account Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">
                                {editingAccount ? 'Edit Account' : 'New Account'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Prop Firm
                                        </label>
                                        <input
                                            type="text"
                                            name="propFirm"
                                            value={formData.propFirm}
                                            onChange={handleChange}
                                            placeholder="FTMO, TopStepTrader, etc."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Type *
                                        </label>
                                        <select
                                            name="accountType"
                                            value={formData.accountType}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="evaluation">Evaluation</option>
                                            <option value="funded">Funded</option>
                                            <option value="personal">Personal</option>
                                        </select>
                                    </div>

                                    {formData.accountType === 'evaluation' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Stage
                                            </label>
                                            <select
                                                name="stage"
                                                value={formData.stage}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="phase1">Phase 1</option>
                                                <option value="phase2">Phase 2</option>
                                                <option value="phase3">Phase 3</option>
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Initial Balance *
                                        </label>
                                        <input
                                            type="number"
                                            name="initialBalance"
                                            value={formData.initialBalance}
                                            onChange={handleChange}
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Profit Target
                                        </label>
                                        <input
                                            type="number"
                                            name="profitTarget"
                                            value={formData.profitTarget}
                                            onChange={handleChange}
                                            step="0.01"
                                            placeholder="e.g., 10000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Daily Loss Limit
                                        </label>
                                        <input
                                            type="number"
                                            name="dailyLossLimit"
                                            value={formData.dailyLossLimit}
                                            onChange={handleChange}
                                            step="0.01"
                                            placeholder="e.g., 500"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Max Drawdown
                                        </label>
                                        <input
                                            type="number"
                                            name="maxDrawdown"
                                            value={formData.maxDrawdown}
                                            onChange={handleChange}
                                            step="0.01"
                                            placeholder="e.g., 1000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Cost
                                        </label>
                                        <input
                                            type="number"
                                            name="pricePaid"
                                            value={formData.pricePaid}
                                            onChange={handleChange}
                                            step="0.01"
                                            placeholder="Amount paid for this account"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Leverage
                                        </label>
                                        <input
                                            type="number"
                                            name="leverage"
                                            value={formData.leverage}
                                            onChange={handleChange}
                                            step="0.1"
                                            placeholder="e.g., 30 for 30x"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Additional notes about this account..."
                                    />
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                                    >
                                        {editingAccount ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
