import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { components, createFilter } from "react-select";
import { Controller } from "react-hook-form";
import api from "../../../axios";
import { useParams } from "react-router-dom";

const Option = (props) => {
  return (
    <components.Option {...props}>
      <div className="flex justify-between">
        <p>{props.data.label}</p>
        <p>{props.data.description}</p>
      </div>
    </components.Option>
  );
};

const CouponPicker = ({
  control,
  setCoupon,
  disabled,
  resetList,
  handleRemove,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { table } = useParams();

  const addOption = (code, description, id) => {
    setOptions((opts) => [
      ...opts,
      {
        label: code,
        value: id,
        description: description,
      },
    ]);
  };

  useEffect(() => {
    api.get(`/coupons/public`).then((val) => {
      setOptions([]);
      val.coupons?.map(({ id, code, description }) =>
        addOption(code, description, id)
      );
    });
  }, []);

  const handleCreate = (val, onChange) => {
    setLoading(true);
    api
      .put(`/order/${table}/coupon/private`, { code: val })
      .then((res) => {
        setCoupon({
          code: res.code,
          description: res.description,
          discount: res.discount,
          minimum: res?.minimum,
          item: res?.item,
          type: res.type,
          id: res.id,
        });

        resetList();

        setLoading(false);

        onChange({
          label: res.code,
          value: res.id,
          description: res.description,
        });
      })
      .catch(() => {});
  };

  const handleChange = (newV, meta, onChange) => {
    setLoading(true);

    if (!newV) {
      handleRemove().then(() => setLoading(false));
    } else {
      api
        .put(`/order/${table}/coupon`, { id: newV.value })
        // .then(() => api.get(`/coupons/${newV.value}`))
        .then((res) => {
          setCoupon({
            code: res.code,
            description: res.description,
            discount: res.discount,
            minimum: res?.minimum,
            item: res?.item,
            type: res.type,
            id: res.id,
          });

          resetList();

          setLoading(false);

          onChange(newV, meta);
        })
        .catch(() => setLoading(false));
    }
  };

  return (
    <Controller
      name={"coupon"}
      control={control}
      render={({ field: { value, onChange, onBlur } }) => {
        return (
          <CreatableSelect
            placeholder="Enter/Search..."
            components={{ Option }}
            options={options}
            isLoading={loading}
            isDisabled={loading || disabled}
            onChange={(newV, meta) => {
              handleChange(newV, meta, onChange);
            }}
            onCreateOption={(val) => handleCreate(val, onChange)}
            onBlur={onBlur}
            required
            value={value}
            className="flex-1"
            formatCreateLabel={(val) => `${val}`}
            filterOption={createFilter({
              stringify: (option) =>
                `${option.data.description} ${option.label}`,
            })}
          />
        );
      }}
    />
  );
};

export default CouponPicker;
