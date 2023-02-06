import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import moment from "moment";

import SidePanel from "./Components/Waiter Order/SidePanel";
import BillModal from "./Components/Waiter Order/BillModal";
import Icon from "./Components/Icon";

const WaiterOrder = () => {
  const navigate = useNavigate();
  const data = useLoaderData();

  const [orders, setOrders] = useState([]);
  const [wss, setWS] = useState();
  const stateRef = useRef();
  stateRef.current = orders;

  useEffect(() => {
    setWS(
      new WebSocket(
        `wss://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/ws`
      )
    );
  }, []);

  useEffect(() => {
    if (wss) {
      wss.onopen = () => {
        wss.send(JSON.stringify({ message: "waitstaff" }));
      };

      wss.onclose = () => {};

      wss.onerror = (e) => {};

      wss.onmessage = (e) => {
        const orderJson = JSON.parse(e.data);

        if (orderJson["message"] === "ready") {
          setOrders((orders) => [
            ...orders,
            {
              tableno: orderJson["tableno"],
              name: orderJson["name"],
              addons: orderJson["addons"],
            },
          ]);

          toast("Order is ready!");
        } else {
        }

        if (orderJson["message"] === "delivered") {
          setOrders(
            stateRef.current.filter((item, ind) => ind !== orderJson["index"])
          );
        }

        if (orderJson["message"] === "orders") {
          setOrders(orderJson["orders"]);
        }
      };
    }
  }, [wss]);

  function markDelivered(index) {
    const temp = index["index"];
    setOrders(orders.filter((item, ind) => ind !== temp));
    wss.send(JSON.stringify({ message: "delivered", index: temp }));
  }

  return (
    <div className="h-screen">
      <div className="flex justify-center">
        <div className="navbar rounded-box mt-2 bg-base-200 shadow-md max-w-[90%] h-[4.84vh] flex justify-between">
          <Icon id="logo" className="w-12 pl-2" />
          <h1 className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black">
            {data.name}
          </h1>
          <div>
            <button
              className="btn modal-button"
              onClick={() =>
                navigate(
                  `/waitstaff/reservations/${moment().format("YYYY-MM-DD")}`
                )
              }
            >
              Reservations
            </button>
            <button onClick={() => navigate("/logout")} className="btn m-5">
              Log Out
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full lg:flex-row h-[94vh]">
        <div className="grid flex-grow">
          <div className="card bg-base-200 mx-8 my-6 flex-grow">
            <div className="absolute inset-x-0 top-0 mt-2">
              <BillModal tables={data.tables} />
            </div>
            <hr
              className="my-16 h-px bg-gray-200 border-0"
              style={{ marginBottom: "0px" }}
            />
            <h1 className="title ml-8"> Ready Items </h1>
            <div id="ready-items" name="ready-items">
              {orders.map((order, index) => {
                return (
                  <div className="card w-96 bg-base-100 mb-3" id={index}>
                    <p className="card-title" id="table-num">
                      {" "}
                      Table {order.tableno}{" "}
                    </p>
                    <p id="food-order" className="mb-2">
                      {" "}
                      Item: {order.name}{" "}
                    </p>
                    <p id="addons">
                      {" "}
                      {Object.keys(order.addons).length ? "Addons:" : ""}{" "}
                      {Object.entries(order.addons)
                        ?.map(([key, value]) => {
                          return `${key}: ${value?.join(", ")}`;
                        })
                        ?.join("; ")}
                    </p>
                    <button
                      className="btn btn-success"
                      onClick={() => markDelivered({ index })}
                    >
                      {" "}
                      Delivered!{" "}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div
          className="divider divider-horizontal divider-gray-200"
          style={{ height: "93vh" }}
        />
        <div className="grid basis-1/3 h-[94vh]">
          <SidePanel ws={wss} />
        </div>
      </div>
    </div>
  );
};

export default WaiterOrder;
