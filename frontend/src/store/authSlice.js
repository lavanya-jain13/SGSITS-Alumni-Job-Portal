import { createSlice } from "@reduxjs/toolkit";

const TOKEN_KEY = "api_token";
const LEGACY_TOKEN_KEY = "token";
const USER_KEY = "user";

const loadInitialState = () => {
  const storedUser = localStorage.getItem(USER_KEY);
  const storedToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isAuthenticated: !!storedUser && !!storedToken,
  };
};

const initialState = loadInitialState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(LEGACY_TOKEN_KEY, token); // keep compatibility with old key
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    },
    updateUser: (state, action) => {
      const updates = action.payload || {};
      state.user = { ...(state.user || {}), ...updates };
      state.isAuthenticated = !!state.token && !!state.user;
      localStorage.setItem(USER_KEY, JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;

export const selectAuth = (state) => state.auth;
