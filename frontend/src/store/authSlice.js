import { createSlice } from "@reduxjs/toolkit";

const USER_KEY = "user";
const TOKEN_KEYS = ["api_token", "token"];

const loadInitialState = () => {
  const storedUser = localStorage.getItem(USER_KEY);
  TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    isAuthenticated: !!storedUser,
  };
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem(USER_KEY);
      TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    },
    updateUser: (state, action) => {
      const updates = action.payload || {};
      state.user = { ...(state.user || {}), ...updates };
      state.isAuthenticated = !!state.user;
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state) => state.auth;
