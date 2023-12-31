import { Request }  from 'express'
import { ParsedQs } from 'qs'

export type requestQuery = string | ParsedQs | string[] | ParsedQs[] | undefined

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

export type HistoryDataType = {
  startDate:          string;
  startTime:          string;
  endDate:            string;
  endTime:            string;
  routeNumber:        number | undefined;
  id:                 number;
  userName:           string;
  problemCount:       number;
  pageID:             number;
  _id:                string;
  secret:             string;
  userRole:           string;
  filledData: {
    values: {
      [key: string]: {
        [key: string]: boolean
        }[]
    },
    pageID:           number;
    routeNumber:      number;
  }[]
  values: {
      [key: string]: {
        [key: string]: boolean;
      }[],
    },

};

export type RouteType = {
  id:                 number;
  routenumber:        number;
  floor:              string;
  title:              string;
};

export type AreaType = {
  id:                 number;
  routesId:           number;
  areaNumber:         string;
  roomName:           string;
};

export type TodoType = {
  areasId:            number;
  duty:               string;
  id:                 number;
};

export type PossibleProblemsType = {
  id:                 number;
  todoId:             number;
  possibleProblem:    string;
  reaction:           string;
};