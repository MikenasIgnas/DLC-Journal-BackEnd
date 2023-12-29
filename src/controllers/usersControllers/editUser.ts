import { Response }          from 'express'

import { TypedRequestBody }  from '../../types.js'
import UserSchema            from '../../shemas/UserSchema.js'
import { getLoggedInUserId } from '../../helpers.js'

interface EditUserBody {
  email:    string
  id:       string
  name:     string
  username: string
  isAdmin:  boolean
}
interface UpdatedFields {
  name:     string
  email:    string
  username: string
  isAdmin?: boolean
}


export default async (req: TypedRequestBody<EditUserBody>, res: Response) => {
  try {
    const { id, name, email, username, isAdmin } = req.body

    const loggedInUserId = await getLoggedInUserId(req)

    const loggedInUser = await UserSchema.findById({_id: loggedInUserId})
    
    if (!id) {
      return res.status(500).json({ message: 'Id is required' })
    }else{
      const updatedFields: UpdatedFields = { name, email, username };

      if (loggedInUser?.isAdmin) {
        updatedFields.isAdmin = isAdmin
      }
      
      const user = await UserSchema.findOneAndUpdate(
        { _id: id },
        updatedFields,
        { new: true }
      );
        
        return res.status(201).json(user)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
