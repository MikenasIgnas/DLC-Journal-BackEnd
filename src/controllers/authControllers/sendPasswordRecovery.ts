import jwt                       from 'jsonwebtoken'
import { Response }              from 'express'

import { TypedRequestBody }      from '../../types.js'
import UserSchema                from '../../shemas/UserSchema.js'

import sendPasswordRecoveryEmail from './sendPasswordRecoveryEmail.js'

interface Body {
  email:  string
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const emailExists   = await UserSchema.exists({ email: email })

    if (!emailExists) {
      return res.status(400).json({ message: 'User with that email does not exist' })
    } else {
      const user = await UserSchema.findOne({ email: email })

      const token = jwt.sign(
        { userId: user?._id },
        process.env.RECOVERY_TOKEN_KEY,
        { expiresIn: '10m', algorithm: 'HS256' }
      )

      sendPasswordRecoveryEmail({ email, token })

      res.status(200).json({ message: 'Recovery email sent' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
