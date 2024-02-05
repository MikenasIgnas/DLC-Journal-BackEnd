import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import VisitorSchema        from '../../shemas/VisitorSchema.js'

interface Body {
  id:         ObjectId
  dlcEmployee: ObjectId
  employeeId:  ObjectId
  visitId:     ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { id, dlcEmployee, employeeId, visitId } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const rack = await VisitorSchema.findByIdAndUpdate(
      { _id: id },
      { dlcEmployee, employeeId, visitId },
      { new: true }
    )

    return res.status(201).json(rack)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
