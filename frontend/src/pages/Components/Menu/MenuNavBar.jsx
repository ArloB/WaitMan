/*
Menu Navigation Bar
Displays the restaurant name, logo, call for assistance button and cart
*/

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import AssistanceButton from "./AssistanceButton";
import Icon from "../Icon";
import api from "../../../axios";
import axios from "axios";

const MenuNavBar = ({ ws }) => {
  const navigate = useNavigate();
  const { table } = useParams();

  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [restaurantName, setRestaurantName] = useState("");

  useEffect(() => {
    api.get(`/restaurant`).then((response) => {
      setRestaurantName(response.name);
    });
  }, [table]);

  useEffect(() => {
    axios
      .get(
        `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/cart/${table}`
      )
      .then((response) => {
        setCart(response.data.cart);
        setCartTotal(response.data.total_price);
      });
  }, [table]);

  useEffect(() => {
    api.get(`/cart/${table}/no_items`).then((response) => {
      setCartCount(response.no_items);
    });
  }, [table]);

  const callAssistance = () => {
    const msg = JSON.stringify({ message: "assistance", table_id: table });
    ws.send(msg);
  };
  return (
    <div className="navbar bg-base-200 rounded-box">
      <div className="navbar-start pl-5">
        <Icon id="logo" className="w-12" />
      </div>
      <div className="navbar-center">
        <h1 className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black">
          {restaurantName}
        </h1>
      </div>
      <div className="navbar-end space-x-5">
        <AssistanceButton callAssistance={callAssistance} />
        <div>
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle bg-gray-200"
            >
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="bg-base-200"
                  viewBox="0 0 24 24"
                  stroke="black"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="badge badge-sm indicator-item">
                  {cartCount}
                </span>
              </div>
            </label>
            <div
              tabIndex={0}
              className="mt-3 card card-compact dropdown-content w-52 shadow"
            >
              <div className="card-body bg-white">
                <span className="font-bold text-lg">{cartCount} Items</span>
                <div className="flex flex-col">
                  {cart.map((item) => (
                    <div
                      className="flex flex-row justify-between"
                      key={item.id}
                    >
                      <span className="text-base text-ellipsis overflow-hidden">
                        {item.quantity} x {item.name}
                      </span>
                      <span className="text-base">${item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="divider"></div>
                <span className="text-base text-xl">
                  Total Price: ${cartTotal}
                </span>
                <div className="card-actions">
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => navigate(`/${table}/menu/cart`)}
                  >
                    View cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuNavBar;
