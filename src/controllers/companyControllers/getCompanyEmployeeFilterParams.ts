import { RequestQuery }           from '../../types'

import { CompanyEmployeeFilters } from './types'

interface Params {
  isDisabled?:  RequestQuery
  companyId?:   RequestQuery
  search?:      RequestQuery
}


export default ({ search, isDisabled, companyId }: Params) => {
  const params: CompanyEmployeeFilters = {}

  if (isDisabled !== undefined && isDisabled !== null) {
    params.isDisabled = isDisabled
  }

  if (companyId !== undefined && companyId !== null) {
    params.companyId = companyId
  }

  if (search) {
    params.$or = [
      { name: { $regex: search, $options: 'i' } },
      { lastname: { $regex: search, $options: 'i' } },
      { occupation: { $regex: search, $options: 'i' } },
    ]
  }

  return params
}