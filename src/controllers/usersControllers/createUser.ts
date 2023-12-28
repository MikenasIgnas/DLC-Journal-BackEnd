import bcrypt               from 'bcrypt'
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
      res.status(400).json({ messsage: 'Bad request' })
    }

    const usernameEmail = await UserSchema.exists({ email: username })

    const userExists = await UserSchema.exists({ email })

    const loginTaken = await UserSchema.exists({ username })

    if (userExists || loginTaken || usernameEmail) {
      res.status(409).send("User Already Exist. Please Login")
    }

    const encryptedPassword = await bcrypt.hash(password, 10)

    const user = {
      email: email.toLowerCase(),
      isAdmin,
      isDisabled: false,
      name,
      password: encryptedPassword,
      username,
    };
    
    const instance = new UserSchema(user)

    await instance.save()

    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}
