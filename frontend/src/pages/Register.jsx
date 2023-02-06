import { useForm, Controller } from "react-hook-form";
import { Link, useLoaderData } from "react-router-dom";
import { useCookies } from "react-cookie";
import Select from "react-select";
import api from "../axios";
import Icon from "./Components/Icon";

const Register = () => {
  const { register, handleSubmit, control } = useForm();
  const setCookie = useCookies(["USER"])[1];
  const data = useLoaderData();

  const onSubmit = (data) => {
    api
      .post("/admin/register", {
        email: data.email,
        password: data.password,
        role: data.role.value,
      })
      .then((data) => {
        setCookie("USER", data.token);
      })
      .catch(() => {});
  };

  const options = [
    { label: "Manager", value: 0 },
    { label: "Wait Staff", value: 1 },
    { label: "Kitchen Staff", value: 2 },
  ];

  return (
    <div className="min-w-[100vw] min-h-screen flex flex-col">
      <div className="prose min-w-full flex flex-col items-center pt-5">
        <h1 className="mb-4">{data.name}</h1>
        <Icon id="logo" className="max-w-sm mb-4" />
      </div>
      <div className="flex justify-center items-center">
        <div className="w-76 max-h-[35.5rem] shadow-xl rounded-lg">
          <div className="card-body">
            <div className="mb-4">
              <h3 className="card-title">Register</h3>
              <p className="">Sign up for an account.</p>
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
                  <label className="label">Password</label>
                  <input
                    {...register("password")}
                    className="input input-bordered"
                    type="password"
                    placeholder="Enter your password"
                    required
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
                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <Link to="/login" className="">
                      Log In
                    </Link>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button type="submit" className="btn">
                    Register
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
