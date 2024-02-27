import { Response }           from 'express'
import { ObjectId }           from 'mongoose'

import {
  Guest,
  TypedRequestBody,
}                             from '../../types.js'
import CompanyEmployeeSchema  from '../../shemas/CompanyEmployeeSchema.js'
import CompanySchema          from '../../shemas/CompanySchema.js'
import SiteSchema             from '../../shemas/SiteSchema.js'
import VisitSchema            from '../../shemas/VisitSchema.js'
import VisitorSchema          from '../../shemas/VisitorSchema.js'

import sendVisitsEmail        from './sendVisitsEmail.js'

interface Body {
  carPlates?:          string[]
  companyId:           ObjectId
  date:                Date
  endDate:             Date,
  guests?:             Guest[]
  id:                  ObjectId
  racks:               ObjectId[]
  scheduledVisitTime?: Date
  sendEmail?:          boolean
  siteId:              ObjectId
  startDate:           Date,
  statusId:            ObjectId
  visitorIdType:       ObjectId
  visitPurpose:        ObjectId[]
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const {
      carPlates,
      companyId,
      date,
      endDate,
      guests,
      id,
      racks,
      scheduledVisitTime,
      sendEmail,
      siteId,
      startDate,
      statusId,
      visitorIdType,
      visitPurpose,
    } = req.body

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
        endDate,
        guests,
        racks,
        scheduledVisitTime,
        siteId,
        startDate,
        statusId,
        visitorIdType,
        visitPurpose,
      },
      { new: true }
    )

    const site = await SiteSchema.findById(siteId)

    if (sendEmail && site?.isRemote) {
      const company           = await CompanySchema.findById(companyId)
      const companyName       = company?.name
      const visitors          = await VisitorSchema.find({ visitId: id })
      const employeeIds       = visitors.map(visitor => visitor.employeeId)
      const companyEmployees  = await CompanyEmployeeSchema.find({ _id: { $in: employeeIds } })

      await sendVisitsEmail({
        companyName,
        companyEmployees,
        scheduledVisitTime,
        guests,
        carPlates,
      })
    }
    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
