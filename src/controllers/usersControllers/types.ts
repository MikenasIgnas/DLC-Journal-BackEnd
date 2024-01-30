import { RequestQuery } from '../../types'

export interface UsersFilters {
  isAdmin?:    RequestQuery
  isDisabled?: RequestQuery
  isSecurity?: RequestQuery
  $or?: [
    { name: { $regex: RequestQuery, $options: 'i' } },
    { email: { $regex: RequestQuery, $options: 'i' } },
    { username: { $regex: RequestQuery, $options: 'i' } }
  ]
}