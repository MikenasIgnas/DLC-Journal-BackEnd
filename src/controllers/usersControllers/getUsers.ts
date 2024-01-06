import {
  Request,
  Response,
}                           from 'express'

import { getPagination }    from '../../helpers.js'
import UserSchema           from '../../shemas/UserSchema.js'

import getUserFilterParams  from './getUserFilterParams.js'


export default async (req: Request, res: Response) => {
  try {
    const { id, isAdmin, isDisabled, isSecurity, page, limit, search } = req.query

    if (id) {
      const user = await UserSchema.findById({
        _id: id,
      })
      return res.status(201).json(user)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params = getUserFilterParams({ isAdmin, isDisabled, isSecurity, search })

      const users = await UserSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(201).json(users)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
