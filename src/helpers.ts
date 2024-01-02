import { Request }        from 'express'
import jwt                from 'jsonwebtoken'

import { DecodedToken }   from './controllers/authControllers/types'
import { requestQuery }   from "./types"


export const getCurrentDate = () => {
  const currentdate = new Date()
  const year = currentdate.getFullYear()
  const month = (currentdate.getMonth() + 1).toString().padStart(2, '0')
  const day = currentdate.getDate().toString().padStart(2, '0')

  const formattedDate = `${year}-${month}-${day}`
  return formattedDate
}

export const getCurrentTime  = () => {
    const currentdate = new Date()
    const currentTime = currentdate.getHours() + ':'
                    + currentdate.getMinutes()
    return currentTime.padStart(2, '0')
}


export const getPagination = (page?: requestQuery, limit?: requestQuery) => {
  const parsedLimit = typeof limit === 'string' ? parseInt(limit) : undefined

  const skip = typeof page === 'string' && typeof limit === 'string' ? (parseInt(page) - 1) * parseInt(limit) : 0

  return {
    parsedLimit: parsedLimit ? parsedLimit : 0,
    skip: skip >= 0 ? skip : 0
  }
}


export const getLoggedInUserId = async (req: Request) => {
  const token = req.headers['token']

  if (typeof token === 'string') {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY) as DecodedToken

    return decoded?.userId
  }
}
