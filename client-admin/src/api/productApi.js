import axiosClient from "./axiosClient";

const productApi = {
  getAll: () => {
    return axiosClient.get("/products?admin=true");
  },

  getById: (id) => {
    return axiosClient.get(`/products/detail/${id}`);
  },
  create: (data) => {
    return axiosClient.post("/products", data);
  },

  update: (id, data) => {
    return axiosClient.put(`/products/${id}`, data);
  },

  delete: (id) => {
    return axiosClient.delete(`/products/${id}`);
  },
};

export default productApi;
