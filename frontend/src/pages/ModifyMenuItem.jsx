import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useForm, useFormState } from "react-hook-form";

import CategoryPicker from "./Components/Menu Management/CategoryPicker";
import IngredientPicker from "./Components/Menu Management/IngredientPicker";
import BackButton from "./Components/BackButton";
import AddonPicker from "./Components/Menu Management/AddonPicker";
import ModifyAddonItem from "./Components/Menu Management/ModifyAddon";
import api from "../axios";
import { condMethod } from "../shared";

function ModifyMenuItem({ edit = false }) {
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, control } = useForm();
  const { errors } = useFormState({ control });
  const {
    register: registerAddon,
    handleSubmit: handleAddonSubmit,
    setValue: setAddonValue,
    reset,
    control: addonControl,
  } = useForm();
  const [upload, setUpload] = useState();
  const [icon, setIcon] = useState("");
  const [addonID, setAddonID] = useState();
  const [addons, setAddons] = useState([]);
  const [isEditing, setIsEditing] = useState(edit);
  const [addonFuncs, setAddonFuncs] = useState([() => {}, [], () => {}]);
  const [restore, setRestore] = useState(() => () => {});
  const { item } = useParams();
  const data = useLoaderData();

  useEffect(() => {
    if (edit) {
      setValue("name", data.name);
      setValue("price", data.price);
      setValue("available", data.availability);
      setValue("description", data.description);
      setValue("category", { value: data.category_id, label: data.category });
      setValue(
        "ingredients",
        data.ingredients?.map(({ id, name }) => {
          return { value: id, label: name };
        })
      );
      setValue(
        "addons",
        data.addons?.map(({ id, title, options, type }) => {
          return { label: title, value: id, opts: options, type: type };
        })
      );
      setAddons(data.addons);
      setIcon(
        `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/img/${item}`
      );
    }
  }, [edit, item, setValue, data]);

  const onSubmit = (data) => {
    const fdata = new FormData();
    fdata.append("name", data.name);
    fdata.append("category", data.category.value);
    fdata.append("price", data.price);
    fdata.append("available", data.available);
    fdata.append("description", data.description);
    if (data.icon?.item(0)) {
      fdata.append("img", data.icon.item(0));
    }
    fdata.append(
      "ingredients",
      JSON.stringify({
        ingredients: data.ingredients?.map(({ value }) => value) ?? [],
      })
    );
    if (edit) {
      fdata.append("item", item);
    } else {
      fdata.append("addons", JSON.stringify({ addons: addons }));
    }

    condMethod(edit, `/items`, fdata).then(() => navigate("/admin/menu"));
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure?")) {
      api
        .delete(`/items`, {
          data: {
            id: item,
          },
        })
        .then(navigate("/admin/menu"));
    }
  };

  useEffect(() => {
    if (upload) {
      const obj_url = URL.createObjectURL(upload);

      setIcon(obj_url);

      return () => URL.revokeObjectURL(obj_url);
    }
  }, [upload]);

  const setPreview = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setUpload(e.target.files[0]);
  };

  const toggleOpen = () => {
    document.getElementById("modify-addon").checked =
      !document.getElementById("modify-addon").checked;
  };

  const onAddonSubmit = (fdata) => {
    reset();

    condMethod(isEditing, `/addons/${isEditing ? addonID : ""}`, {
      title: fdata.title,
      multiselect: fdata.multiselect,
      options: fdata.options,
      item: item,
    }).then((data) => {
      const addon_obj = {
        label: fdata.title,
        value: isEditing ? addonID : data.id,
        opts: fdata.options,
        type: fdata.multiselect,
      };
      setAddons((prev) => [
        ...prev,
        {
          title: fdata.title,
          id: isEditing ? addonID : data.id,
          options: fdata.options,
          type: fdata.multiselect,
        },
      ]);
      addonFuncs[0](
        addonFuncs[1] ? [...addonFuncs[1], addon_obj] : [addon_obj]
      );
      addonFuncs[2](
        fdata.title,
        isEditing ? addonID : data.id,
        fdata.options,
        fdata.multiselect
      );
      toggleOpen();
    });
  };

  return (
    <div className="overflow-visible">
      <BackButton to="/admin/menu" />
      <div className="flex flex-col justify-center items-center overflow-visible min-h-screen">
        {icon && (
          <img
            src={icon}
            alt="icon"
            className="max-w-2xl max-h-[42rem] mb-[2.5rem]"
          />
        )}
        <form
          className="bg-white p-5 rounded-box"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-row">
            <div className="flex flex-col mr-5">
              <div className="mt-3 mb-2">
                <p className="font-bold mb-2">Upload image</p>
                <input
                  {...register("icon")}
                  className="file-input file-input-bordered"
                  type="file"
                  accept="image/*"
                  onChange={setPreview}
                />
              </div>
              <div className="mt-3 mb-2">
                <p className="font-bold mb-2">Item Name</p>
                <div
                  className={
                    errors.name
                      ? "w-full tooltip tooltip-bottom tooltip-open"
                      : ""
                  }
                  data-tip={errors?.name?.message}
                >
                  <input
                    {...register("name", { required: "Item name required" })}
                    className="input input-bordered w-full"
                    type="text"
                    placeholder="Item Name"
                  ></input>
                </div>
              </div>
              <div className="mt-3 mb-2">
                <p className="font-bold mb-2">Category</p>
                <div
                  className={
                    errors.category
                      ? "w-full tooltip tooltip-bottom tooltip-open"
                      : ""
                  }
                  data-tip={errors?.category?.message}
                >
                  <div className="max-w-sm">
                    <CategoryPicker control={control} />
                  </div>
                </div>
              </div>
              <div className="mt-3 mb-2">
                <p className="font-bold mb-2">Price</p>
                <div
                  className={
                    errors.price ? "tooltip tooltip-bottom tooltip-open" : ""
                  }
                  data-tip={errors?.price?.message}
                >
                  <div className="input-group">
                    <span className="input-group-text">$</span>

                    <input
                      {...register("price", { required: "Price is required" })}
                      step="0.01"
                      className="input input-bordered"
                      type="number"
                      placeholder="0.00"
                    ></input>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="mt-3 mb-1">
                <p className="font-bold mb-2">Description</p>
                <div
                  className={
                    errors.description
                      ? "w-full tooltip tooltip-bottom tooltip-open"
                      : ""
                  }
                  data-tip={errors?.description?.message}
                >
                  <textarea
                    {...register("description", {
                      required: "Description is required",
                    })}
                    className="textarea textarea-bordered max-w-sm resize-none"
                    style={{ width: 400, height: 120 }}
                    id="item-description"
                    type="text"
                    placeholder="Insert Description Here"
                  ></textarea>
                </div>
              </div>
              <div className="mb-2">
                <p className="font-bold mb-2">Ingredients</p>
                <div className="max-w-sm">
                  <IngredientPicker control={control} item={item} />
                </div>
              </div>
              <div>
                <p className="font-bold mb-2">Add-ons</p>
                <div className="max-w-sm">
                  <AddonPicker
                    id={item}
                    setAID={setAddonID}
                    addons={addons}
                    toggleOpen={toggleOpen}
                    control={control}
                    setIsEditing={setIsEditing}
                    setAddonFuncs={setAddonFuncs}
                  />
                </div>
              </div>
              <div className="flex justify-end items-center mt-3">
                <div className="flex justify-between mr-3">
                  <span className="font-bold">Available</span>
                  <input
                    {...register("available")}
                    className="toggle ml-2"
                    type="checkbox"
                  ></input>
                </div>
                <button className="btn btn-primary mr-3" type="submit">
                  {edit ? "Update" : "Add"} Item
                </button>
                {edit && (
                  <button
                    className="btn btn-error"
                    type="button"
                    onClick={handleDelete}
                  >
                    Remove Item
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <input type="checkbox" id="modify-addon" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box max-w-sm max-h-[50%]">
          <form onSubmit={handleAddonSubmit(onAddonSubmit)}>
            <h3 className="font-bold text-lg">
              {isEditing ? "Edit" : "Create New"} Add-on
            </h3>
            <ModifyAddonItem
              edit={isEditing}
              id={addonID}
              register={registerAddon}
              addon={addons.find((el) => el.id === addonID)}
              setValue={setAddonValue}
              reset={reset}
              addonControl={addonControl}
              setRestore={setRestore}
            />
            <div className="modal-action">
              <label
                htmlFor="modify-addon"
                className="btn min-w-[50%]"
                onClick={() => restore()}
              >
                Cancel
              </label>
              <button type="submit" className="btn btn-success min-w-[50%]">
                {isEditing ? "Edit" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModifyMenuItem;
