import bcrypt               from 'bcrypt'
import jwt                  from 'jsonwebtoken'
import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import UserSchema           from '../../shemas/UserSchema.js'

import { DecodedToken }     from './types.js'

interface Body {
  password:       string
  repeatPassword: string
  token:          string
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { password, repeatPassword, token } = req.body

    if (!token) {
      return res.status(500).json({ message: 'No token provided' })
    }

    if (!password || !repeatPassword) {
      return res.status(500).json({ message: 'All fields required' })
    }

    if (repeatPassword !== password) {
      return res.status(500).json({ message: 'Repeat password does not match' })
    }

    let userId: string | undefined

    try {
      const decoded = jwt.verify(token, process.env.RECOVERY_TOKEN_KEY) as DecodedToken
      userId = decoded.userId
    } catch (err) {
      return res.status(401).json({ message: 'token expired' })
    }

    const user = await UserSchema.findById({ _id: userId })

    if (!user) {
      return res.status(500).json({ message: 'User not found' })
    } else {
      const encryptedPassword = await bcrypt.hash(password, 10)

      await user.updateOne({
        password: encryptedPassword,
      })

      await user.save()

      return res.status(201).json({ message: 'Password changed successfully' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
