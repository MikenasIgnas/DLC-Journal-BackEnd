import bcrypt                from 'bcrypt'
import { Response }          from 'express'

import { getLoggedInUserId } from '../../helpers.js'
import { TypedRequestBody }  from '../../types.js'
import UserSchema            from '../../shemas/UserSchema.js'

interface ChangePasswordBody {
  id:             string;
  oldPassword:    string;
  password:       string;
  repeatPassword: string;
}

export default async (req: TypedRequestBody<ChangePasswordBody>, res: Response) => {
  try {
    const { password, repeatPassword, oldPassword } = req.body

    const id = await getLoggedInUserId(req)
    
    if (!password || !repeatPassword || !oldPassword) {
      return res.status(500).json({ message: 'All fields required' })
    }
    
    if (repeatPassword !== password) {
      return res.status(500).json({ message: 'Repeat password does not match' })
    }

    const user = await UserSchema.findById({_id: id })

    if (!user) {
      return res.status(500).json({ message: 'Could not find user by that id' })
    } else {
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
      
      if (isPasswordValid) {
        const encryptedPassword = await bcrypt.hash(password, 10);

        await user.updateOne({
          password: encryptedPassword,
        })

        await user.save()

        return res.status(201).json({ message: 'Password changed successfully' })
      } else {
        return res.status(500).json({ message: 'Wrong old password' })
      }
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
