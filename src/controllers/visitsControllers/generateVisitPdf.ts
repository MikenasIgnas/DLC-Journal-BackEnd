import { Types }             from 'mongoose'
import autoTable             from 'jspdf-autotable'
import fs                    from 'fs'
import jsPDF                 from 'jspdf'

import { parseDateToString } from '../../helpers'
import CompanyEmployeeSchema from '../../shemas/CompanyEmployeeSchema'
import CompanySchema         from '../../shemas/CompanySchema'
import PermissionSchema      from '../../shemas/PermissionSchema'
import PremiseSchema         from '../../shemas/PremiseSchema'
import RackSchema            from '../../shemas/RackSchema'
import SiteSchema            from '../../shemas/SiteSchema'
import VisitorSchema         from '../../shemas/VisitorSchema'
import VisitSchema           from '../../shemas/VisitSchema'

interface ExtendedJsPDF extends jsPDF {
  lastAutoTable?: {
      finalY?: number
  };
}

interface Params {
  visitId:    Types.ObjectId
  signatures: { signature: string, visitorId: number }[]
}


export default async ({ visitId, signatures }: Params) => {
  const visit = await VisitSchema.findById(visitId)

  if (!visit) {
    throw new Error('Could not find visit by that id')
  }

  const site = await SiteSchema.findById(visit?.siteId)

  if (!site) {
    throw new Error('Could not find site')
  }

  const company = await CompanySchema.findById(visit?.companyId)

  if (!company) {
    throw new Error('Could not find company')
  }

  const visitors = await VisitorSchema.find({ visitId })

  if (!visitors || visitors.length === 0) {
    throw new Error('No visitors found')
  }

  const visitorEmployee = await Promise.all(visitors.map(
    async ({ employeeId, id, visitorIdType }) => {
      const employee = await CompanyEmployeeSchema.findById(employeeId)

      const signature = signatures.find(el => el.visitorId === id)?.signature

      const permissions: string[] = []

      for (let index = 0; index < visit.permissions.length; index++) {
        const element = visit.permissions[index]

        const employeeHasPermission = employee?.permissions.includes(element)

        if (employeeHasPermission) {
          const permission = await PermissionSchema.findById(element)

          if (permission) {
            permissions.push(permission.name)
          }
        }
      }

      return {
        name:       employee?.name,
        lastname:   employee?.lastname,
        birthday:   parseDateToString(employee?.birthday),
        occupation: employee?.occupation,
        phone:      employee?.phone,
        email:      employee?.email,
        idType:     visitorIdType as string,
        permissions,
        signature,
      }
    })
  )

  const visitRacks: Record<string, string[]> = {}

  for (let index = 0; index < visit.racks.length; index++) {
    const element = visit.racks[index]

    const rack = await RackSchema.findById(element)

    if (rack) {
      if (visitRacks[String(rack.premiseId)]) {
        visitRacks[String(rack.premiseId)].push(rack.name)
      } else {
        const premise = await PremiseSchema.findById(rack.premiseId)

        if (premise) {
          visitRacks[String(rack.premiseId)] = [rack.name]
        }
      }
    }
  }

  const backgroundPath   = 'src/Images/PDFbackround.png'
  const backgroundBuffer = fs.readFileSync(backgroundPath)

  const doc: ExtendedJsPDF = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' })
  doc.addFont('src/Fonts/arial.ttf', 'Arial', 'bold')
  doc.setFont('Arial', 'bold')
  doc.setFontSize(20)
  doc.addImage(
    backgroundBuffer,
    'PNG',
    0,
    0,
    doc.internal.pageSize.width + 50,
    doc.internal.pageSize.height
  )

  const originalFontSize = doc.getFontSize()

  doc.setFontSize(14)
  doc.text('Vizito ataskaita', doc.internal.pageSize.width / 2, 30, { align: 'center' })

  doc.setFontSize(10)
  doc.text(
    `Data: ${visit.date}`,
    doc.internal.pageSize.width / 2,
    35,
    { align: 'center' }
  )

  doc.setFontSize(10)
  doc.text(
    `Duomenų centras: ${site.name}`,
    doc.internal.pageSize.width / 2,
    40,
    { align: 'center' }
  )

  doc.setFontSize(10)
  doc.text(
    `Įmonė: ${company.name}`,
    doc.internal.pageSize.width / 2,
    45,
    { align: 'center' }
  )
  doc.setFontSize(originalFontSize)

  autoTable(doc,{
    head: [
      [
        'Vardas',
        'Pavardė',
        'Gimimo data',
        'Pareigos',
        'Telefono Nr.',
        'El.Paštas',
        'Dokumentas',
        'Leidimai',
        'Parašas',
      ],
    ],
    bodyStyles: {
      minCellHeight: 20,
    },
    body: visitorEmployee?.map((el) => [
      el?.name || '',
      el?.lastname || '',
      el?.birthday || '',
      el?.occupation || '',
      el?.phone || '',
      el?.email || '',
      el.idType || '',
      el?.permissions?.map((el: string) => `${el}\n`).join('') || '',
      el?.signature || null,
    ]),
    columns: [
      { header: 'Vardas', dataKey: 'name' },
      { header: 'Pavardė', dataKey: 'lastName' },
      { header: 'Gimimo data', dataKey: 'birthday' },
      { header: 'Pareigos', dataKey: 'occupation' },
      { header: 'Telefono Nr.', dataKey: 'phoneNr' },
      { header: 'El.Paštas', dataKey: 'email' },
      { header: 'Dokumentas', dataKey: 'idType' },
      { header: 'Leidimai', dataKey: 'permissions' },
      { header: 'Parašas', dataKey: 'signature' },
    ],
    didParseCell: (data) => {
      if (data.row.section === 'body' && data.column.dataKey === 'signature') {
        data.cell.text = ['']
        data.cell.minWidth = 200
      }
    },
    didDrawCell: (data) => {
      if (data.row.section === 'body' && data.column.dataKey === 'signature') {
        const { raw, x, y } = data.cell

        if (typeof raw === 'string') {
          doc.addImage(raw, 'PNG', x , y, 15, 15)
        }
      }
    },
    styles: { font: 'Arial' },
    startY: 50,
  })

  if (visitRacks && Object.keys(visitRacks).length !== 0) {
    const firstTableEnd = doc?.lastAutoTable?.finalY
    if (firstTableEnd) {
      doc.setFontSize(10)
      doc.text('Kolokacijos', 15, firstTableEnd + 10)
      doc.setFontSize(originalFontSize)

      autoTable(doc, {
        head: [
          ['Patalpa', 'Spinta'],
        ],
        columns: [
          { header: 'Patalpa', dataKey: 'premise' },
          { header: 'Spinta', dataKey: 'rack' },
        ],
        body: Object.entries(visitRacks).map(([key, value]) =>
          [key, value]),

        startY:       firstTableEnd + 15,
        styles:       { font: 'Arial' },
        columnStyles: { premise: { cellWidth: 50 } },
      })
    }
  }

  if (visit.guests && visit.guests.length > 0) {
    const secondTableEnd = doc?.lastAutoTable?.finalY
    if (secondTableEnd) {
      doc.setFontSize(10)
      doc.text('Palyda', 15, secondTableEnd + 10)
      doc.setFontSize(originalFontSize)
      autoTable(doc, {
        head: [
          ['Varads/Pavardė', 'Įmonė'],
        ],
        body: visit.guests.map((el) => [
          el.name,
          el.company!,
        ]),
        columns: [
          { header: 'Vardas/Pavardė', dataKey: 'name' },
          { header: 'Įmonė', dataKey: 'company' },
        ],
        startY: secondTableEnd + 15,
        styles: { font: 'Arial' },
      })
    }
  }

  const docOutput = doc.output('arraybuffer')
  const docBuffer = Buffer.from(docOutput)

  const documentPath = `${process.env.IMG_PATH}${'\\'}visit_${visitId}.pdf`

  fs.writeFile(documentPath, docBuffer, function (err) {
    if (err) {
      throw new Error('error save file')
    }
  })

  return documentPath
}