import {
  Response,
}                           from 'express'

import { TypedRequestBody } from '../../types.js'
import UserSchema           from '../../shemas/UserSchema.js'

interface ChangeUserStatusBody {
  id:             string
  isDisabled:     boolean
  disabledDate:   Date
}


export default async (req: TypedRequestBody<ChangeUserStatusBody>, res: Response) => {
  try {
    const { id, isDisabled, disabledDate } = req.body
    
    const userExists = await UserSchema.exists({ _id: id })

    if (!userExists) {
      return res.status(500).send("User does not exist")
    } else {
      await UserSchema.findOneAndUpdate({ _id: id }, { isDisabled, disabledDate })
  
      return res.status(201).json({ message: 'User status updated' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
