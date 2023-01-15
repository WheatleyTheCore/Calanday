import React, { useState } from 'react'
import { Link } from "react-router-dom"
import * as XLSX from 'xlsx';
import * as ICS from 'ics-js'
import { Component, Property } from 'immutable-ics'
import { v4 as uuidv4 } from 'uuid';
import { saveAs } from 'file-saver';



const Home = () => {

    const [formattedSchedulingData, setFormattedSchedulingData] = useState([]);


    const handleFileSelected = (event) => {
        formatRawCalandarDataAndSetState(event.target.files[0], setFormattedSchedulingData) //this is such a jank function name
    }

    const handleCalandarExport = () => {
        //const cal = new ICS.VCALENDAR();
        let cal = new Component({
            name: 'VCALENDAR',
            properties: [
              new Property({ name: 'VERSION', value: 2 }),
              new Property({ name: 'PRODID', value: 'WPI Workday To ICal Generator'})
            ]
        })


        formattedSchedulingData.map(course => {
            console.log(course)
            let [startTime, endTime] = course.meeting_time.split(" - ")
            let timeBlockLength = getTimeBlockLengthInMins(course.meeting_time)
            let timeBlockStartInMins = convertTimeStringToMinutes(startTime)
            console.log('startMins: ', timeBlockStartInMins, 'length', timeBlockLength)

            // get date object for DTSTART
            let startDateObject = new Date(course.start_date + timeBlockStartInMins * 60000)

            let endDateObject = new Date(startDateObject.getTime() + timeBlockLength * 60000)
            let untilDateObject = new Date(course.end_date + 24 * 60 * 60000)

            console.log('Start:', startDateObject.toString(), "end:", endDateObject.toString())

            let event = new Component({ name: 'VEVENT' })
            event = event.pushProperty(new Property({
                name: 'UID',
                parameters: {VALUE: 'TEXT'},
                value: uuidv4()
            }))
            event = event.pushProperty(new Property({
                name: 'DTSTAMP',
                parameters: {VALUE: 'DATE-TIME'},
                value: new Date()
            }))
            event = event.pushProperty(new Property({
                name: 'DTSTART',
                parameters: {VALUE: 'DATE-TIME'},
                value: startDateObject
            }))
            event = event.pushProperty(new Property({
                name: 'DTEND',
                parameters: {VALUE: 'DATE-TIME'},
                value: endDateObject
            }))
            event = event.pushProperty(new Property({
                name: 'SUMMARY',
                parameters: {VALUE: 'TEXT'},
                value: course.course_title
            }))
            event = event.pushProperty(new Property({
                name: 'LOCATION',
                parameters: {VALUE: 'TEXT'},
                value: course.location
            }))
            event = event.pushProperty(new Property({
                name: 'RRULE',
                // parameters: {VALUE: 'RECUR'},
                value: `FREQ=WEEKLY;BYDAY=${course.meeting_days};INTERVAL=1;UNTIL=${untilDateObject.toISOString().substr(0, 10).replaceAll("-", "")}T000000Z`
            }))

            cal = cal.pushComponent(event)
        })

        console.log(cal.toString())
        let calandarBlob = new Blob([cal.toString()], {type: "text/calandar;charset=utf-8"});
        saveAs(calandarBlob, "calandar.ics");


    }




    return (
        <div>
            <p>Main page!</p>
            <Link to="/docs">How do I use this?</Link>
            <hr />
            <input type="file" id="input" onChange={handleFileSelected} />

            {/* <div className='courseTable'>
                <div className='courseTableRow'>
                    <div>Course Title</div>
                    <div>Instructor</div>
                    <div></div>
                </div>
                {formattedSchedulingData.map(schedulingData => {
                    <div className='courseEntry'>
                        <div></div>
                    </div>
                })}

            </div> */}

            <button onClick={handleCalandarExport}>Export Calendar File</button>

        </div>
    )
}

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

const formatRawCalandarDataAndSetState = (file, setFormattedSchedulingData) => {
    let formattedDataArray = []

    const reader = new FileReader();
    reader.onload = (evt) => { // evt = on_file_select event
        /* Parse data */
        console.log(evt)
        const bstr = evt.target.result;

        const wb = XLSX.read(bstr, { type: 'binary' });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        console.log('ws>>', ws)
        let rawRowArray = (XLSX.utils.sheet_to_json(ws, { raw: true, range: "A1:L13" }));

        /* Fix key names */
        let badKeyNames = Object.keys(rawRowArray[2])
        badKeyNames.shift()
        let goodKeyNames = Object.values(rawRowArray[1])

        for (let i = 2; i < rawRowArray.length; i++) {
            badKeyNames.forEach((badKeyName, index) => {

                rawRowArray[i][goodKeyNames[index]] = rawRowArray[i][badKeyName]
            })
        }


        //shift out the sheet title and column titles 
        rawRowArray.shift()
        rawRowArray.shift()


        rawRowArray.forEach(row => {
            let [meeting_days, meeting_time, location] = row["Meeting Patterns"].split("|")
            meeting_days = meeting_days.toString()
            console.log(meeting_days)
            meeting_days = meeting_days.replaceAll(" ", "").replaceAll("-", ",").replaceAll("M", "MO").replaceAll("T", "TU").replaceAll("W", "WE").replaceAll("R", "TH").replaceAll("F", "FR") //format data for use as RRULE
            meeting_time = meeting_time.replace(" ",  '')
            let startDateString = ExcelDateToJSDate(parseInt(row["Start Date"])).valueOf()
            let endDateString = ExcelDateToJSDate(parseInt(row["End Date"])).valueOf()

            let courseObject = {
                course_title: row["Course Listing"],
                meeting_days: meeting_days,
                meeting_time: meeting_time,
                location: location,
                instructor: row["Instructor"],
                start_date: startDateString,
                end_date: endDateString

            }
            formattedDataArray.push(courseObject)
        })


    };
    reader.readAsBinaryString(file);
    setFormattedSchedulingData(formattedDataArray)

    // fix key names


}

function ExcelDateToJSDate(serial) {
    var utc_days = Math.floor(serial - 25568);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);

    var fractional_day = serial - Math.floor(serial) + 0.0000001;

    var total_seconds = Math.floor(86400 * fractional_day);

    var seconds = total_seconds % 60;

    total_seconds -= seconds;

    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
}

const getTimeBlockLengthInMins = (timeString) => {

    let [startTime, endTime] = timeString.split(" - ")
    let mins = convertTimeStringToMinutes(endTime) - convertTimeStringToMinutes(startTime)
    return mins
}

const convertTimeStringToMinutes = (timeString) => {
    let totalMins
    if (timeString.includes("PM")) {
        timeString.replace(" PM", "")
        let [hours, mins] = timeString.split(":")

        hours = parseInt(hours)
        mins = parseInt(mins)
        if (hours != 12) hours += 12

        mins += hours * 60
        totalMins = mins
    } else {
        timeString.replace(" AM", "")
        let [hours, mins] = timeString.split(":")
        hours = parseInt(hours)
        mins = parseInt(mins)

        mins += hours * 60
        totalMins = mins
    }
    return totalMins
}

export default Home