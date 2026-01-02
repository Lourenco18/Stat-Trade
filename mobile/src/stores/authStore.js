import { create } from "zustand";
import { authAPI } from "../api/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  initializeAuth: async () => {
    const token = await AsyncStorage.getItem("token");
    const user = await AsyncStorage.getItem("user");
    if (token && user) {
      set({ token, user: JSON.parse(user) });
    }
  },

  register: async (email, password, firstName, lastName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(
        email,
        password,
        firstName,
        lastName
      );
      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
      });
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error, isLoading: false });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      set({
        user: response.data.user,
        token: response.data.token,
        isLoading: false,
      });
      await AsyncStorage.setItem("token", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ user: null, token: null });
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
  },
}));

export default useAuthStore;
