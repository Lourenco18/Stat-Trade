import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Trades API
export const tradesAPI = {
  getAll: () => axios.get(`${API_URL}/trades`, getAuthHeader()),
  create: (trade) => axios.post(`${API_URL}/trades`, trade, getAuthHeader()),
  update: (id, trade) =>
    axios.put(`${API_URL}/trades/${id}`, trade, getAuthHeader()),
  delete: (id) => axios.delete(`${API_URL}/trades/${id}`, getAuthHeader()),
  import: (trades) =>
    axios.post(`${API_URL}/trades/import`, { trades }, getAuthHeader()),
};

// Analytics API
export const analyticsAPI = {
  getPerformance: () =>
    axios.get(`${API_URL}/analytics/performance`, getAuthHeader()),
  getEquityCurve: () =>
    axios.get(`${API_URL}/analytics/equity-curve`, getAuthHeader()),
  getBySymbol: () =>
    axios.get(`${API_URL}/analytics/by-symbol`, getAuthHeader()),
  getMonthly: () => axios.get(`${API_URL}/analytics/monthly`, getAuthHeader()),
};

// Diary API
export const diaryAPI = {
  getAll: () => axios.get(`${API_URL}/diary`, getAuthHeader()),
  create: (entry) => axios.post(`${API_URL}/diary`, entry, getAuthHeader()),
  update: (id, entry) =>
    axios.put(`${API_URL}/diary/${id}`, entry, getAuthHeader()),
  delete: (id) => axios.delete(`${API_URL}/diary/${id}`, getAuthHeader()),
};

// Insights API
export const insightsAPI = {
  getSuggestions: () =>
    axios.get(`${API_URL}/insights/suggestions`, getAuthHeader()),
  getTradingViewAnalysis: (symbol) =>
    axios.get(
      `${API_URL}/insights/tradingview-analysis/${symbol}`,
      getAuthHeader()
    ),
};

// Settings API
export const settingsAPI = {
  get: () => axios.get(`${API_URL}/settings`, getAuthHeader()),
  update: (settings) =>
    axios.put(`${API_URL}/settings`, settings, getAuthHeader()),
};
