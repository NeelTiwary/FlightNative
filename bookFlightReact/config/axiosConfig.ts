import axios from "axios";
import { BACKEND_URL } from '@env';

// Use environment variable or fallback to custom endpoint
//const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8080";
// const baseURL = process.env.REACT_APP_API_URL || "http://172.29.14.199:8080";

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,   
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add Amadeus authentication for direct API calls
axiosInstance.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("test.api.amadeus.com")) {
      const accessToken = await getAccessToken();
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

async function getAccessToken() {
  try {
    const response = await axios.post(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching Amadeus token:", error);
    throw error;
  }
}

export default axiosInstance