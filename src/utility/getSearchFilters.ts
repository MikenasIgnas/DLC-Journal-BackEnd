import { isNonExistant } from '../typeChecks'
import { requestQuery }  from '../types'

interface ReturnParams {
  $or: SearchParam[]
}

interface SearchParam {
  [x: string]: {
    $options: string
    $regex:   requestQuery
  }
}


export default (params: Record<string, requestQuery>) => {
  const otherparams: ReturnParams = {
    '$or': [],
  }


  Object.entries(params).map(([key, value]) => {
    if (!isNonExistant(value)) {
      otherparams.$or.push({ [key]: { $regex: value, $options: 'i' } })
    }
  })

  return otherparams
}
