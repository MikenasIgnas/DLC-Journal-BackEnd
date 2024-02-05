import { Response }         from 'express'

import { TypedRequestBody } from '../../types.js'
import VisitPurposeSchema   from '../../shemas/VisitPurposeSchema.js'

interface Body {
  name: string
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { name } = req.body

    if (!name) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const exists = await VisitPurposeSchema.exists({ name })

    if (exists) {
      return res.status(409).json({ message: 'Visit Purpose Already Exist.' })
    } else {
      const instance = new VisitPurposeSchema({
        name,
      })

      await instance.save()

      return res.status(201).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
