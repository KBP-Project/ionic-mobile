import axios from "axios";
const API_URL = "http://localhost:8001/api";

export default {
  async getCat(role) {
    try {
      const response = await axios.get(`${API_URL}/categories/getCat/${role}`, {
        params: {},
        timeout: 20000,
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
  async getSubCat(id) {
    try {
      const response = await axios.get(
        `${API_URL}/categories/getSubCat/${id}`,
        {
          params: {},
          timeout: 20000,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
  async getAnswer(id) {
    try {
      const response = await axios.get(
        `${API_URL}/categories/getAnswer/${id}`,
        {
          params: {},
          timeout: 20000,
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  },
};
