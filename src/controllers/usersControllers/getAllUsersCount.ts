import {
  Response,
}                           from 'express';

import { TypedRequestBody } from '../../types.js';
import UserSchema           from '../../shemas/UserSchema.js';

interface GetAllUsersBody {
  isDisabled: boolean
}


export default async (req: TypedRequestBody<GetAllUsersBody>, res: Response) => {
  try {
    const { isDisabled } = req.query

    let users

    if (isDisabled === undefined || isDisabled === null) {
      users = await UserSchema.find().countDocuments()
    } else {
      users = await UserSchema.find({ isDisabled }).countDocuments()
    }

    res.status(200).json(users)
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}
