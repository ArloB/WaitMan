// import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Icon from "./Components/Icon";
import api from "../axios";
import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import BackButton from "./Components/BackButton";

const Cart = () => {
  let waiter = window.location.pathname.split("/")[1] === "waitstaff";
  const navigate = useNavigate();

  const { table } = useParams();

  const [orders, setOrderList] = useState([]);
  const [total, setTotal] = useState(0);
  const [coupon, setCoupon] = useState({});
  const [discount, setDiscount] = useState(0);
  const [amount, setAmount] = useState(0);

  const applyDeal = (obj) => {
    let num = 0;

    const ord = [];

    for (const order of orders) {
      if (order.id === obj.item) {
        ord.push({
          ...order,
          price: order.price - obj.discount,
        });
      } else {
        ord.push(order);
      }

      num += 1;
    }

    return [ord, num];
  };

  useEffect(() => {
    if (Object.keys(coupon).length > 0 && coupon.type === 2) {
      let [ord, amount] = applyDeal(coupon);

      setOrderList([...ord]);
      setAmount(amount);
    }
    // eslint-disable-next-line
  }, [coupon]);

  useEffect(() => {
    api
      .post(`/${table}/bill/${waiter ? "wait" : "customer"}`)
      .then((response) => {
        setOrderList(response.bill);
        setTotal(response.total_price ?? 0);
        if (Object.keys(response.coupon ?? {}).length > 0) {
          setCoupon(response.coupon);
        }
      });
  }, [table]);

  useEffect(() => {
    setDiscount(0);

    switch (coupon?.type) {
      case 0:
        setDiscount(total * (coupon.discount / 100));
        break;
      case 1:
        setDiscount(coupon.discount);
        break;
      case 2:
        setDiscount(coupon.discount * amount);
        break;
      default:
        setDiscount(0);
    }
  }, [coupon, total, amount]);

  const billItems = () => {
    let table_id = window.location.pathname.split("/")[2];
    api
      .delete(`${table_id}/order-history`, { data: table_id })
      .then(navigate("/waitstaff"));
  };

  return (
    <div className="flex flex-col items-center">
      {waiter && <BackButton to={"/waitstaff"} />}
      <div className="justify-center inline-flex w-full px-1 pt-2">
        <div className="py-2 inline-block justify-center w-full px-1 pt-2">
          <div className="overflow-hidden">
            <div className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black pt-2 pb-3">
              <h1>Bill</h1>
            </div>
            <div className="flex items-center text-center justify-center">
              <table className="table-fixed">
                <tbody className="border-b border-t">
                  {orders.map((item, i) => {
                    return (
                      <tr key={i}>
                        <th className="px-2 py-1">
                          <Icon
                            id={item.id}
                            className="scale-75 object-center object-cover md:block hidden"
                          />
                        </th>
                        <th className="w-96 px-3 py-1 text-left">
                          <p className="text-base font-black leading-none text-black-800 dark:black-white">
                            {item.name}
                          </p>
                          <p className="text-xs leading-3 text-black-600 dark:text-black py-4">
                            {item.addons?.name}:{" "}
                            {item.addons?.options?.join(", ")}
                          </p>
                        </th>
                        <th className="px-3 py-1 text-center">
                          <button
                            className="bg-white rounded-box px-8 py-1"
                            disabled
                          >
                            {item.quantity}
                          </button>
                          <p className="text-base font-black leading-none text-black-800 dark:text-black pt-5">
                            ${item.price}
                          </p>
                        </th>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-col items-center pt-2 pb-2">
              {Object.keys(coupon).length > 0 && <p>Code: {coupon.code}</p>}
              <h1 className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black">
                Total: ${(total - discount).toFixed(2)}
              </h1>
              {Object.keys(coupon).length > 0 && (
                <h1 className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black">
                  Saved: ${discount.toFixed(2)}
                </h1>
              )}
            </div>
            <div className="align-center text-center">
              {waiter ? (
                <button
                  className="btn-primary bg-white text-3xl leading-10 rounded-box px-8 py-1 hover:bg-base-300"
                  onClick={billItems}
                >
                  Paid
                </button>
              ) : (
                <div className="text-center">
                  <h1>♡ Please make your way to the front counter to pay ♡</h1>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
