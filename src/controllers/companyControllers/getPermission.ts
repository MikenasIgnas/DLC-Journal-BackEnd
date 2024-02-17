import {
  Request,
  Response,
}                        from 'express'

import { getPagination } from '../../helpers.js'
import PermissionSchema  from '../../shemas/PermissionSchema.js'


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, limit } = req.query

    if (id) {
      const permission = await PermissionSchema.findById({ _id: id })

      return res.status(200).json(permission)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      let permissions

      if (!name) {
        permissions = await PermissionSchema.find().limit(parsedLimit).skip(skip)
      } else {
        permissions = await PermissionSchema.find({ name }).limit(parsedLimit).skip(skip)
      }

      return res.status(200).json(permissions)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
