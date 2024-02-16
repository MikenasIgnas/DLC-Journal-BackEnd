import VisitSchema from '../../shemas/VisitSchema'

import {
  Request,
  Response,
}                        from 'express'

export default async (req: Request, res: Response) => {
  try {
    const visits = await VisitSchema.find()

    return res.status(200).json(visits.length)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
