import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import CompanySchema        from '../../shemas/CompanySchema.js'

interface CreateCompanyBody {
  description: string
  isDisabled?: boolean
  name:        string
  photo?:      string
  racks:       ObjectId[]
}


export default async (req: TypedRequestBody<CreateCompanyBody>, res: Response) => {
  try {
    const { description, isDisabled, name, photo, racks } = req.body

    if (!(description && name && racks)) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const exists = await CompanySchema.exists({ name })

    if (exists) {
      return res.status(409).json({ message: 'Company Already Exist.' })
    } else {
      const instance = new CompanySchema({ description, isDisabled, name, photo, racks })

      await instance.save()

      return res.status(201).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
