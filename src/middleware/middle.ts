import {
  Response,
  Request,
  NextFunction
}                            from 'express'
import jwt                   from 'jsonwebtoken'

import { DecodedToken }      from '../controllers/authControllers/types'
import { getLoggedInUserId } from '../helpers'
import UserSchema            from '../shemas/UserSchema'


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['token']
    if (!token) {
      return res.status(401).json({ message: 'No token provided' })
    } else if (typeof token === 'string') {
      try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY) as DecodedToken

        if (decoded.exp < Date.now() / 80000) {
          return res.status(401).json({ message: 'No token provided' })
        }

        next()
      } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' })
      } 
  }
}

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const id = await getLoggedInUserId(req)
  const user = await UserSchema.findById({ _id: id })
  if (user?.isAdmin) {
    next()
  } else {
    return res.status(401).json({ message: 'Unauthorized' })
  }
}
