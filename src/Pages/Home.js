import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import * as ICS from "ics-js";
import { Component, Property } from "immutable-ics";
import { v4 as uuidv4 } from "uuid";
import { saveAs } from "file-saver";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Paper } from "@mui/material";
import Container from "@mui/material/Container";
import timeStringToMins from "../shared/utils/timeStringToMins";
import getTimeBlockLengthInMins from "../shared/utils/getTimeBlockLengthInMins";
import excelDateToJSDate from "../shared/utils/excelDateToJSDate";
import exportCalendarToICS from "../shared/utils/exportCalendarToICS.js";
import "../styles.css";
import CustomAppBar from "../widgets/CustomAppBar.js";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
  height: "100%",
}));

const Home = () => {
  const [calendarData, setCalendarData] = useState([]);

  const handleFileUpload = (event) => {
    // should really do some sort of checking here to see if it's normal
    formatRawCalandarDataAndSetState(event.target.files[0], setCalendarData); //this is such a jank function name
  };

  const handleCalandarExport = () => {
    let cal = new Component({
      name: "VCALENDAR",
      properties: [
        new Property({ name: "VERSION", value: 2 }),
        new Property({
          name: "PRODID",
          value: "WPI Workday To ICal Generator",
        }),
      ],
    });

    calendarData.map((course) => {
      console.log(course);
      if (!course.is_active) {
        console.log("skipping this one.");
        return;
      }
      let [startTime, endTime] = course.meeting_time.split(" - ");
      let timeBlockLength = getTimeBlockLengthInMins(course.meeting_time);
      let timeBlockStartInMins = timeStringToMins(startTime);
      console.log(
        "startMins: ",
        timeBlockStartInMins,
        "length",
        timeBlockLength
      );

      // get date object for DTSTART
      let startDateObject = new Date(
        course.start_date + timeBlockStartInMins * 60000
      );

      let endDateObject = new Date(
        startDateObject.getTime() + timeBlockLength * 60000
      );
      let untilDateObject = new Date(course.end_date + 24 * 60 * 60000);

      console.log(
        "Start:",
        startDateObject.toString(),
        "end:",
        endDateObject.toString()
      );

      let event = new Component({ name: "VEVENT" });
      event = event.pushProperty(
        new Property({
          name: "UID",
          parameters: { VALUE: "TEXT" },
          value: uuidv4(),
        })
      );
      event = event.pushProperty(
        new Property({
          name: "DTSTAMP",
          parameters: { VALUE: "DATE-TIME" },
          value: new Date(),
        })
      );
      event = event.pushProperty(
        new Property({
          name: "DTSTART",
          parameters: { VALUE: "DATE-TIME" },
          value: startDateObject,
        })
      );
      event = event.pushProperty(
        new Property({
          name: "DTEND",
          parameters: { VALUE: "DATE-TIME" },
          value: endDateObject,
        })
      );
      event = event.pushProperty(
        new Property({
          name: "SUMMARY",
          parameters: { VALUE: "TEXT" },
          value: course.course_title,
        })
      );
      event = event.pushProperty(
        new Property({
          name: "LOCATION",
          parameters: { VALUE: "TEXT" },
          value: course.location,
        })
      );
      event = event.pushProperty(
        new Property({
          name: "RRULE",
          // parameters: {VALUE: 'RECUR'},
          value: `FREQ=WEEKLY;BYDAY=${
            course.meeting_days
          };INTERVAL=1;UNTIL=${untilDateObject
            .toISOString()
            .substr(0, 10)
            .replaceAll("-", "")}T000000Z`,
        })
      );

      cal = cal.pushComponent(event);
    });

    console.log(cal.toString());
    let calandarBlob = new Blob([cal.toString()], {
      type: "text/calandar;charset=utf-8",
    });
    saveAs(calandarBlob, "calandar.ics");
  };

  console.log(calendarData);

  return (
    <div>
      <CustomAppBar />
      <Container>
        <div className="heading">
          <h1>Workday Calandar Generator</h1>
          <p>Because I hate manually adding all my classes to outlook.</p>
        </div>

        <div className="fileSelector">
          Exported workday schedule (.xlsx):{" "}
          <input type="file" id="input" onChange={handleFileUpload} />
        </div>
        {calendarData.length == 0 ? null : (
          <>
            <Grid container className="courseGrid">
              <Grid item xs={1}>
                <Item style={{ height: "100%" }}>Active</Item>
              </Grid>
              <Grid item xs={2}>
                <Item>Course Title</Item>
              </Grid>
              <Grid item xs={2}>
                <Item>Instructor</Item>
              </Grid>
              <Grid item xs={3}>
                <Item>Meeting Schedule</Item>
              </Grid>
              <Grid item xs={2}>
                <Item>Course Start</Item>
              </Grid>
              <Grid item xs={2}>
                <Item>Course End</Item>
              </Grid>

              {calendarData.map((schedulingData, index) => {
                return (
                  <>
                    <Grid item xs={1} className="gridItem">
                      <Item>
                        <input
                          type="checkbox"
                          checked={schedulingData.is_active}
                          onChange={() => {
                            let currentCourseData = { ...schedulingData };
                            currentCourseData.is_active =
                              !currentCourseData.is_active;
                            let updatedState = [...calendarData];
                            updatedState[index] = currentCourseData;
                            setCalendarData([...updatedState]);
                          }}
                        ></input>
                      </Item>
                    </Grid>
                    <Grid item xs={2} className="gridItem">
                      <Item>{schedulingData.course_title}</Item>
                    </Grid>
                    <Grid item xs={2} className="gridItem">
                      <Item>{schedulingData.instructor}</Item>
                    </Grid>
                    <Grid item xs={3} className="gridItem">
                      <Item>{schedulingData.meeting_pattern_raw}</Item>
                    </Grid>
                    <Grid item xs={2} className="gridItem">
                      <Item>
                        {new Date(schedulingData.start_date).toDateString()}
                      </Item>
                    </Grid>
                    <Grid item xs={2} className="gridItem">
                      <Item>
                        {new Date(schedulingData.end_date).toDateString()}
                      </Item>
                    </Grid>
                  </>
                );
              })}
            </Grid>

            <div className="exportButton">
              <button onClick={() => exportCalendarToICS(calendarData)}>
                Export Calendar File
              </button>
            </div>
          </>
        )}

        <div className="docsLink">
          New? Check out our <Link to="/docs">docs</Link> to learn how to use
          this site.
        </div>
      </Container>
    </div>
  );
};

/**
 * formatted Data: [{
 *  course_title (aka course listing): '12736127 asdhkfjsdhkfhs',
 *  meeting_days: 'SU,MO,TU,WE,TH,FR,SA',
 *  meeting_time: 10:00 AM - 10:50 AM',
 *  location: 'wherver'
 *  instructor: 'whoever',
 *  start_date: unix_time (MUST CONVERT),
 *  end_date: unix_time (MUST CONVERT)
 * },
 * {...}
 * ]
 */

const formatRawCalandarDataAndSetState = (file, setCalendarData) => {
  let formattedDataArray = [];

  const reader = new FileReader();
  reader.onload = (evt) => {
    // evt = on_file_select event
    /* Parse data */
    console.log(evt);
    const bstr = evt.target.result;

    const wb = XLSX.read(bstr, { type: "binary" });
    /* Get first worksheet */
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    /* Convert array of arrays */
    console.log("ws>>", ws);
    let rawRowArray = XLSX.utils.sheet_to_json(ws, {
      raw: true,
      range: "A1:L44",
    });

    /* Fix key names */
    let badKeyNames = Object.keys(rawRowArray[2]);
    badKeyNames.shift();
    let goodKeyNames = Object.values(rawRowArray[1]);

    for (let i = 2; i < rawRowArray.length; i++) {
      badKeyNames.forEach((badKeyName, index) => {
        rawRowArray[i][goodKeyNames[index]] = rawRowArray[i][badKeyName];
      });
    }

    //shift out the sheet title and column titles
    rawRowArray.shift();
    rawRowArray.shift();

    rawRowArray.forEach((row) => {
      if (!row["Meeting Patterns"]) {
        return;
      }
      let [meeting_days, meeting_time, location] =
        row["Meeting Patterns"].split("|");
      meeting_days = meeting_days.toString();
      console.log(meeting_days);
      meeting_days = meeting_days
        .replaceAll(" ", "")
        .replaceAll("-", ",")
        .replaceAll("M", "MO")
        .replaceAll("T", "TU")
        .replaceAll("W", "WE")
        .replaceAll("R", "TH")
        .replaceAll("F", "FR"); //format data for use as RRULE
      meeting_time = meeting_time.replace(" ", "");
      let startDateString = excelDateToJSDate(
        parseInt(row["Start Date"])
      ).valueOf();
      let endDateString = excelDateToJSDate(
        parseInt(row["End Date"])
      ).valueOf();

      let courseObject = {
        course_title: row["Course Listing"],
        meeting_pattern_raw: row["Meeting Patterns"],
        meeting_days: meeting_days,
        meeting_time: meeting_time,
        location: location,
        instructor: row["Instructor"],
        start_date: startDateString,
        end_date: endDateString,
        is_active: true,
      };
      formattedDataArray.push(courseObject);
    });
    console.log(formattedDataArray);
    setCalendarData([...formattedDataArray]);
  };
  reader.readAsBinaryString(file);

  // fix key names
};

export default Home;
