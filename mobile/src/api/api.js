import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Trades API
export const tradesAPI = {
  getAll: async () => {
    const headers = await getAuthHeader();
    return axios.get(`${API_URL}/trades`, headers);
  },
  create: async (trade) => {
    const headers = await getAuthHeader();
    return axios.post(`${API_URL}/trades`, trade, headers);
  },
  update: async (id, trade) => {
    const headers = await getAuthHeader();
    return axios.put(`${API_URL}/trades/${id}`, trade, headers);
  },
  delete: async (id) => {
    const headers = await getAuthHeader();
    return axios.delete(`${API_URL}/trades/${id}`, headers);
  },
};

// Analytics API
export const analyticsAPI = {
  getPerformance: async () => {
    const headers = await getAuthHeader();
    return axios.get(`${API_URL}/analytics/performance`, headers);
  },
  getEquityCurve: async () => {
    const headers = await getAuthHeader();
    return axios.get(`${API_URL}/analytics/equity-curve`, headers);
  },
  getBySymbol: async () => {
    const headers = await getAuthHeader();
    return axios.get(`${API_URL}/analytics/by-symbol`, headers);
  },
};

// Diary API
export const diaryAPI = {
  getAll: async () => {
    const headers = await getAuthHeader();
    return axios.get(`${API_URL}/diary`, headers);
  },
  create: async (entry) => {
    const headers = await getAuthHeader();
    return axios.post(`${API_URL}/diary`, entry, headers);
  },
  update: async (id, entry) => {
    const headers = await getAuthHeader();
    return axios.put(`${API_URL}/diary/${id}`, entry, headers);
  },
  delete: async (id) => {
    const headers = await getAuthHeader();
    return axios.delete(`${API_URL}/diary/${id}`, headers);
  },
};

// Insights API
export const insightsAPI = {
  getSuggestions: async () => {
    const headers = await getAuthHeader();
    return axios.get(`${API_URL}/insights/suggestions`, headers);
  },
};

// Auth API
export const authAPI = {
  register: async (email, password, firstName, lastName) => {
    return axios.post(`${API_URL}/auth/register`, {
      email,
      password,
      firstName,
      lastName,
    });
  },
  login: async (email, password) => {
    return axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
  },
};
