import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useCookies } from "react-cookie";

import "./App.css";

import Item from "./pages/Item";
import FrontPage from "./pages/FrontPage";
import Menu from "./pages/Menu";
import TableManagement from "./pages/TableManagement";
import TableCode from "./pages/TableCode";
import MenuManagement from "./pages/MenuManagement";
import AdminMenu from "./pages/AdminMenu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditUser from "./pages/EditUser";
import EditRestaurant from "./pages/EditRestaurant";
import ModifyMenuItem from "./pages/ModifyMenuItem";
import Cart from "./pages/Cart";
import Bill from "./pages/Bill";
import KitchenOrder from "./pages/KitchenOrder";
import WaiterOrder from "./pages/WaiterOrder";
import Reservations from "./pages/Reservations";
import CustomerReservation from "./pages/CustomerReservation";
import CustomerReservationDetails from "./pages/CustomerReservationDetails";
import CustomerReservationEdit from "./pages/CustomerReservationEdit";
import CouponManagement from "./pages/CouponManagement";
import ModifyCoupon from "./pages/ModifyCoupon";
import api from "./axios";
import { useEffect, useState } from "react";
import Logout from "./pages/Logout";
import { toast } from "react-toastify";

const decodeToken = (token) => {
  return JSON.parse(
    decodeURIComponent(
      window
        .atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    )
  );
};

const AdminRestricted = ({ cookie }) => {
  if (cookie) {
    const role = decodeToken(cookie)["role"];

    if (role === 0) {
      return <Outlet />;
    }

    switch (role) {
      case 1:
        return <Navigate to="/waitstaff" />;
      case 2:
        return <Navigate to="/kitchen" />;
      default:
        toast.error("Invalid user role");
        return <Navigate to="/logout" />;
    }
  } else {
    return <Navigate to="/login" />;
  }
};

const OtherRestricted = ({ cookie, other }) => {
  if (cookie) {
    const role = decodeToken(cookie)["role"];

    if (role === other || role === 0) {
      return <Outlet />;
    }

    if (role === (other === 1 ? 2 : 1)) {
      return <Navigate to={other === 1 ? "/kitchen" : "/waitstaff"} />;
    }

    toast.error("Invalid user role");
    return <Navigate to="/logout" />;
  } else {
    return <Navigate to="/login" />;
  }
};

const Unrestricted = ({ cookie }) => {
  // https://stackoverflow.com/a/38552302
  if (cookie) {
    const role = decodeToken(cookie)["role"];

    switch (role) {
      case 0:
        return <Navigate to="/admin" />;
      case 1:
        return <Navigate to="/waitstaff" />;
      case 2:
        return <Navigate to="/kitchen" />;
      default:
        toast.error("Invalid user role");
        return <Navigate to="/logout" />;
    }
  } else {
    return <Outlet />;
  }
};

const App = () => {
  const token = useCookies(["USER"])[0]["USER"];
  const [wss, setWSS] = useState();

  useEffect(() => {
    const ws = new WebSocket(
      `wss://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/ws`
    );

    setWSS(ws);

    return () => {
      ws.onclose = () => {
        setWSS(
          new WebSocket(
            `wss://${process.env.REACT_APP_HOST}:${process.env.REACT_APP_BIP}/ws`
          )
        );
      };
    };
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          loader={async () => {
            return api.get("/");
          }}
          element={<FrontPage />}
        />
        <Route
          path="/:table/menu"
          loader={async () => {
            return api.get("/menu");
          }}
          element={<Menu ws={wss} />}
        />
        <Route
          path="/:table/menu/:item"
          loader={async ({ params }) => {
            return api.get(`/item/${params.item}`);
          }}
          element={<Item ws={wss} />}
        />
        <Route path="/login" element={<Unrestricted cookie={token} />}>
          <Route
            index
            loader={async () => {
              return api.get("/restaurant");
            }}
            element={<Login />}
          />
        </Route>
        <Route path="/register" element={<Unrestricted cookie={token} />}>
          <Route
            index
            loader={async () => {
              return api.get("/restaurant");
            }}
            element={<Register />}
          />
        </Route>
        <Route path="/logout">
          <Route index element={<Logout token={token} />} />
        </Route>
        <Route path="/admin" element={<AdminRestricted cookie={token} />}>
          <Route path="" element={<AdminMenu token={token} />}>
            <Route index element={<TableManagement />} />
            <Route
              path="menu"
              loader={async () => {
                return api.get("/items");
              }}
              element={<MenuManagement />}
            />
            <Route
              path="coupons"
              loader={async () => {
                return api.get("/coupons");
              }}
              element={<CouponManagement />}
            />
          </Route>
        </Route>
        <Route
          path="/admin/table/:table_id"
          element={<AdminRestricted cookie={token} />}
        >
          <Route index element={<TableCode />} />
        </Route>
        <Route
          path="/admin/menu/add"
          element={<AdminRestricted cookie={token} />}
        >
          <Route index element={<ModifyMenuItem />} />
        </Route>
        <Route
          path="/admin/menu/edit/:item"
          element={<AdminRestricted cookie={token} />}
        >
          <Route
            index
            loader={async ({ params }) => {
              return api.get(`/item/${params.item}`);
            }}
            element={<ModifyMenuItem edit />}
          />
        </Route>
        <Route
          path="/admin/edit/user"
          element={<AdminRestricted cookie={token} />}
        >
          <Route
            index
            loader={async () => {
              return api.get(`/admin/user`, {
                headers: { Authorization: token },
              });
            }}
            element={<EditUser />}
          />
        </Route>
        <Route
          path="/admin/edit/restaurant"
          element={<AdminRestricted cookie={token} />}
        >
          <Route
            index
            loader={async () => {
              return api.get("/restaurant");
            }}
            element={<EditRestaurant />}
          />
        </Route>
        <Route
          path="/admin/coupons/add"
          element={<AdminRestricted cookie={token} />}
        >
          <Route index element={<ModifyCoupon />} />
        </Route>
        <Route
          path="/admin/coupons/edit/:coupon"
          element={<AdminRestricted cookie={token} />}
        >
          <Route
            index
            loader={async ({ params }) => {
              return api.get(`/coupons/${params.coupon}`);
            }}
            element={<ModifyCoupon edit />}
          />
        </Route>
        <Route path="/:table/menu/cart" element={<Cart wss={wss} />} />
        <Route
          path="/:table/menu/cart/:item"
          loader={async ({ params }) => {
            return api.get(`/cart/item/${params.item}`);
          }}
          element={<Item edit ws={wss} />}
        />
        <Route path="/:table/menu/bill" element={<Bill />} />
        <Route
          path="/kitchen"
          element={<OtherRestricted cookie={token} other={2} />}
        >
          <Route
            index
            loader={async () => {
              return api.get("/");
            }}
            element={<KitchenOrder ws={wss} />}
          />
        </Route>
        <Route
          path="/waitstaff"
          element={<OtherRestricted cookie={token} other={1} />}
        >
          <Route
            index
            loader={async () => {
              return api.get("/");
            }}
            element={<WaiterOrder ws={wss} />}
          />
          <Route path="reservations/:date" element={<Reservations />} />
          <Route path=":table/bill" element={<Bill />} />
        </Route>

        <Route path="/reservation" element={<CustomerReservation />} />
        <Route
          exact
          path="/reservation/:reservation_id"
          element={<CustomerReservationDetails />}
        />
        <Route
          path="/reservation/edit/:reservation_id"
          element={<CustomerReservationEdit />}
        />
      </>
    )
  );

  return <RouterProvider router={router} />;
};

export default App;
