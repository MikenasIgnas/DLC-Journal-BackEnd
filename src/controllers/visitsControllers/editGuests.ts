import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import GuestSchema          from '../../shemas/GuestSchema.js'

interface Body {
  id:            ObjectId
  visitId?:      ObjectId
  guestIdType:   ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id, visitId, guestIdType } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const guest = await GuestSchema.findByIdAndUpdate(
      { _id: id },
      { visitId, guestIdType },
      { new: true }
    )

    return res.status(201).json(guest)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}