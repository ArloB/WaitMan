/*
Add Tables Components
Displays a button that triggers a popup asking for an integer table number upon click
Adds the table and stores it upon entering a valid and unique table number
*/

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../../../axios";

const AddTables = ({ tables, setTables }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit } = useForm();

  const togglePopup = () => {
    setIsOpen(!isOpen);
    setValue("");
  };

  const [value, setValue] = useState("");

  const handleChange = (event) => {
    const result = event.target.value.replace(/\D/g, "");
    setValue(result);
  };

  const postData = (data) => {
    api
      .post(`/tables`, data)
      .then(() => {
        setTables([...tables, Number(data["table_id"])]);
        toast.success(`Table ${data["table_id"]} added successfully`);
      })
      .catch(() => {});

    togglePopup();
  };

  return (
    <div>
      <label onClick={togglePopup} className="btn modal-button text-xl w-48">
        Add Table
      </label>
      <input
        type="checkbox"
        id="table-mng-modal"
        className="modal-toggle"
        checked={isOpen}
        readOnly
      />
      <div className="modal">
        <div className="modal-box max-w-sm">
          <div className="flex justify-between">
            <h3 className="text-lg font-bold mt-0 mb-8">
              Enter a table number
            </h3>
            <label onClick={togglePopup} className="btn btn-sm btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </label>
          </div>
          <form
            onSubmit={handleSubmit(postData)}
            className="flex justify-center"
          >
            <input
              {...register("table_id", { required: true })}
              type="text"
              className="input input-bordered max-w-[5em] mr-5"
              value={value}
              onChange={handleChange}
            />
            <button type="submit" className="btn">
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTables;
