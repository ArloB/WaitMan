import React, { useState } from "react";
import EditCalendar from "./Components/EditCalendar";

function CustomerReservationEdit() {
  const [availability, setAvailability] = useState([]);
  const Calendar = EditCalendar({
    availability,
    setAvailability,
  });

  return (
    <div>
      <Calendar />
    </div>
  );
}

export default CustomerReservationEdit;
