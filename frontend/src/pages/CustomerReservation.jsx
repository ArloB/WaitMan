import React, { useState } from "react";
import CalendarTemplate from "./Components/Calendar";

function CustomerReservation() {
  const [availability, setAvailability] = useState([]);
  const Calendar = CalendarTemplate({
    availability,
    setAvailability,
  });

  return (
    <div>
      <Calendar />
    </div>
  );
}

export default CustomerReservation;
