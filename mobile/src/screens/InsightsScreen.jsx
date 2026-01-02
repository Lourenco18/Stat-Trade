import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { insightsAPI } from '../api/api';

export default function InsightsScreen() {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchInsights();
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <Text style={styles.title}>IA Insights</Text>

            {/* Performance Level */}
            <View style={styles.performanceCard}>
                <Text style={styles.performanceLabel}>Nível de Performance</Text>
                <Text style={styles.performanceValue}>{insights?.performanceLevel}</Text>
            </View>

            {/* Insights */}
            <Text style={styles.sectionTitle}>Análises e Alertas</Text>
            {insights?.insights && insights.insights.length > 0 ? (
                insights.insights.map((insight, idx) => (
                    <View
                        key={idx}
                        style={[
                            styles.insightCard,
                            insight.type === 'positive' ? styles.positiveInsight : styles.warningInsight
                        ]}
                    >
                        <Text style={styles.insightText}>{insight.message}</Text>
                    </View>
                ))
            ) : (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Sem alertas no momento</Text>
                </View>
            )}

            {/* Recommendations */}
            <Text style={styles.sectionTitle}>Recomendações</Text>
            {insights?.recommendations && insights.recommendations.length > 0 ? (
                insights.recommendations.map((rec, idx) => (
                    <View key={idx} style={styles.recommendationCard}>
                        <View style={styles.recommendationNumber}>
                            <Text style={styles.recommendationNumberText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.recommendationText}>{rec}</Text>
                    </View>
                ))
            ) : (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyText}>Adicione mais trades para gerar recomendações</Text>
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginTop: 8
    },
    performanceCard: {
        marginHorizontal: 20,
        marginBottom: 24,
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: 20,
        elevation: 3
    },
    performanceLabel: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 14,
        marginBottom: 8
    },
    performanceValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold'
    },
    insightCard: {
        marginHorizontal: 20,
        marginBottom: 12,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        elevation: 1
    },
    positiveInsight: {
        backgroundColor: '#d1fae5',
        borderLeftColor: '#10b981'
    },
    warningInsight: {
        backgroundColor: '#fef3c7',
        borderLeftColor: '#f59e0b'
    },
    insightText: {
        fontSize: 14,
        color: '#1f2937',
        lineHeight: 20
    },
    recommendationCard: {
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        gap: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#2563eb',
        elevation: 1
    },
    recommendationNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#2563eb',
        justifyContent: 'center',
        alignItems: 'center'
    },
    recommendationNumberText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    recommendationText: {
        flex: 1,
        fontSize: 14,
        color: '#1f2937',
        lineHeight: 20
    },
    emptyCard: {
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        alignItems: 'center'
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 14,
        textAlign: 'center'
    }
});
