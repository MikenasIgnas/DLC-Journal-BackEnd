import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import VisitorSchema        from '../../shemas/VisitorSchema.js'

interface Body {
  employeeId:  ObjectId
  visitId:     ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { employeeId, visitId } = req.body

    if (!(employeeId && visitId)) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const instance = new VisitorSchema({
      employeeId,
      visitId,
    })

    await instance.save()

    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
