import { create } from "zustand";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,

  register: async (email, password, firstName, lastName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
      });
      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
      });
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
      });
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem("token");
  },

  setToken: (token) => set({ token }),
}));

export default useAuthStore;
