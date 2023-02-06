import { useLoaderData, useNavigate } from "react-router-dom";
import React, { useState } from "react";

import MenuNavBar from "./Components/Menu/MenuNavBar";
import Icon from "./Components/Icon";

const Menu = ({ ws }) => {
  const params = useLoaderData();
  const [selected, setSelected] = useState("All");
  const navigate = useNavigate();

  const handleChange = (event) => {
    setSelected(event.target.value);
  };

  return (
    <div>
      <MenuNavBar ws={ws} />
      <div className="navbar bg-base-100 mb-2">
        <div className="flex-1">
          <h1 className="text-4xl font-bold pl-4">Categories</h1>
        </div>
        <div className="flex-none">
          <select
            className="select select-bordered w-full max-w-xs"
            value={selected}
            onChange={handleChange}
          >
            <option>All</option>
            {Object.entries(params).map(
              ([category, _]) =>
                category !== "full" && (
                  <option key={`${category}-option`} value={category}>
                    {category}
                  </option>
                )
            )}
          </select>
        </div>
      </div>
      <div className="max-h-[calc(100vh-8.97rem)] ml-5">
        {Object.entries(params)?.map(
          ([key, value]) =>
            (selected === "All" || selected === key) &&
            key !== "full" && (
              <div key={key}>
                <h1 className="flex justify-center font-bold text-5xl mb-4">
                  {key}
                </h1>
                <hr className="m-auto max-w-xl pb-4" />
                <div className="grid grid-cols-6 gap-2 items-baseline">
                  {value?.map((item) => (
                    <div
                      className="card m-4 bg-white hover:bg-base-200 cursor-pointer h-80 w-60"
                      onClick={() => {
                        navigate(`./${item.id}`);
                      }}
                      key={`${key}-${item.id}`}
                    >
                      <figure>
                        <Icon
                          id={item.id}
                          className="object-center object-cover md:block hidden max-h-36 pt-2 mt-4 rounded-full"
                        />
                      </figure>
                      <div className="card-body text-center">
                        <h2 className="text-ellipsis overflow-hidden font-bold text-2xl">
                          {item.name}
                        </h2>
                        <p className="text-ellipsis overflow-hidden">
                          {item.desc}
                        </p>
                        <p>{"$" + item.price}</p>
                      </div>
                    </div>
                  )) ?? <></>}
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
};

export default Menu;
