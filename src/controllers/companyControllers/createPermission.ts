import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import PermissionSchema     from '../../shemas/PermissionSchema.js'

interface CreatePermissionBody {
  name: string
}


export default async (req: TypedRequestBody<CreatePermissionBody>, res: Response) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const exists = await PermissionSchema.exists({ name })

    if (exists) {
      return res.status(409).json({ message: 'Permission Already Exist.' })
    } else {

      const instance = new PermissionSchema({ name })

      await instance.save()

      return res.status(201).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
