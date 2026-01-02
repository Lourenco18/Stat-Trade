import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    RefreshControl
} from 'react-native';
import { tradesAPI } from '../api/api';

export default function TradesScreen() {
    const [trades, setTrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        symbol: '',
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        side: 'BUY',
        notes: ''
    });

    useEffect(() => {
        fetchTrades();
    }, []);

    const fetchTrades = async () => {
        try {
            const response = await tradesAPI.getAll();
            setTrades(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar trades');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSubmit = async () => {
        try {
            await tradesAPI.create(formData);
            setFormData({
                symbol: '',
                entryPrice: '',
                exitPrice: '',
                quantity: '',
                side: 'BUY',
                notes: ''
            });
            setShowForm(false);
            fetchTrades();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar trade');
        }
    };

    const handleDelete = async (id) => {
        Alert.alert('Confirmar', 'Tem certeza que deseja apagar?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Apagar',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await tradesAPI.delete(id);
                        fetchTrades();
                    } catch (error) {
                        Alert.alert('Erro', 'Falha ao apagar trade');
                    }
                }
            }
        ]);
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchTrades();
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
            <View style={styles.header}>
                <Text style={styles.title}>Meus Trades</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
                    <Text style={styles.addButtonText}>+ Novo</Text>
                </TouchableOpacity>
            </View>

            {trades.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Nenhum trade registrado</Text>
                </View>
            ) : (
                trades.map((trade) => (
                    <View key={trade.id} style={styles.tradeCard}>
                        <View style={styles.tradeHeader}>
                            <Text style={styles.tradeSymbol}>{trade.symbol}</Text>
                            <Text style={[styles.tradeSide, trade.side === 'BUY' ? styles.buy : styles.sell]}>
                                {trade.side}
                            </Text>
                        </View>

                        <View style={styles.tradeRow}>
                            <Text style={styles.label}>Entrada:</Text>
                            <Text style={styles.value}>${trade.entry_price?.toFixed(2)}</Text>
                        </View>

                        <View style={styles.tradeRow}>
                            <Text style={styles.label}>Saída:</Text>
                            <Text style={styles.value}>${trade.exit_price?.toFixed(2)}</Text>
                        </View>

                        <View style={styles.tradeRow}>
                            <Text style={styles.label}>Qtd:</Text>
                            <Text style={styles.value}>{trade.quantity?.toFixed(2)}</Text>
                        </View>

                        <View style={styles.tradeRow}>
                            <Text style={styles.label}>P&L:</Text>
                            <Text style={[styles.value, trade.profit_loss > 0 ? styles.profit : styles.loss]}>
                                ${trade.profit_loss?.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.tradeRow}>
                            <Text style={styles.label}>ROI:</Text>
                            <Text style={styles.value}>{trade.roi?.toFixed(2)}%</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDelete(trade.id)}
                        >
                            <Text style={styles.deleteButtonText}>Apagar</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}

            {/* Form Modal */}
            <Modal visible={showForm} animationType="slide">
                <ScrollView style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Novo Trade</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Símbolo (ex: AAPL)"
                        value={formData.symbol}
                        onChangeText={(text) => setFormData({ ...formData, symbol: text })}
                        placeholderTextColor="#999"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Preço de Entrada"
                        value={formData.entryPrice}
                        onChangeText={(text) => setFormData({ ...formData, entryPrice: text })}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#999"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Preço de Saída"
                        value={formData.exitPrice}
                        onChangeText={(text) => setFormData({ ...formData, exitPrice: text })}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#999"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Quantidade"
                        value={formData.quantity}
                        onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                        keyboardType="decimal-pad"
                        placeholderTextColor="#999"
                    />

                    <View style={styles.sideButtonContainer}>
                        <TouchableOpacity
                            style={[styles.sideButton, formData.side === 'BUY' && styles.sideBuyActive]}
                            onPress={() => setFormData({ ...formData, side: 'BUY' })}
                        >
                            <Text style={styles.sideButtonText}>BUY</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.sideButton, formData.side === 'SELL' && styles.sideSellActive]}
                            onPress={() => setFormData({ ...formData, side: 'SELL' })}
                        >
                            <Text style={styles.sideButtonText}>SELL</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        style={[styles.input, styles.textarea]}
                        placeholder="Notas"
                        value={formData.notes}
                        onChangeText={(text) => setFormData({ ...formData, notes: text })}
                        multiline
                        placeholderTextColor="#999"
                    />

                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Salvar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={() => setShowForm(false)}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Modal>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    addButton: {
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600'
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center'
    },
    emptyText: {
        color: '#9ca3af',
        fontSize: 16
    },
    tradeCard: {
        marginHorizontal: 20,
        marginBottom: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        elevation: 2
    },
    tradeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    tradeSymbol: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937'
    },
    tradeSide: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        fontWeight: '600',
        fontSize: 12
    },
    buy: {
        backgroundColor: '#d1fae5',
        color: '#065f46'
    },
    sell: {
        backgroundColor: '#fee2e2',
        color: '#991b1b'
    },
    tradeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4
    },
    label: {
        color: '#6b7280',
        fontSize: 14
    },
    value: {
        fontWeight: '600',
        color: '#1f2937'
    },
    profit: {
        color: '#10b981'
    },
    loss: {
        color: '#ef4444'
    },
    deleteButton: {
        marginTop: 12,
        paddingVertical: 8,
        backgroundColor: '#fee2e2',
        borderRadius: 6,
        alignItems: 'center'
    },
    deleteButtonText: {
        color: '#dc2626',
        fontWeight: '600'
    },
    modalContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20
    },
    input: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 14
    },
    textarea: {
        height: 100,
        textAlignVertical: 'top'
    },
    sideButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16
    },
    sideButton: {
        flex: 1,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        alignItems: 'center'
    },
    sideBuyActive: {
        borderColor: '#10b981',
        backgroundColor: '#d1fae5'
    },
    sideSellActive: {
        borderColor: '#ef4444',
        backgroundColor: '#fee2e2'
    },
    sideButtonText: {
        fontWeight: '600',
        fontSize: 14
    },
    submitButton: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: '#e5e7eb',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 30
    },
    cancelButtonText: {
        color: '#6b7280',
        fontWeight: '600',
        fontSize: 16
    }
});
