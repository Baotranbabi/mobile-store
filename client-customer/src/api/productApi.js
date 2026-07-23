import axiosClient from "./axiosClient";

const productApi = {
  getAll: () => {
    return axiosClient.get("/products");
  },

  getById: (id) => {
    return axiosClient.get(`/products/detail/${id}`);
  },
  search: (keyword) => {
  return axiosClient.get(`/products?search=${keyword}`);
},
};

export default productApi;