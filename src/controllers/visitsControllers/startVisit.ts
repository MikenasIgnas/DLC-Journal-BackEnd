import { Response }          from 'express'
import { Types }             from 'mongoose'

import { getLoggedInUserId } from '../../helpers.js'
import { TypedRequestBody }  from '../../types.js'
import VisitGuestSchema      from '../../shemas/VisitGuestSchema.js'
import VisitorSchema         from '../../shemas/VisitorSchema.js'
import VisitSchema           from '../../shemas/VisitSchema.js'
import visitStatusSchema     from '../../shemas/visitStatusSchema.js'

import generateVisitPdf      from './generateVisitPdf.js'

interface Body {
  guestSignatures: { signature: string, id: Types.ObjectId }[]
  signatures:      { signature: string, visitorId: number }[]
  statusId:        Types.ObjectId
  visitId:         Types.ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const dlcEmployee = await getLoggedInUserId(req)

    const { visitId, signatures, statusId, guestSignatures } = req.body

    if (!visitId && !statusId) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    let visit = await VisitSchema.findById(visitId)

    if (!visit) {
      return res.status(400).json({ messsage: 'Visit does not exist' })
    }

    if (visit.statusId === statusId) {
      return res.status(400).json({ messsage: 'Visit already started' })
    }

    const statusExists = await visitStatusSchema.exists({ _id: statusId })

    if (!statusExists) {
      return res.status(400).json({ messsage: 'Visit status does not exist' })
    }

    const startDate = new Date()

    const documentPath = await generateVisitPdf({ signatures, guestSignatures, startDate, visitId })
    if (documentPath) {
      for (let index = 0; index < signatures.length; index++) {
        const id = signatures[index].visitorId

        await VisitorSchema.findByIdAndUpdate(id, { signed: true })
      }

      for (let index = 0; index < guestSignatures.length; index++) {
        const id = guestSignatures[index].id

        await VisitGuestSchema.findByIdAndUpdate(id, { signed: true })
      }
    }

    visit = await VisitSchema.findByIdAndUpdate(
      { _id: visitId },
      {
        dlcEmployee,
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
