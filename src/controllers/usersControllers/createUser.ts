import bcrypt               from 'bcrypt'
import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import RoleSchema           from '../../shemas/RoleSchema.js'
import UserSchema           from '../../shemas/UserSchema.js'


interface CreateUserBody {
  email:    string
  name:     string
  password: string
  roleId:   number
}


export default async (req: TypedRequestBody<CreateUserBody>, res: Response) => {
  try {
    const { email, password, name, roleId } = req.body
    
    
    if (!(email && password && name && roleId)) {
      res.status(400).json({ messsage: 'Bad request' })
    }

    const userExists = await UserSchema.exists({ email })

    if (userExists) {
      res.status(409).send("User Already Exist. Please Login")
    }

    try {
      const roleExists = await RoleSchema.exists({ _id: roleId })
  
      if (!roleExists) {
        res.status(400).json({ message: 'Role does not exist' })
      }
    } catch (error) {
      res.status(400).json({ message: 'Invalid role Id' })
    }

    const encryptedPassword = await bcrypt.hash(password, 10)

    const user = {
      email: email.toLowerCase(),
      isDisabled: false,
      name,
      password: encryptedPassword,
      roleId,
    };
    
    const instanc = new UserSchema(user)

    await instanc.save()

    res.status(201).json(user)
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}
