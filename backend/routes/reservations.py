from db import conn
from fastapi import APIRouter

from models import NewReservation, Reservation, ReservationID
from datetime import datetime, timedelta, date

router = APIRouter()

# Returns a list of all the bookings for a particular date
@router.get("/reservations/{date}")
def get_reservations(date: date):
    reservations = {"reservations": []}

    with conn.cursor() as cur:
        cur.execute("select * from reservations where date=%s order by time", (date,))

        for reservation in cur.fetchall():
            reservations["reservations"].append(
                {
                    "id": reservation[0],
                    "name": reservation[1],
                    "phone": reservation[2],
                    "no_guests": reservation[3],
                    "date": reservation[4],
                    "time": reservation[5],
                }
            )

    return reservations


# Returns the details of a particular reservation
@router.get("/reservations/{reservationID}/details")
def get_details(reservationID: str):
    details = {}

    with conn.cursor() as cur:
        cur.execute("select * from reservations where id=%s", (reservationID,))

        reservation = cur.fetchone()

        details = {
            "id": reservation[0],
            "name": reservation[1],
            "phone": reservation[2],
            "no_guests": reservation[3],
            "date": reservation[4],
            "time": reservation[5],
        }

    return details


# Returns a list of all available booking times for a particular date
# Customers can only make a reservation if there are tables available to book for a specific date and time
@router.get("/reservations/{date}/available-times")
def get_available_times(date: date):

    times = {"times": []}
    opening_time = datetime(date.year, date.month, date.day, 1)
    closing_time = datetime(date.year, date.month, date.day, 22)
    current_time = datetime.now()
    booking_time = opening_time

    with conn.cursor() as cur:
        cur.execute("select count(*) from tables")

        n_tables = cur.fetchone()[0]

        # Customers can reserve any available time if it is before opening hours on the current day
        # They can also reserve any available time if the date is in the future
        # However, customers must book 3 hours in advance on the current day if the restaurant is already open
        if date == current_time.date() and current_time.time() > opening_time.time():
            # Set first potential reservation time to 3 hours from now
            booking_time = datetime(
                date.year, date.month, date.day, current_time.hour + 3
            )

        while booking_time <= closing_time - timedelta(hours=1):
            cur.execute(
                "select count(*) from reservations where date=%s and time=%s",
                (date, booking_time.time()),
            )

            n_reservations = cur.fetchone()[0]

            if n_reservations < n_tables:
                times["times"].append(booking_time.time())

            booking_time += timedelta(hours=1)

    return times


# Adds a reservation for a given date and time along with the customer's name, phone number and number of guests, to the list of reservations in the system
@router.post("/reservations")
def make_reservation(reservation: Reservation):
    date_time = datetime.fromtimestamp(reservation.date / 1000)
    id = ""

    with conn.cursor() as cur:
        cur.execute(
            "insert into reservations (name, phone, no_guests, date, time) values (%s, %s, %s, %s, %s) returning id",
            (
                reservation.name,
                reservation.phone,
                reservation.no_guests,
                date_time.date(),
                date_time.time(),
            ),
        )

        id = cur.fetchone()[0]

    return {"id": id}


# Updates the number of guests, date and time for a reservation based on the reservation ID
@router.put("/reservations")
def edit_reservation(reservation: NewReservation):
    date_time = datetime.fromtimestamp(reservation.date / 1000)

    with conn.cursor() as cur:
        cur.execute(
            "update reservations set no_guests=%s, date=%s, time=%s where id=%s",
            (reservation.no_guests, date_time.date(), date_time.time(), reservation.id),
        )

    return {}


# Deletes a reservation with a particular reservation ID from the list of reservations in the system
@router.delete("/reservations")
def delete_reservation(reservation: ReservationID):

    with conn.cursor() as cur:
        cur.execute("delete from reservations where id=%s", (reservation.id,))

    return {}
