import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import UserSchema           from '../../shemas/UserSchema.js'

interface EditUserBody {
  email:    string
  id:       string
  name:     string
  username: string
  isAdmin:  boolean
}

export default async (req: TypedRequestBody<EditUserBody>, res: Response) => {
  try {
    const { id, name, email, username , isAdmin} = req.body

    if (!id) {
      return res.status(500).json({ message: 'Id is required' })
    } else {
      const user = await UserSchema.findOneAndUpdate(
        { _id: id },
        { name, email, username, isAdmin },
        { new: true }
      )
      
      return res.status(201).json(user)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
