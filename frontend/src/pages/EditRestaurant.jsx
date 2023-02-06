import { useForm } from "react-hook-form";
import { useCookies } from "react-cookie";
import { useLoaderData, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import BackButton from "./Components/BackButton";
import api from "../axios";
import { toast } from "react-toastify";

const EditUser = () => {
  const { register, handleSubmit, setValue } = useForm();
  const token = useCookies(["USER"])[0]["USER"];
  const params = useLoaderData();
  const navigate = useNavigate();

  const [upload, setUpload] = useState();
  const [icon, setIcon] = useState("");

  const onSubmit = (data) => {
    const d = new FormData();
    d.append("name", data.name);

    if (data.logo.item(0)) {
      d.append("logo", data.logo.item(0));
    }

    api
      .put(`/admin/edit/restaurant`, d, { headers: { Authorization: token } })
      .then(() => {
        toast.success("Modified Account!");
        navigate("/admin");
      })
      .catch(() => {});
  };

  useEffect(() => {
    setValue("name", params.name);
    setIcon(
      `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/img/logo`
    );
  }, [params.name, setValue]);

  useEffect(() => {
    if (upload) {
      const obj_url = URL.createObjectURL(upload);

      setIcon(obj_url);

      return () => URL.revokeObjectURL(obj_url);
    }
  }, [upload]);

  const setPreview = (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    setUpload(e.target.files[0]);
  };

  return (
    <>
      <BackButton to="/admin" />
      <div className="flex-col min-w-full min-h-screen flex justify-center items-center">
        <img
          src={icon}
          alt="icon"
          className="max-w-2xl max-h-[42rem] mb-[2.5rem]"
        />
        <div className="w-76 max-h-[35.5rem] shadow-xl rounded-lg">
          <div className="card-body">
            <div className="mb-4">
              <h3 className="card-title">Edit Restaurant Details</h3>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="label">Name</label>
                  <input
                    {...register("name")}
                    className="input input-bordered"
                    required
                  />
                </div>
                <div>
                  <label className="label">Logo</label>
                  <input
                    {...register("logo")}
                    type="file"
                    className="file-input file-input-bordered max-w-[215px]"
                    accept="image/*"
                    onChange={setPreview}
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
