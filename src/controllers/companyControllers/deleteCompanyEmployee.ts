import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'

interface DeleteCompanyEmployeeBody {
  id: ObjectId
}


export default async (req: TypedRequestBody<DeleteCompanyEmployeeBody>, res: Response) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    await CompanyEmployeeSchema.findByIdAndDelete({ _id: id })

    return res.status(200).json({ message: 'Delete success '})
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
