const getCurrentDate = () =>  {
    const currentdate = new Date()
    const datetime = currentdate.getFullYear() + '/'
                    + (currentdate.getMonth()+1) + '/'
                    + currentdate.getDate()
    return datetime
}
  
const getCurrentTime  = () => {
    const currentdate = new Date()
    const currentTime = currentdate.getHours() + ':'
                    + currentdate.getMinutes()
    return currentTime
}

module.exports = {
    getCurrentDate,
    getCurrentTime
};