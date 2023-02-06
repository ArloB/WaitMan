import { useCookies } from "react-cookie";
import { Navigate } from "react-router-dom";
import api from "../axios";

const Logout = ({ token }) => {
  const removeCookie = useCookies(["USER"])[2];

  if (token) {
    api
      .post(`/admin/logout`, {
        token: token,
      })
      .then(() => {
        removeCookie("USER");

        return <Navigate to="/login" />;
      });
  }

  return <Navigate to="/login" />;
};

export default Logout;
