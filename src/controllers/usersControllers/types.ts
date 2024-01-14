import { requestQuery } from '../../types'

export interface UsersFilters {
  isAdmin?:    requestQuery
  isDisabled?: requestQuery
  isSecurity?: requestQuery
  $or?: [
    { name: { $regex: requestQuery, $options: 'i' } },
    { email: { $regex: requestQuery, $options: 'i' } },
    { username: { $regex: requestQuery, $options: 'i' } }
  ]
}