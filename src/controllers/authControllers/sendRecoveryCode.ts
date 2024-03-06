import jwt                  from 'jsonwebtoken'
import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import generateRecoveryCode from '../../utility/generateRecoveryCode.js'
import UserSchema           from '../../shemas/UserSchema.js'

import sendEmail            from './sendEmail.js'

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
      const user          = await UserSchema.findOne({ email: email })

      const recoveryCode  = generateRecoveryCode()

      const payload = { userId: user?._id, recoveryCode }

      const token = jwt.sign(
        payload,
        process.env.TOKEN_KEY,
        { expiresIn: '10m', algorithm: 'HS256' }
      )

      sendEmail({ email, recoveryCode })

      res.status(200).json({ token })
    }

  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
