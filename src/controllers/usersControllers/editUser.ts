import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js';
import UserSchema           from '../../shemas/UserSchema.js';

interface EditUserBody {
  email: string
  id:    string
  name:  string
}

export default async (req: TypedRequestBody<EditUserBody>, res: Response) => {
  try {
    const { id, name, email } = req.body

    if (!id) {
      res.status(500).json({ message: 'Id is required' })
    }
 
    const user = await UserSchema.findOneAndUpdate({_id: id},{
      name,
      email,
    })
    
    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}
