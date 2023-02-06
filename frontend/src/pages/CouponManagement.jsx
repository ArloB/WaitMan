import React, { useEffect, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import Enabled from "./Components/Enabled";

function CouponManagement() {
  const navigate = useNavigate();
  const data = useLoaderData();
  const [coupons, setCouponList] = useState([{}]);

  useEffect(() => {
    setCouponList(data.coupons);
  }, [data]);

  const typeName = (type) => {
    switch (type) {
      case 0:
        return "Discount (%)";
      case 1:
        return "Discount (Flat)";
      case 2:
        return "Deal";
      default:
        return "Unknown (Error?)";
    }
  };

  const offerText = (coupon) => {
    if (coupon.type === 2) {
      return `$${coupon.new_price} ${coupon.item_name}`;
    }

    if (coupon.type === 1) {
      return `$${coupon.discount} off ($${coupon.minimum} min)`;
    }

    return `${coupon.discount}% off ($${coupon.minimum} min)`;
  };

  return (
    <div className="h-full">
      <div className="prose flex justify-end min-w-full pr-5 pt-5">
        <button
          type="button"
          className="btn btn-outline-primary text-xl w-48"
          onClick={() => navigate("/admin/coupons/add")}
        >
          Add Coupon
        </button>
      </div>
      <div className="flex justify-center h-full mt-[-1.25rem]">
        <div className="card">
          <div className="card-body overflow-y-auto min-w-[80vw]">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col" className="text-left">
                    Code
                  </th>
                  <th scope="col" className="text-left">
                    Description
                  </th>
                  <th scope="col" className="text-center">
                    Offer
                  </th>
                  <th scope="col" className="text-center">
                    Type
                  </th>
                  <th scope="col" className="text-center">
                    Active
                  </th>
                  <th scope="col" className="text-center">
                    Single Use
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons?.map((coupon, i) => {
                  return (
                    <tr
                      key={i}
                      className="hover cursor-pointer"
                      onClick={() =>
                        navigate(`/admin/coupons/edit/${coupon.id}`)
                      }
                    >
                      <td className="text-left">{coupon.code}</td>
                      <td className="text-left">{coupon.description}</td>
                      <td className="text-center">{offerText(coupon)}</td>
                      <td className="text-center">{typeName(coupon.type)}</td>
                      <td>
                        <div className="flex justify-center">
                          <Enabled on={coupon.active} />
                        </div>
                      </td>
                      <td>
                        <Enabled on={coupon.one_time} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CouponManagement;
