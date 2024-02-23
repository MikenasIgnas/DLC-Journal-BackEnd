import {
  Request,
  Response,
}                       from 'express'

import CompanySchema    from '../../shemas/CompanySchema'
import getSearchFilters from '../../utility/getSearchFilters'


export default async (req: Request, res: Response) => {
  const { name, parentId } = req.query

  try {
    const params = getSearchFilters({ name })

    if (parentId) {
      params.parentId = parentId
    }

    const companies = await CompanySchema.find(params).count()

    return res.status(200).json(companies)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}