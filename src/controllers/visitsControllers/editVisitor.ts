import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import VisitorSchema        from '../../shemas/VisitorSchema.js'

interface Body {
  id:            ObjectId
  employeeId?:   ObjectId
  visitId?:      ObjectId
  visitorIdType: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id, employeeId, visitId, visitorIdType } = req.body

    const signature = req.file?.path

    if (!id) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const rack = await VisitorSchema.findByIdAndUpdate(
      { _id: id },
      { employeeId, signature, visitId, visitorIdType },
      { new: true }
    )

    return res.status(201).json(rack)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
