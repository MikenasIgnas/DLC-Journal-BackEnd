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

export const getUserId = async (req: Request) => {
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

export const convertUTCtoLocalTime = (utcTimestamp: Date | undefined) => {
  if (utcTimestamp) {
    const date            = new Date(utcTimestamp)
    const year            = date.toLocaleString('en-US', { year: 'numeric' })
    const month           = date.toLocaleString('en-US', { month: '2-digit' })
    const day             = date.toLocaleString('en-US', { day: '2-digit' })
    const hours           = date.getHours().toString().padStart(2, '0')
    const minutes         = date.getMinutes().toString().padStart(2, '0')
    const dateTimeString  = `${year} ${month} ${day}, ${hours}:${minutes}`

    return dateTimeString
  }
}
