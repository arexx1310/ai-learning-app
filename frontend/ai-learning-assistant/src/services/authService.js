import axiosInstance from '../utils/axiosInstances.js';
import { API_PATHS } from '../utils/apiPaths.js';

// The axios interceptor in axiosInstances.js normalises all error responses
// into a plain Error object. These functions let that error propagate as-is
// so callers only need to catch a consistent Error with a .message string.

const login = async (email, password) => {
  const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, { email, password });
  return response.data;
};

const logout = async () => {
  const response = await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
  return response.data;
};

const register = async (username, email, password) => {
  const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
    username,
    email,
    password,
  });
  return response.data;
};

const getProfile = async () => {
  const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
  return response.data;
};

const updateProfile = async (userData) => {
  const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, userData);
  return response.data;
};

const changePassword = async (passwords) => {
  const response = await axiosInstance.post(API_PATHS.AUTH.CHANGE_PASSWORD, passwords);
  return response.data;
};

const authService = {
  login,
  logout,
  register,
  getProfile,
  updateProfile,
  changePassword,
};

export default authService;