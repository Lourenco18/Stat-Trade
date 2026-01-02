import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Alert
} from 'react-native';
import useAuthStore from '../stores/authStore';

export default function RegisterScreen({ navigation }) {
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);
    const error = useAuthStore((state) => state.error);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });

    const handleRegister = async () => {
        try {
            await register(formData.email, formData.password, formData.firstName, formData.lastName);
            navigation.replace('Home');
        } catch (err) {
            Alert.alert('Erro', error || 'Falha ao registrar');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Stat-Trade</Text>
                <Text style={styles.subtitle}>Crie sua conta</Text>

                {error && (
                    <View style={styles.errorBox}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                <TextInput
                    style={styles.input}
                    placeholder="Primeiro nome"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholderTextColor="#999"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Último nome"
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholderTextColor="#999"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    keyboardType="email-address"
                    placeholderTextColor="#999"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry
                    placeholderTextColor="#999"
                />

                <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Registrar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Já tem conta? Entrar</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5'
    },
    content: {
        padding: 20,
        paddingTop: 60
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#1f2937'
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#6b7280',
        marginBottom: 30
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        borderRadius: 8,
        padding: 12,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#dc2626'
    },
    errorText: {
        color: '#991b1b',
        fontSize: 14
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 14
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginTop: 20
    },
    buttonDisabled: {
        opacity: 0.6
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    link: {
        color: '#2563eb',
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        fontWeight: '500'
    }
});
