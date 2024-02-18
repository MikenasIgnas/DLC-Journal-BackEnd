import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema.js'
import CompanySchema         from '../../shemas/CompanySchema.js'

interface DeleteCompanyBody {
  id:       ObjectId
  parentId: ObjectId | 'null'
}


export default async (req: TypedRequestBody<DeleteCompanyBody>, res: Response) => {
  try {
    const { id, parentId } = req.body

    if (!id) {
      return res.status(400).json({ message: 'Bad request' })
    }

    await CompanySchema.findByIdAndDelete({ _id: id })

    const employees = await CompanyEmployeeSchema.find({ companyId: id })

    for (let index = 0; index < employees.length; index++) {
      const element = employees[index]

      await CompanyEmployeeSchema.findByIdAndDelete(element._id)
    }

    await CompanySchema.updateMany(
      { parentId: id },
      {
        parentId: parentId !== 'null' ? parentId : undefined,
        $unset:   parentId === 'null' ? { parentId: 1 } : {},
      },
      { new: true }
    )

    return res.status(200).json({ message: 'Delete success' })
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
