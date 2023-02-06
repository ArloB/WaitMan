import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Outlet, useMatches } from "react-router";
import { useEffect, useState } from "react";
import axios from "axios";
import Icon from ".//Components/Icon";

const AdminMenu = ({ token }) => {
  const navigate = useNavigate();
  const removeCookie = useCookies(["USER"])[2];
  const [active, setActive] = useState();
  const [restaurantName, setRestaurantName] = useState("");
  const matches = useMatches();

  useEffect(() => {
    axios
      .get(
        `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/restaurant`
      )
      .then((response) => {
        setRestaurantName(response.data.name);
      });
  }, []);

  const handleLogOut = () => {
    fetch(
      `https://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/admin/logout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
        }),
      }
    ).then(() => {
      removeCookie("USER");
    });
  };

  useEffect(
    () => setActive(Number(matches[2].id.charAt(matches[2].id.length - 1))),
    [matches]
  );

  return (
    <div className="min-h-screen">
      <div className="flex justify-center">
        <div className="navbar rounded-box mt-2 bg-base-200 shadow-md max-w-[100%] max-h-[4.84vh]">
          <div className="flex-1">
            <Icon id="logo" className="w-12 pl-2" />
            <button
              onClick={() => navigate("/admin/edit/user")}
              className="btn btn-ghost m-5"
            >
              Edit Account
            </button>
            <button
              onClick={() => navigate("/admin/edit/restaurant")}
              className="btn btn-ghost m-5"
            >
              Edit Restaurant
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black">
              {restaurantName}
            </h1>
          </div>
          <div className="flex-none">
            <button onClick={handleLogOut} className="btn btn-ghost m-5">
              Log Out
            </button>
          </div>
        </div>
      </div>
      <div className="h-[91vh]">
        <Outlet />
      </div>
      <div className="btm-nav h-[4vh]">
        <button
          onClick={() => navigate("/admin")}
          className={active === 0 ? "active" : ""}
        >
          <span className="btm-nav-label">Tables</span>
        </button>
        <button
          onClick={() => navigate("/admin/menu")}
          className={active === 1 ? "active" : ""}
        >
          <span className="btm-nav-label">Menu</span>
        </button>
        <button
          onClick={() => navigate("/admin/coupons")}
          className={active === 2 ? "active" : ""}
        >
          <span className="btm-nav-label">Coupons</span>
        </button>
      </div>
    </div>
  );
};

export default AdminMenu;
