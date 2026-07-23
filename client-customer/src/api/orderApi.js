import axiosClient from "./axiosClient";

const orderApi = {
  create: (data) => {
    return axiosClient.post("/orders", data);
  },
};

export default orderApi;