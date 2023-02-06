import BackButton from "./Components/BackButton";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import api from "../axios";

function Reservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const reservationID = {
    id: 0,
  };
  let date = window.location.pathname.split("/")[3];
  let today = moment().format("YYYY-MM-DD");
  let sameDay = false;
  if (date === today) {
    sameDay = true;
  }

  useEffect(() => {
    api.get(`/reservations/${date}`).then((response) => {
      setReservations(response.reservations);
    });
  }, [date]);

  const nextBookings = () => {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    let nextDate = newDate.toISOString().split("T")[0];
    navigate(`/waitstaff/reservations/${nextDate}`);
    window.location.reload(false);
  };

  const prevBookings = () => {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    let prevDate = newDate.toISOString().split("T")[0];
    navigate(`/waitstaff/reservations/${prevDate}`);
    window.location.reload(false);
  };

  const removeBooking = () => {
    reservationID.id = document.getElementById("toDelete").value;
    api.delete(`/reservations`, { data: reservationID }).then(() => {
      window.location.reload(false);
    });
  };

  return (
    <div className="min-h-screen">
      <div className="">
        <BackButton to="/waitstaff" />
        <br></br>
        <div className="flex justify-center pt-5 min-h-screen">
          <div
            className="card pt-2 pb-4 mt-4 mr-8 ml-8 mb-10"
            style={{ backgroundColor: "white" }}
          >
            <div className="card-body">
              <div className="text-center">
                <span className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black pt-2 pb-3">
                  <button onClick={prevBookings} disabled={sameDay}>
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke={sameDay ? "#6B7280" : "currentColor"}
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: "inline-block" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                      />
                    </svg>
                  </button>
                  &nbsp; &nbsp; Reservations for {date} &nbsp; &nbsp;
                  <button onClick={nextBookings}>
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ display: "inline-block" }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </span>
              </div>
              <table
                className="table-fixed w-3/4 self-center"
                style={{ marginLeft: "200px" }}
              >
                <thead>
                  <tr className="border-collapse border-solid">
                    <th
                      scope="col"
                      className="text-center border-b-2 border-black"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="text-center border-b-2 border-black"
                    >
                      Phone Number
                    </th>
                    <th
                      scope="col"
                      className="text-center border-b-2 border-black"
                    >
                      Number of Guests
                    </th>
                    <th
                      scope="col"
                      className="text-center border-b-2 border-black"
                    >
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((reservation, index) => {
                    return (
                      <tr key={index}>
                        <td className="text-left">{reservation.name}</td>
                        <td className="text-center">{reservation.phone}</td>
                        <td className="text-center">{reservation.no_guests}</td>
                        <td className="text-center">
                          {reservation.time.split(":")[0]}:
                          {reservation.time.split(":")[1]}
                        </td>
                        <td className="text-left pl-4">
                          <button
                            onClick={removeBooking}
                            id="toDelete"
                            value={reservation.id}
                          >
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
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
    </div>
  );
}

export default Reservations;
