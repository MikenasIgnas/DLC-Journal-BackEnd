import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import CompanySchema         from '../../shemas/CompanySchema.js'
import VisitSchema           from '../../shemas/VisitSchema.js'


interface Body {
  carPlates?:         string[]
  companyId:          ObjectId
  date:               Date
  endDate?:           Date
  guests?:            string[]
  permissions:        ObjectId[]
  racks:              ObjectId[]
  scheduledVisitTime: Date
  startDate?:         Date
  statusId:           ObjectId
  visitorIdType?:     ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const {
      carPlates,
      companyId,
      date,
      endDate,
      guests,
      permissions,
      racks,
      scheduledVisitTime,
      startDate,
      statusId,
      visitorIdType,
    } = req.body

    let signature: string | undefined

    if (req.file) {
      signature = req.file?.path
    }

    if (!(companyId && permissions && racks && racks.length > 0 && statusId)) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const companyExists = await CompanySchema.exists({ _id: companyId })

    if (!companyExists) {
      return res.status(400).json({ messsage: 'Company does not exist' })
    }

    const instance = new VisitSchema({
      carPlates,
      companyId,
      date,
      endDate,
      guests,
      permissions,
      racks,
      scheduledVisitTime,
      signature,
      startDate,
      statusId,
      visitorIdType,
    })

    await instance.save()

    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
