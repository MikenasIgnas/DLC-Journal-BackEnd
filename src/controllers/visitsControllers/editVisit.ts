import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { Guest, TypedRequestBody }  from '../../types.js'
import CompanySchema         from '../../shemas/CompanySchema.js'
import VisitSchema           from '../../shemas/VisitSchema.js'

import sendVisitsEmail       from './sendVisitsEmail.js'
import SiteSchema from '../../shemas/SiteSchema.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'
import VisitorSchema from '../../shemas/VisitorSchema.js'

interface Body {
  carPlates?:          string[]
  companyId:           ObjectId
  date:                Date
  guests?:             Guest[]
  id:                  ObjectId
  racks:               ObjectId[]
  scheduledVisitTime?: Date
  visitorIdType:       ObjectId
  visitPurpose:        ObjectId[]
  siteId:              ObjectId
  statusId:            ObjectId
  startDate:           Date,
  endDate:             Date,
  sendEmail:           boolean
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const {
      carPlates,
      companyId,
      date,
      guests,
      id,
      racks,
      scheduledVisitTime,
      visitorIdType,
      visitPurpose,
      siteId,
      statusId,
      startDate,
      endDate,
      sendEmail,
    } = req.body


    let signature: string | undefined

    if (req.file) {
      signature = req.file?.path
    }

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    if (companyId) {
      const companyExists = await CompanySchema.exists({ _id: companyId })

      if (!companyExists) {
        return res.status(400).json({ messsage: 'Company does not exist' })
      }
    }


    const instance = await VisitSchema.findByIdAndUpdate(
      { _id: id },
      {
        carPlates,
        companyId,
        date,
        guests,
        racks,
        scheduledVisitTime,
        signature,
        visitorIdType,
        visitPurpose,
        siteId,
        statusId,
        startDate,
        endDate,
      },
      { new: true }
    )

    const site = await SiteSchema.findById(siteId)

    if (sendEmail && site?.name === 'T72') {
      const company           = await CompanySchema.findById(companyId)
      const companyName       = company?.name
      const visitors          = await VisitorSchema.find({visitId: id})
      const employeeIds       = visitors.map(visitor => visitor.employeeId)
      const companyEmployees  = await CompanyEmployeeSchema.find({ _id: { $in: employeeIds } })

      sendVisitsEmail({companyName, companyEmployees, scheduledVisitTime, guests, carPlates })
    }
    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
