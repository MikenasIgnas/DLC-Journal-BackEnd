import { Response }          from 'express'
import { Types }             from 'mongoose'

import { getLoggedInUserId } from '../../helpers.js'
import { TypedRequestBody }  from '../../types.js'
import VisitSchema           from '../../shemas/VisitSchema.js'
import visitStatusSchema     from '../../shemas/visitStatusSchema.js'

import generateVisitPdf      from './generateVisitPdf.js'


interface Body {
  signatures: { signature: string, visitorId: number }[]
  statusId:   Types.ObjectId
  visitId:    Types.ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const dlcEmlpyee = await getLoggedInUserId(req)

    const { visitId, signatures, statusId } = req.body

    if (!visitId && !statusId) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const visitExists = await VisitSchema.exists({ _id: visitId })

    if (!visitExists) {
      return res.status(400).json({ messsage: 'Visit does not exist' })
    }

    const statusExists = await visitStatusSchema.exists({ _id: statusId })

    if (!statusExists) {
      return res.status(400).json({ messsage: 'Visit status does not exist' })
    }

    const startDate = new Date()

    const documentPath = await generateVisitPdf({ signatures, startDate, visitId })

    const visit = await VisitSchema.findByIdAndUpdate(
      { _id: visitId },
      {
        dlcEmlpyee,
        documentPath,
        startDate,
        statusId,
      },
      { new: true }
    )

    return res.status(201).json(visit)
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message })
    } else {
      return res.status(500).json({ message: 'Unexpected error' })
    }
  }
}
