import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const EditReservationModal = () => {
  const { handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    let id = document.getElementById("id").value;
    navigate(`/reservation/edit/${id}`);
  };

  return (
    <>
      <label htmlFor="reservation-modal" className="btn modal-button mb-4">
        {" "}
        Edit Reservation{" "}
      </label>

      <input type="checkbox" id="reservation-modal" className="modal-toggle" />
      <label htmlFor="reservation-modal" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="font-bold text-lg pb-2">Enter your Booking ID</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              id="id"
              className="bg-[#fcc6e2] border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Booking ID"
            />
            <div className="modal-action">
              <button className="btn" type="submit">
                Go to reservation
              </button>
            </div>
          </form>
        </label>
      </label>
    </>
  );
};

export default EditReservationModal;
