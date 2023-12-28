import {
    Response,
  }                           from 'express'
  
  import RoleSchema           from '../../shemas/RoleSchema.js'
  import { TypedRequestBody } from '../../types.js'
  
  interface EnableRoleBody {
    id: string
  }
  
  
  export const getRole = async (req: TypedRequestBody<EnableRoleBody>, res: Response) => {
    const { roleId } = req.query

    try {
      const roles = await RoleSchema.findOne({_id: roleId})
      
      if (!roles) {
        return res.status(500).send("Role does not exist")
      }

      res.status(201).json(roles)

    } catch (error) {
      res.status(500).json({ message: 'Unexpected error' })
    }
  }