import bcrypt               from 'bcrypt'
import jwt                  from 'jsonwebtoken'
import { Response }         from "express"

import { TypedRequestBody } from "../../types"
import UserSchema           from "../../shemas/UserSchema"

interface LoginBody {
  email:    string
  password: string
}


export default async (req: TypedRequestBody<LoginBody>, res: Response) => {
  try {
      const { email, password } = req.body;
      if (!(email && password)) {
        res.status(400).send("All input is required")
      }

      const user = await UserSchema.findOne({ email })

      if (user) {
        if (user.isDisabled) {
          res.status(401).send("User disabled")
        } else {
          const isPasswordValid = await bcrypt.compare(password, user.password)
          if (isPasswordValid) {
            const payload = { email, userId: user._id }

            const token = jwt.sign(payload, process.env.TOKEN_KEY, { expiresIn: '8h', algorithm: 'HS256' })

            res.status(200).json({
              email,
              name: user.name,
              token,
             })
          } else {
            res.status(400).send("Invalid password")
          }
        }
      } else {
        res.status(400).send("User does not exist")
      }
    } catch (err) {
      res.status(500).send("Unexpected error")
    }
}