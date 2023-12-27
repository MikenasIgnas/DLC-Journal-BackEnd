import {
    Response,
  }                           from 'express'
  
  import RoleSchema           from '../../shemas/RoleSchema.js'
  import { TypedRequestBody } from '../../types.js'
  
  interface EnableRoleBody {
    id: string
  }
  
  
  export const getAllRoles = async (req: TypedRequestBody<EnableRoleBody>, res: Response) => {
    try {
      const roles = await RoleSchema.find()
      if (!roles) {
        return res.status(500).send("No Roles Found")
      }
      res.status(201).json(roles)
    } catch (error) {
      res.status(500).json({ message: 'Unexpected error' })
    }
  }