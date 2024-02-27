import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import VisitorSchema        from '../../shemas/VisitorSchema.js'

interface Body {
  employeeId?:   ObjectId
  id:            ObjectId
  visitId?:      ObjectId
  visitorIdType: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id, employeeId, visitId, visitorIdType } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const rack = await VisitorSchema.findByIdAndUpdate(
      { _id: id },
      { employeeId, visitId, visitorIdType },
      { new: true }
    )

    return res.status(201).json(rack)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
