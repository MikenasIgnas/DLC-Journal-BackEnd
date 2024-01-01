import { Response } from 'express';
import {
  AreaType,
  HistoryDataType,
  PossibleProblemsType,
  RouteType,
  TodoType,
  TypedRequestBody
} from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient('mongodb://10.81.7.29:27017/');
const fs = require('fs');

interface ChangePasswordBody {
  id: string;
  oldPassword: string;
  password: string;
  repeatPassword: string;
}

export default async (req: TypedRequestBody<ChangePasswordBody>, res: Response) => {
  try {
    const checklistHistoryCollection              = client.db('ChecklistDB').collection('checklistHistoryData');
    const routesCollection                        = client.db('ChecklistDB').collection('routesTable');
    const areasCollection                         = client.db('ChecklistDB').collection('areasTable');
    const todoCollection                          = client.db('ChecklistDB').collection('todoTable');
    const problemsCollection                      = client.db('ChecklistDB').collection('problemsTable');
    const checklisHistoryItems: HistoryDataType[] = await checklistHistoryCollection.find().toArray();
    const routes: RouteType[]                     = await routesCollection.find().toArray();
    const areas: AreaType[] | undefined           = await areasCollection.find().toArray();
    const todo: TodoType[]                        = await todoCollection.find().toArray();
    const problems: PossibleProblemsType[]        = await problemsCollection.find().toArray();
    const backgroundPath                          = 'src/Images/PDFbackround.png';
    const backgroundBuffer                        = fs.readFileSync(backgroundPath);
    const dateFrom                                = req.query.dateFrom;
    const dateTo                                  = req.query.dateTo;
    const startDate                               = new Date(dateFrom as string);
    const endDate                                 = new Date(dateTo as string);

    const historyItemsByDate = checklisHistoryItems.filter((item: any) => {
      const visitDate = new Date(item.startDate);
      return visitDate >= startDate && visitDate <= endDate;
    }).sort((a: any, b: any) => b.id - a.id);

    const historyItemsByProblemCount = historyItemsByDate.filter((item) => item.problemCount > 0);
    const filteredData = historyItemsByProblemCount?.map(user => ({
      ...user,
      filledData: user?.filledData?.filter(page => {
        const values = Object?.values(page?.values);
        return values?.some(pageValues =>
          Object?.values(pageValues)?.some(value =>
            typeof value === 'object' ? Object?.values(value)?.some(innerValue => innerValue === true) : value === true
          )
        );
      }),
    }));

    if (!historyItemsByDate) {
      res.status(500).json({ message: 'Could not find visit by that id' });
    } else {
      const doc = new jsPDF({ putOnlyUsedFonts: true, orientation: 'landscape' });
      filteredData.map((item, index) => {
        if (index > 0) doc.addPage();
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

        const problemRoute    = item.filledData.map((el) => routes.find((item) => el.routeNumber === item.id));
        const area            = problemRoute.map((el) => areas?.find((item) => el?.id === item.routesId));
        const todoInArea      = area.map((el) => todo.find((item) => el?.id === item.areasId));
        const problemsInArea  = todoInArea.map((el) => problems.find((item) => el?.id === item.todoId));
   
        const bodyRows = (
          rowCount: number, 
          area: (AreaType | undefined)[], 
          todoInArea: (TodoType | undefined)[], 
          problemsInArea: (PossibleProblemsType | undefined)[]
          ) => {
          const body = [];
          for (let j = 0; j < rowCount; j++) {
            const row = {
              id: j + 1,
              roomName:         area && area?.[j]?.roomName || '',
              duty:             todoInArea && todoInArea?.[j]?.duty || '',
              possibleProblem:  problemsInArea && problemsInArea?.[j]?.possibleProblem || '',
              reaction:         problemsInArea && problemsInArea?.[j]?.possibleProblem || ''
            };
            body.push(row);
          }
          return body;
        }
        const raw: any  = bodyRows(item.filledData.length,area , todoInArea, problemsInArea);
        const body      = [];

        for (let i = 0; i < raw.length; i++) {
          const row = [];
          for (const key in raw[i]) {
            row.push(raw[i][key]);
          }
          if (i % 5 === 0) {
            row.unshift({
              rowSpan: 5,
              content: item.id,
              styles: { valign: 'middle', halign: 'center' },
            });
          }
          body.push(row);
        }
        autoTable(doc, {
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
          styles: { font: 'Arial' },
          startY: 50,
        });
      });

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