import axios from "axios";

const axiosClient = axios.create({
  baseURL: "https://baotranmobile-api.onrender.com/api",
});

export default axiosClient;