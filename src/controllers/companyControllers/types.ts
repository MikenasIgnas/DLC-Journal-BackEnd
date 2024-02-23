import { RequestQuery } from '../../types'

export interface CompanyEmployeeFilters {
  isDisabled?:  RequestQuery
  companyId?:   RequestQuery
  $or?: [
    { name: { $regex: RequestQuery, $options: 'i' } },
    { lastname: { $regex: RequestQuery, $options: 'i' } },
    { occupation: { $regex: RequestQuery, $options: 'i' } }
  ]
}