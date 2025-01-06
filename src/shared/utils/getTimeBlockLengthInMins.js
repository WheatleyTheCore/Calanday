import timeStringToMins from './timeStringToMins'

const getTimeBlockLengthInMins = (timeString) => {

    let [startTime, endTime] = timeString.split(" - ")
    let mins = timeStringToMins(endTime) - timeStringToMins(startTime)
    return mins
}



export default getTimeBlockLengthInMins