import { Request }  from 'express'
import { ParsedQs } from 'qs'

export type requestRequery = string | ParsedQs | string[] | ParsedQs[] | undefined

export interface TypedRequestBody<T> extends Request {
  body: T
}
