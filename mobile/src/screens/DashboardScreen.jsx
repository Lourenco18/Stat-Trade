import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    Dimensions,
    RefreshControl
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { analyticsAPI } from '../api/api';

export default function DashboardScreen() {
    const [performance, setPerformance] = useState(null);
    const [symbolStats, setSymbolStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [perfRes, symbolRes] = await Promise.all([
                analyticsAPI.getPerformance(),
                analyticsAPI.getBySymbol()
            ]);

            setPerformance(perfRes.data);
            setSymbolStats(symbolRes.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    const chartData = {
        labels: symbolStats?.slice(0, 5).map(s => s.symbol) || [],
        datasets: [
            {
                data: symbolStats?.slice(0, 5).map(s => Math.max(0, s.total_profit)) || []
            }
        ]
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.title}>Dashboard</Text>

            {/* KPIs */}
            <View style={styles.kpiContainer}>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Taxa de Vitória</Text>
                    <Text style={styles.kpiValue}>{performance?.winRate.toFixed(1)}%</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Lucro Total</Text>
                    <Text style={[styles.kpiValue, { color: performance?.totalProfitLoss >= 0 ? '#10b981' : '#ef4444' }]}>
                        ${performance?.totalProfitLoss.toFixed(0)}
                    </Text>
                </View>
            </View>

            <View style={styles.kpiContainer}>
                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>ROI Médio</Text>
                    <Text style={styles.kpiValue}>{performance?.averageROI.toFixed(2)}%</Text>
                </View>

                <View style={styles.kpiCard}>
                    <Text style={styles.kpiLabel}>Total Trades</Text>
                    <Text style={styles.kpiValue}>{performance?.totalTrades}</Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsCard}>
                <Text style={styles.statsTitle}>Estatísticas Detalhadas</Text>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Trades Vencedores:</Text>
                    <Text style={[styles.statValue, { color: '#10b981' }]}>
                        {performance?.winningTrades}
                    </Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Trades Perdedores:</Text>
                    <Text style={[styles.statValue, { color: '#ef4444' }]}>
                        {performance?.losingTrades}
                    </Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Profit Factor:</Text>
                    <Text style={styles.statValue}>{performance?.profitFactor.toFixed(2)}</Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Maior Ganho:</Text>
                    <Text style={[styles.statValue, { color: '#10b981' }]}>
                        ${performance?.maxProfit.toFixed(2)}
                    </Text>
                </View>

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Maior Perda:</Text>
                    <Text style={[styles.statValue, { color: '#ef4444' }]}>
                        ${performance?.maxLoss.toFixed(2)}
                    </Text>
                </View>
            </View>

            {/* Chart */}
            {symbolStats && symbolStats.length > 0 && (
                <View style={styles.chartCard}>
                    <Text style={styles.statsTitle}>Performance por Símbolo</Text>
                    <BarChart
                        data={chartData}
                        width={Dimensions.get('window').width - 40}
                        height={220}
                        yAxisLabel="$"
                        chartConfig={{
                            backgroundColor: '#fff',
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 0,
                            color: () => '#2563eb',
                            labelColor: () => '#6b7280'
                        }}
                    />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
        marginTop: 20,
        paddingHorizontal: 20
    },
    kpiContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
        gap: 12
    },
    kpiCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2
    },
    kpiLabel: {
        color: '#6b7280',
        fontSize: 12,
        marginBottom: 8
    },
    kpiValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    statsCard: {
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2
    },
    chartCard: {
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
        elevation: 2
    },
    statsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    statLabel: {
        color: '#6b7280',
        fontSize: 14
    },
    statValue: {
        fontWeight: '600',
        color: '#1f2937',
        fontSize: 14
    }
});
