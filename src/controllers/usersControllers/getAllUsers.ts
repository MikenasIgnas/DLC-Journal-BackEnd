import { Response }         from 'express'
import { getPagination }    from '../../helpers.js'
import { TypedRequestBody } from '../../types.js'
import UserSchema           from '../../shemas/UserSchema.js'

interface GetAllUsersBody {
  isDisabled: boolean
}

export default async (req: TypedRequestBody<GetAllUsersBody>, res: Response) => {
  try {
    const { isDisabled, page, limit } = req.query

    const { parsedLimit, skip } = getPagination(page, limit)
    let users

    if (isDisabled === undefined || isDisabled === null) {
      users = await UserSchema.find().limit(parsedLimit).skip(skip)
    } else {
      users = await UserSchema.find({ isDisabled }).limit(parsedLimit).skip(skip)
    }

    res.status(201).json(users)
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}
