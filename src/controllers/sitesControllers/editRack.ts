import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import RackSchema           from '../../shemas/RackSchema.js'

interface Body {
  id:         ObjectId
  name?:      string
  premiseId?: number
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id, name , premiseId} = req.body

    if (!id) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const rack = await RackSchema.findByIdAndUpdate(
      { _id: id },
      { name, premiseId },
      { new: true }
    )

    return res.status(201).json(rack)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
