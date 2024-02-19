import { Response }         from 'express'
import { ObjectId }         from 'mongoose'

import { TypedRequestBody } from '../../types.js'
import CompanySchema        from '../../shemas/CompanySchema.js'

interface EditCompanyBody {
  companyCode?: number
  description?: string
  id:           ObjectId
  isDisabled?:  boolean
  name?:        string
  parentId?:    ObjectId | 'null'
  racks?:       ObjectId[]
}


export default async (req: TypedRequestBody<EditCompanyBody>, res: Response) => {
  try {
    const {
      companyCode,
      description,
      id,
      isDisabled,
      name,
      parentId,
      racks,
    } = req.body

    let photo: string | undefined

    if (req.file) {
      photo = req.file?.path
    }

    if (!id) {
      return res.status(400).json({ message: 'Bad request' })
    }

    if (parentId && parentId !== 'null') {
      const parentExists = await CompanySchema.exists({ _id: parentId })

      if (!parentExists) {
        return res.status(404).json({ message: 'Parent company does not exist' })
      }
    }

    const company = await CompanySchema.findByIdAndUpdate(
      { _id: id },
      {
        description,
        isDisabled,
        name,
        parentId: parentId !== 'null' ? parentId : undefined,
        photo,
        racks,
        companyCode,
        $unset:   parentId === 'null' ? { parentId: 1 } : {},
      },
      { new: true }
    )

    return res.status(201).json(company)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
