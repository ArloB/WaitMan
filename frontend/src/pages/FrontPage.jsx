import { useLoaderData } from "react-router-dom";

import TableModal from "./Components/Table Select/TableModal";
import QRModal from "./Components/Table Select/QRModal";
import ReservationButton from "./Components/Table Select/ReservationButton";
import EditReservationModal from "./Components/Table Select/EditReservationModal";
import Icon from "./Components/Icon";

const FrontPage = () => {
  const data = useLoaderData();

  return (
    <div className="flex justify-center min-h-screen">
      <div className="flex flex-col justify-center">
        <div className="prose">
          <h1 className="text-center">Restaurant</h1>
          <Icon id="logo" className="max-w-sm mb-4" />
        </div>
        <QRModal />
        <TableModal tables={data.tables} />
        <ReservationButton />
        <EditReservationModal />
      </div>
    </div>
  );
};

export default FrontPage;
