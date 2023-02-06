import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import MenuNavBar from "./Components/Menu/MenuNavBar";
import CouponDisplay from "./Components/Cart/CouponDisplay";
import api from "../axios";
import Icon from "./Components/Icon";
import { toast } from "react-toastify";

const Cart = ({ wss }) => {
  const navigate = useNavigate();
  const { table } = useParams();
  const [first, setTab] = useState(true);

  const [orders, setOrderList] = useState([]);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [coupon, setCoupon] = useState({});
  const [discount, setDiscount] = useState(0);

  const [deal, setDeal] = useState(0);
  const [dealAmount, setDealAmount] = useState(0);
  const [dealItem, setDealItem] = useState(0);

  useEffect(() => {
    api.get(`/${table}/order-history`).then((response) => {
      setOrderList(response.order_history);
      setTotal(response.total_price);
      setCoupon(response.coupon);
    });
  }, [table, setTab]);

  useEffect(() => {
    api.get(`/cart/${table}`).then((response) => {
      setCart(response.cart);
      setCartTotal(response.total_price);
    });
  }, [table, setTab]);

  const addToOrder = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
    } else {
      api.put(`/order/${table}/place-order`).then(() => {
        api.get(`/cart/${table}`).then(() => {
          wss.send(
            JSON.stringify({ message: "order", tableno: table, cart: cart })
          );

          setOrderList((orders) => [...orders, ...cart]);
          setTotal((prev) => prev + cartTotal);
          setCartTotal(0);
          setCart([]);
          toast.success("Order placed successfully");
          setTab(false);
        });
      });
    }
  };

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
      setDealAmount(amount);
      setDeal(coupon.discount);
      setDealItem(coupon.item);
    }
  }, [coupon, setTab]);

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
        setDiscount(coupon.discount * dealAmount);
        break;
      default:
        setDiscount(0);
    }
  }, [coupon, total, deal, dealAmount]);

  const handleRemove = (id) => {
    api
      .delete(
        `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/cart/${id}`
      )
      .then(window.location.reload(false));
  };

  return (
    <div id="checkout">
      <MenuNavBar ws={wss} />
      <div className="tabs justify-center inline-flex w-full px-1 pt-2">
        <div
          className={
            "px-4 py-2 font-semibold text-neutral-focus tab tab-lg tab-bordered rounded-t " +
            (first ? "tab-active" : "opacity-50")
          }
        >
          <button id="default-tab" onClick={() => setTab(true)}>
            Cart
          </button>
        </div>
        <div
          className={
            "px-4 py-2 font-semibold text-neutral-focus tab tab-lg tab-bordered rounded-t " +
            (!first ? "tab-active" : "opacity-50")
          }
        >
          {orders.length ? (
            <button onClick={() => setTab(false)}>Ordered Items</button>
          ) : (
            <p>Ordered Items</p>
          )}
        </div>
      </div>
      <div id="tab-contents">
        {first ? (
          <div id="first" className="p-4">
            <div className="flex lg:flex-row flex-col justify-center" id="cart">
              <div
                className="xl:w-10/12 lg:w-11/12 md:w-full lg:px-8 lg:py-14 md:px-6 px-4 md:py-8 py-4 bg-base-200 rounded-box"
                id="scroll"
              >
                <div
                  className="flex items-center text-black-500 hover:text-black-600 cursor-pointer"
                  onClick={() => navigate(`/${table}/menu`)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-chevron-left"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <polyline points="15 6 9 12 15 18" />
                  </svg>
                </div>
                <p className="lg:text-4xl text-3xl font-black leading-10 text-neutral-focus text-center pt-3 pb-3">
                  Cart
                </p>
                {cart.map((item, i) => {
                  return (
                    <div
                      className="md:flex items-strech py-4 md:py-10 lg:py-4 border-t border-gray-50"
                      key={i}
                    >
                      <div className="md:w-4/12 2xl:w-1/4 w-full">
                        <Icon
                          id={item.id}
                          className="scale-75 object-center object-cover md:block hidden rounded-md"
                        />
                      </div>
                      <div className="md:pl-3 md:w-8/12 2xl:w-3/4 flex flex-col justify-center">
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-base font-black leading-none text-neutral">
                            {item.name}
                          </p>
                          <div>
                            <button
                              className="bg-gray-100 px-8 py-1 rounded-box"
                              disabled
                            >
                              {item.quantity}
                            </button>
                          </div>
                        </div>
                        <div>
                          {Object.entries(item.addons ?? {})?.map(
                            ([title, options], i) => {
                              return (
                                <div key={`${title}-${i}`}>
                                  {Boolean(options.length) && (
                                    <p className="text-sm leading-3 pb-2">
                                      {`${title}: ${options.join(", ")}`}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-5">
                          <div>
                            <button
                              className="pr-8"
                              onClick={() =>
                                navigate(`/${table}/menu/cart/${item.cart_id}`)
                              }
                            >
                              <svg
                                className="w-10 h-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button onClick={() => handleRemove(item.cart_id)}>
                              <svg
                                className="w-10 h-10"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                          <p className="text-base font-black leading-none text-black-800">
                            ${item.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex flex-col lg:px-8 md:px-7 px-4 lg:py-20 md:py-10 pt-12 justify-between">
                  <div className="flex items-center pb-4 justify-between lg:pt-5 pt-2">
                    <p className="lg:text-4xl text-3xl font-black leading-9 text-black-800 ">
                      Total
                    </p>
                    <p className="text-2xl font-bold leading-normal text-right text-black-800 ">
                      ${cartTotal.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={addToOrder}
                    className="text-base leading-none w-full py-5 bg-base-100 text-black hover:enabled:bg-base-300 rounded-box"
                    disabled={cart.length ? 0 : 1}
                  >
                    Confirm Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div id="second" className="p-4">
            <div
              className="flex lg:flex-row flex-col justify-center"
              id="orderedItems"
            >
              <div
                className="container grow :w-10/12 lg:w-11/12 md:w-full lg:px-8 lg:py-14 md:px-6 px-4 md:py-8 py-4 bg-base-200 rounded-box"
                id="scroll"
              >
                <div
                  className="flex items-center text-black-500 hover:text-black-600  cursor-pointer"
                  onClick={() => navigate(`/${table}/menu`)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-chevron-left"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <polyline points="15 6 9 12 15 18" />
                  </svg>
                </div>
                <p className="lg:text-4xl text-3xl font-black leading-10 text-neutral-focus text-center pt-3 pb-3">
                  Ordered Items
                </p>
                {orders.map((item, i) => {
                  return (
                    <div
                      className="md:flex items-strech py-4 md:py-10 lg:py-4 border-t border-gray-50"
                      key={i}
                    >
                      <div className="md:w-4/12 2xl:w-1/4 w-full">
                        <Icon
                          id={item.id}
                          className="scale-75 object-center object-cover md:block hidden rounded-md"
                        />
                      </div>
                      <div className="md:pl-3 md:w-8/12 2xl:w-3/4 flex flex-col justify-center">
                        <div className="flex items-center justify-between pt-1">
                          <p className="text-base font-black leading-none text-neutral">
                            {item.name}
                          </p>
                          <button
                            className="bg-gray-100 px-8 py-1 rounded-box"
                            disabled
                          >
                            {item.quantity}
                          </button>
                        </div>
                        <div>
                          {Object.entries(item.addons ?? {})?.map(
                            ([title, options]) => {
                              return (
                                <div key={`${title}-${i}`}>
                                  {Boolean(options.length) && (
                                    <p className="text-sm leading-3 pb-2">
                                      {`${title}: ${[...options].join(", ")}`}
                                    </p>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-5">
                          <div>
                            <button disabled>
                              <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="none"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                ></path>
                              </svg>
                            </button>
                          </div>
                          <p className="text-base font-black leading-none text-black-800">
                            ${item.price}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="flex flex-col lg:px-8 md:px-7 px-4 lg:py-20 md:py-10 py-6 justify-end">
                  <CouponDisplay
                    couponState={[coupon, setCoupon]}
                    setDiscount={setDiscount}
                    setOrderList={setOrderList}
                    deal={deal}
                    amountState={[dealAmount, setDealAmount]}
                    applyDeal={applyDeal}
                    dealItem={dealItem}
                    disabled={!orders.length}
                  />
                  <div>
                    <div className="flex items-center pb-4 justify-between lg:pt-5 pt-2">
                      <p className="lg:text-4xl text-3xl font-black leading-9">
                        Total
                      </p>
                      <p className="text-2xl font-bold leading-normal text-right">
                        ${(total - discount).toFixed(2)}
                      </p>
                    </div>
                    {Object.keys(coupon).length > 0 && coupon.type < 2 && (
                      <div className="flex items-center pb-4 justify-between lg:pt-5 pt-2">
                        <p className="lg:text-xl text-lg font-black leading-9">
                          Minimum
                        </p>
                        <p className="text-md font-bold leading-normal text-right">
                          ${coupon.minimum}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (total >= (coupon?.minimum ?? 0)) {
                          navigate(`/${table}/menu/bill`);
                        } else {
                          toast.error("Not enough spent for coupon!");
                        }
                      }}
                      className="text-base leading-none w-full py-5 bg-base-100 text-black hover:bg-base-300 rounded-box"
                    >
                      Request Bill
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
