import {
  Request,
  Response,
}                                     from 'express'

import { getPagination }              from '../../helpers.js'
import CompanyEmployeeSchema          from '../../shemas/CompanyEmployeeSchema.js'
import getArrayPhotos                 from '../../utility/getArrayPhotos.js'
import getSinglePhoto                 from '../../utility/getSinglePhoto.js'

import getCompanyEmployeeFilterParams from './getCompanyEmployeeFilterParams.js'


export default async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      id,
      isDisabled,
      limit,
      page,
      search,
    } = req.query

    if (id) {
      const employee = await CompanyEmployeeSchema.findById({ _id: id })
      if (!employee) {
        return res.status(404).json({ message: 'Company not found' })
      }
      try {
        const photo = await getSinglePhoto(employee)
        employee.photo = photo

      } catch (error) {
        employee.photo = ''
      }
      return res.status(200).json(employee)
    } else {
      const { parsedLimit, skip } = getPagination(page, limit)

      let employees = undefined

      const params = getCompanyEmployeeFilterParams({ search, companyId, isDisabled })

      employees = await CompanyEmployeeSchema.find(params).limit(parsedLimit).skip(skip)

      employees = employees.map((el) => el.toObject())

      const employeesFull = await getArrayPhotos(employees)

      return res.status(200).json(employeesFull)
    }
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error' })
  }
}
