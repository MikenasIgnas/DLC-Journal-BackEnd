import { Request }  from 'express'
import { ParsedQs } from 'qs'

export type requestRequery = string | ParsedQs | string[] | ParsedQs[] | undefined

export interface TypedRequestBody<T> extends Request {
  body: T
}

export type EmployeesType = {
  _id:            string;
  companyId:      number | undefined;
  name:           string;
  lastName:       string;
  occupation:     string;
  employeeId:     number | undefined;
  permissions:    string[];
  employeePhoto?: string;
  email?:         string;
  phoneNr?:       string;
  birthday?:      string;
  notes?:         string;
}

export type VisitStatusType = 'success' | 'processing' | 'error' | 'default' | 'warning' | undefined;


export type CollocationType = {
  [key:string] : string[]
}

export type VisitorsType = {
  idType?:            string | null | undefined;
  signature?:         string | undefined;
  selectedVisitor:    EmployeesType;
};

export type VisitsType = {
  id:                 number;
  visitPurpose:       string[];
  visitStatus:        VisitStatusType;
  visitors:           VisitorsType[];
  dlcEmployees:       string;
  visitAddress:       string;
  visitingClient:     string;
  clientsGuests:      string[];
  carPlates:          string[];
  signature:          string;
  visitCollocation:   CollocationType
  visitorsIdType:     string;
  creationDate:       string;
  creationTime:       string;
  startDate:          string;
  startTime:          string;
  endDate:            string;
  endTime:            string;
  companyId:          number;
  scheduledVisitTime: string | undefined;
}