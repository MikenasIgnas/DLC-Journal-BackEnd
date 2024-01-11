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

      let users = undefined

      const params = getUserFilterParams({ isAdmin, isDisabled, isSecurity, search })

      if (isDisabled !== undefined && isDisabled !== null) {
        params.isDisabled = isDisabled
      }

      if (isAdmin !== undefined && isDisabled !== null) {
        params.isAdmin = isAdmin
      }

      if (search) {
        params.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
        ]
      }

      users = await UserSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(201).json(users)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
