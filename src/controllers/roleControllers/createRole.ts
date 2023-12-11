import {
  Response,
}                           from 'express'

import RoleSchema           from '../../shemas/RoleSchema.js'
import { TypedRequestBody } from '../../types.js'


interface CreateRoleBody {
  name: string
}


export const createRole = async (req: TypedRequestBody<CreateRoleBody>, res: Response) => {
  try {
    const { name } = req.body
    
    if (!name) {
      res.status(400).json({ messsage: 'Bad request' })
    }
    
    const roleExists = await RoleSchema.exists({ name })

    if (roleExists) {
      return res.status(409).send("Role already exist")
    }

    const role = {
      isDisabled: false,
      name,
    };
    
    const instance = new RoleSchema(role)

    await instance.save()

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}
