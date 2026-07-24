import axiosClient from "./axiosClient";

const customerApi = {
  getAll: () => {
    return axiosClient.get("/customers");
  },

  create: (data) => {
    return axiosClient.post("/customers", data);
  },
};

export default customerApi;