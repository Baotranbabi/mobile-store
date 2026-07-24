import axiosClient from "./axiosClient";

const orderApi = {
  getAll: () => {
    return axiosClient.get("/orders");
  },

  updateStatus: (id, status) => {
    return axiosClient.put(`/orders/${id}/status`, { status });
  },

  delete: (id) => {
    return axiosClient.delete(`/orders/${id}`);
  },
};

export default orderApi;