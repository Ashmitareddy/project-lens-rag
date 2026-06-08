import axios from 'axios';

// During development, Vite proxies /api to backend.
// In production (Vercel), routes will match exactly.
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const analyzeProject = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/analyze`, data);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('An error occurred during analysis.');
  }
};
