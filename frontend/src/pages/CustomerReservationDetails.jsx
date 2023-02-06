function CustomerReservationDetails() {
  let id = window.location.pathname.split("/")[2];

  return (
    <div
      className="card pt-4 pb-4 pr-4 pl-4 mb-10 mt-10 ml-5 mr-5"
      style={{ backgroundColor: "white" }}
    >
      <div className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black pt-2 pb-3">
        <h1>
          {" "}
          Thank you for booking with us! Your Booking ID is: <br></br>
        </h1>
        <h1>
          {" "}
          {id} <br></br>
        </h1>
        <h1>
          {" "}
          Please record your Booking ID somewhere safe as you need it to edit or
          cancel your reservation. Thank you!
        </h1>
      </div>
    </div>
  );
}

export default CustomerReservationDetails;
