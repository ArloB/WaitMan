import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  IconButton,
  Grid,
  makeStyles,
  Card,
  Button,
  CircularProgress,
  Popover,
  ThemeProvider,
} from "@material-ui/core";

import { createTheme } from "@material-ui/core/styles";

import { ArrowLeft, ArrowRight } from "@material-ui/icons";
import api from "../../axios";
import { toast } from "react-toastify";

const EditCalendar = ({
  availability,
  setAvailability,
  primaryColor = "#AF4670",
  secondaryColor = "#F0D6E8",
  fontFamily = "Roboto",
  fontSize = 12,
  primaryFontColor = "#222222",
  startTime = "11:00",
  endTime = "23:00",
}) => {
  let id = window.location.pathname.split("/")[3];

  const theme = createTheme({
    typography: {
      fontFamily: `${fontFamily}`,
      fontSize: fontSize,
    },
    palette: {
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: secondaryColor,
      },
      text: {
        primary: primaryFontColor,
      },
    },
  });

  const useStyles = makeStyles((theme) => ({
    calendar: {
      fontFamily: theme.typography.fontFamily,
    },
    calendarText: {
      margin: 0,
      width: 25,
      height: 25,
      textAlign: "center",
    },
    button: {
      minWidth: 200,
      margin: 10,
      fontFamily: theme.typography.fontFamily,
    },
    buttonNoMargin: {
      minWidth: 200,
      fontFamily: theme.typography.fontFamily,
    },
    popover: {
      pointerEvents: "none",
      fontFamily: theme.typography.fontFamily,
    },
    paper: {
      padding: theme.spacing(1),
    },
  }));

  const useMonths = (year) => ({
    1: {
      lastDay: 31,
      month: "January",
      firstDay: moment(`01/01/${year}`),
    },
    2: {
      lastDay: year % 4 === 0 ? 29 : 28,
      month: "February",
      firstDay: moment(`02/01/${year}`),
    },
    3: {
      lastDay: 31,
      month: "March",
      firstDay: moment(`03/01/${year}`),
    },
    4: {
      lastDay: 30,
      month: "April",
      firstDay: moment(`04/01/${year}`),
    },
    5: {
      lastDay: 31,
      month: "May",
      firstDay: moment(`05/01/${year}`),
    },
    6: {
      lastDay: 30,
      month: "June",
      firstDay: moment(`06/01/${year}`),
    },
    7: {
      lastDay: 31,
      month: "July",
      firstDay: moment(`07/01/${year}`),
    },
    8: {
      lastDay: 31,
      month: "August",
      firstDay: moment(`08/01/${year}`),
    },
    9: {
      lastDay: 30,
      month: "September",
      firstDay: moment(`09/01/${year}`),
    },
    10: {
      lastDay: 31,
      month: "October",
      firstDay: moment(`10/01/${year}`),
    },
    11: {
      lastDay: 30,
      month: "November",
      firstDay: moment(`11/01/${year}`),
    },
    12: {
      lastDay: 31,
      month: "December",
      firstDay: moment(`12/01/${year}`),
    },
  });

  const getDefaultTimes = () => {
    const times = [
      {
        time: "00:00",
        available: false,
        booked: true,
      },
      {
        time: "01:00",
        available: false,
        booked: true,
      },
      {
        time: "02:00",
        available: false,
        booked: true,
      },
      {
        time: "03:00",
        available: false,
        booked: true,
      },
      {
        time: "04:00",
        available: false,
        booked: true,
      },
      {
        time: "05:00",
        available: false,
        booked: true,
      },
      {
        time: "06:00",
        available: false,
        booked: true,
      },
      {
        time: "07:00",
        available: false,
        booked: true,
      },
      {
        time: "08:00",
        available: false,
        booked: true,
      },
      {
        time: "09:00",
        available: false,
        booked: true,
      },
      {
        time: "10:00",
        available: false,
        booked: true,
      },
      {
        time: "11:00",
        available: false,
        booked: true,
      },
      {
        time: "12:00",
        available: false,
        booked: true,
      },
      {
        time: "13:00",
        available: false,
        booked: true,
      },
      {
        time: "14:00",
        available: false,
        booked: true,
      },
      {
        time: "15:00",
        available: false,
        booked: true,
      },
      {
        time: "16:00",
        available: false,
        booked: true,
      },
      {
        time: "17:00",
        available: false,
        booked: true,
      },
      {
        time: "18:00",
        available: false,
        booked: true,
      },
      {
        time: "19:00",
        available: false,
        booked: true,
      },
      {
        time: "20:00",
        available: false,
        booked: true,
      },
      {
        time: "21:00",
        available: false,
        booked: true,
      },
      {
        time: "22:00",
        available: false,
        booked: true,
      },
      {
        time: "23:00",
        available: false,
        booked: true,
      },
      {
        time: "00:00",
        available: false,
        booked: true,
      },
    ];
    let include = false;
    return times.filter((time) => {
      if (time.time === startTime) {
        include = true;
      }
      if (time.time === endTime) {
        include = false;
        return true;
      }
      return include;
    });
  };

  function TimeButton({ className, start, end, available, handleClick }) {
    return (
      <Button
        onClick={handleClick}
        color={available ? "primary" : "default"}
        className={className}
        variant={available ? "contained" : "outlined"}
      >
        {start} - {end}
      </Button>
    );
  }

  function getDaysArray() {
    return [
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
      ["", "", "", "", "", "", ""],
    ];
  }

  function getDayNamesArray() {
    return [["S", "M", "T", "W", "T", "F", "S"]];
  }

  const convertAvailabilityFromDatabase = (availability) => {
    const output = {};
    for (let range of availability) {
      let start = moment(range.start);
      let startTime = `${start.format("H")}:${start.format("mm")}`;
      let end = moment(range.end);
      let endTime = `${end.format("H")}:${end.format("mm")}`;
      let year = Number(start.format("YYYY"));
      let month = start.format("MMMM");
      let day = Number(start.format("D"));
      fillOutputWithDefaultTimes(output, year, month, day);
      let i = 0;
      while (
        i < output[year][month][day].length &&
        output[year][month][day][i].time !== startTime
      )
        i++;
      while (
        i < output[year][month][day].length &&
        output[year][month][day][i].time !== endTime
      ) {
        output[year][month][day][i].available = true;
        i++;
      }
    }
    return output;
  };

  const convertAvailabilityForDatabase = (availability) => {
    const output = [];
    for (let year in availability) {
      for (let month in availability[year]) {
        for (let day in availability[year][month]) {
          let activeDay = availability[year][month][day];
          addActiveDayToOutput(activeDay, output, month, day, year);
        }
      }
    }
    return output;
  };

  /*const combineTimeArrays = (a, b) => {
        for (let i = 0; i < a.length; i++) {
            a[i].available = a[i].available || b[i].available;
        }
        return a;
    };*/

  function addActiveDayToOutput(activeDay, output, month, day, year) {
    let activeRangeStart = null;
    for (let time of activeDay) {
      if (time.available && !activeRangeStart) activeRangeStart = time.time;
      else if (!time.available && activeRangeStart) {
        output.push({
          start: new Date(`${month} ${day} ${year} ${activeRangeStart}`),
          end: new Date(`${month} ${day} ${year} ${time.time}`),
        });
        activeRangeStart = null;
      }
    }
  }

  function fillOutputWithDefaultTimes(output, year, month, day) {
    if (output.hasOwnProperty(year)) {
      if (output[year].hasOwnProperty(month)) {
        if (!output[year][month].hasOwnProperty(day)) {
          output[year][month][day] = getDefaultTimes();
        }
      } else {
        output[year][month] = {
          [day]: getDefaultTimes(),
        };
      }
    } else {
      output[year] = {
        [month]: {
          [day]: getDefaultTimes(),
        },
      };
    }
  }

  function makeQuickAvailability(availability) {
    const output = {};
    for (let range of availability) {
      if (new Date(range.start) > new Date()) {
        let day = moment(range.start).format("MMMM D, YYYY");
        let time = `${moment(range.start).format("H:mm")} - ${moment(
          range.end
        ).format("H:mm")}`;
        if (output[day]) {
          output[day].push(time);
        } else {
          output[day] = [time];
        }
      }
    }
    return output;
  }
  return function Calendar() {
    const classes = useStyles();
    const today = moment();
    const [availabilityState, setAvailabilityState] = useState(
      convertAvailabilityFromDatabase(availability)
    );
    const [quickAvailability, setQuickAvailability] = useState(
      makeQuickAvailability(availability)
    );
    const [bookedDay, setBookedDay] = useState();
    const [bookedMonth, setBookedMonth] = useState();
    const [bookedYear, setBookedYear] = useState();
    const [bookedTime, setBookedTime] = useState();

    const [reservationDetails, setReservationDetails] = useState({});
    useEffect(() => {
      api.get(`/reservations/${id}/details`).then((response) => {
        setReservationDetails(response);
        document.getElementById("visitors").value = response.no_guests;
        let date = response.date;
        let time = response.time;
        setBookedDay(Number(date.split("-")[2]));
        setBookedMonth(Number(date.split("-")[1]));
        setBookedYear(Number(date.split("-")[0]));
        setBookedTime(time.split(":")[0] + ":" + time.split(":")[1]);
      });
    }, []);

    const [activeDay, setActiveDay] = useState(null);
    const [year, setYear] = useState(Number(today.format("YYYY")));
    const [monthNumber, setMonthNumber] = useState(Number(today.format("M")));
    // const [settingMultiple, setSettingMultiple] = useState(false);
    const months = useMonths(year);
    const { firstDay, month, lastDay } = months[monthNumber];
    let dayOfWeek = Number(moment(firstDay).format("d"));
    const days = getDaysArray();
    const dayNames = getDayNamesArray();
    const [times, setTimes] = useState(getDefaultTimes());
    const [saving, setSaving] = useState(false);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [selectedDay, setSelectedDay] = useState();
    const [showTimes, setShowTimes] = useState(false);
    let week = 0;
    let dayOfMonth = 1;
    while (week < 6 && dayOfMonth <= lastDay) {
      days[week][dayOfWeek] = dayOfMonth;
      dayOfMonth++;
      dayOfWeek++;
      if (dayOfWeek === 7) {
        week++;
        dayOfWeek = 0;
      }
    }
    const createArrowHandler = (delta) => () => {
      let newMonth = monthNumber + delta;
      if (newMonth > 12) {
        setYear(year + 1);
        newMonth = 1;
      } else if (newMonth < 1) {
        setYear(year - 1);
        newMonth = 12;
      }
      setActiveDay(null);
      setTimes(getDefaultTimes());
      setMonthNumber(newMonth);
    };
    const createTimeHandler = (i) => () => {
      const newTimes = [...times];
      if (activeDay) {
        addTimeToDay(newTimes, i);
      }
    };
    const checkTimeAvailability = (time) => {
      let newTimes = [...times];
      for (let i = 0; i < availableTimes.length; i++) {
        availableTimes[i] =
          availableTimes[i].split(":")[0] +
          ":" +
          availableTimes[i].split(":")[1];
        for (let j = 0; j < newTimes.length; j++) {
          if (newTimes[j].time === availableTimes[i]) {
            newTimes[j].booked = false;
          }
        }
      }
      let canBeBooked = true;
      for (let i = 0; i < newTimes.length; i++) {
        if (newTimes[i].time === time.time) {
          if (newTimes[i].booked) {
            canBeBooked = false;
          }
        }
      }
      if (time.time === bookedTime) {
        if (
          bookedDay === selectedDay &&
          bookedMonth === monthNumber &&
          bookedYear === year
        ) {
          return true;
        }
      }
      return (
        time.available &&
        canBeBooked &&
        !(
          time.time <
            parseInt(today.format("HH:mm").split(":")[0]) +
              2 +
              ":" +
              today.format("HH:mm").split(":")[1] &&
          selectedDay === today.format("DD") &&
          monthNumber === today.format("MM") &&
          year === today.format("YYYY")
        )
      );
    };
    const createDayHandler = (day) => () => {
      setSelectedDay(day);
      setShowTimes(true);
      let currDate = year + "-" + monthNumber + "-" + day;
      api.get(`/reservations/${currDate}/available-times`).then((response) => {
        setAvailableTimes(response.times);
      });
      /*if (settingMultiple) {
                addTimesToDay(day);
            } else {*/
      examineAvailabilityForDay(day);
      //}
    };

    /*const handleSetMultiple = () => {
            setActiveDay(null);
            setSettingMultiple(!settingMultiple);
        };*/

    const handleJumpToCurrent = () => {
      setYear(Number(today.format("YYYY")));
      setMonthNumber(Number(today.format("M")));
      setActiveDay(null);
      setTimes(getDefaultTimes());
    };
    const [anchorEl, setAnchorEl] = useState(null);
    const [popoverContent, setPopoverContent] = useState(null);

    const handleOpenPopover = (date) => {
      return (e) => {
        if (quickAvailability[date]) {
          setPopoverContent(
            quickAvailability[date].map((time) => <p>{time}</p>)
          );
          setAnchorEl(e.target);
        }
      };
    };
    const handleClosePopover = () => {
      setAnchorEl(null);
      setPopoverContent(null);
    };

    const navigate = useNavigate();

    const reservationData = {
      id: id,
      no_guests: 0,
      date: 0,
    };
    const reservationID = {
      id: id,
    };

    async function handleBooking() {
      setSaving(true);
      reservationData.no_guests = document.getElementById("visitors").value;
      let noChanges = false;
      if (reservationData.no_guests < 1) {
        toast.error("You cannot have no guests");
        setSaving(false);
      } else {
        const data = convertAvailabilityForDatabase(availabilityState);
        if (data.length === 0) {
          let defaultDate = new Date();
          defaultDate.setDate(bookedDay);
          defaultDate.setMonth(bookedMonth - 1);
          defaultDate.setFullYear(bookedYear);
          defaultDate.setHours(bookedTime.split(":")[0]);
          defaultDate.setMinutes(bookedTime.split(":")[1]);
          defaultDate.setSeconds(0);
          reservationData.date = Date.parse(defaultDate);
          noChanges = true;
        } else {
          reservationData.date = Date.parse(data[0]["start"]);
        }
        if (
          reservationData.no_guests === reservationDetails.no_guests &&
          noChanges
        ) {
          toast.error("You have not made any changes");
          setSaving(false);
        } else {
          api.put(`/reservations`, reservationData).then(() => {
            toast.success("Reservation updated");
            window.location.reload(false);
            setSaving(false);
          });
        }
      }
    }

    const removeBooking = () => {
      api.delete(`/reservations`, { data: reservationID }).then(() => {
        navigate(`/`);
      });
    };

    return (
      <div>
        <ThemeProvider theme={theme}>
          <Grid
            style={{ paddingTop: 60 }}
            className={classes.calendar}
            container
            direction="column"
            alignItems="center"
          >
            <div
              className="card p-8 mr-8 ml-8 mb-10"
              style={{ backgroundColor: "white" }}
            >
              <div className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black pt-2 pb-3">
                <h1>Update Reservation </h1>
              </div>
              <Grid item>
                <Grid
                  container
                  direction="row"
                  alignItems="center"
                  justify="center"
                >
                  <Grid item>
                    <Grid
                      container
                      justify="center"
                      alignments="center"
                      wrap="wrap"
                    >
                      <Grid item>
                        <Grid
                          container
                          direction="column"
                          alignItems="center"
                          wrap="wrap"
                        >
                          <div className="text-center lg:text-4xl text-3xl font-black leading-10 text-black-800 dark:text-black pt-2 pb-3">
                            <h1> Booking for: </h1>
                          </div>
                          <div className="text-center">
                            <label
                              for="name"
                              className="block text-sm font-medium text-black text-center"
                            >
                              Name:
                            </label>
                            {reservationDetails?.name}
                            <label
                              for="phone"
                              className="block text-sm font-medium text-black"
                            >
                              Phone number:
                            </label>
                            {reservationDetails?.phone}
                          </div>
                          <div>
                            <label
                              for="visitors"
                              className="block mb-2 mt-2 text-sm font-medium text-black"
                            >
                              Number of Guests
                            </label>
                            <input
                              type="number"
                              id="visitors"
                              className="bg-white border border-neutral text-gray-900 text-sm rounded-lg block w-full p-2.5"
                              placeholder={reservationDetails?.no_guests}
                              required
                            />
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item>
                    <IconButton
                      disabled={
                        year === Number(today.format("YYYY")) &&
                        month === today.format("MMMM")
                      }
                      onClick={createArrowHandler(-1)}
                    >
                      <ArrowLeft />
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Card
                      style={{ padding: 10, margin: 10 }}
                      variant="outlined"
                    >
                      <Grid container direction="column" alignItems="center">
                        <h3>
                          {month} {year}
                        </h3>
                        {dayNames.map((week, i) => (
                          <Grid key={i} item>
                            <Grid container direction="row">
                              {week.map((day, i) => (
                                <Grid key={year + month + i} item>
                                  <IconButton
                                    disabled
                                    style={{ color: "black" }}
                                  >
                                    <p className={classes.calendarText}>
                                      {day}
                                    </p>
                                  </IconButton>
                                </Grid>
                              ))}
                            </Grid>
                          </Grid>
                        ))}
                        {days.map((week, i) => (
                          <Grid key={i} item>
                            <Grid container direction="row">
                              {week.map((day, i) => (
                                <Grid key={year + month + i} item>
                                  <IconButton
                                    onClick={createDayHandler(day)}
                                    color={
                                      activeDay === day || day === bookedDay
                                        ? "primary"
                                        : availabilityState[year] &&
                                          availabilityState[year][month] &&
                                          availabilityState[year][month][day] &&
                                          availabilityState[year][month][
                                            day
                                          ].filter((x) => x.available).length >
                                            0
                                        ? "secondary"
                                        : "default"
                                    }
                                    disabled={
                                      !day ||
                                      (year === Number(today.format("YYYY")) &&
                                        month === today.format("MMMM") &&
                                        day < Number(today.format("D")))
                                    }
                                    size="medium"
                                    onMouseEnter={handleOpenPopover(
                                      `${month} ${day}, ${year}`
                                    )}
                                    onMouseLeave={handleClosePopover}
                                  >
                                    <p className={classes.calendarText}>
                                      {day}
                                    </p>
                                  </IconButton>
                                </Grid>
                              ))}
                            </Grid>
                          </Grid>
                        ))}
                        <Popover
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "center",
                          }}
                          className={classes.popover}
                          classes={{ paper: classes.paper }}
                          anchorEl={anchorEl}
                          open={!!anchorEl}
                        >
                          {popoverContent}
                        </Popover>
                        <Button
                          disabled={
                            year === Number(today.format("YYYY")) &&
                            month === today.format("MMMM")
                          }
                          onClick={handleJumpToCurrent}
                          className={classes.buttonNoMargin}
                        >
                          Jump to Current Month
                        </Button>
                      </Grid>
                    </Card>
                  </Grid>
                  <Grid item>
                    <IconButton onClick={createArrowHandler(1)}>
                      <ArrowRight />
                    </IconButton>
                  </Grid>

                  <Grid item>
                    {showTimes ? (
                      <Grid
                        container
                        justify="center"
                        alignItems="center"
                        wrap="wrap"
                      >
                        <Grid item>
                          <Grid
                            container
                            direction="column"
                            alignItems="center"
                            wrap="wrap"
                          >
                            {times.map(
                              (time, i) =>
                                i < times.length - 7 && (
                                  <TimeButton
                                    key={time.time}
                                    className={classes.button}
                                    start={time.time}
                                    end={times[i + 1].time}
                                    handleClick={createTimeHandler(i)}
                                    available={checkTimeAvailability(time)}
                                  />
                                )
                            )}
                          </Grid>
                        </Grid>
                        <Grid item>
                          <Grid
                            container
                            direction="column"
                            alignItems="center"
                            wrap="wrap"
                          >
                            {times.map(
                              (time, i) =>
                                i < times.length - 1 &&
                                i > 5 && (
                                  <TimeButton
                                    key={time.time}
                                    className={classes.button}
                                    start={time.time}
                                    end={times[i + 1].time}
                                    handleClick={createTimeHandler(i)}
                                    available={checkTimeAvailability(time)}
                                  />
                                )
                            )}
                          </Grid>
                        </Grid>
                      </Grid>
                    ) : null}
                  </Grid>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    direction="row"
                    alignItems="center"
                    justify="center"
                  >
                    <Grid item>
                      {saving ? (
                        <CircularProgress />
                      ) : (
                        <Button
                          color="primary"
                          variant="contained"
                          onClick={handleBooking}
                          className={classes.button}
                        >
                          Update Booking
                        </Button>
                      )}
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={removeBooking}
                        className={classes.button}
                      >
                        Cancel Booking
                      </Button>
                      <Button
                        color="primary"
                        variant="contained"
                        onClick={() => navigate("/")}
                        className={classes.button}
                      >
                        Cancel Update
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </ThemeProvider>
      </div>
    );

    function addTimeToDay(newTimes, i) {
      const newAvail = availabilityState;

      for (const year in newAvail) {
        for (const month in newAvail[year]) {
          for (const day in newAvail[year][month]) {
            newAvail[year][month][day].forEach((_, index) => {
              newAvail[year][month][day][index].available = false;
            });
          }
        }
      }

      newTimes[i].available = !newTimes[i].available;
      setTimes(newTimes);

      if (newAvail.hasOwnProperty(year)) {
        if (newAvail[year].hasOwnProperty(month)) {
          newAvail[year][month][activeDay] = newTimes;
        } else {
          newAvail[year][month] = {
            [activeDay]: newTimes,
          };
        }
      } else {
        newAvail[year] = {
          [month]: {
            [activeDay]: newTimes,
          },
        };
      }
      setAvailabilityState(newAvail);
      setQuickAvailability(
        makeQuickAvailability(convertAvailabilityForDatabase(newAvail))
      );
    }

    function examineAvailabilityForDay(day) {
      if (
        availabilityState[year] &&
        availabilityState[year][month] &&
        availabilityState[year][month][day]
      ) {
        setTimes(availabilityState[year][month][day]);
      } else {
        setTimes(getDefaultTimes());
      }
      setActiveDay(day);
    }
  };
};

export default EditCalendar;
