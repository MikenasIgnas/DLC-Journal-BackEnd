import { Request }        from 'express'
import jwt                from 'jsonwebtoken'

import { DecodedToken }   from './controllers/authControllers/types'
import { RequestQuery }   from './types'


export const getCurrentDate = () => {
  const currentdate = new Date()
  const year = currentdate.getFullYear()
  const month = (currentdate.getMonth() + 1).toString().padStart(2, '0')
  const day = currentdate.getDate().toString().padStart(2, '0')
  const formattedDate = `${year}-${month}-${day}`

  return formattedDate
}

export const parseDateToString = (date?: Date) => {
  if (date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    return formattedDate
  }
}

export const parseDateTimeToString = (date?: Date) => {
  if (date) {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    const currentTime = date.getHours() + ':' + date.getMinutes()

    const formattedDate = `${year}-${month}-${day} ${currentTime}`

    return formattedDate
  }
}

export const getCurrentTime  = () => {
  const currentdate = new Date()
  const currentTime = currentdate.getHours() + ':' + currentdate.getMinutes()

  return currentTime.padStart(2, '0')
}

export const getCurrentDateTime = () => {
  const currentdate =  getCurrentDate()
  const currentTime = getCurrentTime()
  const dateTime = `${currentdate} ${currentTime}`

  return dateTime
}

export const getPagination = (page?: RequestQuery, limit?: RequestQuery) => {
  const parsedLimit = typeof limit === 'string' ? parseInt(limit) : undefined

  const skip = typeof page === 'string' && typeof limit === 'string' ?
    (parseInt(page) - 1) * parseInt(limit) :
    0

  return {
    parsedLimit: parsedLimit ? parsedLimit : 0,
    skip:        skip >= 0 ? skip : 0,
  }
}


export const getLoggedInUserId = async (req: Request) => {
  const token = req.headers['token']

  if (typeof token === 'string') {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY) as DecodedToken

    return decoded?.userId
  }
}

export const calculateTimeDifference = (startDate: Date | undefined, endDate: Date | undefined) => {
  if (startDate && endDate) {
    const startDateTime   = new Date(`${startDate}`)
    const endDateTime     = new Date(`${endDate}`)
    const timeDifference  = Number(endDateTime) - Number(startDateTime)
    const hours           = Math.floor(timeDifference / (1000 * 60 * 60))
    const minutes         = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60))
    const result          = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`

    return result
  } else {
    return
  }
}

export const convertUTCtoLocalDateTime = (utcTimestamp: Date | undefined) => {
  if (utcTimestamp) {
    const dateObject = new Date(utcTimestamp)

    const year = dateObject.toLocaleString('en-US', { year: 'numeric' })
    const month = dateObject.toLocaleString('en-US', { month: '2-digit' })
    const day = dateObject.toLocaleString('en-US', { day: '2-digit' })

    const hour = dateObject.toLocaleString('en-US', { hour: '2-digit', hour12: false })
    const minute = dateObject.toLocaleString('en-US', { minute: '2-digit' })

    const localDateTimeString = `${year}-${month}-${day} ${hour}:${minute}`
    return localDateTimeString
  }
  return
}
