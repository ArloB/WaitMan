import React, { useEffect, useState } from "react";
import Select from "react-select";
import { components } from "react-select";
import { Controller } from "react-hook-form";
import api from "../../../axios";

const MultiValueLabel = (props) => {
  const { setAID, setIsEditing } = props.selectProps;

  return (
    <label
      htmlFor="modify-addon"
      className="text-xl cursor-pointer"
      onClick={() => {
        setAID(props.data.value);
        setIsEditing(true);
      }}
    >
      <components.MultiValueLabel {...props} />
    </label>
  );
};

const MultiValueRemove = (props) => {
  const [newProps, setNewProps] = useState(props);

  useEffect(() => {
    props.innerProps.className =
      props.innerProps.className + " !items-start !p-0 min-h-full";

    const func = props.innerProps.onClick;

    props.innerProps.onClick = () => {
      if (window.confirm("Are you sure you want to delete?")) {
        func();
      }
    };

    setNewProps({ ...props });
  }, [props]);

  return (
    <div
      onClick={() => {
        api.delete(`/addons/${props.data.value}`);
      }}
    >
      <components.MultiValueRemove {...newProps}>
        <div className="px-1 min-w-full min-h-full items-start text-xl cursor-pointer">
          <strong>x</strong>
        </div>
      </components.MultiValueRemove>
    </div>
  );
};

const IndicatorsContainer = (props) => {
  const { create, value, onChange, setIsEditing } = props.selectProps;

  return (
    <>
      <components.IndicatorSeparator {...props} />
      <components.IndicatorsContainer {...props}>
        <div
          className="p-[8px] cursor-pointer"
          onClick={() => {
            create(value, onChange);
            setIsEditing(false);
          }}
        >
          <svg
            className="p-[3.5px]"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="rgb(204, 204, 204)"
          >
            <path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z" />
          </svg>
        </div>
      </components.IndicatorsContainer>
    </>
  );
};

const Menu = () => {};

const AddonPicker = ({
  control,
  setAID,
  addons,
  toggleOpen,
  setIsEditing,
  setAddonFuncs,
}) => {
  const [options, setOptions] = useState([]);

  const addOption = (label, value, opts, type) => {
    const optobj = {
      label: label,
      value: value,
      opts: opts,
      type: type,
    };

    setOptions((opts) => [...opts, optobj]);
  };

  useEffect(() => {
    setOptions([]);
    addons?.map(({ title, id, type, options }) =>
      addOption(title, id, options, type)
    );
  }, [addons]);

  const createIngredient = (value, onChange) => {
    toggleOpen();

    setAddonFuncs([onChange, value, addOption]);
  };

  return (
    <div>
      <Controller
        name={"addons"}
        control={control}
        render={({ field: { value, onChange, onBlur } }) => {
          return (
            <Select
              options={options}
              placeholder="Press '+' to add..."
              components={{
                MultiValueLabel,
                Menu,
                MultiValueRemove,
                IndicatorsContainer,
              }}
              isMulti
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              className="bg-primary"
              setAID={setAID}
              backspaceRemovesValue={false}
              isSearchable={false}
              isClearable={false}
              create={createIngredient}
              setIsEditing={setIsEditing}
            />
          );
        }}
      />
    </div>
  );
};

export default AddonPicker;
