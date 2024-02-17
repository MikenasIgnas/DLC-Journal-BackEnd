import {
  Request,
  Response,
}                  from 'express'

import VisitSchema from '../../shemas/VisitSchema'


export default async (req: Request, res: Response) => {
  try {
    const visits = await VisitSchema.count()

    return res.status(200).json(visits)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
