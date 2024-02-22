import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import PermissionSchema     from '../../shemas/PermissionSchema.js'


interface EditPermissionBody {
  name: string
  id:   ObjectId
}


export default async (req: TypedRequestBody<EditPermissionBody>, res: Response) => {
  try {
    const { id, name } = req.body

    if (!id || !name) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const permisison = await PermissionSchema.findByIdAndUpdate(
      { _id: id },
      { name },
      { new: true },
    )

    return res.status(201).json(permisison)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
