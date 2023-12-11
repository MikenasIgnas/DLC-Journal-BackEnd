import {
  Response,
}                           from 'express'

import RoleSchema           from '../../shemas/RoleSchema.js'
import { TypedRequestBody } from '../../types.js'

interface EnableRoleBody {
  id: string
}


export const enableRole = async (req: TypedRequestBody<EnableRoleBody>, res: Response) => {
  try {
    const { id } = req.body
    
    const roleExists = await RoleSchema.exists({ _id: id })

    if (!roleExists) {
      return res.status(500).send("Role does not exist")
    }

    await RoleSchema.findOneAndUpdate({
      _id: id,
    }, { isDisabled: false })

    res.status(201).json({ message: 'Role enabled'})
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}