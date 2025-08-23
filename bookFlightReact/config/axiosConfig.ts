import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://13.217.15.128:8080"
    // baseURL: "http://13.217.13.159:8080"
//     baseURL: "http://localhost:8080"
    // baseURL: "http://10.176.54.44:8080"
    // baseURL: "http://51.21.252.113:8080"
});

axiosInstance.interceptors.request.use(config => {
    return config;
});

export default axiosInstance;