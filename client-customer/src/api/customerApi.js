import axiosClient from "./axiosClient";

const customerApi = {
  register: (data) => axiosClient.post("/customers/register", data),
  login: (data) => axiosClient.post("/customers/login", data),
};

export default customerApi;