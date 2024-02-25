import {
  Request,
  Response,
}                          from 'express'
import {
  SortOrder,
}                          from 'mongoose'

import { getPagination }   from '../../helpers.js'
import VisitSchema         from '../../shemas/VisitSchema.js'

import getVisitQueryParams from './getVisitQueryParams.js'



export default async (req: Request, res: Response) => {
  try {
    const {
      descending,
      id,
      _id,
      limit,
      page,
      search,
      siteId,
      startFrom,
      startTo,
      statusId,
    } = req.query

    if (_id) {
      const visit = await VisitSchema.findById(_id)

      return res.status(200).json(visit)
    } else if (id) {
      const visit = await VisitSchema.find({ id })

      return res.status(200).json(visit)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params = await getVisitQueryParams({
        search,
        siteId,
        statusId,
        startFrom,
        startTo,
      })

      let sort: SortOrder = 1

      if (descending === 'true') {
        sort = -1
      }

      const visits = await VisitSchema.find(params)
        .limit(parsedLimit).skip(skip).sort({ date: sort })

      return res.status(200).json(visits)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
