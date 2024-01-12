import { createTransport }   from 'nodemailer'
import { diskStorage }       from 'multer'
import { MongoClient }       from 'mongodb'
import { unlink }            from 'fs'
import multer                from 'multer'
import UserSchema            from '../shemas/UserSchema.js'
import { findOneAndUpdate }  from '../shemas/FilledChecklistData'
import {
  getCurrentDate,
  getCurrentTime,
}                            from '../helpers'
import sendRes               from '../modules/UniversalRes'
import { getLoggedInUserId } from '../helpers.js'
// needs fixing
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
require('dotenv').config()

// eslint-disable-next-line no-undef
const client = new MongoClient(process.env.MONGO_PATH)

export async function routeData(req, res) {
  const collection = client.db('ChecklistDB').collection('routesTable')
  const routes = await collection.find().sort({ id: 1 }).toArray()
  return sendRes(res, false, 'all routes', routes)
}

export async function areasData(req, res) {
  const collection = client.db('ChecklistDB').collection('areasTable')
  const areas = await collection.find().sort({ id: 1 }).toArray()
  return sendRes(res, false, 'all areas', areas)
}

export async function todoData(req, res) {
  const collection = client.db('ChecklistDB').collection('todoTable')
  const todo = await collection.find().sort({ id: 1 }).toArray()
  return sendRes(res, false, 'all todo', todo)
}

export async function problemsData(req, res) {
  const collection = client.db('ChecklistDB').collection('problemsTable')
  const problems = await collection.find().sort({ id: 1 }).toArray()
  return sendRes(res, false, 'all problems', problems)
}

export function postFilledChecklistData(req, res) {
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  historyIdCounter.findOneAndUpdate(
    { id: 'historyId' },
    { '$inc': { 'seq': 1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      }
      else {
        seqId = cd.value.seq
      }
      const filledData = {
        userName:     req.body.employee,
        filledData:   req.body.filledData,
        startDate:    req.body.startDate,
        startTime:    req.body.startTime,
        endDate:      req.body.endDate,
        endTime:      req.body.endTime,
        problemCount: req.body.problemCount,
        secret:       req.body.secret,
        userRole:     req.body.userRole,
        id:           String(seqId),
      }
      await checklistHistoryData.insertOne(filledData)
    }
  )
  return sendRes(res, false, 'all good', null)
}

export async function getSingleHistoryELementData(req, res) {
  const { id } = req.params
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const singleHistoryElementData = await checklistHistoryData.findOne({ id })
  return sendRes(res, false, 'getSingleHistoryELementData', singleHistoryElementData)
}

export async function updateFilledChecklistData(req, res) {
  const { pageId, values } = req.body
  await findOneAndUpdate({ pageId: String(pageId) }, { $set: { values: values } }, { new: true })
  res.send({ success: true })
}

export async function checklistHistoryCount(req, res) {
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const totalHistoryData = await checklistHistoryData.countDocuments()
  return sendRes(res, false, 'totalHistoryData', totalHistoryData)
}

export async function visitsCount(req, res) {
  const visits = client.db('ChecklistDB').collection('visits')
  const visitsCount = await visits.countDocuments()
  return sendRes(res, false, 'totalHistoryData', visitsCount)
}

export async function totalVisitsEntries(req, res) {
  const visitsData = client.db('ChecklistDB').collection('visits')
  const visitsCount = await visitsData.countDocuments()
  return sendRes(res, false, 'visitsCount', visitsCount)
}

export async function getTotalAreasCount(req, res) {
  const collection = client.db('ChecklistDB').collection('areasTable')
  const totalAreasCount = await collection.countDocuments()
  return sendRes(res, false, 'totalAreasCount', totalAreasCount)
}

export async function deleteVisit(req, res) {
  const visits = client.db('ChecklistDB').collection('visits')
  const id = req.query.id
  await visits.findOneAndDelete({ id: Number(id) })
  res.send({ success: true })
}

export async function changedUsername(req, res) {
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const username = req.body.employee
  const { id } = req.params
  const changeUsernameInHistoryElements = await checklistHistoryData.updateMany(
    { id: Number(id) },
    { $set: { userName: username } }
  )
  return sendRes(res, false, 'changeUsernameInHistoryElements', changeUsernameInHistoryElements)
}

export async function addDeletionData(req, res) {
  const archivedUsers = client.db('ChecklistDB').collection('archivedusers')
  const { id } = req.params
  const dateDeleted = req.body.dateDeleted
  const updateUsersStatus = await archivedUsers.findOneAndUpdate(
    { id: Number(id) },
    { $set: { dateDeleted } }
  )
  return sendRes(res, false, 'updateUsersStatus', updateUsersStatus)
}

export async function deleteHistoryItem(req, res) {
  const historyItem = client.db('ChecklistDB').collection('checklistHistoryData')
  const id = req.query.id
  const result = await historyItem.findOneAndDelete({ id: id })
  if (result.value === null) {
    return res.status(404).json({ error: 'Document not found' })
  }
  res.send({ success: true })
}

export async function latestHistoryItem(req, res) {
  const historyItem = client.db('ChecklistDB').collection('checklistHistoryData')
  const latestHistoryItem = await historyItem.find().sort({ _id: -1 }).limit(1).toArray()
  sendRes(res, false, 'latestHistoryItem', latestHistoryItem)
}

export async function updateHistoryItem(req, res) {
  const historyItem = client.db('ChecklistDB').collection('checklistHistoryData')
  const { id } = req.params
  const item = await historyItem.findOneAndUpdate(
    { id },
    { $set: { filledData: req.body.updatedArray, problemCount: req.body.problemCount } }
  )
  sendRes(res, false, 'latestHistoryItem', item.value)
}

export async function getHistoryData(req, res) {
  const historyItem = client.db('ChecklistDB').collection('checklistHistoryData')
  const items = await historyItem
    .aggregate([
      { $sort: { id: 1 } },
      { $addFields: { numericId: { $toInt: '$id' } } },
      { $sort: { numericId: -1 } },
      { $unset: 'numericId' },
    ])
    .toArray()
  sendRes(res, false, 'historyItems', items)
}

export async function postPhotos(req, res) {
  const problemPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  const historyItemId = await historyIdCounter.findOne({ id: 'historyId' })
  const count = await problemPhotos.countDocuments()
  if (count === 0) {
    await problemPhotos.updateMany(
      { checklistId: historyItemId.seq - 1 },
      { $set: { checklistId: Number(historyItemId.seq) } }
    )
    const photosWithChecklistId = req.body.map((item) => ({
      ...item,
      checklistId: historyItemId.seq,
    }))
    for (const item of photosWithChecklistId) {
      await problemPhotos.insertOne(item)
    }
    sendRes(res, false, 'problemPhotos', historyItemId)
  } else {
    await problemPhotos.updateMany(
      { checklistId: historyItemId.seq - 1 },
      { $set: { checklistId: Number(historyItemId.seq) } }
    )
    const photosWithChecklistId = req.body.map((item) => ({
      ...item,
      checklistId: historyItemId.seq,
    }))
    for (const item of photosWithChecklistId) {
      const filter = {
        checklistId: item.checklistId,
        photoId:     item.photoId,
      }
      const update = { $set: { photo: item.photo } }
      const options = { upsert: true }
      await problemPhotos.updateMany(filter, update, options)
    }
    sendRes(res, false, 'postLastestAndCurrentPhotos', photosWithChecklistId)
  }
}

export async function postLastestAndCurrentPhotos(req, res) {
  const problemPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  const historyItemId = await historyIdCounter.findOne({ id: 'historyId' })
  const currentPhotos = req.body.currentPhotos // FROM LOCAL STORAGE
  if (currentPhotos) {
    const photosWithChecklistId = currentPhotos.map((item) => ({
      ...item,
      checklistId: historyItemId.seq,
    }))
    for (const item of photosWithChecklistId) {
      await problemPhotos.updateMany(
        { checklistId: item.checklistId, photo: item.photo, photoId: item.photoId },
        { $set: { photo: item.photo } },
        { upsert: true }
      )
    }
    sendRes(res, false, 'postLastestAndCurrentPhotos', photosWithChecklistId)
  }
}

export async function postLatestPhotos(req, res) {
  const problemPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  const historyItemId = await historyIdCounter.findOne({ id: 'historyId' })
  const updateLatest = await problemPhotos.updateMany(
    { checklistId: historyItemId.seq - 1 },
    { $set: { checklistId: Number(historyItemId.seq) } }
  )
  sendRes(res, false, 'postLatestPhotos', updateLatest)
}

export async function getPhotos(req, res) {
  const problemPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const { photoId } = req.params
  const photos = await problemPhotos.find({ checklistId: Number(photoId) }).toArray()
  sendRes(res, false, 'getPhotos', photos)
}

export async function latestPhotos(req, res) {
  const lastesPhotos = client.db('ChecklistDB').collection('problemPhotos')
  const historyIdCounter = client.db('ChecklistDB').collection('historyIdCounter')
  const historyItemId = await historyIdCounter.findOne({ id: 'historyId' })

  const latestHistoryItemPhotos = await lastesPhotos.find({
    checklistId: historyItemId.seq - 1,
  }).toArray()

  sendRes(res, false, 'lastestPhotos', latestHistoryItemPhotos)
}

export async function deletePhoto(req, res) {
  const photos = client.db('ChecklistDB').collection('problemPhotos')
  const { photoId } = req.params
  await photos.findOneAndDelete({ photoId })
  res.send({ success: true })
}

export async function uploadPhoto(req, res) {

  const storage = diskStorage({
    destination: function (req, file, cb) {
      cb(null, ('C:/Users/Public/Desktop/DLC-Checklist-main/DLC-Checklist-BackEnd/uploads'))
    },
    filename: function (req, file, cb) {
      cb(null, 'asdasdasd.jpeg')
    },
  })
  const upload = multer({ storage: storage }).single('file')

  upload(req, res, function (err) {
    if (err) {
      // Kažkada buvo?
      // return handleError(err, res)
    }
    res.json({ 'status': 'completed' })
  })
}

export async function uploadCompanysPhoto(req, res) {
  const companyIdCounterCollection = client.db('ChecklistDB').collection('companiesIdCounter')
  const companiesCollection = client.db('ChecklistDB').collection('companies')
  const companyIdCounter = await companyIdCounterCollection.findOne({ id: 'companyId' })
  const companyName = req.query.companyName.replace(/\s+/g, '')
  const filePath = 'C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/CompanyLogos'
  const companyId = Number(req.query.companyId)
  const fileName = `${companyName}Logo${companyId ? companyId : companyIdCounter.seq - 1}.jpeg`

  const storage = diskStorage({
    destination: function (req, file, cb) {
      cb(null, (filePath))
    },
    filename: function (req, file, cb) {
      cb(null, fileName)
    },
  })

  const upload = multer({ storage: storage }).single('file')

  await companiesCollection.findOneAndUpdate(
    { id: companyId ? companyId : companyIdCounter.seq - 1 },
    { $set: { 'companyInfo.companyPhoto': `${fileName}` },
    })

  upload(req, res, function (err) {
    if (err) {
      // Kažkada buvo?
      // return handleError(err, res)
    }
    res.json({ 'status': 'completed' })
  })
}

export async function getCompanies(req, res) {
  const companiesCollection = client.db('ChecklistDB').collection('companies')
  const companies = await companiesCollection.find().toArray()
  sendRes(res, false, 'Companies', companies)
}

export async function getCompaniesSites(req, res) {
  const CompanySitesTableCollection = client.db('ChecklistDB').collection('CompanySitesTable')
  const companiesSites = await CompanySitesTableCollection.find().toArray()
  sendRes(res, false, 'CompanySitesTable', companiesSites)
}

export async function getSingleCompany(req, res) {
  const companyId = req.query.companyId
  const companiesCollection = client.db('ChecklistDB').collection('companies')
  const singleCompany = await companiesCollection.findOne({ id: Number(companyId) })
  sendRes(res, false, 'singleCompany', singleCompany)
}

export async function getSingleCompaniesEmployees(req, res) {
  const companyId = req.query.companyId
  const companyEmployeesCollection = client.db('ChecklistDB').collection('companyEmployees')

  const companiesEmployees = await companyEmployeesCollection.find({
    companyId: Number(companyId),
  }).toArray()

  sendRes(res, false, 'companiesEmployees', companiesEmployees)
}

export async function postVisitDetails(req, res) {
  const visistsCollection = client.db('ChecklistDB').collection('visits')
  const visitsIdCounter = client.db('ChecklistDB').collection('visitsIdCounter')
  visitsIdCounter.findOneAndUpdate(
    { id: 'visitId' },
    { '$inc': { 'seq': 1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      }
      else {
        seqId = cd.value.seq
      }
      const visitRegistrationData = {
        visitStatus:        req.body.visitStatus,
        visitingClient:     req.body.visitingClient,
        visitors:           req.body.visitors,
        visitAddress:       req.body.visitAddress,
        dlcEmployees:       req.body.dlcEmployees,
        visitPurpose:       req.body.visitPurpose,
        visitorsIdType:     req.body.visitorsIdType,
        visitCollocation:   req.body.visitCollocation,
        signature:          req.body.signature,
        creationDate:       req.body.creationDate,
        creationTime:       req.body.creationTime,
        clientsGuests:      req.body.clientsGuests,
        carPlates:          req.body.carPlates,
        scheduledVisitTime: req.body.scheduledVisitTimes,
        companyId:          req.body.companyId,
        id:                 seqId,
      }
      await visistsCollection.insertOne(visitRegistrationData)
      return sendRes(res, false, 'all good', visitRegistrationData.id)
    }
  )

  if (req.body.visitAddress === 'T72') {
    const imagePath = 'src/Images/signatureLogo.png'

    const sendEmail = () => {
      return new Promise((resolve, reject) => {
        const transporter = createTransport({
          service: 'gmail',
          auth:    {
            user: 'mikenasignas@gmail.com',
            pass: 'czwj jdyw xdyn qphs',
          },
        })

        const mail_configs = {
          from: 'mikenasignas@gmail.com',
          to:   'ignas.mikenas@datalogistics.lt',
          subject:
            `${req.body.visitingClient}  ${req.body.creationDate} ${req.body.creationTime}`,
          attachments: [{
            filename: 'signatureLogo.png',
            path:     imagePath,
            cid:      'unique@nodemailer.com',
          }],
          html: `<!DOCTYPE html>
          <html lang="en" >
            <head>
              <meta charset="UTF-8">
            </head>
            <body>
              <div style="font-family: Helvetica,Arial,sans-serif;overflow:auto;line-height:2">
                <div style="margin:50px auto;width:70%;padding:20px 0">
                  <p style="font-size:1.1em">Sveiki, </p>
                  <span>Vizitas į DATAINN</span>
                  <p>Klientas: ${req.body.visitingClient}</p>
                  <p>Data/Laikas: ${req.body.scheduledVisitTime}</p>
                  <p>` +
                    // eslint-disable-next-line max-len
                    `Įmonės atstovai: ${req.body.visitors.map((el) =>`${el.selectedVisitor.name} ${el.selectedVisitor.lastName}<br>`).join('')}` +
                  '</p>' +
                  // eslint-disable-next-line max-len
                  `${req.body.clientsGuests.length > 0 ? `<p>Palyda: ${req.body.clientsGuests.map((el) => `${el}<br>`).join('')}</p>` : ''}` +
                  // eslint-disable-next-line max-len
                  `${req.body.carPlates.length > 0 ? `<p>Automobilių Nr.: ${req.body.carPlates.map((el) => `${el}<br>`).join('')}</p>` : ''}` +
                `</div>
                <div style="margin:50px auto;width:70%;padding:20px 0">
                  <img src="cid:unique@nodemailer.com"/>
                  <p style="font-size: 10px">Pagarbiai,</p>
                  <p style="font-size: 10px">Monitoringo centras</p>
                  <p style="font-size: 10px">
                    UAB Duomenų logistikos centras  |  A. Juozapavičiaus g. 13  |  LT-09311 Vilnius
                  </p>
                  <p style="font-size: 10px">Mob. +370 618 44 445;  +370 674 44 455 |</p>
                  <p style="font-size: 10px">El.paštas noc@datalogistics.lt</p>
                  <p style="font-size: 10px">www.datalogistics.lt</p>
                </div>
              </div>
            </body>
          </html>`,
        }

        transporter.sendMail(mail_configs, function (error) {
          if (error) {
            return reject({ message: 'An error has occurred' })
          }
          return resolve({ message: 'Email sent successfully' })
        })
      })
    }
    sendEmail()
  }
}

export async function getVisits(req, res) {
  const visistsCollection = client.db('ChecklistDB').collection('visits')
  const visits = await visistsCollection.find().toArray()
  sendRes(res, false, 'visits', visits)
}

export async function getSingleVisit(req, res) {
  const visistsCollection = client.db('ChecklistDB').collection('visits')
  const visitId = req.query.visitId
  const visits = await visistsCollection.find({ id: Number(visitId) }).toArray()
  sendRes(res, false, 'visits', visits)
}

export async function getCollocations(req, res) {
  const collocationsCollection = client.db('ChecklistDB').collection('Collocations')
  const collocations = await collocationsCollection.find().toArray()
  sendRes(res, false, 'collocations', collocations)
}

export async function getSingleClientsCollocations(req, res) {
  const collocationsCollection = client.db('ChecklistDB').collection('Collocations')
  const companyId = req.query.companyId
  const addressId = req.query.addressId
  const collocations = await collocationsCollection.find({
    companyId: companyId,
    PremiseId: addressId,
  }).toArray()
  sendRes(res, false, 'collocations', collocations)
}

export async function addCompany(req, res) {
  const companies = client.db('ChecklistDB').collection('companies')
  const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
  companiesIdCounter.findOneAndUpdate(
    { id: 'companyId' },
    { '$inc': { 'seq': 1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      }
      else {
        seqId = cd.value.seq
      }
      const companyData = {
        companyInfo: req.body,
        id:          seqId,
      }
      await companies.insertOne(companyData)
    }
  )
  return sendRes(res, false, 'all good', null)
}

export async function addEmployee(req, res) {
  const companyEmployees = client.db('ChecklistDB').collection('companyEmployees')
  const employeeIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
  employeeIdCounter.findOneAndUpdate(
    { id: 'employeeId' },
    { '$inc': { 'seq': 1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      }
      else {
        seqId = cd.value.seq
      }
      req.body.employeeId = seqId
      await companyEmployees.insertOne(req.body)
    }
  )
  return sendRes(res, false, 'all good', null)
}

export async function getClientsEmployees(req, res) {
  const companyEmployees = client.db('ChecklistDB').collection('companyEmployees')
  const companyId = Number(req.query.companyId)
  const employeeId = Number(req.query.employeeId)
  const employee = await companyEmployees.findOne({ companyId: companyId, employeeId: employeeId })
  return sendRes(res, false, 'all good', employee)
}

export async function getClientsEmployeesCompanyName(req, res) {
  const companies = client.db('ChecklistDB').collection('companies')
  const { id } = req.params
  const companyName = await companies.findOne({ id })
  return sendRes(res, false, 'all good', companyName.companyInfo.companyName)
}

export async function deleteCompany(req, res) {
  const company = client.db('ChecklistDB').collection('companies')
  const companyEmployees = client.db('ChecklistDB').collection('companyEmployees')
  const companiesEmployeesIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
  const clientsEmployees = await companyEmployees.find().toArray()

  const companyId = Number(req.query.companyId)
  const companyData = await company.findOneAndDelete({ id: companyId })
  if (!companyData.value) {
    return res.status(404).send({ success: false, message: 'Company not found' })
  }

  const deletedEmployees = await companyEmployees.deleteMany({ companyId: companyId })
  const numDocumentsDeleted = deletedEmployees.deletedCount
  const companyName = companyData.value.companyInfo.companyName.replace(/\s+/g, '')
  // eslint-disable-next-line max-len
  const companyLogofilePath = `C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/CompanyLogos/${companyName}Logo${companyId}.jpeg`

  unlink(companyLogofilePath, (err) => {
    if (err) {
      console.error('Error deleting company logo file:', err)
    }
  })

  for (let i = 1; i <= numDocumentsDeleted; i++) {
    // eslint-disable-next-line max-len
    for (let i = Number(clientsEmployees[0].employeeId); i <= Number(clientsEmployees[clientsEmployees.length - 1].employeeId); i++) {
      // eslint-disable-next-line max-len
      const companyEmployeePhotoFilePath = `C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos/${companyName}companyId${companyId}employeeId${i}.jpeg`
      unlink(companyEmployeePhotoFilePath, (err) => {
        if (err) {
          console.error('Error deleting file:', err)
        }
      })
    }
  }

  await company.updateMany(
    { parentCompanyId: companyId },
    { $unset: { parentCompanyId: '' } }
  )

  companiesEmployeesIdCounter.findOneAndUpdate(
    { id: 'employeeId' },
    { $inc: { seq: -numDocumentsDeleted } },
    { new: true, upsert: true },
    async (err, cd) => {
      // ?????
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        seqId = cd.value.seq
      }
    }
  )

  res.send({ success: true })
}

export async function uploadCliesntEmployeesPhoto(req, res) {
  const employeeIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
  const employeeId = await employeeIdCounter.findOne({ id: 'employeeId' })
  const clientsEmployeesCollection = client.db('ChecklistDB').collection('companyEmployees')
  const companyName = req.query.companyName.replace(/\s+/g, '')
  const companyId = req.query.companyId
  const fileName = `${companyName}companyId${companyId}employeeId${employeeId.seq - 1}.jpeg`
  const storage = diskStorage({
    destination: function (req, file, cb) {
      cb(
        null,
        ('C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos')
      )
    },
    filename: function (req, file, cb) {
      cb(null, fileName)
    },
  })
  const upload = multer({ storage: storage }).single('file')
  await clientsEmployeesCollection.findOneAndUpdate({ employeeId: Number(employeeId.seq - 1) }, {
    $set: {
      employeePhoto: `${fileName}`,
    },
  })

  upload(req, res, function (err) {
    if (err) {
      // Kažkada buvo?
      // return handleError(err, res)
    }
    res.json({ 'status': 'completed' })
  })
}
export async function updateClientsEmployeesPhoto(req, res) {
  const clientsEmployeesCollection = client.db('ChecklistDB').collection('companyEmployees')
  const companyName = req.query.companyName.replace(/\s+/g, '')
  const companyId = req.query.companyId
  const employeeId = req.query.employeeId
  const fileName = `${companyName}companyId${companyId}employeeId${employeeId}.jpeg`
  const storage = diskStorage({
    destination: function (req, file, cb) {
      cb(
        null,
        ('C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos')
      )
    },
    filename: function (req, file, cb) {
      cb(null, fileName)
    },
  })
  const upload = multer({ storage: storage }).single('file')
  await clientsEmployeesCollection.findOneAndUpdate({
    companyId:  Number(companyId),
    employeeId: Number(employeeId),
  }, {
    $set: { employeePhoto: `${fileName}` },
  })

  upload(req, res, function (err) {
    if (err) {
      // Kažkada buvo?
      // return handleError(err, res)
    }
    res.json({ 'status': 'completed' })
  })
}
export async function deleteClientsEmployee(req, res) {
  const clientsEmployees = client.db('ChecklistDB').collection('companyEmployees')
  const employeesIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
  const companyId = Number(req.query.companyId)
  const employeeId = Number(req.query.employeeId)
  const companyName = req.query.companyName.split(' ').join('')
  await clientsEmployees.findOneAndDelete({ companyId, employeeId })
  // eslint-disable-next-line max-len
  const filePath = `C:/Users/Public/Desktop/DLC JOURNAL/DLC-Checklist-FrontEnd/public/ClientsEmployeesPhotos/${companyName}companyId${companyId}employeeId${employeeId}.jpeg`
  unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting file:', err)
    }
  })
  employeesIdCounter.findOneAndUpdate(
    { id: 'employeeId' },
    { $inc: { seq: -1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      // ??????
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        seqId = cd.value.seq
      }
    }
  )
  res.send({ success: true })
}
export async function updateClientsEmployee(req, res) {
  const clientsEmployees = client.db('ChecklistDB').collection('companyEmployees')
  await clientsEmployees.findOneAndUpdate({
    companyId:  req.body.companyId,
    employeeId: req.body.employeeId,
  }, {
    $set: req.body,
  })
  return sendRes(res, false, 'all good', null)
}
export async function updateCompaniesData(req, res) {
  const companiesCollenction = client.db('ChecklistDB').collection('companies')
  await companiesCollenction.findOneAndUpdate({ id: Number(req.query.companyId) }, {
    $set: {
      'companyInfo.J13':         req.body.J13,
      'companyInfo.T72':         req.body.T72,
      'companyInfo.companyName': req.body.companyName,
    },
  })
  return sendRes(res, false, 'all good', null)
}
export async function deleteCompaniesSubClient(req, res) {
  const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
  const companiesCollenction = client.db('ChecklistDB').collection('companies')
  await companiesCollenction.findOneAndDelete({
    id:              Number(req.query.subClientId),
    parentCompanyId: Number(req.query.parentCompanyId),
  })
  companiesIdCounter.findOneAndUpdate(
    { id: 'companyId' },
    { $inc: { seq: -1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      // ????
      if (!cd || !cd.value.seq) {
        seqId = 1
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        seqId = cd.value.seq
      }
    }
  )
  return sendRes(res, false, 'all good', null)
}
export async function addSubClient(req, res) {
  const companies = client.db('ChecklistDB').collection('companies')
  const companiesIdCounter = client.db('ChecklistDB').collection('companiesIdCounter')
  companiesIdCounter.findOneAndUpdate(
    { id: 'companyId' },
    { '$inc': { 'seq': 1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      }
      else {
        seqId = cd.value.seq
      }
      const companyData = {
        parentCompanyId: Number(req.query.parentCompanyId),
        companyInfo:     req.body,
        id:              seqId,
      }
      await companies.insertOne(companyData)
    }
  )
  return sendRes(res, false, 'all good', null)
}
export async function getSubClients(req, res) {
  const companies = client.db('ChecklistDB').collection('companies')
  const parentCompanyId = req.query.parentCompanyId
  const subClient = await companies.find({ parentCompanyId: Number(parentCompanyId) }).toArray()
  return sendRes(res, false, 'all good', subClient)
}
export async function getSingleSubClient(req, res) {
  const companies = client.db('ChecklistDB').collection('companies')
  const parentCompanyId = req.query.parentCompanyId
  const subClientId = req.query.subClientId
  const subClient = await companies.findOne({
    parentCompanyId: Number(parentCompanyId),
    id:              Number(subClientId),
  })
  return sendRes(res, false, 'all good', subClient)
}
export async function addSubClientsEmployee(req, res) {
  const companyEmployees = client.db('ChecklistDB').collection('companyEmployees')
  const employeeIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
  employeeIdCounter.findOneAndUpdate(
    { id: 'employeeId' },
    { '$inc': { 'seq': 1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      if (!cd || !cd.value.seq) {
        seqId = 1
      }
      else {
        seqId = cd.value.seq
      }
      req.body.employeeId = seqId
      req.body.subClientId = req.query.subClientId
      await companyEmployees.insertOne(req.body)
    }
  )
  return sendRes(res, false, 'all good', null)
}
export async function getSubClientsEmployees(req, res) {
  const companyEmployees = client.db('ChecklistDB').collection('companyEmployees')
  const subClientEmployees = await companyEmployees.find({
    subClientId: req.query.subClientId,
  }).toArray()
  return sendRes(res, false, 'all good', subClientEmployees)
}
export async function deleteSubClientsEmployee(req, res) {
  const subClientsEMployees = client.db('ChecklistDB').collection('companyEmployees')
  const employeesIdCounter = client.db('ChecklistDB').collection('employeeIdCounter')
  const companyId = req.query.companyId
  const employeeId = req.query.employeeId
  await subClientsEMployees.findOneAndDelete({ companyId, employeeId })
  employeesIdCounter.findOneAndUpdate(
    { id: 'employeeId' },
    { $inc: { seq: -1 } },
    { new: true, upsert: true },
    async (err, cd) => {
      let seqId
      //?????
      if (!cd || !cd.value.seq) {
        seqId = 1
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        seqId = cd.value.seq
      }
    }
  )
  res.send({ success: true })
}
export async function getAllMainCompanies(req, res) {
  const companiesCollection = client.db('ChecklistDB').collection('companies')
  const companies = await companiesCollection.find().toArray()
  const companyId = req.query.companyId
  const mainCompanies = companies.filter(item =>
    !item.parentCompanyId
  ).filter((el) => el.id !== Number(companyId))

  return sendRes(res, false, 'all good', mainCompanies)
}
export async function addMainCompanyAsSubClient(req, res) {
  const companiesCollection = client.db('ChecklistDB').collection('companies')
  await companiesCollection.findOneAndUpdate({
    id: Number(req.query.companyId),
  }, {
    $set: {
      parentCompanyId: Number(req.query.parentCompanyId),
      wasMainClient:   true,
    },
  })

  return sendRes(res, false, 'all good', null)
}
export async function changeSubClientToMainClient(req, res) {
  const companiesCollection = client.db('ChecklistDB').collection('companies')
  await companiesCollection.findOneAndUpdate(
    { id: Number(req.query.companyId) },
    { $unset: { parentCompanyId: 1 }, $set: { wasMainClient: false } }
  )
  return sendRes(res, false, 'all good', null)
}
// kas čia per?
// export async function getAllHistoryData(req, res) {
//   return sendRes(res, false, 'totalHistoryData', totalHistoryData)
// }
export async function generateMonthlyPDFReport(req, res) {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1 // Month is 0-based, so add 1
  const day = today.getDate()
  const currentDate = `${year}/${month}/${day}`

  let newYear = year
  let newMonth = month - 1
  if (newMonth < 1) {
    newMonth = 12
    newYear--
  }

  const dateMonthAgo = `${newYear}/${newMonth}/${day}`
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const allHistoryData = await checklistHistoryData.find().toArray()
  const startDateRangeStart = new Date(dateMonthAgo)
  const endDateRange = new Date(currentDate)
  const filteredData2 = allHistoryData?.filter(user => {
    const userStartDate = new Date(user.endDate)
    return userStartDate >= startDateRangeStart && userStartDate <= endDateRange
  })

  const filteredData = filteredData2?.map(user => ({
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

  return sendRes(res, false, 'totalHistoryData', filteredData)
}
export async function getSpecificDateReport(req, res) {
  const checklistHistoryData = client.db('ChecklistDB').collection('checklistHistoryData')
  const allHistoryData = await checklistHistoryData.find().toArray()
  const startDate = req.query.startDate
  const endDate = req.query.endDate
  const startDateRangeStart = new Date(startDate)
  const endDateRange = new Date(endDate)
  const filteredData2 = allHistoryData?.filter(user => {
    const userStartDate = new Date(user.endDate)
    return userStartDate >= startDateRangeStart && userStartDate <= endDateRange
  })

  const filteredData = filteredData2?.map(user => ({
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
  const filterEmptyFilledData = filteredData.filter((el) => el.filledData.length > 0)
  return sendRes(res, false, 'totalHistoryData', filterEmptyFilledData)
}
export async function getAllClientsEmployees(req, res) {
  const companies = client.db('ChecklistDB').collection('companyEmployees')
  const companyId = req.query.companyId
  const employees = await companies.find({ companyId: Number(companyId) }).toArray()
  return sendRes(res, false, 'all good', employees)
}
export async function endVisit(req, res) {
  const visistsCollection = client.db('ChecklistDB').collection('visits')
  const updateVisitStatus = await visistsCollection.findOneAndUpdate(
    { id: Number(req.query.visitId) },
    { $set: { visitStatus: 'error', endDate: getCurrentDate(), endTime: getCurrentTime() } }
  )
  return sendRes(res, false, 'all good', [updateVisitStatus.value])
}
export async function startVisit(req, res) {
  const visistsCollection = client.db('ChecklistDB').collection('visits')
  const id = await getLoggedInUserId(req)
  const user = await UserSchema.findById({_id: id })
  const updateVisitStatus = await visistsCollection.findOneAndUpdate(
    { id: Number(req.query.visitId) },
    { $set: {
      visitStatus:  'success',
      startDate:    getCurrentDate(),
      startTime:    getCurrentTime(),
      dlcEmployees: user.name,
      endDate:      '',
      endTime:      '',
    } }
  )
  return sendRes(res, false, 'all good', [updateVisitStatus.value])
}
export async function prepareVisit(req, res) {
  const visistsCollection = client.db('ChecklistDB').collection('visits')
  const updateVisitStatus = await visistsCollection.findOneAndUpdate(
    { id: Number(req.query.visitId) },
    { $set: { visitStatus: 'processing', startDate: '', startTime: '', endDate: '', endTime: '' } }
  )
  return sendRes(res, false, 'all good', [updateVisitStatus.value])
}
export async function filterByStatus(req, res) {
  const visistsCollection = client.db('ChecklistDB').collection('visits')
  const filterOption = req.query.filterOption
  let sortCriteria = {}
  if (filterOption === 'processing') {
    sortCriteria = { visitStatus: 1 }
  } else if (filterOption === 'success') {
    sortCriteria = { visitStatus: -1 }
  }
  const filteredVisits = await visistsCollection.find().sort(sortCriteria).toArray()

  return sendRes(res, false, 'all good', filteredVisits)
}
export async function deleteVisitor(req, res) {
  const visitId = req.query.visitId
  const employeeId = req.query.employeeId
  const visistsCollection = client.db('ChecklistDB').collection('visits')
  const result = visistsCollection.findOneAndUpdate(
    { id: Number(visitId) },
    { $pull: { 'visitors': { 'selectedVisitor.employeeId': Number(employeeId) } } },
    { returnDocument: 'after' }
  )

  return sendRes(res, false, 'all good', result.value)
}
export async function updateVisitorList(req, res) {
  const visitId = req.query.visitId
  const visitsCollection = client.db('ChecklistDB').collection('visits')
  const result = await visitsCollection.findOneAndUpdate(
    { id: Number(visitId) },
    { $push: { 'visitors': { idType: '', selectedVisitor: req.body } } },
    { returnDocument: 'after' }
  )

  return sendRes(res, false, 'all good', [result.value])
}
export async function updateClientsGests(req, res) {
  const visitId = req.query.visitId
  const visitsCollection = client.db('ChecklistDB').collection('visits')
  const result = visitsCollection.findOneAndUpdate(
    { id: Number(visitId) },
    { $push: { 'clientsGuests': req.body.value } },
    { returnDocument: 'after' }
  )
  return sendRes(res, false, 'all good', result.value)
}
export async function updateCarPlates(req, res) {
  const visitId = req.query.visitId
  const visitsCollection = client.db('ChecklistDB').collection('visits')
  const result = visitsCollection.findOneAndUpdate(
    { id: Number(visitId) },
    { $push: { 'carPlates': req.body.value } },
    { returnDocument: 'after' }
  )
  return sendRes(res, false, 'all good', result.value)
}
export async function removeClientsGuest(req) {
  const visitId = req.query.visitId
  const index = req.query.index
  const visitsCollection = client.db('ChecklistDB').collection('visits')
  const visit = await visitsCollection.findOne({ id: Number(visitId) })
  visit.clientsGuests.splice(Number(index), 1)
  await visitsCollection.updateOne(
    {id: Number(visitId) },
    { $set: { clientsGuests: visit.clientsGuests } }
  )
}
export async function removeCarPlates(req) {
  const visitId = req.query.visitId
  const index = req.query.index
  const visitsCollection = client.db('ChecklistDB').collection('visits')
  const visit = await visitsCollection.findOne({ id: Number(visitId) })
  visit.carPlates.splice(Number(index), 1)
  await visitsCollection.updateOne(
    { id: Number(visitId) },
    { $set: { carPlates: visit.carPlates } }
  )
}
export async function updateVisitInformation(req, res) {
  const visitId = req.query.visitId
  const visitsCollection = client.db('ChecklistDB').collection('visits')
  const existingVisit = await visitsCollection.findOne({ id: Number(visitId) })
  const updateVisit = await visitsCollection.findOneAndUpdate({ id: Number(visitId) }, {
    $set: {
      visitCollocation: req.body.visitCollocation,
      startDate:        req.body.startDate,
      startTime:        req.body.startTime,
      endDate:          req.body.endDate,
      endTime:          req.body.endTime,
      dlcEmployees:     req.body.dlcEmployees,
      visitAddress:     req.body.visitAddress,
      visitPurpose:     req.body.visitPurpose,
      visitors:         req.body.visitors.map((el, i) => ({
        ...existingVisit.visitors[i],
        selectedVisitor: req.body.visitors[i].selectedVisitor,
        idType:          req.body.visitors[i].idType,
      })),
    },
  })
  return sendRes(res, false, 'all good', updateVisit)
}
export async function addSignature(req, res) {
  const visitId = req.query.visitId
  const employeeId = req.query.employeeId
  const signature = req.body.signature
  const visitsCollection = client.db('ChecklistDB').collection('visits')
  await visitsCollection.updateOne(
    { 'id': Number(visitId), 'visitors.selectedVisitor.employeeId': Number(employeeId) },
    { $set: { 'visitors.$.signature': signature } }
  )
  return sendRes(res, false, 'all good', null)
}
export async function deleteSignature(req, res) {
  const visitId = req.query.visitId
  const employeeId = req.query.employeeId
  const visitsCollection = client.db('ChecklistDB').collection('visits')
  await visitsCollection.updateOne(
    { 'id': Number(visitId), 'visitors.selectedVisitor.employeeId': Number(employeeId) },
    { $set: { 'visitors.$.signature': null } }
  )
  return sendRes(res, false, 'all good', null)
}
export async function addCollocation(req, res) {
  const collocationCollection = client.db('ChecklistDB').collection('Collocations')
  await collocationCollection.updateOne(
    { 'colocations.id': req.body.addressId },
    {
      $push: {
        'colocations.$.premises': {
          'premiseName': req.body.premise,
          'racks':       req.body.racks,
        },
      },
    }
  )
  return sendRes(res, false, 'all good', null)
}
export async function deleteCollocation(req, res) {
  const collocationCollection = client.db('ChecklistDB').collection('Collocations')
  const addressId = req.body.addressId
  const premiseName = req.body.premiseName
  const colocation = await collocationCollection.findOne({ 'colocations.id': addressId })
  const premisesArray = colocation.colocations.find(c => c.id === addressId)?.premises
  const premiseIndex = premisesArray.findIndex(p => p.premiseName === premiseName)
  premisesArray.splice(premiseIndex, 1)
  await collocationCollection.updateOne(
    { 'colocations.id': addressId },
    { $set: { 'colocations.$.premises': premisesArray } }
  )
  return sendRes(res, false, 'Item deleted successfully', null)
}