import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import api from "../../../axios";
import CouponPicker from "./CouponPicker";

const CouponDisplay = ({
  couponState,
  setDiscount,
  setOrderList,
  deal,
  amountState,
  applyDeal,
  dealItem,
  disabled,
}) => {
  const { setValue, control } = useForm();
  const [coupon, setCoupon] = couponState;
  const [amount, setAmount] = amountState;
  const { table } = useParams();

  useEffect(() => {
    if (Object.keys(coupon).length > 0) {
      setValue("coupon", {
        label: coupon?.code,
        value: coupon?.id,
        description: coupon?.description,
      });
    }
  }, [coupon, setValue]);

  const resetList = () => {
    if (amount > 0) {
      let ord = applyDeal({ item: dealItem, discount: -deal })[0];

      setOrderList([...ord]);
      setAmount(0);
    }
  };

  const handleRemove = () => {
    return api.delete(`/order/${table}/coupon`).then(() => {
      resetList();
      setCoupon({});
      setValue("coupon", null);
      setDiscount(0);
    });
  };

  return (
    <div>
      {Object.keys(coupon).length > 0 && (
        <div className="flex justify-center mb-3">
          <div className="border flex justify-between items-center lg:w-1/2 w-full">
            <div className="flex flex-col prose mb-1 ml-2">
              <h4>Coupon Applied: {coupon.code}</h4>
              <h1 className="text-3xl">{coupon.description}</h1>
            </div>
            <button
              className="btn btn-error btn-md w-[3rem] mr-4"
              onClick={handleRemove}
            >
              X
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-center w-full">
        <span className="text-lg mr-2">Coupon Code:</span>
        <div className="w-[37%]">
          <CouponPicker
            control={control}
            setCoupon={setCoupon}
            setDiscount={setDiscount}
            resetList={() => resetList()}
            handleRemove={() => handleRemove()}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default CouponDisplay;
