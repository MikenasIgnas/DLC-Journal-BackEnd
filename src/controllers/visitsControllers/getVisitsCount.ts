import {
  Request,
  Response,
}                          from 'express'

import VisitSchema         from '../../shemas/VisitSchema'

import getVisitQueryParams from './getVisitQueryParams'


export default async (req: Request, res: Response) => {
  try {
    const {
      search,
      siteId,
      startFrom,
      startTo,
      statusId,
    } = req.query

    const params = await getVisitQueryParams({
      search:    String(search),
      siteId:    String(siteId),
      statusId:  String(statusId),
      startFrom: String(startFrom),
      startTo:   String(startTo),
    })

    const visits = await VisitSchema.find(params).countDocuments()

    return res.status(200).json(visits)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
