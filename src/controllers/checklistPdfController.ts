import {
  Request,
  Response,
}                      from 'express'
import { jsPDF }       from 'jspdf'
import { MongoClient } from 'mongodb'
import autoTable       from 'jspdf-autotable'
import fs              from 'fs'

import {
  AreaType,
  HistoryDataType,
  PossibleProblemsType,
  RouteType,
  TodoType,
}                      from '../types'

const client = new MongoClient('mongodb://10.81.7.29:27017/')


export default async (req: Request, res: Response) => {
  try {
    const db = client.db('ChecklistDB')

    const checklistHistoryCollection = db.collection<HistoryDataType>('checklistHistoryData')
    const routesCollection           = db.collection<RouteType>('routesTable')
    const areasCollection            = db.collection<AreaType>('areasTable')
    const todoCollection             = db.collection<TodoType>('todoTable')
    const problemsCollection         = db.collection<PossibleProblemsType>('problemsTable')

    const checklisHistoryItems = await checklistHistoryCollection.find().toArray()
    const routes               = await routesCollection.find().toArray()
    const areas                = await areasCollection.find().toArray()
    const todo                 = await todoCollection.find().toArray()
    const problems             = await problemsCollection.find().toArray()

    const backgroundPath   = 'src/Images/PDFbackround.png'
    const backgroundBuffer = fs.readFileSync(backgroundPath)
    const dateFrom         = req.query.dateFrom
    const dateTo           = req.query.dateTo
    const startDate        = new Date(dateFrom as string)
    const endDate          = new Date(dateTo as string)

    const historyItemsByDate = checklisHistoryItems.filter((item) => {
      const visitDate = new Date(item.startDate)
      return visitDate >= startDate && visitDate <= endDate
    }).sort((a, b) => b.id - a.id)

    const historyItemsByProblemCount = historyItemsByDate.filter((item) => item.problemCount > 0)
    const filteredData = historyItemsByProblemCount?.map(user => ({
      ...user,
      filledData: user?.filledData?.filter(page => {
        const values = Object?.values(page?.values)
        return values?.some(pageValues =>
          Object?.values(pageValues)?.some(value =>
            typeof value === 'object' ?
              Object?.values(value)?.some(innerValue => innerValue === true) :
              value === true
          )
        )
      }),
    }))

    if (!historyItemsByDate) {
      res.status(500).json({ message: 'Could not find visit by that id' })
    } else {
      const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' })
      filteredData.map((item, index) => {
        if (index > 0) doc.addPage()
        doc.addFont('src/Fonts/arial.ttf', 'Arial', 'bold')
        doc.setFont('Arial', 'bold')

        doc.addImage(
          backgroundBuffer,
          'PNG',
          0,
          0,
          doc.internal.pageSize.width,
          doc.internal.pageSize.height
        )

        const originalFontSize = doc.getFontSize()
        doc.setFontSize(20)

        doc.text(
          'Apėjimo ataskaita',
          doc.internal.pageSize.width / 2,
          30,
          { align: 'center' }
        )

        doc.setFontSize(10)

        doc.text(
          `Data: ${item.startDate}`,
          doc.internal.pageSize.width / 2,
          35,
          { align: 'center' }
        )

        doc.setFontSize(15)
        doc.setFontSize(originalFontSize)

        const problemRoute = item.filledData.map((el) =>
          routes.find((item) => el.routeNumber === item.id)
        )

        const area = problemRoute.map((el) => areas?.find((item) => el?.id === item.routesId))

        const todoInArea = area.map((el) => todo.find((item) => el?.id === item.areasId))

        const problemsInArea = todoInArea.map((el) =>
          problems.find((item) => el?.id === item.todoId)
        )

        const bodyRows = (
          rowCount: number,
          area: (AreaType | undefined)[],
          todoInArea: (TodoType | undefined)[],
          problemsInArea: (PossibleProblemsType | undefined)[]
        ) => {
          const body = []
          for (let j = 0; j < rowCount; j++) {
            const row = {
              id:              j + 1,
              roomName:        area && area?.[j]?.roomName || '',
              duty:            todoInArea && todoInArea?.[j]?.duty || '',
              possibleProblem: problemsInArea && problemsInArea?.[j]?.possibleProblem || '',
              reaction:        problemsInArea && problemsInArea?.[j]?.possibleProblem || '',
            }
            body.push(row)
          }
          return body
        }

        // TO DO FIX THIS!!
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const raw: any = bodyRows(item.filledData.length,area , todoInArea, problemsInArea)
        const body = []

        for (let i = 0; i < raw.length; i++) {
          const row = []

          for (const key in raw[i]) {
            row.push(raw[i][key])
          }

          if (i % 5 === 0) {
            row.unshift({
              rowSpan: 5,
              content: item.id,
              styles:  { valign: 'middle', halign: 'center' },
            })
          }

          body.push(row)
        }

        autoTable(doc, {
          head: [
            [
              {
                title:   item.userName,
                colSpan: 5,
                styles:  { halign: 'center', fillColor: [22, 160, 133] },
              },
            ],
          ],
          body:   body,
          theme:  'grid',
          styles: { font: 'Arial' },
          startY: 50,
        })
      })

      const docOutput = doc.output('arraybuffer')
      // TO DO FIX THIS!
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const docBuffer = Buffer.from(docOutput as any, 'ascii')
      res.setHeader('Content-Disposition', 'attachment; filename="two-by-four.pdf"')
      res.setHeader('Content-Type', 'application/pdf')
      res.send(docBuffer)
    }
  } catch (error) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}