import api from "./axios";

const condMethod = (edit, url, obj) => {
  if (edit) {
    return api.put(url, obj);
  } else {
    return api.post(url, obj);
  }
};

export { condMethod };
