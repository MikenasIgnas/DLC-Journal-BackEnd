import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import CompanySchema        from '../../shemas/CompanySchema.js'

interface EditCompanyBody {
  description?: string
  id:           ObjectId
  isDisabled?:  boolean
  name?:        string
  racks?:       ObjectId[]
}


export default async (req: TypedRequestBody<EditCompanyBody>, res: Response) => {
  try {
    const { description, id, isDisabled, name, racks } = req.body

    let photo: string | undefined

    if (req.file) {
      photo = req.file?.path
    }

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const company = await CompanySchema.findByIdAndUpdate(
      { _id: id },
      {
        description,
        isDisabled,
        name,
        photo,
        racks,
      },
      { new: true }
    )

    return res.status(201).json(company)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
