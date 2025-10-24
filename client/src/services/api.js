import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api/mgnrega";

const api = {
  getLatestPunjab: async () => {
    const res = await axios.get(`${API_BASE}/latest`);
    return res.data;
  },

  getDistrictRecords: async (districtCode) => {
    const res = await axios.get(`${API_BASE}/district/${districtCode}`);
    return res.data;
  },

  syncPunjabData: async () => {
    const res = await axios.get(`${API_BASE}/sync`);
    return res.data;
  },
};

export default api;
