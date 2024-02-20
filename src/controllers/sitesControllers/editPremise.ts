import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import PremiseSchema        from '../../shemas/PremiseSchema.js'

interface Body {
  id:      ObjectId
  name?:   string
  siteId?: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id, name, siteId } = req.body

    if (!id) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const premise = await PremiseSchema.findByIdAndUpdate(
      { _id: id },
      { name, siteId },
      { new: true }
    )

    return res.status(201).json(premise)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
