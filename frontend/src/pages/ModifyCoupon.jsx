import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useForm, useFormState } from "react-hook-form";

import BackButton from "./Components/BackButton";
import ItemPicker from "./Components/Coupon Management/ItemPicker";
import TypePicker from "./Components/Coupon Management/TypePicker";
import api from "../axios";
import { condMethod } from "../shared";

function ModifyCoupon({ edit = false }) {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, control, watch } = useForm();
  const { errors } = useFormState({ control });
  const fields = watch(["discount", "item"], false);
  const data = useLoaderData();
  const [type, setType] = useState(data?.type ?? 0);
  const { coupon } = useParams();
  const options = [
    { label: "Percentage", value: 0 },
    { label: "Flat", value: 1 },
    { label: "Deal", value: 2 },
  ];

  useEffect(() => {
    setValue("type", options[type]);

    if (edit) {
      setValue("description", data.description);
      setValue("active", data.active);

      if (data.code?.length > 0) {
        setValue("code", data.code);
      }

      setValue("one_time", data.one_time);

      if (data.type === 2) {
        setValue("item", { label: data.item_name, value: data.item });
        setValue("discount", data.new_price);
      } else {
        setValue("minimum", data.minimum);
        setValue("discount", data.discount);
      }
    }
  }, [edit, setValue, data, type]);

  const onSubmit = (data) => {
    const obj = { ...data };

    if (obj?.item) {
      obj["item"] = obj["item"].value;
    }

    obj["type"] = obj["type"].value;

    delete obj[type === 2 ? "minimum" : "item"];

    condMethod(edit, `/coupons/${edit ? coupon : ""}`, obj).then(() =>
      navigate("/admin/coupons")
    );
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure?")) {
      api.delete(`/coupons/${coupon}`).then(navigate("/admin/coupons"));
    }
  };

  const generateCode = () => {
    if (edit) {
      api.get(`/coupons/${coupon}/generate`).then((data) => {
        setValue("code", data.code);
      });
    } else {
      let str = "";

      if ((fields[0] && type !== 2) || (fields[0] && fields[1] && type === 2)) {
        switch (type) {
          case 2:
            str = `$${fields[0]}${fields[1].label}`;
            break;
          case 1:
            str = `$${fields[0]}off`;
            break;
          case 0:
            str = `${fields[0]}%off`;
            break;
          default:
        }
      }

      // https://www.w3schools.com/js/js_random.asp
      setValue(
        "code",
        str + String(Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000)
      );
    }
  };

  return (
    <div className="overflow-visible">
      <BackButton to="/admin/coupons" />
      <div className="flex flex-col justify-center items-center overflow-visible min-h-screen">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <p className="font-bold mb-2">Coupon Type</p>
            <div
              className={
                errors.type ? "w-full tooltip tooltip-bottom tooltip-open" : ""
              }
              data-tip={errors?.type?.message}
            >
              <TypePicker
                control={control}
                options={options}
                setType={setType}
              />
            </div>
          </div>
          <div className="mt-3 mb-1">
            <p className="font-bold mb-2">Description</p>
            <textarea
              {...register("description", { required: true })}
              className="textarea textarea-bordered min-w-full resize-none"
              style={{ width: 400, height: 120 }}
              id="item-description"
              type="text"
              placeholder="Insert Description Here"
              required
            />
          </div>
          <div className="mt-3 mb-2 flex items-center justify-between">
            {type === 2 && (
              <div className="flex-1 pr-4">
                <p className="font-bold mb-2">Discounted item</p>
                <div
                  className={
                    errors.item
                      ? "w-full tooltip tooltip-bottom tooltip-open"
                      : ""
                  }
                  data-tip={errors?.item?.message}
                >
                  <ItemPicker control={control} />
                </div>
              </div>
            )}
            {type < 2 && (
              <div>
                <p className="font-bold mb-2">Minimum purchase</p>
                <div className="input-group">
                  <span className="input-group-text min-w-[11%]">$</span>
                  <input
                    {...register("minimum", {
                      valueAsNumber: true,
                      min: 0,
                      max: 1000,
                    })}
                    step="0.01"
                    max={1000}
                    min={0}
                    className="input input-bordered w-28"
                    type="number"
                    defaultValue={0}
                    required
                  />
                </div>
              </div>
            )}
            <div>
              <p className="font-bold mb-2">
                {type === 2 ? "New Price" : "Discount"}
              </p>
              <div className="input-group">
                {type !== 0 && (
                  <span className="input-group-text min-w-[11%]">$</span>
                )}
                <input
                  {...register("discount", {
                    valueAsNumber: true,
                    min: 0,
                    max: 100,
                  })}
                  step="0.01"
                  max={100}
                  min={0}
                  className="input input-bordered w-24"
                  type="number"
                  placeholder="00.00"
                  required
                />
                {!type && <span className="input-group-text">%</span>}
              </div>
            </div>
          </div>
          <div className="mt-3 mb-2">
            <p className="font-bold mb-2">Coupon Code</p>
            <div
              className={
                errors.code ? "w-full tooltip tooltip-bottom tooltip-open" : ""
              }
              data-tip={errors?.code?.message}
            >
              <div className="input-group">
                <input
                  {...register("code", { required: "Code is required" })}
                  className="input input-bordered w-full"
                  type="text"
                  placeholder="Coupon Code"
                  required
                  readOnly
                />
                <button
                  className="btn"
                  onClick={() => generateCode()}
                  type="button"
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end">
            <div className="flex justify-center mr-3">
              <label className="label cursor-pointer">
                <span className="font-bold">Single Use</span>
                <input
                  {...register("one_time")}
                  className="checkbox ml-2"
                  type="checkbox"
                />
              </label>
            </div>
            <div className="flex justify-center mr-3">
              <label className="label cursor-pointer">
                <span className="font-bold">Active</span>
                <input
                  {...register("active")}
                  className="toggle ml-2"
                  type="checkbox"
                ></input>
              </label>
            </div>
            <button className="btn" type="submit">
              {edit ? "Edit" : "Add"}
            </button>
            {edit && (
              <button
                className="btn btn-error ml-3"
                type="button"
                onClick={() => handleDelete()}
              >
                Delete
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModifyCoupon;
