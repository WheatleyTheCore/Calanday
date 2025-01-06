const updateCalendarObject = (newData, calendarItemIndex, fieldName, calendarData, setCalendarData) => {
    let updatedCalendarData = [...calendarData]
    updatedCalendarData[calendarItemIndex][fieldName] = newData
    setCalendarData(updatedCalendarData)
}

export default updateCalendarObject