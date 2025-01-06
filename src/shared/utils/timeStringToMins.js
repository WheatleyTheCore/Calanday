const timeStringToMins = (timeString) => {
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

export default timeStringToMins