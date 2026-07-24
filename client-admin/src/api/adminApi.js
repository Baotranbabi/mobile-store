import axiosClient from "./axiosClient";

const adminApi = {
  login: (data) => {
    return axiosClient.post("/admin/login", data);
  },
};

export default adminApi;