import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import SiteSchema           from '../../shemas/SiteSchema.js'

interface Body {
  name:     string
  isRemote: boolean
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { name, isRemote } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const exists = await SiteSchema.exists({ name })

    if (exists) {
      return res.status(409).json({ message: 'Site Already Exist.' })
    } else {
      const instance = new SiteSchema({
        name,
        isRemote,
      })

      await instance.save()

      return res.status(201).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
