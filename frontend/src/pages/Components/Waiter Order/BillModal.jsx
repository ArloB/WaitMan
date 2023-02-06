import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

const BillModal = ({ tables }) => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = (data) => navigate(`/waitstaff/${data.table}/bill`);

  return (
    <>
      <label htmlFor="table-modal" className="btn modal-button mb-4 ml-4">
        Select Table
      </label>

      <input type="checkbox" id="table-modal" className="modal-toggle" />
      <label htmlFor="table-modal" className="modal cursor-pointer">
        <label className="modal-box relative" htmlFor="">
          <h3 className="font-bold text-lg">Select a table</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <select
              className="select select-bordered w-full mt-6"
              {...register("table", { required: true })}
            >
              {tables.map((table) => (
                <option key={table} value={table}>
                  Table {table}
                </option>
              ))}
            </select>
            <div className="modal-action">
              <button className="btn" type="submit">
                Go
              </button>
            </div>
          </form>
        </label>
      </label>
    </>
  );
};

export default BillModal;
