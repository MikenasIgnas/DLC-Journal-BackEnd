import {
  Request,
  Response,
}                  from 'express'

import VisitSchema from '../../shemas/VisitSchema'


export default async (req: Request, res: Response) => {
  const { id } = req.query

  try {
    const visit = await VisitSchema.findById(id)

    if (visit) {
      if (visit.documentPath) {
        res.download(visit.documentPath)
      } else {
        return res.status(404).json({ message: 'Visit has no document' })
      }
    } else {
      return res.status(404).json({ message: 'Visit not found' })
    }

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
