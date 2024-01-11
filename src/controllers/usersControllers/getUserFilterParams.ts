import { requestQuery } from "../../types"

import { UsersFilters } from "./types"

interface Params {
  isAdmin?:    requestQuery
  isDisabled?: requestQuery
  isSecurity?: requestQuery
  search?:     requestQuery
}


export default ({ isAdmin, isDisabled, isSecurity, search }: Params) => {
  const params: UsersFilters = {}

  if (isDisabled !== undefined && isDisabled !== null) {
    params.isDisabled = isDisabled
  }

  if (isAdmin !== undefined && isDisabled !== null) {
    params.isAdmin = isAdmin
  }

  if (isSecurity !== undefined && isSecurity !== null) {
    params.isSecurity = isSecurity
  }

  if (search) {
    params.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } }
    ]
  }

  return params
}