import { Response }          from 'express'

import { getLoggedInUserId } from '../../helpers.js'
import { TypedRequestBody }  from '../../types.js'
import UserSchema            from '../../shemas/UserSchema.js'

interface EditUserBody {
  email:        string
  id:           string
  isAdmin:      boolean
  isSecurity:   boolean
  name:         string
  username:     string
}

interface UpdatedFields {
  email:        string
  isAdmin?:     boolean
  name:         string
  username:     string
  isSecurity?:  boolean
}


export default async (req: TypedRequestBody<EditUserBody>, res: Response) => {
  try {
    const { id, name, email, username, isAdmin, isSecurity } = req.body

    const loggedInUserId = await getLoggedInUserId(req)

    const loggedInUser = await UserSchema.findById({ _id: loggedInUserId })

    if (isSecurity && isAdmin) {
      return res.status(400).json({ message: 'Security cant be admin' })
    }

    if (!id) {
      return res.status(500).json({ message: 'Id is required' })
    } else {
      const updatedFields: UpdatedFields = { name, email, username }

      if (loggedInUser?.isAdmin) {
        if (isAdmin) {
          updatedFields.isAdmin = isAdmin
          updatedFields.isSecurity = false
        } else if (isSecurity) {
          updatedFields.isAdmin = false
          updatedFields.isSecurity = isSecurity
        }else if (!isAdmin && !isSecurity){
          updatedFields.isAdmin = false
          updatedFields.isSecurity = false
        }
      }

      const user = await UserSchema.findOneAndUpdate(
        { _id: id },
        updatedFields,
        { new: true }
      )

      return res.status(201).json(user)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
