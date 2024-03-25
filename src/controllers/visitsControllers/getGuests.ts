import {
  Request,
  Response,
}                          from 'express'

import { getPagination }   from '../../helpers.js'
import VisitGuestSchema    from '../../shemas/VisitGuestSchema.js'


export default async (req: Request, res: Response) => {
  try {
    const { _id, visitId, page, limit } = req.query

    if (_id) {
      const guest = await VisitGuestSchema.findById(_id)

      return res.status(200).json(guest)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const guests = await VisitGuestSchema.find({ visitId }).limit(parsedLimit).skip(skip)

      return res.status(200).json(guests)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
