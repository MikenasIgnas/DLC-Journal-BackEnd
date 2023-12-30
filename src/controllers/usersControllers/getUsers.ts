import {
  Request,
  Response,
}                           from 'express'

import { getPagination }    from '../../helpers.js'
import UserSchema           from '../../shemas/UserSchema.js'


export default async (req: Request, res: Response) => {
  try {
    const { id, isDisabled, page, limit } = req.query

    if (id) {
      const user = await UserSchema.findById({
        _id: id,
      })
  
      return res.status(201).json(user)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)
  
      let users
  
      if (isDisabled === undefined || isDisabled === null) {
        users = await UserSchema.find().limit(parsedLimit).skip(skip)
      } else {
        users = await UserSchema.find({ isDisabled }).limit(parsedLimit).skip(skip)
      }
  
      return res.status(201).json(users)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
