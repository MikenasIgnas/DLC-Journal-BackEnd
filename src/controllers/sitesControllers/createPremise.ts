import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import PremiseSchema        from '../../shemas/PremiseSchema.js'

interface Body {
  name:   string
  siteId: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { name, siteId } = req.body

    if (!(name && siteId)) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const exists = await PremiseSchema.exists({ name })

    if (exists) {
      return res.status(409).json({ message: 'Premise Already Exist.' })
    } else {
      const instance = new PremiseSchema({
        name,
        siteId,
      })

      await instance.save()

      return res.status(201).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
