
import {
  Request,
  Response,
}                        from 'express'

import CompanySchema     from '../../shemas/CompanySchema.js'

export default async (req: Request, res: Response) => {
  try {
    const { id } = req.body
    const documentPath = req.file?.path

    if (id) {
      const company = await CompanySchema.findByIdAndUpdate({ _id: id },
        {
          $push: { document: documentPath },
        },
        { new: true })

      return res.status(200).json(company)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
