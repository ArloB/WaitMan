import { useForm, Controller } from "react-hook-form";
import { useCookies } from "react-cookie";
import { useLoaderData, useNavigate } from "react-router-dom";
import Select from "react-select";
import { useEffect } from "react";
import { useState } from "react";
import BackButton from "./Components/BackButton";
import api from "../axios";
import { toast } from "react-toastify";

const EditUser = () => {
  const { register, handleSubmit, control, setValue } = useForm();
  const token = useCookies(["USER"])[0]["USER"];
  const data = useLoaderData();
  const navigate = useNavigate();

  const [active, setActive] = useState(false);

  const onSubmit = (data) => {
    api
      .put(
        `/admin/edit/user`,
        {
          email: data.email,
          password: data.password,
          role: data.role.value,
          new_password: data.new_password,
        },
        { headers: { Authorization: token } }
      )
      .then(() => {
        toast.success("Modified Account!");
        navigate("/admin");
      })
      .catch(() => {});
  };

  const options = [
    { label: "Manager", value: 0 },
    { label: "Wait Staff", value: 1 },
    { label: "Kitchen Staff", value: 2 },
  ];

  useEffect(() => {
    setValue("email", data.email);
    setValue("role", options[data.role]);
  }, []);

  const handlePassword = (e) => {
    setActive(Boolean(e.target.value.length));

    if (!e.target.value.length) {
      setValue("new_password", "");
    }
  };

  return (
    <>
      <BackButton to="/admin" />
      <div className="min-w-full min-h-screen flex justify-center items-center">
        <div
          className={`w-76 ${
            active ? "max-h-[38rem]" : "max-h-[35.5rem]"
          } shadow-xl rounded-lg`}
        >
          <div className="card-body">
            <div className="mb-4">
              <h3 className="card-title">Edit Account</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="label">Email</label>
                  <input
                    {...register("email")}
                    className="input input-bordered"
                    type="email"
                    placeholder="mail@gmail.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="label">New Password</label>
                  <input
                    {...register("password")}
                    className="input input-bordered"
                    type="password"
                    placeholder="Enter old password"
                    onChange={handlePassword}
                  />
                </div>
                <div className="space-y-2">
                  <input
                    {...register("new_password")}
                    className="input input-bordered"
                    type="password"
                    placeholder="Enter new password"
                    disabled={!active}
                  />
                </div>
                <div>
                  <label className="label">Role</label>
                  <Controller
                    control={control}
                    name="role"
                    render={({ field: { value, onChange } }) => {
                      return (
                        <Select
                          options={options}
                          value={value}
                          onChange={onChange}
                          placeholder="Select a role"
                          isSearchable={false}
                        />
                      );
                    }}
                  />
                </div>
                <div className="flex justify-center">
                  <button type="submit" className="btn">
                    Edit
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUser;
