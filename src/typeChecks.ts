/* eslint-disable @typescript-eslint/no-explicit-any */

export const isNonExistant = (val: any) => val === undefined || val === null || val === ''

export const iSstring = (val: any): val is string => typeof val === 'string'
