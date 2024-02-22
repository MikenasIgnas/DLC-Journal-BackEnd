
import { Response }          from 'express'

import { TypedRequestBody }  from '../../types.js'

import { getCurrentDateTime } from '../../helpers.js'

import CompanyDocumentSchema from '../../shemas/CompanyDocumentSchema.js'
import CompanySchema         from '../../shemas/CompanySchema.js'

interface Body {
  companyId:  number
}


export default async (req: TypedRequestBody<Body>, res: Response) => {
  try {
    const { companyId } = req.body

    const documentPath    = req.file?.path
    const documentName    = req.file?.originalname
    const documentFormat  = documentName?.split('.').pop()

    if (companyId) {
      const company = await CompanySchema.exists({ _id: companyId })

      if (!company) {
        return res.status(404).json({ message: 'Company not found' })
      }

      const instance = new CompanyDocumentSchema({
        companyId,
        path:   documentPath,
        name:   `${documentName}-${getCurrentDateTime()}`,
        format: documentFormat,

      })

      await instance.save()

      return res.status(200).json(instance)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
