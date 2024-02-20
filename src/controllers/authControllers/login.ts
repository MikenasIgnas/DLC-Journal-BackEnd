import bcrypt               from 'bcrypt'
import jwt                  from 'jsonwebtoken'
import { Response }         from 'express'

import { TypedRequestBody } from '../../types'
import UserSchema           from '../../shemas/UserSchema'

interface LoginBody {
  login:    string
  password: string
}


export default async (req: TypedRequestBody<LoginBody>, res: Response) => {
  try {
    const { login, password } = req.body

    if (!(login && password)) {
      return res.status(400).json({ message: 'All input is required' })
    }

    let user = await UserSchema.findOne({ email: login })

    if (!user) {
      user = await UserSchema.findOne({ username: login })
    }

    if (user) {
      if (user.isDisabled) {
        return res.status(401).json({ message: 'User disabled' })
      } else {
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (isPasswordValid) {
          const payload = { email: user.email, userId: user._id }

          const token = jwt.sign(
            payload,
            process.env.TOKEN_KEY,
            { expiresIn: '8h', algorithm: 'HS256' }
          )

          res.status(200).json({
            email:    user.email,
            name:     user.name,
            token,
            username: user.username,
          })
        } else {
          return res.status(400).json({ message: 'Invalid password' })
        }
      }
    } else {
      return res.status(400).json({ message: 'User does not exist' })
    }
  } catch (err) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
