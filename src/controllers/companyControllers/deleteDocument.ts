import { Response }          from 'express'
import { ObjectId }          from 'mongoose'

import { TypedRequestBody }  from '../../types.js'
import CompanySchema         from '../../shemas/CompanySchema.js'

interface DeletePermissionBody {
  id:   ObjectId
  file: {uid: number, name: string, status: string}
}


export default async (req: TypedRequestBody<DeletePermissionBody>, res: Response) => {
  try {
    const { id, file } = req.body

    if (!id) {
      return res.status(400).json({ messsage: 'Bad request' })
    }

    const company = await CompanySchema.findById({_id: id})

    if (!company) {
      return res.status(404).json({ message: 'Company not found' })
    }

    company.document = company.document.filter(doc => doc !== file.name)

    await company.save()

    return res.status(200).json({ message: 'File deleted successfully' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Unexpected error occurred' })
  }
}
