import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { CookiesProvider } from "react-cookie";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <CookiesProvider>
    <App />
    <ToastContainer
      position="top-center"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      pauseOnHover
    />
  </CookiesProvider>
);
