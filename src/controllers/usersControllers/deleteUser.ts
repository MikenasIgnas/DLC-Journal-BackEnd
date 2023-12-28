import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js';
import UserSchema           from '../../shemas/UserSchema.js';

interface DeleteUserBody {
  id: string
}


export default async (req: TypedRequestBody<DeleteUserBody>, res: Response) => {
  try {
    const { id } = req.query
    
    if (!id) {
      res.status(500).json({ message: 'Id is required' })
    }
    
    const user = await UserSchema.findOneAndDelete({
      _id: id,
    })

    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}
