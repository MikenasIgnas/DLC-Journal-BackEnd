import { isNonExistant } from '../typeChecks'
import { RequestQuery }  from '../types'

interface ReturnParams {
  $or?:        SearchParam[]
  [x: string]: RequestQuery
}

interface SearchParam {
  [x: string]: {
    $options: string
    $regex:   RequestQuery
  }
}


export default (params: Record<string, RequestQuery>) => {
  const parsedParams: ReturnParams = {}

  const $or: SearchParam[] = []

  Object.entries(params).map(([key, value]) => {
    if (!isNonExistant(value)) {
      $or.push({ [key]: { $regex: value, $options: 'i' } })
    }
  })

  if ($or.length > 0) {
    parsedParams.$or = $or
  }

  return parsedParams
}
