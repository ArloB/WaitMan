import Select from "react-select";
import { Controller } from "react-hook-form";

const TypePicker = ({ control, options, setType }) => {
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
        name={"type"}
        control={control}
        rules={{ required: "Type is required" }}
        render={({ field: { value, onChange, onBlur } }) => {
          return (
            <Select
              styles={customStyles}
              options={options}
              placeholder={"Choose a type..."}
              onChange={(newVal, act) => {
                setType(newVal.value);
                onChange(newVal, act);
              }}
              onBlur={onBlur}
              value={value}
              isSearchable={false}
            />
          );
        }}
      />
    </div>
  );
};

export default TypePicker;
