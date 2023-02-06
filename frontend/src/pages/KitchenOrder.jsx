import React, { useState, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import Icon from "./Components/Icon";

const KitchenOrder = () => {
  const [orders, setOrders] = useState([]);
  const [ws, setWS] = useState();
  const navigate = useNavigate();
  const data = useLoaderData();

  useEffect(() => {
    setWS(
      new WebSocket(
        `wss://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/ws`
      )
    );
  }, []);

  useEffect(() => {
    if (ws) {
      ws.onopen = () => {
        ws.send(JSON.stringify({ message: "kitchen" }));
      };

      ws.onerror = (e) => {};

      ws.onmessage = (e) => {
        const order = JSON.parse(e.data);

        if (order["message"] === "order") {
          order["cart"]?.forEach((item) => {
            for (let j = 0; j < item["quantity"]; j++) {
              setOrders((orders) => [
                ...orders,
                {
                  tableno: order["tableno"],
                  name: item["name"],
                  addons: item["addons"],
                },
              ]);
            }
          });
        }

        if (order["message"] === "ready") {
          const c = [...orders];

          c.splice(order["index"], 1);

          setOrders(c);
        }

        if (order["message"] === "orders") {
          setOrders(order["orders"]);
        }
      };
    }
  }, [ws, orders]);

  function markReady(index) {
    ws.send(
      JSON.stringify({
        message: "ready",
        index: index,
        tableno: orders[index]["tableno"],
        name: orders[index]["name"],
        addons: orders[index]["addons"],
      })
    );

    const c = [...orders];

    c.splice(index, 1);

    setOrders(c);
  }

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="navbar rounded-box mt-2 bg-base-200 shadow-md max-w-[90%] max-h-[4.84vh] flex justify-between">
        <Icon id="logo" className="w-12 pl-2" />
        <h1 className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black">
          {data.name}
        </h1>
        <button
          onClick={() => navigate("/logout")}
          className="btn btn-ghost m-5"
        >
          Log Out
        </button>
      </div>
      <h1 className="text-[40px] pt-5 pl-5">Orders</h1>
      <div
        id="order-cont"
        name="order-cont"
        className="max-h-full w-full overflow-y-auto"
      >
        <div className="flex flex-col items-center">
          {orders.map((order, index) => {
            return (
              <div
                className="card w-96 bg-base-100 shadow-xl mb-3"
                id={index}
                key={`${order.tableno}-${order.name}-${index}`}
              >
                <p className="card-title" id="table-num">
                  {" "}
                  Table {order.tableno}{" "}
                </p>
                <p id="food-order"> Item: {order.name} </p>
                <p id="addons">
                  {Object.keys(order.addons).length ? "Addons:" : ""}{" "}
                  {Object.entries(order.addons)
                    ?.map(([key, value]) => {
                      return `${key}: ${value?.join(", ")}`;
                    })
                    ?.join("; ")}
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => markReady(index)}
                >
                  {" "}
                  Ready{" "}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KitchenOrder;
