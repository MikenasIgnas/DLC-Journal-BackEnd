import bcrypt               from 'bcrypt'
import emailvalidator       from 'email-validator'
import { Response }         from 'express'


import { TypedRequestBody } from '../../types.js'
import UserSchema           from '../../shemas/UserSchema.js'


interface CreateUserBody {
  email:    string
  name:     string
  password: string
  isAdmin:  boolean
  username: string
}


export default async (req: TypedRequestBody<CreateUserBody>, res: Response) => {
  try {
    const { email, password, name, isAdmin, username } = req.body

    if (!(email && password && name && username)) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const isValid = emailvalidator.validate(email)

    if (!isValid) {
      return res.status(400).json({ messsage: 'Invalid email' })
    }

    const usernameEmail = await UserSchema.exists({ email: username })

    const userExists = await UserSchema.exists({ email })

    const loginTaken = await UserSchema.exists({ username })

    if (userExists || loginTaken || usernameEmail) {
      return res.status(409).json({ message: 'User Already Exist. Please Login' })
    } else {
      const encryptedPassword = await bcrypt.hash(password, 10)

      const user = {
        email:      email.toLowerCase(),
        isAdmin,
        isDisabled: false,
        name,
        password:   encryptedPassword,
        username,
      }

      const instance = new UserSchema(user)

      await instance.save()

      return res.status(201).json(user)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
