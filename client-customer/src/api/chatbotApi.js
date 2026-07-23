import axiosClient from "./axiosClient";

const chatbotApi = {
  ask(message) {
    return axiosClient.post("/chatbot", { message });
  },
};

export default chatbotApi;