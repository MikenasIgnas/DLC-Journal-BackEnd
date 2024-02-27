import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import VisitSchema           from '../../shemas/VisitSchema.js'
import visitStatusSchema     from '../../shemas/visitStatusSchema.js'


interface Body {
  statusId: ObjectId
  visitId:  ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { visitId, statusId } = req.body

    if (!visitId && !statusId) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    let visit = await VisitSchema.findById(visitId)

    if (!visit) {
      return res.status(400).json({ messsage: 'Visit does not exist' })
    }

    if (visit.statusId === statusId) {
      return res.status(400).json({ messsage: 'Visit already ended' })
    }

    const statusExists = await visitStatusSchema.exists({ _id: statusId })

    if (!statusExists) {
      return res.status(400).json({ messsage: 'Visit status does not exist' })
    }

    visit = await VisitSchema.findByIdAndUpdate(
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
