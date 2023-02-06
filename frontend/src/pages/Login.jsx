import { useForm } from "react-hook-form";
import { Link, useLoaderData } from "react-router-dom";
import { useCookies } from "react-cookie";
import api from "../axios";
import Icon from "./Components/Icon";

const Login = () => {
  const { register, handleSubmit } = useForm();
  const setCookie = useCookies(["USER"])[1];
  const data = useLoaderData();

  const onSubmit = (data) => {
    api
      .post(`/admin/login`, {
        email: data.email,
        password: data.password,
      })
      .then((data) => {
        setCookie("USER", data.token);
      })
      .catch(() => {});
  };

  return (
    <div className="min-w-[100vw] min-h-screen flex flex-col pt-5">
      <div className="prose min-w-full flex flex-col items-center">
        <h1 className="mb-2">{data.name}</h1>
        <Icon id="logo" className="max-w-sm mb-4" />
      </div>
      <div className="flex justify-center items-center">
        <div className="w-76 max-h-[28.75rem] shadow-xl rounded-lg">
          <div className="card-body">
            <div className="mb-4">
              <h3 className="card-title">Sign In </h3>
              <p className="">Please sign in to your account.</p>
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
                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <Link to="/register">Register</Link>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button type="submit" className="btn">
                    Sign in
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

export default Login;
