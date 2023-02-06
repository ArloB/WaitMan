import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { components } from "react-select";
import { Controller } from "react-hook-form";
import api from "../../../axios";

const MultiValueRemove = (props) => {
  const { item } = props.selectProps;
  const [newProps, setNewProps] = useState(props);

  useEffect(() => {
    props.innerProps.className =
      props.innerProps.className +
      " !items-start !p-0 min-h-full !flex-col !justify-center";

    setNewProps({ ...props });
  }, [props]);

  return (
    <div
      onClick={() => {
        api.delete(`/ingredients`, {
          data: {
            item: item,
            ingredient: props.data.value,
          },
        });
      }}
      className="min-h-full"
    >
      <components.MultiValueRemove {...newProps} />
    </div>
  );
};

const IngredientPicker = ({ control, item }) => {
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
    api.get(`/ingredients`).then((val) => {
      setOptions([]);
      val.ingredients?.map(({ name, id }) => addOption(name, id));
    });
  }, []);

  const createIngredient = (new_ingredient, value, onChange) => {
    setIsLoading(true);
    api
      .post(`/ingredients`, {
        name: new_ingredient,
      })
      .then((data) => {
        const ingredient_obj = { label: new_ingredient, value: data.id };
        onChange(value ? [...value, ingredient_obj] : [ingredient_obj]);
        addOption(new_ingredient, data.id);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <Controller
        name={"ingredients"}
        control={control}
        render={({ field: { value, onChange, onBlur } }) => {
          return (
            <CreatableSelect
              options={options}
              placeholder={"Choose..."}
              isLoading={isLoading}
              isDisabled={isLoading}
              isMulti
              components={{ MultiValueRemove }}
              onChange={onChange}
              onCreateOption={(new_ingredient) =>
                createIngredient(new_ingredient, value, onChange)
              }
              onBlur={onBlur}
              value={value}
              className="bg-primary"
              item={item}
            />
          );
        }}
      />
    </div>
  );
};

export default IngredientPicker;
