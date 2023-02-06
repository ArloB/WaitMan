import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}`,
});

api.interceptors.response.use(
  (res) => ({ ...res.data, full: res }),
  (err) => {
    let message = "Something has gone wrong";

    if (err?.response && err.response.data) {
      message = err.response.data.detail ?? "Something has gone wrong";
    }

    toast.error(message);

    throw err;
  }
);

export default api;
