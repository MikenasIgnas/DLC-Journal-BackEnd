/* eslint-disable max-len */
import {
  Request,
  Response,
}                                   from 'express'

import { calculateTimeDifference }  from '../helpers'

import CompanyEmployeeSchema        from '../shemas/CompanyEmployeeSchema'
import CompanySchema                from '../shemas/CompanySchema'
import SiteSchema                   from '../shemas/SiteSchema'
import VisitPurposeSchema           from '../shemas/VisitPurposeSchema'
import VisitSchema                  from '../shemas/VisitSchema'
import VisitorSchema                from '../shemas/VisitorSchema'

export default async (req: Request, res: Response) => {
  const startDate = new Date(req.query.dateFrom as string)
  const endDate   = new Date(req.query.dateTo as string)

  try {
    const visits = await VisitSchema.find()

    if (!visits || visits.length === 0) {
      return res.status(404).json({ message: 'No visits found' })
    }

    const filteredVisits = visits.filter(item => {
      if (item.endDate) {
        const itemEndDate = new Date(item.endDate)

        return itemEndDate >= startDate && itemEndDate <= endDate
      }
      return false
    })

    if (filteredVisits.length === 0) {
      return res.status(404).json({ message: 'No visits found in the specified date range' })
    }

    const csvHeaders = 'Visito Id, Vizito data, Įmonė, Įmonės darbuotojai, Vizito tikslas, Adresas, Užtrukta\n'

    const csvRowsPromises = filteredVisits.map(async visit => {
      const visitors        = await VisitorSchema.find({ visitId: visit._id })
      const company         = await CompanySchema.findById(visit.companyId)
      const site            = await SiteSchema.findById(visit.siteId)
      const visitPurposes   = await Promise.all(visit.visitPurpose.map(purposeId => VisitPurposeSchema.findById(purposeId)))
      const purposesString  = visitPurposes.map(purpose => purpose?.name).join(', ')
      const timeSpent       = calculateTimeDifference(visit.startDate, visit.endDate)

      const visitInfo = await Promise.all(visitors.map(async visitor => {
        const employee = await CompanyEmployeeSchema.findById(visitor.employeeId)
        return `${visit.id}, ${visit.date.toISOString()}, ${company?.name}, ${employee?.name} ${employee?.lastname}, ${purposesString}, ${site?.name}, ${timeSpent}`
      }))

      return visitInfo.join('\n')
    })

    const csvRows     = (await Promise.all(csvRowsPromises)).join('\n')
    const footer      = `Viso vizitų: ${filteredVisits.length}`
    const BOM         = '\uFEFF'
    const csvContent  = BOM + csvHeaders + csvRows + '\n' + footer
    const csvBuffer   = Buffer.from(csvContent, 'utf-8')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', 'attachment; filename="visit.csv"')

    res.status(200).send(csvBuffer)
  } catch (error) {
    return res.status(500).json({ message: 'Unexpected error', error })
  }
}