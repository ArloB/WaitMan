import { useState, useEffect } from "react";
import { useFieldArray, useFormState } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../../axios";

function ModifyAddonItem({
  edit,
  id,
  register,
  addon,
  setValue,
  reset,
  addonControl,
  setRestore,
}) {
  const [addonID, setAID] = useState(null);
  const { fields, append, remove } = useFieldArray({
    control: addonControl,
    name: "options",
    rules: {
      required: true,
      validate: (values) => values.length > 1 && values.length <= 16,
    },
  });
  const { errors } = useFormState({ control: addonControl });

  const addOption = (name, price, exists = false) => {
    append({
      name: name,
      price: price,
      exists: exists,
    });
  };

  useEffect(() => {
    remove();
    reset();
    setAID(null);

    if (edit && typeof id !== "undefined") {
      setAID(id);
    }
  }, [reset, id, edit, remove]);

  useEffect(() => {
    if (addonID !== null) {
      setValue("title", addon.title);
      setValue("multiselect", addon.type);
      addon.options.forEach(({ name, price }) => {
        addOption(name, price, true);
      });
    }
  }, [addonID]);

  useEffect(() => {
    setRestore(() => () => {
      if (edit) {
        const real = [];

        fields?.forEach((val, i) => {
          if (val.name) {
            real.push(val);
          }
        });

        remove();

        real.forEach((val) => append(val));
      }
    });
  }, [append, edit, fields, remove, setRestore]);

  const handleDelete = (name, price, exists, i) => {
    if (window.confirm("Do you want to delete?")) {
      if (exists) {
        api
          .delete(`/options/${id}`, {
            data: {
              name: name,
              price: price,
            },
          })
          .then(() => remove(i));
      } else {
        remove(i);
      }
    }
  };

  if (errors?.options?.root) {
    toast.error("Must have between 2 and 16 options!");
  }

  return (
    <div>
      <div className="mt-2">
        <label className="label">Title</label>
        <input
          {...register("title", { required: true })}
          className="input input-bordered min-w-full"
          type="text"
          required
        />
      </div>
      <div className="mt-2 form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Multiple Selections</span>
          <input
            {...register("multiselect")}
            className="checkbox"
            type="checkbox"
          />
        </label>
      </div>
      <div className="mt-2">
        {fields.map((item, i) => {
          return (
            <div className="flex mb-2 input-group" key={item.id}>
              <input
                {...register(`options.${i}.name`)}
                className="input input-bordered w-[65%]"
                type="text"
                placeholder="Name..."
                required
              />
              <span>$</span>
              <input
                {...register(`options.${i}.price`, { valueAsNumber: true })}
                className="input input-bordered w-[30%]"
                type="number"
                step="0.01"
                required
              />
              <button
                className="btn btn-error w-[5%]"
                onClick={() =>
                  handleDelete(item.name, item.price, item.exists, i)
                }
                type="button"
              >
                X
              </button>
            </div>
          );
        })}
      </div>
      <div className="mt-2">
        <button className="btn min-w-full" onClick={() => addOption("", 0)}>
          Add new option
        </button>
      </div>
    </div>
  );
}

export default ModifyAddonItem;
