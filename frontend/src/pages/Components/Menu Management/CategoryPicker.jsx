import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { Controller } from "react-hook-form";
import api from "../../../axios";

const CategoryPicker = ({ control }) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addOption = (label, value) => {
    setOptions((opts) => [
      ...opts,
      {
        label: label,
        value: value,
      },
    ]);
  };

  useEffect(() => {
    api.get(`/categories`).then((val) => {
      setOptions([]);
      val.categories?.map(({ name, id }) => addOption(name, id));
    });
  }, []);

  const createCategory = (new_category, onChange) => {
    setIsLoading(true);
    api
      .post(`/categories`, {
        name: new_category,
      })
      .then((data) => {
        onChange({ label: new_category, value: data.id });
        addOption(new_category, data.id);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <Controller
        name={"category"}
        control={control}
        rules={{ required: "Category is required" }}
        render={({ field: { value, onChange, onBlur } }) => {
          return (
            <CreatableSelect
              options={options}
              placeholder={"Choose..."}
              isLoading={isLoading}
              isDisabled={isLoading}
              onChange={onChange}
              onCreateOption={(new_category) =>
                createCategory(new_category, onChange)
              }
              onBlur={onBlur}
              value={value}
            />
          );
        }}
      />
    </div>
  );
};

export default CategoryPicker;
