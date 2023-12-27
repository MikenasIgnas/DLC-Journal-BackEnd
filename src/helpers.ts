import { Request }        from 'express'
import jwt                from 'jsonwebtoken'

import { DecodedToken }   from './controllers/authControllers/types'
import { requestRequery } from "./types"


export const getCurrentDate = () =>  {
    const currentdate = new Date()
    const datetime = currentdate.getFullYear() + '/'
                    + (currentdate.getMonth()+1) + '/'
                    + currentdate.getDate()
    return datetime
}


export const getCurrentTime  = () => {
    const currentdate = new Date()
    const currentTime = currentdate.getHours() + ':'
                    + currentdate.getMinutes()
    return currentTime
}


export const getPagination = (page?: requestRequery, limit?: requestRequery) => {
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
