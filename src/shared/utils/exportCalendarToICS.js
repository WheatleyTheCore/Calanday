import { saveAs } from 'file-saver';
import timeStringToMins from './timeStringToMins'
import getTimeBlockLengthInMins from './getTimeBlockLengthInMins'
import excelDateToJSDate from './excelDateToJSDate'
import * as ICS from 'ics-js'
import { Component, Property } from 'immutable-ics'
import { v4 as uuidv4 } from 'uuid';


const exportCalendarToICS = calendarObject => {
        let cal = new Component({
            name: 'VCALENDAR',
            properties: [
                new Property({ name: 'VERSION', value: 2 }),
                new Property({ name: 'PRODID', value: 'WPI Workday To ICal Generator' })
            ]
        })


        calendarObject.map(course => {
            console.log(course)
            if (!course.is_active) {
                console.log("skipping this one.")
                return
            }
            let [startTime, endTime] = course.meeting_time.split(" - ")
            let timeBlockLength = getTimeBlockLengthInMins(course.meeting_time)
            let timeBlockStartInMins = timeStringToMins(startTime)
            console.log('startMins: ', timeBlockStartInMins, 'length', timeBlockLength)

            // get date object for DTSTART
            let startDateObject = new Date(course.start_date + timeBlockStartInMins * 60000)

            let endDateObject = new Date(startDateObject.getTime() + timeBlockLength * 60000)
            let untilDateObject = new Date(course.end_date + 24 * 60 * 60000)

            console.log('Start:', startDateObject.toString(), "end:", endDateObject.toString())

            let event = new Component({ name: 'VEVENT' })
            event = event.pushProperty(new Property({
                name: 'UID',
                parameters: { VALUE: 'TEXT' },
                value: uuidv4()
            }))
            event = event.pushProperty(new Property({
                name: 'DTSTAMP',
                parameters: { VALUE: 'DATE-TIME' },
                value: new Date()
            }))
            event = event.pushProperty(new Property({
                name: 'DTSTART',
                parameters: { VALUE: 'DATE-TIME' },
                value: startDateObject
            }))
            event = event.pushProperty(new Property({
                name: 'DTEND',
                parameters: { VALUE: 'DATE-TIME' },
                value: endDateObject
            }))
            event = event.pushProperty(new Property({
                name: 'SUMMARY',
                parameters: { VALUE: 'TEXT' },
                value: course.course_title
            }))
            event = event.pushProperty(new Property({
                name: 'LOCATION',
                parameters: { VALUE: 'TEXT' },
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
        let calandarBlob = new Blob([cal.toString()], { type: "text/calandar;charset=utf-8" });
        saveAs(calandarBlob, "calandar.ics");
    }

export default exportCalendarToICS