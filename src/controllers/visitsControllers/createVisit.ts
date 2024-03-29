import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import {
  Guest,
  TypedRequestBody,
}                            from '../../types.js'
import CompanySchema         from '../../shemas/CompanySchema.js'
import VisitSchema           from '../../shemas/VisitSchema.js'


interface Body {
  carPlates?:          string[]
  companyId:           ObjectId
  endDate?:            Date
  guests?:             Guest[]
  siteId:              ObjectId
  racks?:              ObjectId[]
  scheduledVisitTime?: Date
  startDate?:          Date
  statusId:            ObjectId
  visitPurpose:        ObjectId[]
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const {
      carPlates,
      companyId,
      guests,
      racks,
      scheduledVisitTime,
      siteId,
      statusId,
      visitPurpose,
    } = req.body

    if (!(
      companyId &&
      racks &&
      statusId &&
      visitPurpose &&
      siteId
    )) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const companyExists = await CompanySchema.exists({ _id: companyId })

    if (!companyExists) {
      return res.status(400).json({ messsage: 'Company does not exist' })
    }

    const latestVisit = await VisitSchema.findOne({}, {}, { sort: { 'date': -1 } })

    const id = latestVisit?.id ? ++latestVisit.id : 1

    const instance = new VisitSchema({
      carPlates,
      companyId,
      guests,
      id,
      racks,
      scheduledVisitTime,
      statusId,
      visitPurpose,
      siteId,
    })

    await instance.save()

    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
