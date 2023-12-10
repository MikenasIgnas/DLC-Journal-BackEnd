import { Request }  from 'express'

import { ParsedQs } from 'qs'

export interface TypedRequestBody<T> extends Request {
  body: T
}


export type requestRequery = string | ParsedQs | string[] | ParsedQs[] | undefined