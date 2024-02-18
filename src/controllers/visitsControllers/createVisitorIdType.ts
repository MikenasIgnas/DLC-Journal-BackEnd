import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import VisitorIdTypeSchema  from '../../shemas/VisitorIdTypeSchema.js'

interface Body {
  name: string
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const exists = await VisitorIdTypeSchema.exists({ name })

    if (exists) {
      return res.status(409).json({ message: 'Visitor Id Type Already Exist.' })
    } else {
      const instance = new VisitorIdTypeSchema({
        name,
      })

      await instance.save()

      return res.status(201).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
