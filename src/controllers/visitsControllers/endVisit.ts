import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import VisitSchema           from '../../shemas/VisitSchema.js'
import visitStatusSchema from '../../shemas/visitStatusSchema.js'


interface Body {
  visitId:  ObjectId
  statusId: ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { visitId, statusId } = req.body

    if (!visitId && !statusId) {
      return res.status(400).json({ message: 'Bad request' })
    }

    const visitExists = await VisitSchema.exists({ _id: visitId })

    if (!visitExists) {
      return res.status(400).json({ message: 'Visit does not exist' })
    }

    const statusExists = await visitStatusSchema.exists({ _id: statusId })

    if (!statusExists) {
      return res.status(400).json({ message: 'Visit status does not exist' })
    }

    const visit = await VisitSchema.findByIdAndUpdate(
      { _id: visitId },
      {
        statusId,
        endDate: Date.now(),
      },
      { new: true }
    )

    return res.status(201).json(visit)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
