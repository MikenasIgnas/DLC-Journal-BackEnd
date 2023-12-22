import { Response }                          from 'express';
import { AreaType, HistoryDataType, PossibleProblemsType, RouteType, TodoType, TypedRequestBody } from '../types';
import { jsPDF }                        from 'jspdf';
import autoTable                        from 'jspdf-autotable';

const MongoClient = require('mongodb').MongoClient;
const client      = new MongoClient('mongodb://10.81.7.29:27017/');
const fs          = require('fs');

interface ChangePasswordBody {
  id:             string;
  oldPassword:    string;
  password:       string;
  repeatPassword: string;
}

export default async (req: TypedRequestBody<ChangePasswordBody>, res: Response) => {
  try {
    const checklistHistoryCollection              = client.db('ChecklistDB').collection('checklistHistoryData');
    const routesCollection                        = client.db('ChecklistDB').collection('routesTable');
    const areasCollection                         = client.db('ChecklistDB').collection('areasTable');
    const todoCollection                          = client.db('ChecklistDB').collection('todoTable');
    const problemsCollection                      = client.db('ChecklistDB').collection('problemsTable');
    const checklisHistoryItems: HistoryDataType[] = await checklistHistoryCollection.find().toArray()
    const routes: RouteType[]                     = await routesCollection.find().toArray()
    const areas: AreaType[]                       = await areasCollection.find().toArray()
    const todo: TodoType[]                        = await todoCollection.find().toArray()
    const problems: PossibleProblemsType[]        = await problemsCollection.find().toArray()
    const backgroundPath                          = 'src/Images/PDFbackround.png';
    const backgroundBuffer                        = fs.readFileSync(backgroundPath);
    const dateFrom                                = req.query.dateFrom
    const dateTo                                  = req.query.dateTo
    const startDate                               = new Date(dateFrom as string);
    const endDate                                 = new Date(dateTo as string);

    const historyItemsByDate  = checklisHistoryItems.filter((item: any) => {
        const visitDate = new Date(item.startDate);
        return visitDate >= startDate && visitDate <= endDate;
    }).sort((a: any, b: any) => b.id - a.id);

    const historyItemsByProblemCount = historyItemsByDate.filter((item) => item.problemCount > 0)

    const filteredData = historyItemsByProblemCount?.map(user => ({
      ...user,
      filledData: user?.filledData?.filter(page => {
        const values = Object?.values(page?.values)
        return values?.some(pageValues =>
          Object?.values(pageValues)?.some(value =>
            typeof value === 'object' ? Object?.values(value)?.some(innerValue => innerValue === true) : value === true
            ))
        }),
    }))
    
    if (!historyItemsByDate) {
        res.status(500).json({ message: 'Could not find visit by that id' });
    } else {
        const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' });
        const bodyRows = (rowCount: number, problemArea: any[], todoInArea: any[], problemsInArea: any[]) => {
            const body = [];
            for (let j = 0; j < rowCount; j++) {
                const row = [];
                row.push({ rowSpan: 5, content: j+1, styles: { valign: 'middle', halign: 'center' } });
                if (problemArea[j]) {
                    row.push(problemArea[j]?.roomName);
                } else {
                    row.push(undefined);
                }
                if (todoInArea[j]) {
                    row.push(todoInArea[j]?.duty);
                } else {
                    row.push(undefined);
                }
                if (problemsInArea[j]) {
                    row.push(problemsInArea[j]?.possibleProblem);
                } else {
                    row.push(undefined);
                }
                body.push(row);
            }
            return body;
        };

        filteredData.map((item, index) => {
            if (index > 0)  doc.addPage();
            doc.addFont("src/Fonts/arial.ttf", "Arial", "bold");
            doc.setFont("Arial", "bold"); 
            doc.addImage(backgroundBuffer, 'PNG', 0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height);
            const originalFontSize = doc.getFontSize();
            doc.setFontSize(20);
            doc.text("Apėjimo ataskaita", doc.internal.pageSize.width / 2, 30, { align: 'center' });
            doc.setFontSize(10);
            doc.text(`Data: ${item.startDate}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
            
            doc.setFontSize(15);
            doc.setFontSize(originalFontSize);
            const problemRoute      = item.filledData.map((el) => routes.find((item) => el.routeNumber === item.id))
            const problemArea       = problemRoute.map((el) => areas.find((item) => el?.id === item.routesId))
            const todoInArea        = problemArea.map((el) => todo.find((item) =>  el?.id === item.areasId))
            const problemsInArea    = todoInArea.map((el) => problems.find((item) => el?.id === item.todoId))

            const raw: any = bodyRows(item.filledData.length, problemArea, todoInArea, problemsInArea);
            const body = []
            
            for (var i = 0; i < raw.length; i++) {
                var row = []
                for (var key in raw[i]) {
                  row.push(raw[i][key])
                }
                if (i % 5 === 0) {
                  row.unshift({
                    rowSpan: 4,
                    content: item.id ,
                    styles: { valign: 'middle', halign: 'center' },
                  })
                }
                body.push(row)
            }

            autoTable(doc,{
                head: [
                    [
                      {
                        title: item.userName,
                        colSpan: 5,
                        styles: { halign: 'center', fillColor: [22, 160, 133] },
                      },
                    ],
                ],
                body: body,
                theme: 'grid',
                styles: {font: 'Arial'},
                startY: 50,
            })
        })

      const docOutput = doc.output('arraybuffer');
      const docBuffer = Buffer.from(docOutput as any, 'ascii');

      res.setHeader('Content-Disposition', 'attachment; filename="two-by-four.pdf"');
      res.setHeader('Content-Type', 'application/pdf');
      res.send(docBuffer);
      }
    } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Unexpected error' });
  }
};