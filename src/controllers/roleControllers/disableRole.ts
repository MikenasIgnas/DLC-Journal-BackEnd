import {
  Response,
}                           from 'express'

import { TypedRequestBody } from '../../types.js'
import RoleSchema           from '../../shemas/RoleSchema.js'


interface DisableRoleBody {
  id: string
}


export const disableRole = async (req: TypedRequestBody<DisableRoleBody>, res: Response) => {
  try {
    const { id } = req.body
    
    const roleExists = await RoleSchema.exists({ _id: id })

    if (!roleExists) {
      return res.status(500).send("Role does not exist")
    }

    await RoleSchema.findOneAndUpdate({
      _id: id,
    }, { isDisabled: true })

    res.status(201).json({ message: 'Role disabled'})
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}