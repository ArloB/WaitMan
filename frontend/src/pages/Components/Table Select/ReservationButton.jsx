import { useNavigate } from "react-router-dom";

const ReservationButton = () => {
  const navigate = useNavigate();

  return (
    <>
      <label
        className="btn button mb-4"
        onClick={() => navigate(`/reservation`)}
      >
        {" "}
        Make A Reservation{" "}
      </label>
    </>
  );
};

export default ReservationButton;
