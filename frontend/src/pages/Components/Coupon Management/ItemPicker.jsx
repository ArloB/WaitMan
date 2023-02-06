import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Controller } from "react-hook-form";
import api from "../../../axios";

const ItemPicker = ({ control }) => {
  const [options, setOptions] = useState([]);

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
    api.get(`/items`).then((val) => {
      setOptions([]);
      val.items?.map(({ name, id }) => addOption(name, id));
    });
  }, []);

  const customStyles = {
    control: (base) => ({
      ...base,
      height: 48,
      minHeight: 48,
    }),
  };

  return (
    <div>
      <Controller
        name={"item"}
        control={control}
        rules={{ required: "Item is required" }}
        render={({ field: { value, onChange, onBlur } }) => {
          return (
            <Select
              styles={customStyles}
              options={options}
              onChange={onChange}
              onBlur={onBlur}
              value={value}
            />
          );
        }}
      />
    </div>
  );
};

export default ItemPicker;
