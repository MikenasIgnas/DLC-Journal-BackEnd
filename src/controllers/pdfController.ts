import { Response }         from 'express'
import { TypedRequestBody } from '../types'
const MongoClient = require('mongodb').MongoClient;
const client      = new MongoClient('mongodb://10.81.7.29:27017/');
const PDFDocument = require("pdfkit-table");
interface ChangePasswordBody {
  id:            string
  oldPassword:   string
  password:      string
  repeatPassword:string
}

const fontPath = 'src/Fonts/arial.ttf'

export default async (req: TypedRequestBody<ChangePasswordBody>, res: Response) => {
  try {
    const visits    = client.db('ChecklistDB').collection('visits');
    const visitId   = req.query.visitId
    const visit     = await visits.findOne({id: Number(visitId)})
    const logoPath  = 'src/Images/signatureLogo.png'; 
    if (!visit) {
      res.status(500).json({ message: 'Could not find visit by that id' })
    } else {

      let doc = new PDFDocument({ margin: 20, size: 'A4', layout: 'landscape'});
      doc.image(logoPath, { width: 70, height: 50 });
      (async function(){
        const table = {
          title:  "Duomenų Logistikos Centras",
          subtitle: `Vizito ataskaita ${visit.startDate}`,
          headers: [
            { label: "Vardas", property: 'name', width: 60, renderer: null },
            { label: "Pavardė", property: 'lastName', width: 80, renderer: null }, 
            { label: "Pareigos", property: 'occupation', width: 70, renderer: null }, 
            { label: "Tel. Nr.", property: 'phoneNr', width: 70, renderer: null }, 
            { label: "El. paštas", property: 'email', width: 80, renderer: null }, 
            { label: "Gimimo data", property: 'birthday', width: 80, render: null},
            { label: 'Parašas', property: 'signature', width: 80, render:null },
            { label: "Dokumentas", property: 'idType', width: 80, render: null},
            { label: "Leidimai", property: 'permissions', width: 43, renderer:(value:any) => {
                const permission = value.map((el: any) => el)
                return permission
              },
            },
          ],
          rows:  visit.visitors.map((el: any) => ([
            el.selectedVisitor.name,
            el.selectedVisitor.lastName,
            el.selectedVisitor.occupation,
            el.selectedVisitor.phoneNr,
            el.selectedVisitor.email,
            el.selectedVisitor.birthday,
            el.signature,
            el.idType,
            el.selectedVisitor.permissions,
          ]
          )),
          options: {
            minRowHeight:70,
          }
        };

        doc.table(table, {
          prepareHeader: () => doc.font(fontPath).fontSize(8),
          prepareRow: (row: any, indexColumn: any, indexRow: any, rectRow: any, rectCell: any) => {
            doc.font(fontPath).fontSize(8);
            if (table.headers[indexColumn].property === 'signature') {
              doc.image(row[indexColumn], { width: 50, height: 50 });
            }
          
            indexColumn === 0 && doc.addBackground(rectRow, 'white', 0.15);
          },
        });
        doc.pipe(res);
        doc.end();
      })();
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Unexpected error' })
  }
}
