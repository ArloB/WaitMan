import { useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import BackButton from "./Components/BackButton";
import axios from "axios";
import MenuNavBar from "./Components/Menu/MenuNavBar";
import { toast } from "react-toastify";

import Addons from "./Components/Item/Addons";
import Icon from "./Components/Icon";
import { condMethod } from "../shared";

const Item = ({ edit = false, ws }) => {
  const params = useLoaderData();
  const { table, item } = useParams();
  const navigate = useNavigate();
  const [price, setPrice] = useState(params.price);
  const [quant, setQuant] = useState(edit ? params.quantity : 1);

  const handleOrder = (data) => {
    if (edit && !quant) {
      axios
        .delete(
          `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/cart/${item}`
        )
        .then(() => navigate(`/${table}/menu/cart`));
    }

    const addons = {};

    try {
      for (const key in data) {
        if (data[key]) {
          var val = JSON.parse(
            key.replace(/([a-z0-9A-Z_]+):([^,}]+)/g, '"$1":"$2"')
          );

          if (val.type === "r") {
            addons[val.id] = [data[key]];
          } else {
            addons[val.id] =
              val.id in addons ? addons[val.id].concat(val.name) : [val.name];
          }
        }
      }

      condMethod(edit, `/cart/${edit ? item : table}`, {
        item: params.id,
        amount: quant,
        addons,
      }).then(() => navigate(`/${table}/menu/${edit ? "cart" : ""}`));
    } catch {
      toast.error("Something has gone wrong!");
    }
  };

  const modifyPrice = (amount, subtract = false) => {
    if (subtract) {
      setPrice((prev) => prev - amount);
    } else {
      setPrice((prev) => prev + amount);
    }
  };

  return (
    <div className="flex justify-center">
      <BackButton to={`/${table}/menu/${edit ? "cart" : ""}`} />
      <div className="min-h-screen max-h-screen min-w-[93vw] flex flex-col items-center">
        <MenuNavBar ws={ws} />
        <div className="prose prose-sm md:prose-base max-w-3xl pt-4">
          <Icon id={params.id} className="mt-0 mb-4 max-h-[45vh]" />
          <div className="px-4">
            <h1 className="font-bold mb-2">{params.name}</h1>
            <p className="mt-0">{params.description}</p>
            <hr className="mt-0 mb-0" />
          </div>
        </div>
        {params.addons ? (
          <Addons
            list={params.addons}
            order={handleOrder}
            modifyPrice={modifyPrice}
          />
        ) : (
          <></>
        )}
        <div className="sticky top-[100vh] text-center w-full md:max-w-4xl px-4 pb-2">
          <div className="flex justify-center mb-2">
            <div className="flex justify-between w-4/12">
              <button
                className="btn shadow-xl"
                disabled={quant === (edit ? 0 : 1)}
                onClick={() => {
                  if (quant > (edit ? 0 : 1)) {
                    setQuant(quant - 1);
                  }
                }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </button>
              <p className="self-center">{quant}</p>
              <button
                className="btn shadow-xl"
                onClick={() => {
                  setQuant(quant + 1);
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            </div>
          </div>
          <button
            className="btn shadow-xl w-1/4"
            form="addon-form"
            type="submit"
          >
            {quant
              ? edit
                ? `Edit Item ($${price * quant})`
                : `Add for $${price * quant}`
              : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Item;
