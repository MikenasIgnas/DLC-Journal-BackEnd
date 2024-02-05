import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import CompanySchema         from '../../shemas/CompanySchema.js'
import VisitSchema           from '../../shemas/VisitSchema.js'

interface Body {
  carPlates?:          string[]
  companyId:           ObjectId
  date:                Date
  guests?:             string[]
  id:                  ObjectId
  permissions:         ObjectId[]
  racks:               ObjectId[]
  scheduledVisitTime?: Date
  visitorIdType:       ObjectId
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const {
      carPlates,
      companyId,
      date,
      guests,
      id,
      permissions,
      racks,
      scheduledVisitTime,
      visitorIdType,
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
        permissions,
        racks,
        scheduledVisitTime,
        signature,
        visitorIdType,
      },
      { new: true }
    )

    return res.status(201).json(instance)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
