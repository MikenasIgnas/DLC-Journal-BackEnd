import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import VisitGuestSchema     from '../../shemas/VisitGuestSchema.js'

interface Body {
  id:       ObjectId
  idType:   ObjectId
  visitId?: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id, visitId, idType } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const guest = await VisitGuestSchema.findByIdAndUpdate(
      { _id: id },
      { visitId, idType },
      { new: true }
    )

    return res.status(201).json(guest)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}