import {
  Request,
  Response,
}                        from 'express'

import { getPagination } from '../../helpers.js'
import { isNonExistant } from '../../typeChecks.js'
import getSearchFilters  from '../../utility/getSearchFilters.js'
import RackSchema        from '../../shemas/RackSchema.js'


export default async (req: Request, res: Response) => {
  try {
    const { name, id, page, limit, premiseId } = req.query

    if (id) {
      const rack = await RackSchema.findById({ _id: id })

      return res.status(200).json(rack)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      const params = getSearchFilters({ name })

      if (!isNonExistant(premiseId)) {
        params.premiseId
      }

      const racks = await RackSchema.find(params).limit(parsedLimit).skip(skip)

      return res.status(200).json(racks)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
