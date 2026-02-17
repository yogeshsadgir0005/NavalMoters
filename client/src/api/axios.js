
import axios from "axios";

const API = axios.create({
  baseURL: "https://navalmoters.onrender.com/api",

});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    config.headers = config.headers || {}; 
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => Promise.reject(error)
);

export default API; 
